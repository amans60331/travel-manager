import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Preloader.css';

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
                return prev + Math.random() * 15;
            });
        }, 150);
        return () => clearInterval(interval);
    }, []);

    const words = ["Dream", "Plan", "Explore", "TravelGenie"];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="preloader"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        y: -100,
                        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
                    }}
                >
                    <div className="preloader__content">
                        <motion.div
                            className="preloader__logo"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <span className="preloader__icon">✨</span>
                        </motion.div>

                        <div className="preloader__text-container">
                            {words.map((word, i) => (
                                <motion.span
                                    key={i}
                                    className="preloader__word"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: progress > (i * 25) ? 1 : 0,
                                        y: progress > (i * 25) ? 0 : 20
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {word}{i < words.length - 1 ? " • " : ""}
                                </motion.span>
                            ))}
                        </div>

                        <div className="preloader__bar-container">
                            <motion.div
                                className="preloader__bar"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "linear" }}
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
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{ duration: 10, repeat: Infinity }}
                        />
                        <motion.div
                            className="shape shape--2"
                            animate={{
                                scale: [1, 1.3, 1],
                                x: [0, 50, 0],
                                y: [0, -30, 0],
                            }}
                            transition={{ duration: 15, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;
