import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer--short">
            <div className="footer__container">
                <div className="footer__brand">
                    <span className="footer__logo-icon">⛵</span>
                    <span className="footer__logo-text">TravelGenie</span>
                    <span className="footer__tagline">© 2026 AI Travel Manager</span>
                </div>

                <div className="footer__links--short">
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/destinations">Destinations</Link>
                </div>

                <div className="footer__social--short">
                    <a href="https://x.com/_Aman_san_" target="_blank" rel="noopener noreferrer" title="Twitter">
                        Twitter
                    </a>
                    <a href="https://www.linkedin.com/in/aman-sharma-249508116" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                        LinkedIn
                    </a>
                    <a href="https://github.com/amans60331" target="_blank" rel="noopener noreferrer" title="GitHub">
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
