
import { GoogleGenAI } from "@google/genai";

// FIX: Initialize GoogleGenAI with API key directly from process.env as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNotificationMessage = async (
  residentName: string,
  blockName: string,
  apartmentNumber: string
): Promise<string> => {
  try {
    const prompt = `Você é um sistema de gestão de condomínios. Escreva uma notificação amigável e concisa em português do Brasil para um morador sobre uma encomenda que chegou.
    - Nome do morador: ${residentName}
    - Bloco: ${blockName}
    - Apartamento: ${apartmentNumber}
    A mensagem deve informar que a encomenda está disponível para retirada na portaria/administração durante o horário comercial. Seja cordial e profissional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating notification message:", error);
    return `Olá, ${residentName} (apartamento ${blockName} ${apartmentNumber}). Uma encomenda chegou para você. Por favor, retire na portaria.`;
  }
};
