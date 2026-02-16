import axios from 'axios';

// In production, VITE_API_URL will be set (e.g. https://travel-manager-api.onrender.com)
// Locally, it will be empty, so requests go to /api/agent (proxied by Vite)
const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/agent';

export async function createSession() {
    const res = await axios.post(`${API_BASE}/new-session`);
    return res.data;
}

export async function sendMessage(sessionId, message) {
    const res = await axios.post(`${API_BASE}/message`, { sessionId, message });
    return res.data;
}
