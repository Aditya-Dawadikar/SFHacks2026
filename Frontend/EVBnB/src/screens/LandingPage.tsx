import cleanEnergyVideo from '../assets/clean_energy.mp4';
import bookSlotImg from '../assets/book_slot.png';
import mapImg from '../assets/map.png';
import earnImg from '../assets/earn.png';
import React, { useRef, useEffect, useState } from 'react';
import './LandingPage.css';
import heroBgVideo from '../assets/hero_bg.mp4';
import PowerOutlinedIcon from '@mui/icons-material/PowerOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { Link } from 'react-router-dom';

const FOLDS = [
    { label: 'Home' },
    { label: 'Charge' },
    { label: 'Maps' },
    { label: 'Earn' },
    { label: 'Footer' },
];

const LandingPage = () => {
    const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
    const [activeFold, setActiveFold] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            let found = 0;
            for (let i = 0; i < sectionRefs.length; i++) {
                const ref = sectionRefs[i].current;
                if (ref) {
                    const top = ref.getBoundingClientRect().top + window.scrollY;
                    if (scrollY + vh / 2 >= top) {
                        found = i;
                    }
                }
            }
            setActiveFold(found);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sectionRefs]);

    // Smooth scroll on click
    const scrollToFold = idx => {
        const ref = sectionRefs[idx].current;
        if (ref) {
            ref.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="landing-container">
            <nav className="landing-navbar">
                <div className="logo">EVBnB</div>
                <div className="nav-links">
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Sign Up</Link>
                </div>
            </nav>
            <div className="fold-scrollbar">
                {FOLDS.map((fold, idx) => (
                    <div
                        key={fold.label}
                        className={`fold-scrollbar-bar${idx <= activeFold ? ' filled' : ''}${activeFold === idx ? ' active' : ''}`}
                        onClick={() => scrollToFold(idx)}
                    >
                        <span className="fold-scrollbar-label">{fold.label}</span>
                    </div>
                ))}
            </div>
            <main className="landing-main">
                {/* Fold 1: Hero */}
                <section ref={sectionRefs[0]} className="hero-section fold-section">
                    <div className="hero-video-bg-wrapper">
                        <video
                            className="hero-video-bg"
                            src={heroBgVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                        <div className="hero-overlay-content">
                            <h1>Charge Ahead with EVBnB</h1>
                            <p>Find, book, and rent EV chargers anywhere. Empowering drivers and owners for a greener tomorrow.</p>
                            <Link to="/browse" className="cta-btn">Browse Listings</Link>
                        </div>
                    </div>
                </section>
                {/* Fold 2: Charge (left media, right text) */}
                <section ref={sectionRefs[1]} className="fold-section fold-charge split-fold">
                    <div className="split-fold-media split-fold-media-left">
                        {/* Replace with real image/video as needed */}
                        <img src={bookSlotImg} alt="Book Slot" className="split-fold-img" />
                    </div>
                    <div className="split-fold-content split-fold-content-right">
                        <h2>Book a Slot</h2>
                        <p>Reserve your EV charging slot in seconds. Enjoy a seamless, hassle-free booking experience with real-time availability and instant confirmation.</p>
                    </div>
                </section>
                {/* Fold 3: Maps (left text, right media) */}
                <section ref={sectionRefs[2]} className="fold-section fold-maps split-fold">
                    <div className="split-fold-content split-fold-content-left">
                        <h2>Find Chargers on the Map</h2>
                        <p>Discover nearby chargers, filter by type, and navigate with ease. Our interactive map makes finding your next charge effortless.</p>
                    </div>
                    <div className="split-fold-media split-fold-media-right">
                        {/* Replace with real image/video as needed */}
                        <img src={mapImg} alt="Map" className="split-fold-img" />
                    </div>
                </section>
                {/* Fold 4: Earn (left media, right text) */}
                <section ref={sectionRefs[3]} className="fold-section fold-earn split-fold">
                    <div className="split-fold-media split-fold-media-left">
                        {/* Use earn.png for the Earn fold */}
                        <img src={earnImg} alt="Earn" className="split-fold-img" />
                    </div>
                    <div className="split-fold-content split-fold-content-right">
                        <h2>Earn by Hosting</h2>
                        <p>List your charger, set your schedule, and start earning. Help the EV community while making passive income from your unused charger.</p>
                    </div>
                </section>
                {/* Fold 5: Footer with background video */}
                <section ref={sectionRefs[4]} className="fold-section fold-footer">
                    <div className="footer-video-bg-wrapper">
                        <video
                            className="footer-video-bg"
                            src={cleanEnergyVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    </div>
                    <div className="footer-overlay-content">
                        <h2>Together for a Greener Tomorrow</h2>
                        <p>Every charge, every shared resource, and every journey brings us closer to a cleaner, more sustainable future. Join us in powering the movement for a better planet.</p>
                    </div>
                    <footer className="landing-footer">
                        <span>© 2026 EVBnB. All rights reserved.</span>
                    </footer>
                </section>
            </main>
        </div>
    );
};


export default LandingPage;
