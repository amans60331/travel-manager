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

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: "4d6fa68d-b78f-4081-a9f9-c93fa3d148c0",
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSubmitted(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                console.error("Web3Forms Error:", result);
                alert("Something went wrong! Please try again later.");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Failed to send message. Please check your connection.");
        } finally {
            setSending(false);
        }
    };

    const quickSubjects = [
        'Product feedback',
        'Bug or issue',
        'Collaboration opportunity',
        'Just saying hi',
    ];

    const messageLength = formData.message.length;

    return (
        <div className="contact-page">
            <div className="contact-hero">
                <h1 className="contact-hero__title">Get in Touch</h1>
                <p className="contact-hero__subtitle">
                    Have a question, feedback, or want to collaborate? I'd love to hear from you!
                </p>
                <div className="contact-hero__chips">
                    {quickSubjects.map(subject => (
                        <button
                            key={subject}
                            type="button"
                            className="contact-hero__chip"
                            onClick={() => setFormData(prev => ({ ...prev, subject }))}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            <div className="contact-grid">
                <div className="contact-info">
                    <div className="contact-info__card">
                        <div className="contact-info__icon contact-info__icon--accent">Email</div>
                        <h3>Email</h3>
                        <p>amansharma60331@gmail.com</p>
                    </div>
                    <div className="contact-info__card">
                        <div className="contact-info__icon contact-info__icon--accent">Location</div>
                        <h3>Location</h3>
                        <p>India</p>
                    </div>
                    <div className="contact-info__card">
                        <div className="contact-info__icon contact-info__icon--accent">Response</div>
                        <h3>Response Time</h3>
                        <p>Usually within 24 hours</p>
                    </div>
                    <div className="contact-info__card">
                        <div className="contact-info__icon contact-info__icon--accent">Social</div>
                        <h3>Social</h3>
                        <div className="contact-social-links">
                            <a href="https://github.com/amans60331" target="_blank" rel="noopener noreferrer">GitHub</a>
                            <a href="https://www.linkedin.com/in/aman-sharma-249508116" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        </div>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    {submitted && (
                        <div className="contact-form__success">
                            ✅ Message received! I'll get back to you at {formData.email}.
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
                        <div className="contact-form__meta">
                            <span>{messageLength} / 1000 characters</span>
                            <span>Tell me as much detail as you’d like.</span>
                        </div>
                    </div>
                    <button className="contact-form__submit" type="submit" disabled={sending}>
                        {sending ? 'Opening email...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
