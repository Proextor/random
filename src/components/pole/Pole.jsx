import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { heroScrollState, helixState } from '../../utils/math';
import useMouse from '../../hooks/useMouse';

export default function Pole() {
    const groupRef = useRef();
    const meshRef = useRef();
    const { raycaster, camera, pointer } = useThree();
    const mouseRef = useMouse();

    const uniforms = useMemo(() => ({
        u_time: { value: 0 },
        u_mouse: { value: new THREE.Vector2(-1, -1) },
        u_drag: { value: 0 },
        u_scroll: { value: 0 },
        u_rotation: { value: 0 },
        u_activeY: { value: 0 },
        u_bass: { value: 0 }
    }), []);

    const dragState = useRef({ isDragging: false, startX: 0, currentDrag: 0 });

    useEffect(() => {
        if (groupRef.current) {
            gsap.fromTo(groupRef.current.position,
                { y: 20 },
                { y: 0, duration: 1.4, ease: 'elastic.out(1, 0.5)' }
            );
        }

        const onPointerDown = (e) => {
            dragState.current.isDragging = true;
            dragState.current.startX = e.touches ? e.touches[0].clientX : e.clientX;
        };
        const onPointerMove = (e) => {
            if (dragState.current.isDragging) {
                const x = e.touches ? e.touches[0].clientX : e.clientX;
                const delta = x - dragState.current.startX;
                dragState.current.currentDrag += delta * 0.001;
                dragState.current.startX = x;
            }
        };
        const onPointerUp = () => {
            dragState.current.isDragging = false;
        };

        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        return () => {
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('touchstart', onPointerDown);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('touchend', onPointerUp);
        };
    }, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        uniforms.u_time.value = t;

        const p = heroScrollState.progress;
        uniforms.u_scroll.value = p;
        uniforms.u_activeY.value = helixState.activeY;

        let currentBass = 0;
        if (typeof window !== 'undefined' && window.SITE_AUDIO) {
            currentBass = window.SITE_AUDIO.bass > 0 ? window.SITE_AUDIO.bass : (0.3 + Math.sin(t * 0.7) * 0.1);
        }
        uniforms.u_bass.value = currentBass;

        if (!dragState.current.isDragging) {
            dragState.current.currentDrag = 0;
        }
        uniforms.u_drag.value += dragState.current.currentDrag * 2.0;
        uniforms.u_rotation.value += dragState.current.currentDrag;

        if (meshRef.current) {
            meshRef.current.rotation.y = uniforms.u_rotation.value;
        }

        // Scroll Phase 1 shrinkage
        const scaleY = 1.0 - THREE.MathUtils.clamp(p / 0.3, 0, 1) * 0.6;
        if (groupRef.current) {
            groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, scaleY, 0.1);
        }

        raycaster.setFromCamera(pointer, camera);
        if (meshRef.current) {
            const intersects = raycaster.intersectObject(meshRef.current);
            if (intersects.length > 0 && intersects[0].uv) {
                uniforms.u_mouse.value.lerp(intersects[0].uv, 0.1);
            } else {
                uniforms.u_mouse.value.lerp(new THREE.Vector2(-1, -1), 0.1);
            }
        }
    });

    const onBeforeCompile = (shader) => {
        shader.uniforms.u_time = uniforms.u_time;
        shader.uniforms.u_mouse = uniforms.u_mouse;
        shader.uniforms.u_drag = uniforms.u_drag;
        shader.uniforms.u_scroll = uniforms.u_scroll;
        shader.uniforms.u_rotation = uniforms.u_rotation;
        shader.uniforms.u_activeY = uniforms.u_activeY;
        shader.uniforms.u_bass = uniforms.u_bass;

        shader.vertexShader = `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 customVWorldPosition;
      ${shader.vertexShader}
    `.replace(
            `#include <begin_vertex>`,
            `
      #include <begin_vertex>
      vUv = uv;
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      vec4 customWorldPos = modelMatrix * vec4(position, 1.0);
      customVWorldPosition = customWorldPos.xyz;
      `
        );

        // Inject poleUv directly at the start of main
        shader.fragmentShader = shader.fragmentShader.replace(
            `void main() {`,
            `void main() {
             vec2 poleUv = vUv;
             poleUv.x -= u_drag * 0.02;
            `
        );

        shader.fragmentShader = `
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_drag;
      uniform float u_scroll;
      uniform float u_rotation;
      uniform float u_activeY;
      uniform float u_bass;

      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 customVWorldPosition;

      float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
      float noise(vec2 x) {
          vec2 i = floor(x);
          vec2 f = fract(x);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.5;
          vec2 shift = vec2(100.0);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < 4; ++i) {
              v += a * noise(x);
              x = rot * x * 2.0 + shift;
              a *= 0.5;
          }
          return v;
      }

      vec3 voronoi(vec2 x) {
          vec2 n = floor(x);
          vec2 f = fract(x);
          float m = 8.0;
          vec2 mg, mr;
          for(int j=-1; j<=1; j++)
          for(int i=-1; i<=1; i++) {
              vec2 g = vec2(float(i),float(j));
              vec2 o = vec2(hash(n + g));
              vec2 r = g + o - f;
              float d = dot(r,r);
              if(d < m) {
                  m = d;
                  mg = g;
                  mr = r;
              }
          }
          float res = 8.0;
          for(int j=-2; j<=2; j++)
          for(int i=-2; i<=2; i++) {
              vec2 g = mg + vec2(float(i),float(j));
              vec2 o = vec2(hash(n + g));
              vec2 r = g + o - f;
              if (dot(mr-r,mr-r) > 0.00001) res = min(res, dot(0.5*(mr+r), normalize(r-mr)));
          }
          return vec3(res, m, hash(n + mg));
      }

      ${shader.fragmentShader}
    `.replace(
            `#include <map_fragment>`,
            `
      #include <map_fragment>
      float vertNoise = fbm(vec2(poleUv.x * 12.0, poleUv.y * 0.4));
      vec3 baseColor = mix(vec3(0.05, 0.05, 0.08), vec3(0.1, 0.1, 0.18), vertNoise);

      float scratches = step(0.94, fract(poleUv.y * 180.0)) * 0.06;
      vec3 scratchColor = vec3(1.0);

      float brushing = vertNoise * 0.04;
      
      vec3 finalBase = baseColor + scratchColor * scratches + vec3(1.0) * brushing;
      diffuseColor = vec4(finalBase, 1.0);
      `
        ).replace(
            `#include <emissivemap_fragment>`,
            `
      #include <emissivemap_fragment>
      vec3 v = voronoi(vec2(poleUv.x * 10.0, poleUv.y * 12.5));
      float edge = smoothstep(0.05, 0.0, v.x);
      
      float mouseDist = distance(vUv, u_mouse);
      float glowFactor = smoothstep(0.15, 0.0, mouseDist);
      
      float cellAnim = (sin(u_time * 2.0 + v.z * 10.0) * 0.5 + 0.5);
      float activeBand = smoothstep(0.15, 0.0, abs(customVWorldPosition.y - u_activeY));
      
      float traceAlpha = edge * 0.07 * cellAnim;
      traceAlpha += edge * glowFactor * 0.8; 
      traceAlpha += edge * activeBand * 0.5;
      
      vec3 traceColor = vec3(0.18, 0.18, 1.0);
      float band = smoothstep(0.98, 1.0, fract(poleUv.y + u_time * 0.04));

      totalEmissiveRadiance += traceColor * traceAlpha * 2.0;
      totalEmissiveRadiance += vec3(1.0) * band * 0.3;
      `
        ).replace(
            `#include <dithering_fragment>`,
            `
      #include <dithering_fragment>
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
      vec3 fresnelColor = vec3(0.37, 0.25, 1.0) * (0.5 + u_bass) * fresnel;
      
      gl_FragColor = vec4(gl_FragColor.rgb + fresnelColor, gl_FragColor.a);
      `
        );
    };

    const onBeforeCompilePole = (shader) => {
        shader.vertexShader = `
            varying vec3 vPolePos;
            ${shader.vertexShader}
        `.replace(
            `#include <begin_vertex>`,
            `
            #include <begin_vertex>
            vPolePos = position;
            `
        );
        shader.fragmentShader = `
            varying vec3 vPolePos;
            ${shader.fragmentShader}
        `.replace(
            `#include <dithering_fragment>`,
            `
            #include <dithering_fragment>
            float h = clamp((vPolePos.y + 7.0) / 14.0, 0.0, 1.0);
            vec3 top = vec3(0.08, 0.12, 0.3);
            vec3 bottom = vec3(0.02, 0.03, 0.08);
            vec3 gradient = mix(bottom, top, h);
            gl_FragColor.rgb *= gradient;
            `
        );
    };

    useEffect(() => {
        console.log("POLE MOUNTED");
    }, []);

    return (
        <group ref={groupRef}>
            <mesh ref={meshRef} position={[0, 0, 0]} scale={[1, 1, 1]} renderOrder={1}>
                <cylinderGeometry args={[1.4, 1.8, 14, 128, 64, false]} />
                <meshPhysicalMaterial
                    color="#0b1228"
                    metalness={0.15}
                    roughness={0.85}
                    clearcoat={0.2}
                    clearcoatRoughness={0.6}
                    envMapIntensity={0.3}
                />
            </mesh>

            <mesh position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={1}>
                <circleGeometry args={[1.4, 128]} />
                <meshStandardMaterial metalness={0.92} roughness={0.18} color="#0d0d14" depthTest={false} />
            </mesh>
            <mesh position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={1}>
                <torusGeometry args={[1.4, 0.015, 16, 128]} />
                <meshStandardMaterial metalness={0.9} roughness={0.2} color="#ffffff" depthTest={false} />
            </mesh>

            <mesh position={[0, -7, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
                <circleGeometry args={[1.8, 128]} />
                <meshStandardMaterial metalness={0.92} roughness={0.18} color="#0d0d14" depthTest={false} />
            </mesh>
            <mesh position={[0, -7, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
                <torusGeometry args={[1.8, 0.015, 16, 128]} />
                <meshStandardMaterial metalness={0.9} roughness={0.2} color="#ffffff" depthTest={false} />
            </mesh>
        </group>
    );

}
