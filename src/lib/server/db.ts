import type { Flight, ChatterMessage, StandbyRequest } from '$lib/types';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export const state = {
  flights: [] as Flight[],
  chatter: [
    {
      id: 'c0',
      sender: 'Orville [AI]',
      text: "Welcome to the Dodo Airlines Terminal! We're monitoring local frequencies. You can request standby seats or publish your own flight!",
      timestamp: new Date().toISOString(),
      type: 'orville'
    }
  ] as ChatterMessage[],
  requests: [] as StandbyRequest[]
};

export function getGemini() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
