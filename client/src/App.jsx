import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Preloader from './components/Preloader/Preloader';
import ChatWindow from './components/Chat/ChatWindow/ChatWindow';
import InputBar from './components/Chat/InputBar/InputBar';
import Destinations from './pages/Destinations';
import About from './pages/About';
import Contact from './pages/Contact';
import { createSession, sendMessage } from './api/agent';
import './App.css';

const Home = ({ messages, isTyping, handleSend, handleDestinationSelect, selectedDestination, handleSuggestionClick, handleNewChat, hasStarted }) => (
    <div className="chat-container">
        <div className="chat-header">
            <h3>AI Travel Planner</h3>
            <button className="new-chat-btn" onClick={handleNewChat}>Reset Session</button>
        </div>
        <ChatWindow
            messages={messages}
            isTyping={isTyping}
            onDestinationSelect={handleDestinationSelect}
            selectedDestination={selectedDestination}
            onSuggestionClick={handleSuggestionClick}
            hasStarted={hasStarted}
        />
        <InputBar onSend={handleSend} disabled={isTyping} />
    </div>
);

const App = () => {
    const [loading, setLoading] = useState(true);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [hasStarted, setHasStarted] = useState(false);

    const initSession = useCallback(async () => {
        try {
            const data = await createSession();
            setSessionId(data.sessionId);
            return data;
        } catch (error) {
            console.error('Failed to create session:', error);
            throw error;
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2500);
        return () => clearTimeout(timer);
    }, []); // Run ONLY once on mount

    const handleSend = useCallback(async (text) => {
        if (!text.trim() || isTyping) return;

        setHasStarted(true);

        // Show the user's message immediately so the chat never looks blank
        const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        let activeSessionId = sessionId;

        // Lazily create a session on first interaction so the landing hero stays visible.
        // We intentionally do NOT show the backend welcome bubble here so your first
        // question is always the starting point of the visible chat.
        if (!activeSessionId) {
            try {
                const data = await initSession();
                activeSessionId = data.sessionId;
            } catch (e) {
                console.error('Failed to initialise session before sending:', e);
            }
        }

        try {
            const data = await sendMessage(activeSessionId, text);
            const assistantMsg = {
                role: 'assistant',
                content: data.response,
                richContent: data.richContent,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, assistantMsg]);
            if (data.collectedInfo?.selectedDestination) setSelectedDestination(data.collectedInfo.selectedDestination);
        } catch (error) {
            console.error('Send error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, something went wrong. Please try again!',
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    }, [sessionId, isTyping, initSession]);

    const handleDestinationSelect = useCallback((destName) => {
        setSelectedDestination(destName);
        handleSend(`I'd like to go to ${destName}`);
    }, [handleSend]);

    const handleNewChat = useCallback(() => {
        setMessages([]);
        setSelectedDestination(null);
        setIsTyping(false);
        setSessionId(null);
        setHasStarted(false);
    }, [initSession]);

    const handleSuggestionClick = useCallback((text) => handleSend(text), [handleSend]);

    return (
        <Router>
            <div className="layout">
                <AnimatePresence>
                    {loading && <Preloader key="loader" />}
                </AnimatePresence>
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={
                            <Home
                                messages={messages}
                                isTyping={isTyping}
                                handleSend={handleSend}
                                handleDestinationSelect={handleDestinationSelect}
                                selectedDestination={selectedDestination}
                                handleSuggestionClick={handleSuggestionClick}
                                handleNewChat={handleNewChat}
                                hasStarted={hasStarted}
                            />
                        } />
                        <Route path="/destinations" element={<Destinations />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
