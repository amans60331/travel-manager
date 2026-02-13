import React, { useState, useRef, useEffect } from 'react';
import './InputBar.css';

const InputBar = ({ onSend, disabled }) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (!disabled) {
            inputRef.current?.focus();
        }
    }, [disabled]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (trimmed && !disabled) {
            onSend(trimmed);
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form className="input-bar" onSubmit={handleSubmit}>
            <div className="input-bar__container">
                <input
                    ref={inputRef}
                    className="input-bar__field"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={disabled ? "Thinking..." : "Type your travel plans..."}
                    disabled={disabled}
                    autoComplete="off"
                />
            </div>
            <button
                className="input-bar__send"
                type="submit"
                disabled={disabled || !message.trim()}
            >
                ➤
            </button>
        </form>
    );
};

export default InputBar;
