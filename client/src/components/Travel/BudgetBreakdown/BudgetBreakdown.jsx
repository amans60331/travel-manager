import React from 'react';
import './BudgetBreakdown.css';

const BudgetBreakdown = ({ breakdown }) => {
    if (!breakdown) return null;

    const items = [
        { icon: '🚌', label: 'Travel', amount: breakdown.travel, color: '#FF6B1A' },
        { icon: '🏨', label: 'Accommodation', amount: breakdown.stay, color: '#FF8C42' },
        { icon: '🍽️', label: 'Food', amount: breakdown.food, color: '#FFB380' },
        { icon: '🛵', label: 'Local Commute', amount: breakdown.commute, color: '#FFD4B2' },
        { icon: '🧾', label: 'Buffer', amount: breakdown.buffer, color: '#4CAF50' }
    ];

    const total = breakdown.total || items.reduce((s, i) => s + i.amount, 0);

    return (
        <div className="budget-breakdown">
            <div className="budget-breakdown__title">
                💰 Budget Breakdown
            </div>
            <div className="budget-breakdown__items">
                {items.map((item, index) => (
                    <div className="budget-item" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                        <span className="budget-item__icon">{item.icon}</span>
                        <div className="budget-item__info">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="budget-item__label">{item.label}</span>
                                <span className="budget-item__amount">₹{item.amount?.toLocaleString()}</span>
                            </div>
                            <div className="budget-item__bar">
                                <div
                                    className="budget-item__bar-fill"
                                    style={{
                                        width: `${Math.min((item.amount / total) * 100, 100)}%`,
                                        background: item.color,
                                        animationDelay: `${index * 0.15}s`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="budget-breakdown__total">
                <span className="budget-breakdown__total-label">Total Budget</span>
                <span className="budget-breakdown__total-amount">₹{total?.toLocaleString()}</span>
            </div>
        </div>
    );
};

export default BudgetBreakdown;
