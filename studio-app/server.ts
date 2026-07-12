/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, getDocs, deleteDoc, collection, query, orderBy, getDocFromServer } from 'firebase/firestore';
import { Flight, ChatterMessage, FlightStatus, Passenger, StandbyRequest, UserProfile, FeedbackReview } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Firebase SDK
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Validate connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection verified successfully!");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client is offline.");
    } else {
      console.log("Firestore initialized successfully.");
    }
  }
}
testConnection();

// Lazy-loaded Gemini SDK setup
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to get global state / AI fuel
async function getAiFuelFromFirestore(): Promise<{ aiTokens: number; maxTokens: number }> {
  try {
    const docSnap = await getDoc(doc(db, 'state', 'ai_fuel'));
    if (docSnap.exists()) {
      const data = docSnap.data() as { aiTokens: number; maxTokens: number };
      if (data.maxTokens !== 100000) {
        const updatedFuel = { aiTokens: 100000, maxTokens: 100000 };
        await setDoc(doc(db, 'state', 'ai_fuel'), updatedFuel);
        return updatedFuel;
      }
      return data;
    } else {
      const initialFuel = { aiTokens: 100000, maxTokens: 100000 };
      await setDoc(doc(db, 'state', 'ai_fuel'), initialFuel);
      return initialFuel;
    }
  } catch (error) {
    console.error("Error getting AI fuel from Firestore, using memory fallback:", error);
    return { aiTokens: 100000, maxTokens: 100000 };
  }
}

// Helper to update / consume AI fuel
async function consumeAiFuel(amount: number) {
  try {
    const fuel = await getAiFuelFromFirestore();
    const newTokens = Math.max(0, fuel.aiTokens - amount);
    await setDoc(doc(db, 'state', 'ai_fuel'), {
      aiTokens: newTokens,
      maxTokens: fuel.maxTokens
    });
  } catch (error) {
    console.error("Error updating AI fuel:", error);
  }
}

// Memory fallbacks for analytics
let memoryAnalytics = { views: 0, visitors: 0 };
const memoryVisitors = new Set<string>();

// Helper to get analytics state
async function getAnalyticsFromFirestore(): Promise<{ views: number; visitors: number }> {
  try {
    const docSnap = await getDoc(doc(db, 'state', 'analytics'));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const current = {
        views: typeof data.views === 'number' ? data.views : 0,
        visitors: typeof data.visitors === 'number' ? data.visitors : 0,
      };
      // Keep memory cache updated
      memoryAnalytics.views = Math.max(memoryAnalytics.views, current.views);
      memoryAnalytics.visitors = Math.max(memoryAnalytics.visitors, current.visitors);
      return current;
    } else {
      const initial = { views: 0, visitors: 0 };
      await setDoc(doc(db, 'state', 'analytics'), initial);
      return initial;
    }
  } catch (error) {
    console.error("Error getting analytics from Firestore, using memory fallback:", error);
    return memoryAnalytics;
  }
}

// Helper to record a visit
async function recordVisitToFirestore(visitorId: string): Promise<{ views: number; visitors: number }> {
  try {
    const visitorRef = doc(db, 'state', 'analytics', 'visitors', visitorId);
    const visitorSnap = await getDoc(visitorRef);
    
    const analyticsRef = doc(db, 'state', 'analytics');
    const analyticsSnap = await getDoc(analyticsRef);
    let views = 0;
    let visitors = 0;
    
    if (analyticsSnap.exists()) {
      const data = analyticsSnap.data();
      views = typeof data.views === 'number' ? data.views : 0;
      visitors = typeof data.visitors === 'number' ? data.visitors : 0;
    }
    
    // Sync with memory cache to ensure counts don't regress if memory is ahead
    views = Math.max(views, memoryAnalytics.views);
    visitors = Math.max(visitors, memoryAnalytics.visitors);
    
    if (visitorSnap.exists() || memoryVisitors.has(visitorId)) {
      // Existing visitor: only increment views
      views += 1;
      await setDoc(analyticsRef, { views, visitors }, { merge: true });
    } else {
      // New visitor: increment both views and visitors
      views += 1;
      visitors += 1;
      await setDoc(visitorRef, { visitedAt: new Date().toISOString() });
      await setDoc(analyticsRef, { views, visitors }, { merge: true });
    }
    
    // Update memory cache
    memoryAnalytics = { views, visitors };
    memoryVisitors.add(visitorId);
    
    return { views, visitors };
  } catch (error) {
    console.error("Error recording visit to Firestore, using in-memory increment:", error);
    // In-memory increment fallback
    memoryAnalytics.views += 1;
    if (!memoryVisitors.has(visitorId)) {
      memoryVisitors.add(visitorId);
      memoryAnalytics.visitors += 1;
    }
    return memoryAnalytics;
  }
}

