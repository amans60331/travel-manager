import React from 'react';
import './Destinations.css';

const destinations = [
    { name: 'Manali', type: 'mountains', state: 'Himachal Pradesh', emoji: '🏔️', cost: '₹2,000/day', description: 'Snow-capped peaks, adventure sports, and vibrant cafes in the heart of Himachal.', highlights: ['Snow in Feb', 'Solang Valley', 'Old Manali Cafes'] },
    { name: 'Kasol', type: 'mountains', state: 'Himachal Pradesh', emoji: '⛰️', cost: '₹1,500/day', description: 'Israel of India, budget-friendly hamlet in Parvati Valley with stunning treks.', highlights: ['Parvati Valley', 'Tosh Village', 'Kheerganga Trek'] },
    { name: 'Rishikesh', type: 'adventure', state: 'Uttarakhand', emoji: '🧗', cost: '₹1,800/day', description: 'Adventure & yoga capital, sitting on the banks of the holy Ganges.', highlights: ['River Rafting', 'Laxman Jhula', 'Beatles Ashram'] },
    { name: 'Jaipur', type: 'culture', state: 'Rajasthan', emoji: '🏛️', cost: '₹2,000/day', description: 'The Pink City bursting with royal palaces and vibrant bazaars.', highlights: ['Amber Fort', 'Hawa Mahal', 'Street Food Paradise'] },
    { name: 'Goa', type: 'beach', state: 'Goa', emoji: '🏖️', cost: '₹2,500/day', description: "India's beach paradise with stunning coastline and vibrant nightlife.", highlights: ['Beaches', 'Nightlife', 'Portuguese Architecture'] },
    { name: 'Udaipur', type: 'culture', state: 'Rajasthan', emoji: '🏛️', cost: '₹2,200/day', description: 'The Venice of the East, dreamy city with grand palaces and lakes.', highlights: ['Lake Pichola', 'City Palace', 'Romantic Getaway'] },
    { name: 'Varanasi', type: 'culture', state: 'Uttar Pradesh', emoji: '🕉️', cost: '₹1,500/day', description: 'One of the oldest continuously inhabited cities in the world.', highlights: ['Ganga Aarti', 'Ancient Ghats', 'Spiritual Experience'] },
    { name: 'Pondicherry', type: 'beach', state: 'Puducherry', emoji: '🏖️', cost: '₹2,000/day', description: 'Charming former French colony with colorful colonial architecture.', highlights: ['French Quarter', 'Auroville', 'Promenade Beach'] },
    { name: 'Mcleodganj', type: 'mountains', state: 'Himachal Pradesh', emoji: '🏔️', cost: '₹1,600/day', description: 'Residence of the Dalai Lama, a blend of Tibetan culture and mountains.', highlights: ['Triund Trek', 'Dalai Lama Temple', 'Tibetan Food'] },
    { name: 'Mussoorie', type: 'mountains', state: 'Uttarakhand', emoji: '⛰️', cost: '₹1,800/day', description: 'Classic British-era hill station with scenic viewpoints and colonial charm.', highlights: ['Queen of Hills', 'Kempty Falls', 'Mall Road'] },
];

const typeColors = {
    'mountains': { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    'beach': { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    'culture': { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
    'adventure': { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
};

const Destinations = () => {
    return (
        <div className="destinations-page">
            <div className="destinations-hero">
                <h1 className="destinations-hero__title">Explore Destinations</h1>
                <p className="destinations-hero__subtitle">
                    Handpicked budget-friendly destinations across India. Each one vetted with real cost data.
                </p>
            </div>

            <div className="destinations-grid">
                {destinations.map((dest, i) => {
                    const colors = typeColors[dest.type] || typeColors['culture'];
                    return (
                        <div className="dest-card" key={i}>
                            <div className="dest-card__header">
                                <span className="dest-card__emoji">{dest.emoji}</span>
                                <span className="dest-card__type" style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                                    {dest.type}
                                </span>
                            </div>
                            <h3 className="dest-card__name">{dest.name}</h3>
                            <p className="dest-card__state">{dest.state}</p>
                            <p className="dest-card__desc">{dest.description}</p>
                            <div className="dest-card__highlights">
                                {dest.highlights.map((h, j) => (
                                    <span className="dest-card__tag" key={j}>{h}</span>
                                ))}
                            </div>
                            <div className="dest-card__footer">
                                <span className="dest-card__cost">~{dest.cost}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Destinations;
