import { useProgress } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Loader({ onLoaded }) {
    const { progress } = useProgress();
    const loaderRef = useRef();
    const barRef = useRef();
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        gsap.to(barRef.current, { width: `${progress}%`, duration: 0.2 });

        if (progress === 100 && !complete) {
            setComplete(true);
            gsap.to(loaderRef.current, {
                opacity: 0,
                duration: 0.8,
                ease: 'power3.inOut',
                delay: 0.3,
                onComplete: onLoaded
            });
        }
    }, [progress, complete, onLoaded]);

    return (
        <div ref={loaderRef} className="fixed inset-0 z-[99999] bg-[#00040f] flex flex-col justify-end">
            <div className="w-full h-1 bg-[rgba(255,255,255,0.05)]">
                <div ref={barRef} className="h-full bg-[rgba(255,255,255,0.8)] shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: '0%' }}></div>
            </div>
        </div>
    );
}
