import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar__container">
                <Link to="/" className="navbar__logo">
                    <span className="navbar__icon">⛵</span>
                    <span className="navbar__title">TravelGenie</span>
                </Link>

                <div className="navbar__menu">
                    <Link to="/" className="navbar__link">Home</Link>
                    <Link to="/destinations" className="navbar__link">Destinations</Link>
                    <Link to="/about" className="navbar__link">About</Link>
                    <Link to="/contact" className="navbar__link">Contact</Link>
                </div>

                <div className="navbar__actions">
                    <Link to="/" className="navbar__btn">Get Started</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
