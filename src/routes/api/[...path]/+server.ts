import { json } from '@sveltejs/kit';
import { state } from '$lib/server/db';
import { getGemini } from '$lib/server/db';

export async function GET({ url }) {
  const path = url.pathname;
  if (path === '/api/state') {
    return json({ flights: state.flights, chatter: state.chatter, requests: state.requests });
  }
  return json({ error: 'Not found' }, { status: 404 });
}

export async function POST({ url, request }) {
  const path = url.pathname;
  try {
    if (path === '/api/requests') {
      const data = await request.json();
      const newReq = { ...data, id: `req-${Date.now()}`, createdAt: new Date().toISOString() };
      state.requests.unshift(newReq);
      return json(newReq);
    }
    if (path === '/api/flights') {
      const data = await request.json();
      const newFlight = { ...data, id: `DAL-${Math.floor(Math.random() * 9000) + 1000}`, status: 'Scheduled', passengers: [], createdAt: new Date().toISOString() };
      state.flights.unshift(newFlight);
      state.chatter.unshift({ id: `c-${Date.now()}`, sender: 'Orville [AI]', text: `Attention! New flight ${newFlight.id} to ${newFlight.islandName} is now accepting passengers at Gate ${newFlight.gate}.`, timestamp: new Date().toISOString(), type: 'orville' });
      return json(newFlight);
    }
    if (path.match(/^\/api\/flights\/[^\/]+\/status$/)) {
      const id = path.split('/')[3];
      const { status } = await request.json();
      const flight = state.flights.find(f => f.id === id);
      if (flight) {
        flight.status = status;
        state.chatter.unshift({ id: `c-${Date.now()}`, sender: 'Orville [AI]', text: `Update for Flight ${id}: Status changed to ${status.toUpperCase()}.`, timestamp: new Date().toISOString(), type: 'orville' });
      }
      return json({ success: true });
    }
    if (path.match(/^\/api\/flights\/[^\/]+\/board$/)) {
      const id = path.split('/')[3];
      const data = await request.json();
      const flight = state.flights.find(f => f.id === id);
      if (flight) {
        flight.passengers.push({ ...data, id: `p-${Date.now()}`, checkedInAt: new Date().toISOString() });
        state.chatter.unshift({ id: `c-${Date.now()}`, sender: 'Orville [AI]', text: `${data.name} just boarded Flight ${id} to ${flight.islandName}!`, timestamp: new Date().toISOString(), type: 'orville' });
      }
      return json({ success: true });
    }
    if (path.match(/^\/api\/flights\/[^\/]+\/leave$/)) {
      const id = path.split('/')[3];
      const { passengerId } = await request.json();
      const flight = state.flights.find(f => f.id === id);
      if (flight) {
        const p = flight.passengers.find(x => x.id === passengerId);
        flight.passengers = flight.passengers.filter(x => x.id !== passengerId);
        if (p) state.chatter.unshift({ id: `c-${Date.now()}`, sender: 'Orville [AI]', text: `${p.name} left Flight ${id}.`, timestamp: new Date().toISOString(), type: 'orville' });
      }
      return json({ success: true });
    }
    if (path === '/api/chatter') {
      const data = await request.json();
      state.chatter.unshift({ ...data, id: `c-${Date.now()}`, timestamp: new Date().toISOString(), type: data.sender.includes('AI') ? 'orville' : 'user' });
      if (state.chatter.length > 50) state.chatter = state.chatter.slice(0, 50);
      return json({ success: true });
    }
    if (path === '/api/ai/review') {
      return json({ success: true, message: "AI review completed (mock)" });
    }
    return json({ error: 'Not found' }, { status: 404 });
  } catch (err: any) {
    return json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE({ url }) {
  const path = url.pathname;
  if (path.startsWith('/api/requests/')) {
    const id = path.split('/')[3];
    state.requests = state.requests.filter(r => r.id !== id);
    return json({ success: true });
  }
  return json({ error: 'Not found' }, { status: 404 });
}
