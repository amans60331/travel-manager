import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        // Send via mailto (client-side) or you can hook up a backend email service
        const mailtoLink = `mailto:amansharma60331@gmail.com?subject=${encodeURIComponent(formData.subject || 'TravelGenie Contact')}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;
        window.open(mailtoLink, '_blank');

        // Simulate send
        setTimeout(() => {
            setSending(false);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1000);
    };

    return (
        <div className="contact-page">
            <div className="contact-hero">
                <h1 className="contact-hero__title">Get in Touch</h1>
                <p className="contact-hero__subtitle">
                    Have a question, feedback, or want to collaborate? I'd love to hear from you!
                </p>
            </div>

            <div className="contact-grid">
                <div className="contact-info">
                    <div className="contact-info__card">
                        <div className="contact-info__icon">📧</div>
                        <h3>Email</h3>
                        <p>amansharma60331@gmail.com</p>
                    </div>
                    <div className="contact-info__card">
                        <div className="contact-info__icon">📍</div>
                        <h3>Location</h3>
                        <p>India</p>
                    </div>
                    <div className="contact-info__card">
                        <div className="contact-info__icon">⏰</div>
                        <h3>Response Time</h3>
                        <p>Usually within 24 hours</p>
                    </div>
                    <div className="contact-info__card">
                        <div className="contact-info__icon">🔗</div>
                        <h3>Social</h3>
                        <div className="contact-social-links">
                            <a href="https://github.com/amansharma60331" target="_blank" rel="noopener noreferrer">GitHub</a>
                            <a href="https://linkedin.com/in/amansharma60331" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        </div>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    {submitted && (
                        <div className="contact-form__success">
                            ✅ Your email client should have opened! If not, you can email me directly at amansharma60331@gmail.com
                        </div>
                    )}
                    <div className="contact-form__group">
                        <label htmlFor="contact-name">Your Name</label>
                        <input
                            id="contact-name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Aman Sharma"
                            required
                        />
                    </div>
                    <div className="contact-form__group">
                        <label htmlFor="contact-email">Your Email</label>
                        <input
                            id="contact-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="contact-form__group">
                        <label htmlFor="contact-subject">Subject</label>
                        <input
                            id="contact-subject"
                            name="subject"
                            type="text"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Feedback about TravelGenie"
                        />
                    </div>
                    <div className="contact-form__group">
                        <label htmlFor="contact-message">Message</label>
                        <textarea
                            id="contact-message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell me what's on your mind..."
                            rows={6}
                            required
                        />
                    </div>
                    <button className="contact-form__submit" type="submit" disabled={sending}>
                        {sending ? 'Opening email...' : '📧 Send Message'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
