import React from 'react';
import './DestinationCard.css';

const DestinationCard = ({ destination, selected, onSelect }) => {
    const typeEmoji = {
        'mountains': '🏔️',
        'beach': '🏖️',
        'culture': '🏛️',
        'adventure': '🧗',
        'mix': '🌍'
    };

    return (
        <div
            className={`destination-card ${selected ? 'destination-card--selected' : ''}`}
            onClick={() => onSelect(destination.name)}
        >
            <span className="destination-card__type">
                {typeEmoji[destination.type] || '📍'} {destination.type}
            </span>
            <div className="destination-card__name">{destination.name}</div>
            <div className="destination-card__state">{destination.state}</div>
            <div className="destination-card__highlights">
                {destination.highlights?.slice(0, 3).map((h, i) => (
                    <span className="destination-card__tag" key={i}>{h}</span>
                ))}
            </div>
            <div className="destination-card__cost">
                ~₹{destination.avgDailyCost?.toLocaleString()}/day
            </div>
            {!selected && (
                <div className="destination-card__select-hint">Click to select →</div>
            )}
            {selected && (
                <div className="destination-card__select-hint" style={{ opacity: 1, color: 'var(--success)' }}>
                    ✓ Selected
                </div>
            )}
        </div>
    );
};

export default DestinationCard;
