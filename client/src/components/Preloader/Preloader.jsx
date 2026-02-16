import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Preloader.css';

const loadingPhrases = [
    'Mapping budget-friendly escapes across India…',
    'Balancing your stay, food, and travel costs…',
    'Picking destinations that match your vibe…',
    'Designing your personalised AI itinerary…',
];

const Preloader = () => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsVisible(false), 500);
                    return 100;
                }
                return Math.min(100, prev + Math.random() * 12);
            });
        }, 140);

        return () => clearInterval(interval);
    }, []);

    const currentPhraseIndex = Math.min(
        loadingPhrases.length - 1,
        Math.floor(progress / (100 / loadingPhrases.length))
    );

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="preloader"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        y: -80,
                        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
                    }}
                >
                    <div className="preloader__content">
                        <motion.div
                            className="preloader__logo"
                            initial={{ scale: 0.8, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                        >
                            <span className="preloader__logo-mark">TG</span>
                        </motion.div>

                        <div className="preloader__text-block">
                            <motion.h1
                                className="preloader__headline"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                TravelGenie
                            </motion.h1>
                            <p className="preloader__subtitle">
                                Dream, plan, and explore budget trips across India crafted by your AI travel manager.
                            </p>

                            <div className="preloader__phrases">
                                {loadingPhrases.map((phrase, index) => (
                                    <motion.span
                                        key={phrase}
                                        className={`preloader__phrase ${index === currentPhraseIndex ? 'preloader__phrase--active' : ''}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{
                                            opacity: index === currentPhraseIndex ? 1 : 0.3,
                                            y: index === currentPhraseIndex ? 0 : 4,
                                        }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {phrase}
                                    </motion.span>
                                ))}
                            </div>
                        </div>

                        <div className="preloader__bar-container">
                            <motion.div
                                className="preloader__bar"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: 'linear' }}
                            />
                        </div>

                        <motion.div
                            className="preloader__percentage"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {Math.round(progress)}%
                        </motion.div>
                    </div>

                    <div className="preloader__bg-shapes">
                        <motion.div
                            className="shape shape--1"
                            animate={{
                                scale: [1, 1.15, 1],
                                rotate: [0, 60, 0],
                            }}
                            transition={{ duration: 10, repeat: Infinity }}
                        />
                        <motion.div
                            className="shape shape--2"
                            animate={{
                                scale: [1, 1.25, 1],
                                x: [0, 40, 0],
                                y: [0, -24, 0],
                            }}
                            transition={{ duration: 14, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;
