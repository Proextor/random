import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Object3D, Color } from 'three';
import useMouse from '../../hooks/useMouse';

const ParticleTypes = ['torus', 'icosahedron', 'plane'];

export default function DebrisField() {
    const groupMRefs = {
        torus: useRef(),
        icosahedron: useRef(),
        plane: useRef()
    };

    const count = 60;
    const countPerType = 20;

    const data = useMemo(() => {
        const arr = [];
        const colors = ['#8060ff', '#ffffff', '#00aaff'];
        for (let i = 0; i < count; i++) {
            const type = ParticleTypes[i % 3];
            arr.push({
                type,
                angle: Math.random() * Math.PI * 2,
                radius: Math.random() * 1.5 + 1.0,
                y: (Math.random() - 0.5) * 6.0,
                speed: Math.random() * 2 + 0.5,
                phase: Math.random() * Math.PI * 2,
                orbitSpeed: (Math.random() * 0.0006 + 0.0001) * (Math.random() < 0.5 ? 1 : -1),
                scale: Math.random() * 0.7 + 0.3,
                color: new Color(colors[Math.floor(Math.random() * colors.length)]),
                rotX: Math.random() * Math.PI,
                rotY: Math.random() * Math.PI,
                rotZ: Math.random() * Math.PI,
                localIndex: Math.floor(i / 3)
            });
        }
        return arr;
    }, []);

    const dummy = useMemo(() => new Object3D(), []);
    const mouseRef = useMouse();
    const { viewport } = useThree();

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const mState = mouseRef.current;

        let u_mid = 0.4;
        if (typeof window !== 'undefined' && window.SITE_AUDIO) {
            u_mid = window.SITE_AUDIO.mid > 0 ? window.SITE_AUDIO.mid : (0.4 + Math.sin(t * 1.1 + 1.0) * 0.08);
        }

        let mx = -100, my = -100;
        if (mState) {
            mx = ((mState.x / window.innerWidth) * 2 - 1) * (viewport.width / 2);
            my = (-(mState.y / window.innerHeight) * 2 + 1) * (viewport.height / 2);
        }

        const mouseVel = mState ? Math.sqrt(mState.vx * mState.vx + mState.vy * mState.vy) : 0;
        const scatterForce = Math.min(mouseVel * 0.1, 2.0);

        data.forEach((p) => {
            let currentR = p.radius + scatterForce;
            let targetOrbit = p.orbitSpeed;

            const px = Math.sin(p.angle) * currentR;
            const py = p.y + Math.sin(t * p.speed + p.phase) * 0.1;
            const pz = Math.cos(p.angle) * currentR;

            const dx = px - mx;
            const dy = py - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.8) {
                targetOrbit *= 5.0;
            }
            p.angle += targetOrbit;

            dummy.position.set(px, py, pz);
            dummy.rotation.set(p.rotX + t * 0.2, p.rotY + t * 0.3, p.rotZ + t * 0.1);
            dummy.scale.setScalar(p.scale);
            dummy.updateMatrix();

            const meshRef = groupMRefs[p.type].current;
            if (meshRef) {
                meshRef.setMatrixAt(p.localIndex, dummy.matrix);
            }
        });

        Object.values(groupMRefs).forEach(ref => {
            if (ref.current) {
                ref.current.instanceMatrix.needsUpdate = true;
                if (ref.current.material) {
                    ref.current.material.emissiveIntensity = 0.4 + u_mid * 2.0;
                }
            }
        });
    });

    useEffect(() => {
        Object.values(groupMRefs).forEach(ref => {
            if (!ref.current) return;
            data.forEach(p => {
                if (p.type === ref.current.userData.type) {
                    ref.current.setColorAt(p.localIndex, p.color);
                }
            });
            ref.current.instanceColor.needsUpdate = true;
        });
    }, [data]);

    return (
        <group>
            <instancedMesh ref={groupMRefs.torus} args={[null, null, countPerType]} userData={{ type: 'torus' }}>
                <torusGeometry args={[0.01, 0.003, 8, 16]} />
                <meshStandardMaterial metalness={1.0} roughness={0.0} emissiveIntensity={0.4} emissive="#fff" />
            </instancedMesh>
            <instancedMesh ref={groupMRefs.icosahedron} args={[null, null, countPerType]} userData={{ type: 'icosahedron' }}>
                <icosahedronGeometry args={[0.008, 0]} />
                <meshStandardMaterial metalness={1.0} roughness={0.0} emissiveIntensity={0.4} emissive="#fff" />
            </instancedMesh>
            <instancedMesh ref={groupMRefs.plane} args={[null, null, countPerType]} userData={{ type: 'plane' }}>
                <planeGeometry args={[0.015, 0.015]} />
                <meshStandardMaterial metalness={1.0} roughness={0.0} emissiveIntensity={0.4} emissive="#fff" side={2} />
            </instancedMesh>
        </group>
    );
}
