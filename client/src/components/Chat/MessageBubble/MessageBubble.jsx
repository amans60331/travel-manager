import React from 'react';
import RichContent from '../../Travel/RichContent/RichContent';
import './MessageBubble.css';

/**
 * Parse simple markdown to JSX (handles bold, links, line breaks)
 */
function parseMarkdown(text) {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];

    lines.forEach((line, lineIdx) => {
        if (line.startsWith('### ')) {
            elements.push(<h3 key={lineIdx}>{line.slice(4)}</h3>);
            return;
        }
        if (line.startsWith('## ')) {
            elements.push(<h2 key={lineIdx}>{line.slice(3)}</h2>);
            return;
        }

        if (line.includes('|') && line.trim().startsWith('|')) {
            if (line.match(/^\|[\s-|]+\|$/)) return;

            const cells = line.split('|').filter(c => c.trim());
            if (cells.length > 0) {
                elements.push(
                    <div key={lineIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-light)' }}>
                        {cells.map((cell, i) => (
                            <span key={i} style={{ fontWeight: i === 0 ? 500 : 600 }}>{parseInline(cell.trim())}</span>
                        ))}
                    </div>
                );
            }
            return;
        }

        if (line.startsWith('• ') || line.startsWith('- ') || line.match(/^\d+\. /)) {
            const content = line.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, '');
            elements.push(
                <div key={lineIdx} style={{ display: 'flex', gap: '6px', margin: '2px 0' }}>
                    <span style={{ color: 'var(--primary)', flexShrink: 0 }}>•</span>
                    <span>{parseInline(content)}</span>
                </div>
            );
            return;
        }

        if (line.match(/^[0-9]️⃣/)) {
            elements.push(
                <div key={lineIdx} style={{ margin: '6px 0', fontWeight: 500 }}>
                    {parseInline(line)}
                </div>
            );
            return;
        }

        if (line.trim() === '') {
            elements.push(<div key={lineIdx} style={{ height: '6px' }} />);
            return;
        }

        elements.push(<p key={lineIdx}>{parseInline(line)}</p>);
    });

    return elements;
}

function parseInline(text) {
    if (!text) return text;

    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

        let nextMatch = null;
        let nextIdx = remaining.length;

        if (boldMatch && boldMatch.index < nextIdx) {
            nextMatch = { type: 'bold', match: boldMatch };
            nextIdx = boldMatch.index;
        }
        if (linkMatch && linkMatch.index < nextIdx) {
            nextMatch = { type: 'link', match: linkMatch };
            nextIdx = linkMatch.index;
        }

        if (!nextMatch) {
            parts.push(remaining);
            break;
        }

        if (nextIdx > 0) {
            parts.push(remaining.slice(0, nextIdx));
        }

        if (nextMatch.type === 'bold') {
            parts.push(<strong key={key++}>{nextMatch.match[1]}</strong>);
            remaining = remaining.slice(nextIdx + nextMatch.match[0].length);
        } else if (nextMatch.type === 'link') {
            parts.push(
                <a key={key++} href={nextMatch.match[2]} target="_blank" rel="noopener noreferrer">
                    {nextMatch.match[1]}
                </a>
            );
            remaining = remaining.slice(nextIdx + nextMatch.match[0].length);
        }
    }

    return parts;
}

const MessageBubble = ({ message, onDestinationSelect, selectedDestination }) => {
    const isUser = message.role === 'user';
    const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <div className={`message message--${message.role}`}>
            <div className="message__avatar">
                {isUser ? '👤' : '🤖'}
            </div>
            <div>
                <div className="message__content">
                    {parseMarkdown(message.content)}
                </div>
                {message.richContent && (
                    <div className="message__rich-content">
                        <RichContent
                            richContent={message.richContent}
                            onDestinationSelect={onDestinationSelect}
                            selectedDestination={selectedDestination}
                        />
                    </div>
                )}
                {time && <div className="message__time">{time}</div>}
            </div>
        </div>
    );
};

export default MessageBubble;