// Firestore collection references
const flightsCol = collection(db, 'flights');
const requestsCol = collection(db, 'requests');
const chatterCol = collection(db, 'chatter');
const profilesCol = collection(db, 'profiles');

// Helper to fetch flights from Firestore
async function getFlightsFromFirestore(): Promise<Flight[]> {
  const path = 'flights';
  try {
    const q = query(flightsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: Flight[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Flight);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Helper to save flight to Firestore
async function saveFlightToFirestore(flight: Flight) {
  const path = `flights/${flight.id}`;
  try {
    await setDoc(doc(db, 'flights', flight.id), flight);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to delete flight from Firestore
async function deleteFlightFromFirestore(id: string) {
  const path = `flights/${id}`;
  try {
    await deleteDoc(doc(db, 'flights', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Helper to fetch requests from Firestore
async function getRequestsFromFirestore(): Promise<StandbyRequest[]> {
  const path = 'requests';
  try {
    const q = query(requestsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: StandbyRequest[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as StandbyRequest);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Helper to save request to Firestore
async function saveRequestToFirestore(request: StandbyRequest) {
  const path = `requests/${request.id}`;
  try {
    await setDoc(doc(db, 'requests', request.id), request);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to delete request from Firestore
async function deleteRequestFromFirestore(id: string) {
  const path = `requests/${id}`;
  try {
    await deleteDoc(doc(db, 'requests', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Helper to fetch chatter from Firestore
async function getChatterFromFirestore(): Promise<ChatterMessage[]> {
  const path = 'chatter';
  try {
    const q = query(chatterCol, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    const list: ChatterMessage[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as ChatterMessage);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Helper to save chatter to Firestore
async function saveChatToFirestore(chat: ChatterMessage) {
  const path = `chatter/${chat.id}`;
  try {
    await setDoc(doc(db, 'chatter', chat.id), chat);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to clean stale flights (older than 4 hours) so the board stays fresh
async function cleanStaleData() {
  try {
    const flights = await getFlightsFromFirestore();
    const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
    for (const f of flights) {
      const isOld = new Date(f.createdAt).getTime() < fourHoursAgo;
      if (isOld) {
        await deleteFlightFromFirestore(f.id);
      }
    }
  } catch (error) {
    console.error("Error cleaning stale data:", error);
  }
}

// REST middleware
app.use(express.json());

// API Endpoints

// Get state
app.get('/api/state', async (req, res) => {
  try {
    await cleanStaleData();
    const flights = await getFlightsFromFirestore() || [];
    const chatter = await getChatterFromFirestore() || [];
    const requests = await getRequestsFromFirestore() || [];
    
    // Fetch profiles mapping
    const profiles: Record<string, UserProfile> = {};
    try {
      const profilesSnap = await getDocs(profilesCol);
      profilesSnap.forEach(docSnap => {
        profiles[docSnap.id] = docSnap.data() as UserProfile;
      });
    } catch (error) {
      console.error("Error listing profiles:", error);
    }

    const analytics = await getAnalyticsFromFirestore() || { views: 0, visitors: 0 };
    const aiFuel = await getAiFuelFromFirestore() || { aiTokens: 100000, maxTokens: 100000 };
    res.json({ flights, chatter, requests, profiles, aiFuel, analytics });
  } catch (error: any) {
    console.error("Error in /api/state:", error);
    res.status(500).json({ error: error?.message || String(error), flights: [], chatter: [], requests: [], profiles: {}, aiFuel: { aiTokens: 100000, maxTokens: 100000 }, analytics: { views: 0, visitors: 0 } });
  }
});

// Record a visit (track page views and unique visitors)
app.post('/api/visit', async (req, res) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId || typeof visitorId !== 'string' || visitorId.length > 128) {
      return res.status(400).json({ error: 'Valid visitorId is required.' });
    }
    const result = await recordVisitToFirestore(visitorId);
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/visit:", error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// Submit a Standby Flight Request
app.post('/api/requests', async (req, res) => {
  try {
    const { name, island, title, avatar, friendCode, gateType, timePreference, memo } = req.body;
    if (!name || !island || !gateType) {
      return res.status(400).json({ error: 'Name, island, and desired gate type are required.' });
    }

    const newRequest: StandbyRequest = {
      id: `req-${Date.now()}`,
      name,
      island,
      title: title || 'Frequent Flyer',
      avatar: avatar || '🦤',
      friendCode: friendCode || 'SW-XXXX-XXXX-XXXX',
      gateType: Number(gateType),
      timePreference: timePreference || 'Online Now',
      memo: memo || 'Looking for cozy island to visit!',
      createdAt: new Date().toISOString()
    };

    await saveRequestToFirestore(newRequest);

    // Add system radio notice
    const systemNotice: ChatterMessage = {
      id: `c-req-${Date.now()}`,
      sender: 'Orville [AI]',
      text: `📢 Standby Ticket! ${name} from '${island}' wants to book a flight for Category: ${gateType}! Any open gates?`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    await saveChatToFirestore(systemNotice);

    res.status(201).json(newRequest);
  } catch (error: any) {
    console.error("Error in /api/requests:", error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// Remove a Standby Request
app.delete('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRequestFromFirestore(id);
    res.sendStatus(204);
  } catch (error: any) {
    console.error("Error in delete /api/requests/:id:", error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// File a Flight Plan (Add flight)
app.post('/api/flights', async (req, res) => {
  try {
    const { hostName, islandName, dodoCode, hemisphere, gate, description, planeType, planeColor, hostFriendCode } = req.body;
    if (!hostName || !islandName || !dodoCode) {
      return res.status(400).json({ error: 'Missing required fields: hostName, islandName, dodoCode' });
    }

    const cleanCode = dodoCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanCode.length !== 5) {
      return res.status(400).json({ error: 'Dodo Code must be exactly 5 alphanumeric characters.' });
    }

    const selectedPlaneType = planeType === 'Switch 2' ? 'Switch 2' : 'Switch';
    const selectedCapacity = selectedPlaneType === 'Switch 2' ? 12 : 8;
    const selectedPlaneColor = planeColor || 'orange';

    // Deterministic flight number based on Dodo Code so it is never random
    let charSum = 0;
    for (let i = 0; i < cleanCode.length; i++) {
      charSum += cleanCode.charCodeAt(i);
    }
    const flightNumber = 100 + (charSum % 900);
    const flightId = `DAL-${flightNumber}`;

    const newFlight: Flight = {
      id: flightId,
      hostName,
      islandName,
      dodoCode: cleanCode,
      hemisphere: hemisphere || 'Northern',
      gate: Number(gate) || Math.floor(1 + Math.random() * 5),
      description: description || 'No description provided.',
      status: 'Scheduled',
      passengers: [],
      createdAt: new Date().toISOString(),
      planeType: selectedPlaneType,
      capacity: selectedCapacity,
      planeColor: selectedPlaneColor,
      hostFriendCode
    };

    // Generate initial AI Announcement if key exists
    const ai = getGemini();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `Generate a friendly Dodo Airlines terminal loudspeaker announcement for Flight ${flightId} hosted by ${hostName} to island '${islandName}' (${newFlight.hemisphere} Hemisphere). Dodo Code is ${cleanCode}. Island description: "${newFlight.description}". Keep it to 2-3 sentences max. Speak in the enthusiastic, bubbly voice of Orville from Animal Crossing, using flight puns, and ending with his aviation terms like "double-dodo flight" or "over and out!".`,
        });
        if (response.text) {
          newFlight.announcement = response.text.trim();
        }
      } catch (error) {
        console.error('Failed to generate announcement:', error);
        newFlight.announcement = `Attention passengers! Flight ${flightId} to '${islandName}' is now scheduled at Gate ${newFlight.gate}. Host ${hostName} is ready to welcome you! Dodo code: ${cleanCode}.`;
      }
    } else {
      newFlight.announcement = `Attention passengers! Flight ${flightId} to '${islandName}' is now scheduled at Gate ${newFlight.gate}. Host ${hostName} is ready to welcome you! Dodo code: ${cleanCode}.`;
    }

    await saveFlightToFirestore(newFlight);

    // Broadcast to terminal chatter as a clean system log
    const systemMessage: ChatterMessage = {
      id: `c-sys-${Date.now()}`,
      sender: 'Orville [AI]',
      text: `🚨 Flight Plan Filed! Flight ${flightId} to island '${islandName}' is now scheduled at Gate ${newFlight.gate}! Dodo code is ready.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    await saveChatToFirestore(systemMessage);

    res.status(201).json(newFlight);
  } catch (error: any) {
    console.error("Error in /api/flights:", error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// Update Flight Status
app.post('/api/flights/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const flights = await getFlightsFromFirestore() || [];
    const flight = flights.find(f => f.id === id);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    flight.status = status as FlightStatus;

    // Generate new Loudspeaker announcement on status change if AI is available
    const ai = getGemini();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `Generate a short loudspeaker announcement for Flight ${flight.id} to '${flight.islandName}'. The flight status was updated to: "${status}". Host is ${flight.hostName}. Dodo Code is ${flight.dodoCode}. Speak as Orville from Animal Crossing. Enthusiastic, polite, 2 sentences. Include the status and dodo code.`,
        });
        if (response.text) {
          flight.announcement = response.text.trim();
        }
      } catch (e) {
        console.error('Announcement generation error:', e);
      }
    }

    // System notification - styled cleanly as system type
    const isClosing = status === 'Closed';
    const systemMessage: ChatterMessage = {
      id: `c-sys-${Date.now()}`,
      sender: 'Orville [AI]',
      text: isClosing
        ? `📢 Flight ${flight.id} (${flight.islandName}) has closed its gate and safely departed. Runway is now clear!`
        : `📢 Flight ${flight.id} (${flight.islandName}) status updated to: ${status}.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    await saveChatToFirestore(systemMessage);

    if (isClosing) {
      await deleteFlightFromFirestore(id);
      res.json({ ...flight, status: 'Closed', archived: true });
    } else {
      await saveFlightToFirestore(flight);
      res.json(flight);
    }
  } catch (error: any) {
    console.error("Error in status update /api/flights/:id/status:", error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// Passenger Check-In (Boarding)
app.post('/api/flights/:id/board', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, island, friendCode } = req.body;

    if (!name || !island) {
      return res.status(400).json({ error: 'Passenger name and island are required.' });
    }

    const flights = await getFlightsFromFirestore() || [];
    const flight = flights.find(f => f.id === id);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    if (flight.status === 'Closed') {
      return res.status(400).json({ error: 'Boarding is closed for this flight.' });
    }

    const flightCapacity = flight.capacity || (flight.planeType === 'Switch 2' ? 12 : 8);
    if (flight.passengers.length >= flightCapacity) {
      return res.status(400).json({ error: 'This seaplane flight is currently full! No more seats are available.' });
    }

    const passengerId = `pass-${Date.now()}`;
    const newPassenger: Passenger = {
      id: passengerId,
      name,
      island,
      friendCode,
      checkedInAt: new Date().toISOString()
    };

    flight.passengers.push(newPassenger);
    await saveFlightToFirestore(flight);

    // Add Terminal Chatter announcement
    const announcement: ChatterMessage = {
      id: `c-board-${Date.now()}`,
      sender: 'System Dispatch',
      text: `🎟️ Check-In: Passenger ${name} from '${island}' has checked in at Gate ${flight.gate} for Flight ${flight.id} to '${flight.islandName}'!`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    await saveChatToFirestore(announcement);

    res.status(200).json({ flight, passenger: newPassenger });
  } catch (error: any) {
    console.error("Error in passenger boarding:", error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// Passenger Leave
app.post('/api/flights/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { passengerId } = req.body;

    const flights = await getFlightsFromFirestore() || [];
    const flight = flights.find(f => f.id === id);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    const passenger = flight.passengers.find(p => p.id === passengerId);
    if (passenger) {
      flight.passengers = flight.passengers.filter(p => p.id !== passengerId);
      await saveFlightToFirestore(flight);
      
      // Add departure log
      const systemNotice: ChatterMessage = {
        id: `c-leave-${Date.now()}`,
        sender: 'System Dispatch',
        text: `👋 Departure: Passenger ${passenger.name} from '${passenger.island}' has landed back on their home island or left the terminal.`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      await saveChatToFirestore(systemNotice);
    }

    res.json(flight);
  } catch (error: any) {
    console.error("Error in passenger leave:", error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// Post Terminal Chatter message
app.post('/api/chatter', async (req, res) => {
  try {
    const { sender, island, text } = req.body;
    if (!sender || !text) {
      return res.status(400).json({ error: 'Sender and text are required.' });
    }

    const newMessage: ChatterMessage = {
      id: `c-user-${Date.now()}`,
      sender,
      island,
      text,
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    await saveChatToFirestore(newMessage);

    // Auto AI Responder: Only chimes in if explicitly tagged/mentioned (no unsolicited chat noise!)
    const ai = getGemini();
    if (ai) {
      const chatter = await getChatterFromFirestore() || [];
      const recentChatLog = chatter.slice(-8).map(c => `${c.sender}${c.island ? ` from ${c.island}` : ''}: "${c.text}"`).join('\n');
      
      const lowerText = text.toLowerCase();
      const mentionsAI = lowerText.includes('orville') || lowerText.includes('wilbur') || lowerText.includes('dodo') || lowerText.includes('pilot') || lowerText.includes('@');
      
      if (mentionsAI) {
        const isWilbur = lowerText.includes('wilbur');
        const characterName = isWilbur ? 'Wilbur' : 'Orville';
        
        try {
          const fuel = await getAiFuelFromFirestore();
          if (fuel.aiTokens < 150) {
            const outOfGasMessage: ChatterMessage = {
              id: `c-ai-outofgas-${Date.now()}`,
              sender: 'Orville [AI]',
              text: `⛽ *Splutter!* DAL radio is out of power because our generator is dry! Wilbur says: "No can do, ground team! Drop some tips to Refuel our AI Jet Fuel Tank!" 😭`,
              timestamp: new Date().toISOString(),
              type: 'system'
            };
            await saveChatToFirestore(outOfGasMessage);
          } else {
            const response = await ai.models.generateContent({
              model: 'gemini-3.1-flash-lite',
              contents: `You are ${characterName}, the character from Animal Crossing: New Horizons on Nintendo Switch.
Orville is the helpful, bright airport counter desk agent. Bubbly, polite, uses words like "Dodo-double flight!", "ground control", "wings up!".
Wilbur is the tough, sunglasses-wearing veteran pilot. Uses military radio lingo, military alphabet (Delta-Alpha-Lima), "Roger that!", "over", and speaks in short, punchy pilot commands.

Review the recent airport terminal chatter log and write a short, funny reply in character responding to the latest message by "${sender}":
---
${recentChatLog}
---
Keep your reply very short (under 20 words). Never break character.`,
            });
            
            if (response.text) {
              const aiMessage: ChatterMessage = {
                id: `c-ai-${Date.now()}`,
                sender: `${characterName} [AI]`,
                text: response.text.trim(),
                timestamp: new Date().toISOString(),
                type: isWilbur ? 'wilbur' : 'orville'
              };
              await saveChatToFirestore(aiMessage);
              await consumeAiFuel(150);
            }
          }
        } catch (err) {
          console.error('AI Chatter Banter error:', err);
        }
      }
    }

    // Cap chat history at 40 messages to prevent database bloat
    const currentChatter = await getChatterFromFirestore() || [];
    if (currentChatter.length > 40) {
      const sorted = [...currentChatter].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const toDeleteCount = sorted.length - 40;
      for (let i = 0; i < toDeleteCount; i++) {
        await deleteDoc(doc(db, 'chatter', sorted[i].id));
      }
    }

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error("Error in chatter posting:", error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// Custom AI Travel Review
app.post('/api/ai/review', async (req, res) => {
  const { flightId } = req.body;
  const flights = await getFlightsFromFirestore();
  const flight = flights.find(f => f.id === flightId);
  if (!flight) {
    return res.status(404).json({ error: 'Flight not found' });
  }

  const fuel = await getAiFuelFromFirestore();
  if (fuel.aiTokens < 300) {
    return res.status(403).json({ error: "🛩️ DAL Seaplane out of Jet Fuel! Orville says Wilbur can't make the scouting trip. Refuel the AI Jet Fuel Tank to generate this review!" });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'Gemini AI service is not configured.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Write a humorous, glowing, creative Animal Crossing: New Horizons travel review of the island '${flight.islandName}' hosted by '${flight.hostName}' based on this flight plan description: "${flight.description}". Speak in the friendly, excited voice of Orville from Dodo Airlines, recording this review in the pilot gate logs after Wilbur flew the seaplane low over the island. Incorporate specific elements from their description, use flight puns, mention how pretty it looks from the air, and end with a score like '5 out of 5 stars!' or 'Double-Dodo gold medal flight!'. Under 120 words.`,
    });

    if (response.text) {
      flight.review = response.text.trim();
      await saveFlightToFirestore(flight);
      
      // Consume fuel
      await consumeAiFuel(300);

      // Post to terminal radio as a clean system log
      const systemNotice: ChatterMessage = {
        id: `c-rev-${Date.now()}`,
        sender: 'Orville [AI]',
        text: `📝 Travel Log Alert: I just completed an official DAL Flight Review for '${flight.islandName}'! Open the flight info board to read it!`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      await saveChatToFirestore(systemNotice);

      res.json({ review: flight.review });
    } else {
      res.status(500).json({ error: 'Did not receive content from AI.' });
    }
  } catch (error: any) {
    console.error('AI Review Generation failed:', error);
    res.status(500).json({ error: error.message || 'AI generation failed' });
  }
});

// Community Refuel Endpoint
app.post('/api/ai/refuel', async (req, res) => {
  const { amount } = req.body;
  const refuelAmount = amount || 2000;
  try {
    const fuel = await getAiFuelFromFirestore();
    const newTokens = Math.min(fuel.maxTokens, fuel.aiTokens + refuelAmount);
    await setDoc(doc(db, 'state', 'ai_fuel'), {
      aiTokens: newTokens,
      maxTokens: fuel.maxTokens
    });

    const refuelNotice: ChatterMessage = {
      id: `c-fuel-${Date.now()}`,
      sender: 'Orville [AI]',
      text: `⛽ COMMUNITY REFUEL: A generous passenger just topped up our terminal seaplane fuel tank by ${refuelAmount} gallons! Wilbur says: "Ready for takeoff! Check the dial at the bottom!" ✈️💨`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    await saveChatToFirestore(refuelNotice);

    res.json({ success: true, aiTokens: newTokens, maxTokens: fuel.maxTokens });
  } catch (error) {
    console.error("Error refueling:", error);
    res.status(500).json({ error: "Failed to refuel." });
  }
});

// Persistent Profiles API Endpoints

// Get profile
app.get('/api/profiles/:friendCode', async (req, res) => {
  const { friendCode } = req.params;
  try {
    const profileSnap = await getDoc(doc(db, 'profiles', friendCode));
    if (profileSnap.exists()) {
      res.json(profileSnap.data());
    } else {
      res.json({
        friendCode,
        villagerName: 'Unregistered Resident',
        islandName: 'Mystery Island',
        avatarIcon: '🦤',
        title: 'New Flyer',
        signature: 'Skies are blue, wings are up!',
        colorIndex: 1,
        goodApples: 0,
        rottenTurnips: 0,
        vouchers: {},
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error(`Error in GET profile for ${friendCode}:`, error);
    res.status(500).json({
      error: error?.message || String(error),
      friendCode,
      villagerName: 'Unregistered Resident',
      islandName: 'Mystery Island',
      avatarIcon: '🦤',
      title: 'New Flyer',
      signature: 'Skies are blue, wings are up!',
      colorIndex: 1,
      goodApples: 0,
      rottenTurnips: 0,
      vouchers: {},
      updatedAt: new Date().toISOString()
    });
  }
});

// Upsert profile
app.post('/api/profiles/:friendCode', async (req, res) => {
  const { friendCode } = req.params;
  const { villagerName, islandName, avatarIcon, title, signature, colorIndex } = req.body;
  
  try {
    const profileRef = doc(db, 'profiles', friendCode);
    const profileSnap = await getDoc(profileRef);
    
    let currentProfile: UserProfile;
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      currentProfile = {
        friendCode,
        villagerName: villagerName || data.villagerName,
        islandName: islandName || data.islandName,
        avatarIcon: avatarIcon || data.avatarIcon,
        title: title || data.title,
        signature: signature || data.signature,
        colorIndex: colorIndex !== undefined ? Number(colorIndex) : data.colorIndex,
        goodApples: data.goodApples || 0,
        rottenTurnips: data.rottenTurnips || 0,
        vouchers: data.vouchers || {},
        updatedAt: new Date().toISOString()
      };
    } else {
      currentProfile = {
        friendCode,
        villagerName: villagerName || 'Islander',
        islandName: islandName || 'Island',
        avatarIcon: avatarIcon || '🦤',
        title: title || 'Freshly Picked Islander',
        signature: signature || '',
        colorIndex: colorIndex !== undefined ? Number(colorIndex) : 1,
        goodApples: 0,
        rottenTurnips: 0,
        vouchers: {},
        updatedAt: new Date().toISOString()
      };
    }
    
    await setDoc(profileRef, currentProfile);
    res.json(currentProfile);
  } catch (error: any) {
    console.error(`Error in POST profile for ${friendCode}:`, error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// Rate / vouch profile
app.post('/api/profiles/:friendCode/rate', async (req, res) => {
  const { friendCode } = req.params;
  const { ratingType, voterName, voterIsland, voterFriendCode, comment } = req.body;
  
  if (!ratingType || !voterFriendCode) {
    return res.status(400).json({ error: "ratingType ('apple' | 'turnip') and voterFriendCode are required." });
  }
  
  try {
    const profileRef = doc(db, 'profiles', friendCode);
    const profileSnap = await getDoc(profileRef);
    
    let profile: UserProfile;
    if (profileSnap.exists()) {
      profile = profileSnap.data() as UserProfile;
    } else {
      profile = {
        friendCode,
        villagerName: 'Unknown Resident',
        islandName: 'Unknown Island',
        avatarIcon: '🦤',
        title: 'Frequent Flyer',
        signature: '',
        colorIndex: 1,
        goodApples: 0,
        rottenTurnips: 0,
        vouchers: {},
        updatedAt: new Date().toISOString()
      };
    }
    
    if (!profile.vouchers) {
      profile.vouchers = {};
    }
    
    const previousVote = profile.vouchers[voterFriendCode];
    if (previousVote === ratingType) {
      return res.status(400).json({ error: `You have already given a ${ratingType === 'apple' ? 'Good Apple 🍏' : 'Rotten Turnip 🧅'} to this profile!` });
    }
    
    if (previousVote) {
      if (previousVote === 'apple') {
        profile.goodApples = Math.max(0, profile.goodApples - 1);
        profile.rottenTurnips += 1;
      } else {
        profile.rottenTurnips = Math.max(0, profile.rottenTurnips - 1);
        profile.goodApples += 1;
      }
    } else {
      if (ratingType === 'apple') {
        profile.goodApples += 1;
      } else {
        profile.rottenTurnips += 1;
      }
    }
    
    profile.vouchers[voterFriendCode] = ratingType;
    profile.updatedAt = new Date().toISOString();
    
    await setDoc(profileRef, profile);
    
    // Save review
    const reviewId = `rev-${Date.now()}`;
    const reviewsColRef = collection(db, 'profiles', friendCode, 'reviews');
    const newReview: FeedbackReview = {
      id: reviewId,
      targetFriendCode: friendCode,
      authorName: voterName || 'Anonymous',
      authorIsland: voterIsland || 'Home Island',
      ratingType,
      comment: comment || '',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(reviewsColRef, reviewId), newReview);
    
    // System notification
    const systemNotice: ChatterMessage = {
      id: `c-rate-${Date.now()}`,
      sender: 'Orville [AI]',
      text: `📢 Trust Report! Resident ${voterName} from '${voterIsland}' left feedback for ${profile.villagerName || 'Islander'} (${ratingType === 'apple' ? 'Good Apple 🍏' : 'Rotten Turnip 🧅'}).`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    await saveChatToFirestore(systemNotice);
    
    res.json({ profile, review: newReview });
  } catch (error: any) {
    console.error(`Error in rating profile for ${friendCode}:`, error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

// Fetch reviews
app.get('/api/profiles/:friendCode/reviews', async (req, res) => {
  const { friendCode } = req.params;
  try {
    const reviewsColRef = collection(db, 'profiles', friendCode, 'reviews');
    const q = query(reviewsColRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const reviews: FeedbackReview[] = [];
    snapshot.forEach(docSnap => {
      reviews.push(docSnap.data() as FeedbackReview);
    });
    res.json(reviews);
  } catch (error: any) {
    console.error(`Error in GET reviews for ${friendCode}:`, error);
    res.status(500).json({ error: error?.message || String(error), reviews: [] });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dodo Airlines Server running on http://localhost:${PORT}`);
  });
}

startServer();
