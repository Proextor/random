import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Pole from '../components/pole/Pole';
import HelixCards from '../components/nav/HelixCards';
import ParticleField from '../components/background/ParticleField';
import FogColumn from '../components/pole/FogColumn';
import DebrisField from '../components/background/DebrisField';
import FloorReflection from '../components/background/FloorReflection';

const CanvasFallback = () => (
    <div style={{ position: 'absolute', inset: 0, background: '#08080f' }} />
);

const FallbackHero = () => (
    <div style={{ position: 'absolute', inset: 0, background: '#08080f' }} />
);

class SceneErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { crashed: false }; }
    componentDidCatch(e) { console.warn('Scene component crashed:', this.props.name, e.message); this.setState({ crashed: true }); }
    render() { return this.state.crashed ? null : this.props.children; }
}

function SceneContents({ onCardClick }) {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <pointLight position={[0, 2, 4]} intensity={1} color="#4f7cff" />

            <Suspense fallback={null}>
                <Environment preset="night" />
            </Suspense>

            <group scale={isMobile ? 0.75 : 1}>
                <Pole />
                <FogColumn />
                <DebrisField />
                <HelixCards onCardClick={onCardClick} />
            </group>

            <ParticleField />
        </>
    );
}
export default function HeroScene({ onCardClick }) {
    console.log('[BOOT] HeroScene component mounted');
    const [ready, setReady] = useState(false);
    const [webglSupported, setWebglSupported] = useState(true);

    useEffect(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) { setWebglSupported(false); return; }
        requestAnimationFrame(() => setReady(true));
    }, []);

    if (!webglSupported) return <FallbackHero />;
    if (!ready) return <CanvasFallback />;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1;

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none'
        }}>
            <Canvas
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    background: 'transparent'
                }}
                camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 100 }}
                gl={{
                    powerPreference: "high-performance",
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: false,
                    failIfMajorPerformanceCaveat: false
                }}
                dpr={[1, dpr]}
                frameloop="always"
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                    console.log('[BOOT] Canvas WebGL context created', gl);
                }}
            >
                <SceneContents onCardClick={onCardClick} />

                <EffectComposer disableNormalPass multisampling={4}>
                    <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={0.3} />
                    <Vignette eskil={false} offset={0.2} darkness={0.8} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}