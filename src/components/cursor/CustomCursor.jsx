import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import useMouse from '../../hooks/useMouse';
import styles from './cursor.module.css';

export default function CustomCursor() {
    const mouseRef = useMouse();
    const ringRef = useRef(null);
    const dotRef = useRef(null);
    const trailRefs = useRef([]);
    const labelRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    const trails = Array(8).fill(0);

    const pos = useRef({ x: -100, y: -100 });
    const ringPos = useRef({ x: -100, y: -100 });
    const trailHistory = useRef([]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) return;

        gsap.set([dotRef.current, ringRef.current, ...trailRefs.current], {
            xPercent: -50,
            yPercent: -50
        });

        const onMouseDown = () => {
            if (!mouseRef.current) return;
            const ripple = document.createElement('div');
            ripple.className = styles.ripple;
            document.body.appendChild(ripple);

            gsap.set(ripple, {
                left: pos.current.x,
                top: pos.current.y,
                xPercent: -50,
                yPercent: -50
            });

            gsap.to(ripple, {
                scale: 6,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: () => ripple.remove()
            });

            gsap.to(ringRef.current, {
                scaleX: 1.4,
                scaleY: 0.6,
                duration: 0.1,
                ease: 'power2.inOut',
                yoyo: true,
                repeat: 1
            });
        };

        window.addEventListener('mousedown', onMouseDown);

        let frame = null;

        const update = () => {
            const state = mouseRef.current;
            if (!state) return;

            pos.current.x = state.x;
            pos.current.y = state.y;

            gsap.set(dotRef.current, { x: pos.current.x, y: pos.current.y });

            ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
            ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;

            const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
            const angle = Math.atan2(state.vy, state.vx) * (180 / Math.PI);

            let targetScale = 1;
            let targetBg = 'transparent';
            let ringBorderColor = state.isMatte ? 'rgba(255,255,255,0.4)' : 'var(--glass-border)';
            let dotColor = state.isCanvas ? 'var(--accent-secondary)' : 'var(--accent-glow)';

            let labelText = '';
            if (state.hovering) {
                targetScale = 1.6;
                targetBg = state.isCanvas ? 'transparent' : 'var(--glass-primary)';
                labelText = state.isCanvas ? '⟳' : (state.label || '');
            }

            gsap.to(ringRef.current, {
                x: ringPos.current.x,
                y: ringPos.current.y,
                scale: targetScale,
                rotation: speed > 1 ? angle : 0,
                backgroundColor: targetBg,
                borderColor: ringBorderColor,
                duration: 0.1,
                ease: 'none'
            });

            gsap.to(dotRef.current, {
                backgroundColor: dotColor,
                duration: 0.2
            });

            if (labelRef.current) {
                labelRef.current.innerText = labelText;
                labelRef.current.style.fontSize = state.isCanvas ? '20px' : '10px';
            }

            const now = performance.now();
            trailHistory.current.push({ x: pos.current.x, y: pos.current.y, t: now });

            while (trailHistory.current.length > 50) {
                trailHistory.current.shift();
            }

            trailRefs.current.forEach((el, index) => {
                if (!el) return;
                const delay = (index + 1) * 20;
                const targetTime = now - delay;

                let closest = trailHistory.current[trailHistory.current.length - 1];
                if (closest) {
                    for (let i = trailHistory.current.length - 1; i >= 0; i--) {
                        if (trailHistory.current[i].t <= targetTime) {
                            closest = trailHistory.current[i];
                            break;
                        }
                    }
                    gsap.set(el, {
                        x: closest.x,
                        y: closest.y,
                        scale: 1 - (index * 0.1),
                        opacity: 0.3 - (index * 0.035)
                    });
                }
            });

            frame = requestAnimationFrame(update);
        };

        frame = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('mousedown', onMouseDown);
            cancelAnimationFrame(frame);
        };
    }, [mouseRef, isMobile]);

    if (isMobile) return null;

    return (
        <>
            <div className={styles.trailsContainer}>
                {trails.map((_, i) => (
                    <div
                        key={i}
                        ref={el => (trailRefs.current[i] = el)}
                        className={styles.trailDot}
                    />
                ))}
            </div>

            <div className={styles.ring} ref={ringRef}>
                <div className={styles.label} ref={labelRef}></div>
            </div>

            <div className={styles.dot} ref={dotRef} />
        </>
    );
}
