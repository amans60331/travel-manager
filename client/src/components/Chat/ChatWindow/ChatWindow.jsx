import React, { useRef, useEffect } from 'react';
import MessageBubble from '../MessageBubble/MessageBubble';
import TypingIndicator from '../TypingIndicator/TypingIndicator';
import './ChatWindow.css';

const ChatWindow = ({ messages, isTyping, onDestinationSelect, selectedDestination, onSuggestionClick, hasStarted }) => {
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const hasMessages = messages && messages.length > 0;

    if (!hasMessages && !isTyping && !hasStarted) {
        return (
            <div className="chat-window chat-window--empty-state">
                <div className="chat-window__empty">
                    <div className="chat-window__empty-icon">🌍</div>
                    <div className="chat-window__empty-title">Plan Your Dream Trip</div>
                    <div className="chat-window__empty-text">
                        Tell me your budget, dates, and preferences. I'll suggest the perfect destinations with real booking links, itineraries, and budget breakdowns!
                    </div>
                    <div className="suggestions">
                        <button className="suggestion-chip" onClick={() => onSuggestionClick("Hi, I want to travel from Pune to mountains with a 20k budget for 5 days")}>
                            🏔️ Mountains • ₹20k
                        </button>
                        <button className="suggestion-chip" onClick={() => onSuggestionClick("Plan a beach trip for 2 people, budget 30k, 5 days from Mumbai")}>
                            🏖️ Beach trip • ₹30k
                        </button>
                        <button className="suggestion-chip" onClick={() => onSuggestionClick("Budget solo trip to any cultural city in India for 3 days")}>
                            🏛️ Culture • Solo • ₹10k
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window" ref={chatContainerRef}>
            {messages.map((msg, index) => (
                <MessageBubble
                    key={index}
                    message={msg}
                    onDestinationSelect={onDestinationSelect}
                    selectedDestination={selectedDestination}
                />
            ))}
            {isTyping && <TypingIndicator />}
        </div>
    );
};

export default ChatWindow;
