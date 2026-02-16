import React from 'react';
import devPhoto from '../image1.jpeg';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="about-hero__content">
                    <h1 className="about-hero__title">About TravelGenie</h1>
                    <p className="about-hero__subtitle">
                        An AI-powered travel planning agent that helps you discover budget-friendly
                        destinations across India built with love, code, and a passion for adventure.
                    </p>
                </div>
            </section>

            <section className="about-section about-section--dark">
                <h2 className="about-section__title">Meet the Developer</h2>
                <div className="about-developer">
                    <div className="about-developer__avatar">
                        <img
                            src={devPhoto}
                            alt="Aman Sharma"
                            className="about-developer__avatar-img"
                        />
                        <span className="about-developer__initials">AS</span>
                    </div>
                    <div className="about-developer__info">
                        <h3>Aman Sharma</h3>
                        <p className="about-developer__tagline">Full-Stack Developer & AI Enthusiast</p>
                        <p className="about-developer__bio">
                            I'm a passionate developer who loves building things that combine AI with
                            practical utility. From parkour apps to portfolio websites to this AI travel
                            manager I enjoy pushing the boundaries of what's possible with modern web tech.
                        </p>
                        <p className="about-developer__bio">
                            I specialize in React, Node.js, and AI/ML integrations. I believe good
                            software should feel premium, be intuitive, and actually solve real problems.
                            TravelGenie is my take on making AI practically useful for everyday travel planning in India.
                        </p>
                        <div className="about-developer__skills">
                            <span className="skill-tag">React</span>
                            <span className="skill-tag">Node.js</span>
                            <span className="skill-tag">Google Gemini AI</span>
                            <span className="skill-tag">MongoDB</span>
                            <span className="skill-tag">Agentic AI</span>
                            <span className="skill-tag">Full-Stack</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <div className="about-grid">
                    <div className="about-card">
                        <div className="about-card__icon">🧠</div>
                        <h3>AI-Powered Planning</h3>
                        <p>
                            TravelGenie uses Google's Gemini AI with a custom agentic architecture
                            to understand your travel needs, validate budgets, and suggest the perfect
                            destinations — all through natural conversation.
                        </p>
                    </div>
                    <div className="about-card">
                        <div className="about-card__icon">💰</div>
                        <h3>Budget-First Approach</h3>
                        <p>
                            Every recommendation is grounded in real cost data. No imaginary prices
                            the agent validates your budget against actual travel, stay, and food costs
                            before suggesting anything.
                        </p>
                    </div>
                    <div className="about-card">
                        <div className="about-card__icon">🔗</div>
                        <h3>Real Booking Links</h3>
                        <p>
                            No fake URLs. Every link is algorithmically generated to point to
                            Booking.com, RedBus, IRCTC, MakeMyTrip, and Google Maps with your
                            dates and budget filters pre-applied.
                        </p>
                    </div>
                    <div className="about-card">
                        <div className="about-card__icon">🏗️</div>
                        <h3>Agentic Architecture</h3>
                        <p>
                            Built with a state-machine orchestrator that progresses through 6 phases:
                            collect → validate → suggest → breakdown → links → itinerary.
                            Each phase uses specialized tools.
                        </p>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <h2 className="about-section__title">Tech Stack</h2>
                <div className="tech-stack-grid">
                    <div className="tech-item">
                        <div className="tech-item__icon">⚛️</div>
                        <div className="tech-item__name">React 19</div>
                        <div className="tech-item__desc">Frontend UI</div>
                    </div>
                    <div className="tech-item">
                        <div className="tech-item__icon">🟢</div>
                        <div className="tech-item__name">Node.js + Express</div>
                        <div className="tech-item__desc">Backend API</div>
                    </div>
                    <div className="tech-item">
                        <div className="tech-item__icon">🤖</div>
                        <div className="tech-item__name">Gemini 2.0 Flash</div>
                        <div className="tech-item__desc">AI Engine</div>
                    </div>
                    <div className="tech-item">
                        <div className="tech-item__icon">🍃</div>
                        <div className="tech-item__name">MongoDB Atlas</div>
                        <div className="tech-item__desc">Database</div>
                    </div>
                    <div className="tech-item">
                        <div className="tech-item__icon">⚡</div>
                        <div className="tech-item__name">Vite</div>
                        <div className="tech-item__desc">Build Tool</div>
                    </div>
                    <div className="tech-item">
                        <div className="tech-item__icon">🔧</div>
                        <div className="tech-item__name">Custom Tools</div>
                        <div className="tech-item__desc">Agentic Functions</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
