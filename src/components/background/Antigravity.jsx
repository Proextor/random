import { useRef, useEffect, useCallback } from 'react';

export default function Antigravity({
    count = 500,
    magnetRadius = 6,
    waveSpeed = 0.35,
    waveAmplitude = 0.5,
    particleSize = 0.8,
    lerpSpeed = 0.05,
    color = '#ffffff',
    particleVariance = 0.5,
    depthFactor = 1,
    pulseSpeed = 2,
    fieldStrength = 8,
}) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const particlesRef = useRef([]);
    const frameRef = useRef(null);

    const initParticles = useCallback((w, h) => {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const depth = 0.3 + Math.random() * 0.7;
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                homeX: Math.random() * w,
                homeY: Math.random() * h,
                vx: 0,
                vy: 0,
                size: (particleSize * 0.5 + Math.random() * particleSize * particleVariance) * depth,
                depth,
                phase: Math.random() * Math.PI * 2,
                pulsePhase: Math.random() * Math.PI * 2,
            });
        }
        return particles;
    }, [count, particleSize, particleVariance]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let w = canvas.parentElement.clientWidth;
        let h = canvas.parentElement.clientHeight;
        canvas.width = w;
        canvas.height = h;

        particlesRef.current = initParticles(w, h);

        const onResize = () => {
            const newW = canvas.parentElement.clientWidth;
            const newH = canvas.parentElement.clientHeight;
            const scaleX = newW / w;
            const scaleY = newH / h;
            w = newW;
            h = newH;
            canvas.width = w;
            canvas.height = h;
            particlesRef.current.forEach(p => {
                p.x *= scaleX;
                p.y *= scaleY;
                p.homeX *= scaleX;
                p.homeY *= scaleY;
            });
        };

        const onMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        const onMouseLeave = () => {
            mouseRef.current.x = -9999;
            mouseRef.current.y = -9999;
        };

        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseleave', onMouseLeave);

        let time = 0;

        const render = () => {
            time += 0.016;
            ctx.clearRect(0, 0, w, h);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const magR = magnetRadius * 40;

            particlesRef.current.forEach(p => {
                // Wave drift
                const waveX = Math.sin(time * waveSpeed + p.phase) * waveAmplitude * 0.5;
                const waveY = Math.cos(time * waveSpeed * 0.7 + p.phase) * waveAmplitude * 0.3;

                let targetX = p.homeX + waveX * p.depth * depthFactor;
                let targetY = p.homeY + waveY * p.depth * depthFactor;

                // Mouse magnetic repulsion
                const dx = p.x - mx;
                const dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < magR && dist > 0.1) {
                    const force = ((magR - dist) / magR) * fieldStrength * 0.15;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    targetX += nx * force * 40;
                    targetY += ny * force * 40;
                }

                // Smooth lerp
                p.x += (targetX - p.x) * lerpSpeed;
                p.y += (targetY - p.y) * lerpSpeed;

                // Pulse opacity
                const pulse = (Math.sin(time * pulseSpeed + p.pulsePhase) * 0.5 + 0.5);
                const alpha = (0.04 + pulse * 0.12) * p.depth;

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');

                // Handle hex color
                if (color.startsWith('#')) {
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                }

                ctx.fill();
            });

            frameRef.current = requestAnimationFrame(render);
        };

        frameRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseleave', onMouseLeave);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [initParticles, magnetRadius, waveSpeed, waveAmplitude, lerpSpeed, color, depthFactor, pulseSpeed, fieldStrength]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
            }}
        />
    );
}
