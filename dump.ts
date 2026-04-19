import { db } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function run() {
    const docRef = doc(db, 'settings', 'main');
    const snap = await getDoc(docRef);
    console.log(snap.data());
}
run();
