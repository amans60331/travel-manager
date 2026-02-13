import axios from 'axios';

const API_BASE = '/api/agent';

export async function createSession() {
    const res = await axios.post(`${API_BASE}/new-session`);
    return res.data;
}

export async function sendMessage(sessionId, message) {
    const res = await axios.post(`${API_BASE}/message`, { sessionId, message });
    return res.data;
}
