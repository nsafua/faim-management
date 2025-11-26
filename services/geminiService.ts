import { GoogleGenAI, Type } from "@google/genai";
import { Client, Property, Invoice, Staff } from "../types";

export interface PropertySuggestion {
    propertyId: number;
    reason: string;
}

export const suggestProperties = async (
    client: Client,
    properties: Property[]
): Promise<PropertySuggestion[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const clientPreferences = `
        - Preferred Location: ${client.location}
        - Current Stage: ${client.stage}
        - Payment Total: ${client.payment.total}
        - Registration Date: ${client.regDate}
      `;

        const availableProperties = properties.map(p => (
            `{ id: ${p.id}, location: "${p.location}", size: ${p.size}, price: ${p.price}, description: "${p.description}" }`
        )).join(',\n');

        const prompt = `
        Based on the following client profile and list of available properties, please suggest the top 3 most suitable properties. For each suggestion, provide a brief reason explaining why it's a good match.

        Client Profile:
        ${clientPreferences}

        Available Properties:
        [
          ${availableProperties}
        ]

        Return the response as a JSON array.
      `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            propertyId: {
                                type: Type.NUMBER,
                                description: 'The ID of the suggested property.',
                            },
                            reason: {
                                type: Type.STRING,
                                description: 'A brief explanation for the suggestion.',
                            },
                        },
                        required: ["propertyId", "reason"],
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        const suggestions: PropertySuggestion[] = JSON.parse(jsonStr);
        return suggestions;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get property suggestions.");
    }
};

export const analyzeAppData = async (
    clients: Client[],
    properties: Property[],
    invoices: Invoice[],
    staff: Staff[],
    analysisTopic: string
): Promise<string> => {
     try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // Summarize data to send to the model to save tokens
        const summary = {
            totalClients: clients.length,
            totalRevenue: clients.reduce((acc, c) => acc + c.payment.paid, 0),
            totalOutstanding: clients.reduce((acc, c) => acc + c.payment.balance, 0),
            totalProperties: properties.length,
            totalPlots: properties.reduce((acc, p) => acc + p.inventory.reduce((sum, inv) => sum + inv.count, 0), 0),
            plotsSold: properties.reduce((acc, p) => acc + p.inventory.reduce((sum, inv) => sum + inv.sold, 0), 0),
            staffCount: staff.length,
            pendingInvoices: invoices.filter(i => i.status === 'Pending').length,
            overdueInvoices: invoices.filter(i => i.status === 'Overdue').length,
        };

        const prompt = `
        You are "Araba 2.0", an AI business analyst for a real estate company.
        Analyze the following data summary and provide a detailed report on the topic: "${analysisTopic}".

        Data Summary:
        - Total Clients: ${summary.totalClients}
        - Total Revenue (Paid): GHC ${summary.totalRevenue.toLocaleString()}
        - Total Outstanding Balance: GHC ${summary.totalOutstanding.toLocaleString()}
        - Total Properties: ${summary.totalProperties}
        - Total Plots Available: ${summary.totalPlots}
        - Total Plots Sold: ${summary.plotsSold}
        - Number of Staff: ${summary.staffCount}
        - Pending Invoices: ${summary.pendingInvoices}
        - Overdue Invoices: ${summary.overdueInvoices}

        Based on this data, provide insights and a summary for the requested report. The tone should be professional, data-driven, and insightful for a CEO.
        Structure your response with clear headings (e.g., Key Metrics, Insights, Recommendations).
        Do not output in JSON format. Provide a clean, readable text or markdown report.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;

     } catch (error) {
         console.error("Error calling Gemini API for analysis:", error);
         throw new Error("Failed to generate AI analysis.");
     }
};
