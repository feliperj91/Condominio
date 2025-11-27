import { GoogleGenAI } from "@google/genai";

// NOTE: In a production Vercel app, this would be process.env.API_KEY.
// For this local demo without a backend, we check if the key is available.
// If the key is not set, we will return a mock response to prevent crashing.

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment. AI features will be simulated.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSmartNotification = async (recipientName: string, itemDescription: string, location: string): Promise<string> => {
  const client = getAIClient();
  if (!client) {
    return `Olá ${recipientName}, uma encomenda (${itemDescription}) chegou para você. Por favor, retire em: ${location}.`;
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Escreva uma notificação curta, educada e profissional (em Português do Brasil) para um morador chamado ${recipientName}. 
      Informe que uma encomenda descrita como "${itemDescription}" chegou e está pronta para retirada no local: "${location}".
      Mantenha abaixo de 50 palavras. Não inclua linha de assunto.`,
    });
    return response.text || "Falha na geração da notificação.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Encomenda chegou para ${recipientName} (${itemDescription}). Local: ${location}.`;
  }
};

export const analyzeParkingLogs = async (logsJSON: string): Promise<string> => {
   const client = getAIClient();
  if (!client) {
    return "Análise de IA indisponível sem chave de API. Verifique os logs manualmente.";
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analise os seguintes logs de acesso de veículos (formato JSON) e forneça um breve resumo (em tópicos, em Português do Brasil) de quaisquer anomalias, horários de pico ou preocupações de segurança.
      
      Logs:
      ${logsJSON}
      `,
    });
    return response.text || "Falha na análise.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Não foi possível analisar os logs neste momento.";
  }
}