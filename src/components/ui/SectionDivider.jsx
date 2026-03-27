import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function SectionDivider({ title }) {
    const dividerRef = useRef();
    const wordsRef = useRef([]);

    useGSAP(() => {
        gsap.fromTo(dividerRef.current,
            { x: '-10%', filter: 'blur(8px)', opacity: 0 },
            {
                x: '0%',
                filter: 'blur(0px)',
                opacity: 1,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: dividerRef.current,
                    start: 'top 85%',
                }
            }
        );

        if (wordsRef.current.length) {
            gsap.fromTo(wordsRef.current,
                { clipPath: 'inset(0 100% 0 0)' },
                {
                    clipPath: 'inset(0 0% 0 0)',
                    duration: 0.8,
                    ease: 'power2.out',
                    stagger: 0.06,
                    scrollTrigger: {
                        trigger: dividerRef.current,
                        start: 'top 80%',
                    }
                }
            );
        }
    }, { scope: dividerRef });

    const words = title.split(' ');

    return (
        <div ref={dividerRef} className="w-full py-6 px-12 matte-surface relative overflow-hidden flex items-center border-y border-[rgba(255,255,255,0.06)] bg-[var(--matte-frost)] will-change-transform">
            <div className="absolute inset-0 opacity-10 filter contrast-150 grayscale mix-blend-overlay"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}>
            </div>
            <h2 className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase text-white/80 z-10 flex gap-3">
                {words.map((w, i) => (
                    <span key={i} ref={el => wordsRef.current[i] = el} style={{ display: 'inline-block', clipPath: 'inset(0 100% 0 0)' }}>
                        {w}
                    </span>
                ))}
            </h2>
        </div>
    );
}
