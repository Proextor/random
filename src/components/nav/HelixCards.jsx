import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useFBO, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { heroScrollState, helixState, clamp } from '../../utils/math';

const cardsData = [
    { title: "About", subtitle: "Who we are" },
    { title: "Work", subtitle: "What we build" },
    { title: "Studio", subtitle: "Our process" },
    { title: "Contact", subtitle: "Get in touch" },
    { title: "Showcase", subtitle: "Explore projects" }
];

export default function HelixCards({ onCardClick }) {
    const cardsGroupRef = useRef();
    const cardRefs = useRef([]);
    const htmlRefs = useRef([]);
    const matRefs = useRef([]);
    const pinRefs = useRef([]);
    const activeIndex = useRef(0);
    const hoveredCardRef = useRef(null);

    const { gl, size, raycaster } = useThree();

    const fbo = useFBO({
        samples: 4,
        stencilBuffer: false,
    });

    const rs = useRef({
        current: 0,
        target: 0,
        velocity: 0,
        delta: 0,
        isDragging: false,
        lastX: 0
    });

    const spawnScales = useRef(Array(5).fill(0));

    useEffect(() => {
        cardsData.forEach((_, i) => {
            gsap.to(spawnScales.current, { [i]: 1, duration: 1.0, delay: 1.4 + i * 0.2, ease: 'back.out(1.5)' });
        });

        const onDown = (e) => {
            rs.current.isDragging = true;
            rs.current.snapping = false;
            rs.current.lastX = e.touches ? e.touches[0].clientX : e.clientX;
            gsap.killTweensOf(rs.current);
        };

        const onMove = (e) => {
            if (!rs.current.isDragging) return;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            rs.current.delta = x - rs.current.lastX;
            rs.current.lastX = x;
        };

        const onUp = () => {
            rs.current.isDragging = false;
            rs.current.velocity = 0;
            rs.current.delta = 0;
        };

        window.addEventListener('pointerdown', onDown);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);

        return () => {
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('touchstart', onDown);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };
    }, []);

    const uniformsMemo = useMemo(() => {
        return Array(5).fill().map(() => ({
            uSceneTexture: { value: null },
            u_resolution: { value: new THREE.Vector2() },
            u_time: { value: 0 },
            u_active: { value: 0 },
            u_hoverUV: { value: new THREE.Vector2(-1, -1) },
            u_clickTime: { value: 0 },
            u_high: { value: 0 }
        }));
    }, []);

    const vs = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float bend = sin(pos.x * 1.8) * 0.06;
      pos.z += bend;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

    const fs = `
    uniform sampler2D uSceneTexture;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_active;
    uniform vec2 u_hoverUV;
    uniform float u_clickTime;
    uniform float u_high;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec2 screenUv = gl_FragCoord.xy / u_resolution;
      vec2 refractOffset = normalize(vNormal).xy * 0.04 * (1.0 - abs(vUv.x - 0.5) * 2.0);
      
      float distH = distance(vUv, u_hoverUV);
      float clickElapsed = u_time - u_clickTime;
      
      float ring = smoothstep(0.0, 0.1, clickElapsed) * (1.0 - smoothstep(0.5, 0.8, clickElapsed));
      float shockwave = 0.0;
      if (clickElapsed < 0.8 && u_clickTime > 0.0) {
          shockwave = sin(distH * 18.0 - clickElapsed * 20.0) * 0.06 * exp(-distH * 5.0) * ring;
      }

      float ripple = 0.0;
      if (u_hoverUV.x >= 0.0) {
          ripple = sin(distH * 18.0 - u_time * 4.0) * 0.012 * exp(-distH * 6.0);
      }
      refractOffset += vec2(ripple) + vec2(shockwave);
      
      float r = texture2D(uSceneTexture, screenUv + refractOffset * 1.0).r;
      float g = texture2D(uSceneTexture, screenUv + refractOffset * 0.97).g;
      float b = texture2D(uSceneTexture, screenUv + refractOffset * 0.94).b;
      vec3 refractedColor = vec3(r, g, b);
      
      vec4 glassTint = vec4(0.04, 0.06, 0.12, 0.72);
      glassTint.a -= u_active * 0.3; 
      vec3 finalColor = mix(refractedColor, glassTint.rgb, 0.65);
      
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.0) * 0.6;
      
      float specRect = smoothstep(0.15, 0.0, vUv.x) * smoothstep(0.8, 1.0, vUv.y);
      finalColor += vec3(1.0) * specRect * 0.25;
      finalColor += vec3(1.0) * fresnel;
      
      float caustic = sin(vUv.x * 10.0 + u_time) * cos(vUv.y * 10.0 - u_time) * 0.5 + 0.5;
      finalColor += vec3(0.8, 1.0, 1.0) * caustic * 0.07 * (1.0 + u_high);
      
      vec2 aspect = vec2(1.6, 0.7);
      vec2 pixelPos = (vUv - 0.5) * aspect; 
      vec2 boxSize = aspect * 0.5; 
      
      float cornerRadius = 0.08; 
      vec2 d = abs(pixelPos) - (boxSize - vec2(cornerRadius));
      float distC = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
      if (distC > cornerRadius) discard;
      
      float border = smoothstep(cornerRadius - 0.01, cornerRadius, distC);
      finalColor += border * vec3(0.4, 0.5, 1.0) * 1.5;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

    useFrame(({ gl, scene, camera, clock }, delta) => {
        const t = clock.elapsedTime;
        const state = rs.current;

        const anglePerCard = (Math.PI * 2) / 5;

        if (state.isDragging && state.delta) {
            state.current += state.delta * 0.006;
            state.delta = 0;
        }

        if (!state.isDragging) {
            state.velocity = 0;
        }

        let closestIndex = Math.round(-state.current / anglePerCard);
        activeIndex.current = ((closestIndex % 5) + 5) % 5;

        let targetHigh = 0.2 + Math.sin(t * 2.3 + 2.0) * 0.05;
        if (typeof window !== 'undefined' && window.SITE_AUDIO) {
            if (window.SITE_AUDIO.high > 0) targetHigh = window.SITE_AUDIO.high;
        }

        let currentActiveY = 0;
        const p = heroScrollState.progress;
        const detachForce = clamp(p / 0.3, 0, 1);

        const step = (Math.PI * 2) / 5;
        let dynamicActiveIndex = Math.round(-state.current / step);

        for (let i = 0; i < 5; i++) {
            let offset = (i - dynamicActiveIndex) % 5;
            if (offset > 2) offset -= 5;
            if (offset < -2) offset += 5;

            const dist = Math.abs(offset);
            const isVisible = dist <= 1;

            if (i === activeIndex.current) currentActiveY = 0;

            if (cardRefs.current[i]) {
                const mesh = cardRefs.current[i];
                mesh.visible = isVisible;

                const spacing = 1.6;
                let targetX = offset * spacing;
                let targetZ = 2.6 - dist * 0.8;
                let targetY = 0;

                const detachTargetX = (i - 2) * 2.0;
                const detachTargetZ = 2.5;

                let lerpFrames = Math.min(0.15 + detachForce, 1.0);

                let targetRotY = offset === 0 ? 0 : offset * -0.4;
                let targetScale = offset === 0 ? 0.85 : 0.7;

                const isHovered = hoveredCardRef.current === i && offset === 0 && !state.isDragging;
                if (isHovered && detachForce <= 0.01) {
                    targetScale = 1.0;
                    targetZ += 0.2;
                }

                if (detachForce > 0.01) {
                    targetX = THREE.MathUtils.lerp(targetX, detachTargetX, detachForce);
                    targetZ = THREE.MathUtils.lerp(targetZ, detachTargetZ, detachForce);
                    targetRotY = THREE.MathUtils.lerp(targetRotY, 0, detachForce);
                    targetScale = THREE.MathUtils.lerp(targetScale, 1.0, detachForce);
                    mesh.visible = true;
                }

                mesh.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), lerpFrames);

                const currentRotY = THREE.MathUtils.lerp(mesh.rotation.y, targetRotY, lerpFrames);
                mesh.rotation.set(0, currentRotY, 0);

                const finalLocalScale = THREE.MathUtils.lerp(mesh.scale.x, targetScale, lerpFrames);
                mesh.scale.set(finalLocalScale, finalLocalScale, finalLocalScale);

                const isActive = offset === 0 && !state.isDragging && state.velocity === 0;

                if (matRefs.current[i] && matRefs.current[i].uniforms) {
                    const mat = matRefs.current[i];
                    if (mat.uniforms.u_resolution) {
                        mat.uniforms.u_resolution.value.set(gl.domElement.width, gl.domElement.height);
                        mat.uniforms.uSceneTexture.value = fbo.texture;
                        mat.uniforms.u_active.value = THREE.MathUtils.lerp(mat.uniforms.u_active.value, isActive ? 1.0 : 0.0, 0.1);
                        mat.uniforms.u_active.value = THREE.MathUtils.lerp(mat.uniforms.u_active.value, 1.0, detachForce);
                        mat.uniforms.u_time.value = t;
                        mat.uniforms.u_high.value = targetHigh;

                        if (isActive && !state.isDragging) {
                            const intersects = raycaster.intersectObject(mesh);
                            if (intersects.length > 0 && intersects[0].uv) {
                                mat.uniforms.u_hoverUV.value.lerp(intersects[0].uv, 0.2);
                            } else {
                                mat.uniforms.u_hoverUV.value.set(-1, -1);
                            }
                        } else if (mat.uniforms.u_hoverUV) {
                            mat.uniforms.u_hoverUV.value.set(-1, -1);
                        }
                    }
                } else if (mesh.material) {
                    const targetEmissive = offset === 0 ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
                    const targetEmissiveIntensity = offset === 0 ? 0.4 : 0.1;
                    if (!mesh.material.emissive) mesh.material.emissive = new THREE.Color(0x000000);
                    mesh.material.emissive.lerp(targetEmissive, 0.1);
                    mesh.material.emissiveIntensity = THREE.MathUtils.lerp(mesh.material.emissiveIntensity || 0, targetEmissiveIntensity, 0.1);
                }

                if (htmlRefs.current[i]) {
                    const div = htmlRefs.current[i];
                    div.style.opacity = detachForce > 0.01 ? 1 : (isVisible ? (offset === 0 ? 1.0 : 0.4) : 0);
                    div.style.filter = `blur(${dist * 2 * (1 - detachForce)}px)`;
                    div.style.pointerEvents = isActive || detachForce > 0.01 ? 'all' : 'none';
                    div.style.visibility = (isVisible || detachForce > 0.01) ? 'visible' : 'hidden';
                }

                if (pinRefs.current[i]) {
                    const pin = pinRefs.current[i];
                    pin.visible = isVisible || detachForce > 0.01;
                    pin.position.lerp(new THREE.Vector3(targetX, targetY, targetZ - 0.45), 0.1);
                    pin.rotation.set(Math.PI / 2, 0, 0);

                    pin.scale.setScalar(1.0 - detachForce);
                }
            }
        }

        helixState.activeY = currentActiveY;

    });

    useFrame(({ gl, scene, camera }) => {
        if (!cardsGroupRef.current) return;

        cardsGroupRef.current.visible = false;
        gl.setRenderTarget(fbo);
        gl.clear();
        gl.render(scene, camera);
        gl.setRenderTarget(null);
        cardsGroupRef.current.visible = true;
    });

    const handleCardClick = (i) => {
        if (i === activeIndex.current) {
            if (matRefs.current[i]) {
                matRefs.current[i].uniforms.u_clickTime.value = performance.now() / 1000;
            }

            const flash = document.createElement('div');
            flash.className = 'fixed inset-0 z-[9999] pointer-events-none bg-white mix-blend-difference';
            document.body.appendChild(flash);
            gsap.fromTo(flash, { opacity: 0.8 }, { opacity: 0, duration: 0.1, onComplete: () => flash.remove() });

            if (onCardClick) {
                onCardClick(cardsData[i].title);
            }
        }
    };

    return (
        <group ref={cardsGroupRef}>
            {cardsData.map((card, i) => (
                <group key={i}>
                    <group ref={el => pinRefs.current[i] = el}>
                        <mesh>
                            <cylinderGeometry args={[0.015, 0.015, 0.67, 8]} />
                            <meshStandardMaterial metalness={0.92} roughness={0.18} color="#1a1a2e" />
                        </mesh>
                        <mesh position={[0, 0.335, 0]}>
                            <sphereGeometry args={[0.025, 16, 16]} />
                            <meshStandardMaterial metalness={1.0} roughness={0.1} color="#4040ff" emissive="#4040ff" emissiveIntensity={2} />
                        </mesh>
                    </group>

                    <RoundedBox
                        args={[1.6, 0.7, 0.04]}
                        radius={0.03}
                        smoothness={8}
                        ref={el => cardRefs.current[i] = el}
                        onClick={() => handleCardClick(i)}
                        onPointerEnter={() => hoveredCardRef.current = i}
                        onPointerLeave={() => hoveredCardRef.current = null}
                        renderOrder={10}
                    >
                        <meshPhysicalMaterial
                            color="#0f172a"
                            metalness={0.2}
                            roughness={0.4}
                            transmission={0.6}
                            thickness={0.5}
                            transparent={true}
                            opacity={0.85}
                            depthWrite={false}
                            side={THREE.DoubleSide}
                        />

                        <Html
                            position={[0, 0, 0.01]}
                            center
                            distanceFactor={4}
                            transform
                            occlude={false}
                        >
                            <div
                                ref={el => htmlRefs.current[i] = el}
                                style={{
                                    width: "160px",
                                    textAlign: "center",
                                    color: "white",
                                    fontFamily: "Inter, sans-serif",
                                    pointerEvents: "none",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        marginBottom: "4px",
                                        letterSpacing: "0.02em",
                                        color: "#e8ecff",
                                        textShadow: "0 0 10px rgba(120,160,255,0.4)"
                                    }}
                                >
                                    {card.title}
                                </div>

                                <div
                                    style={{
                                        fontSize: "12px",
                                        opacity: 0.6
                                    }}
                                >
                                    {card.subtitle}
                                </div>
                            </div>
                        </Html>
                    </RoundedBox>
                </group>
            ))}
        </group>
    );
}
