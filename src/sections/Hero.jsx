import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import HeroScene from '../scenes/HeroScene';
import Antigravity from '../components/background/Antigravity';
import { heroScrollState } from '../utils/math';

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ isLoaded, onCardClick }) {
    console.log('[BOOT] Hero component mounted');
    const container = useRef(null);
    const canvasRef = useRef(null);
    const titleRef = useRef(null);
    const [sceneReady, setSceneReady] = useState(false);

    useEffect(() => {
        if (isLoaded) setSceneReady(true);
        const fallback = setTimeout(() => setSceneReady(true), 2500);
        return () => clearTimeout(fallback);
    }, [isLoaded]);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: 'top top',
                end: '+=300%',
                pin: true,
                scrub: 1,
                onUpdate: (self) => {
                    heroScrollState.progress = self.progress;
                }
            }
        });

        tl.to(titleRef.current, { opacity: 0, duration: 0.2 }, 0);
    }, { scope: container });

    return (
        <section
            ref={container}
            id="hero"
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                overflow: 'hidden',
                background: '#040509' // Static background restored while aurora is moved to intro
            }}
            data-cursor-label="EXPLORE"
        >
            {/* White dense particles — behind 3D but above background */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    pointerEvents: "none"
                }}
            >
                <Antigravity
                    count={800}
                    magnetRadius={5}
                    ringRadius={6}
                    waveSpeed={0.3}
                    waveAmplitude={0.6}
                    particleSize={3.0}
                    lerpSpeed={0.08}
                    color="#ffffff"
                    autoAnimate={false}
                    particleVariance={0.5}
                    rotationSpeed={0}
                    depthFactor={0.8}
                    pulseSpeed={2}
                    particleShape="sphere"
                    fieldStrength={8}
                />
            </div>

            {/* 3D Canvas — above particles */}
            <div
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    opacity: 1,
                    visibility: 'visible',
                    pointerEvents: 'none'
                }}
            >
                <HeroScene onCardClick={onCardClick} />
            </div>

            {/* UI text overlay */}
            <div
                ref={titleRef}
                className="absolute inset-0 pointer-events-none flex flex-col justify-between items-center px-4 py-8"
                style={{ zIndex: 3 }}
            >
                <div />
                <p className="text-[10px] md:text-[12px] text-white/50 max-w-2xl text-center font-bold tracking-[0.4em] uppercase">
                    Drag horizontally to explore destinations
                </p>
            </div>
        </section>
    );
}