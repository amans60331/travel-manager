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

const Home = ({ messages, isTyping, handleSend, handleDestinationSelect, selectedDestination, handleSuggestionClick, handleNewChat }) => (
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

    const initSession = useCallback(async () => {
        try {
            const data = await createSession();
            setSessionId(data.sessionId);
            if (data.welcomeMessage) {
                const welcomeMsg = {
                    role: 'assistant',
                    content: data.welcomeMessage.text,
                    richContent: data.welcomeMessage.richContent,
                    timestamp: new Date().toISOString()
                };
                setMessages([welcomeMsg]);
            }
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    }, []);

    useEffect(() => {
        initSession();
        const timer = setTimeout(() => setLoading(false), 2500);
        return () => clearTimeout(timer);
    }, []); // Run ONLY once on mount

    const handleSend = useCallback(async (text) => {
        if (!text.trim() || isTyping) return;
        const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        try {
            const data = await sendMessage(sessionId, text);
            const assistantMsg = { role: 'assistant', content: data.response, richContent: data.richContent, timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, assistantMsg]);
            if (data.collectedInfo?.selectedDestination) setSelectedDestination(data.collectedInfo.selectedDestination);
        } catch (error) {
            console.error('Send error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again!', timestamp: new Date().toISOString() }]);
        } finally {
            setIsTyping(false);
        }
    }, [sessionId, isTyping]);

    const handleDestinationSelect = useCallback((destName) => {
        setSelectedDestination(destName);
        handleSend(`I'd like to go to ${destName}`);
    }, [handleSend]);

    const handleNewChat = useCallback(() => {
        setMessages([]);
        setSelectedDestination(null);
        setIsTyping(false);
        initSession();
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
