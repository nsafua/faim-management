// Define types for gapi and google.accounts.oauth2 to avoid using 'any'
declare const gapi: any;
declare const google: {
    accounts: {
        oauth2: {
            initTokenClient: (config: any) => any;
        }
    }
};

const CLIENT_ID = '897099492281-b52rljj25blg4kbha5o12uvu1k0fj385.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
export const APP_DATA_FOLDER_NAME = "FAIM App Data";

let tokenClient: any;
let gapiReadyPromise: Promise<void>;
let gisReadyPromise: Promise<void>;
let gapiResolve: () => void;
let gisResolve: () => void;

gapiReadyPromise = new Promise(resolve => { gapiResolve = resolve; });
gisReadyPromise = new Promise(resolve => { gisResolve = resolve; });

// Listen for custom events dispatched from index.html to avoid race conditions
window.addEventListener('gapiLoaded', () => {
    gapi.load('client', () => {
        // FIX: Use gapi.client.init for OAuth-based client setup.
        // 'load' is for simple API key requests and does not configure the client
        // correctly for handling user authentication tokens.
        gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
        })
        .then(() => {
            gapiResolve();
        })
        .catch((error: any) => {
             console.error("Error initializing GAPI client for Drive", error);
        });
    });
});


window.addEventListener('gisLoaded', () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Will be set before use
    });
    gisResolve();
});

async function ensureGisGapiReady() {
    await Promise.all([gapiReadyPromise, gisReadyPromise]);
}

async function ensureAuthenticated(): Promise<void> {
    await ensureGisGapiReady();
    return new Promise<void>((resolve, reject) => {
        if (gapi.client.getToken() === null) {
            tokenClient.callback = (resp: any) => {
                if (resp.error !== undefined) {
                    return reject(resp);
                }
                gapi.client.setToken({ access_token: resp.access_token });
                resolve();
            };
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            resolve();
        }
    });
}

export async function findOrCreateFolder(name: string, parentId?: string): Promise<{ id: string, webViewLink: string }> {
    await ensureAuthenticated();
    
    const query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false ${parentId ? `and '${parentId}' in parents` : ''}`;
    
    try {
        const response = await gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, webViewLink)',
            spaces: 'drive',
        });

        if (response.result.files && response.result.files.length > 0) {
            return response.result.files[0];
        } else {
            const fileMetadata = {
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder',
                ...(parentId && { parents: [parentId] }),
            };
            const createResponse = await gapi.client.drive.files.create({
                resource: fileMetadata,
                fields: 'id, webViewLink',
            });
            return createResponse.result;
        }
    } catch (err) {
        console.error(`Error finding or creating folder "${name}":`, err);
        throw err;
    }
}

export async function listJsonFiles(folderId: string): Promise<any[]> {
    await ensureAuthenticated();
    try {
        const response = await gapi.client.drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
            fields: 'files(id, name)',
        });
        
        const files = response.result.files || [];
        const fileContents = await Promise.all(
            files.map(async (file: any) => {
                const fileResponse = await gapi.client.drive.files.get({
                    fileId: file.id,
                    alt: 'media',
                });
                const data = JSON.parse(fileResponse.body);
                return { ...data, driveFileId: file.id };
            })
        );
        return fileContents;

    } catch (err) {
        console.error('Error listing JSON files:', err);
        throw err;
    }
}

export async function saveJsonFile(folderId: string, fileName: string, data: any, fileId?: string): Promise<any> {
    await ensureAuthenticated();
    
    // For updates, we don't need to specify the parent folder again
    const fileMetadata = {
        name: fileName,
        mimeType: 'application/json',
        ...(fileId ? {} : { parents: [folderId] }),
    };

    const media = {
        mimeType: 'application/json',
        body: JSON.stringify(data),
    };

    try {
        const path = fileId ? `/upload/drive/v3/files/${fileId}` : '/upload/drive/v3/files';
        const method = fileId ? 'PATCH' : 'POST';

        // This is the standard way to build a multipart request body for the Google API
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const close_delim = `\r\n--${boundary}--`;

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: ' + media.mimeType + '\r\n\r\n' +
            media.body +
            close_delim;

        const request = gapi.client.request({
            path,
            method,
            params: { uploadType: 'multipart' },
            headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
            body: multipartRequestBody
        });

        const response = await request;
        const result = response.result;
        return { ...data, driveFileId: result.id };
        
    } catch (error) {
        console.error('Error saving JSON file:', error);
        throw error;
    }
}

export async function deleteFile(fileId: string): Promise<void> {
    await ensureAuthenticated();
    try {
        await gapi.client.drive.files.delete({
            fileId: fileId,
        });
    } catch (err) {
        console.error('Error deleting file:', err);
        throw err;
    }
}