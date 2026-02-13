import React from 'react';
import './LinkButton.css';

const LinkButton = ({ href, icon, label }) => {
    return (
        <a
            className="link-button"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
        >
            <span className="link-button__icon">{icon}</span>
            {label}
            <span style={{ fontSize: '12px', opacity: 0.7 }}>↗</span>
        </a>
    );
};

export default LinkButton;
