import { useRef, useEffect } from "react";
import * as THREE from "three";

const Aurora = ({
    colorStops = ["#0b1228", "#1b2b6b", "#0b1228"],
    amplitude = 1.0,
    blend = 0.5,
    speed = 0.5,
}) => {
    const containerRef = useRef();

    useEffect(() => {
        if (!containerRef.current) return;

        // SCENE SETUP
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        const setSize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        setSize();
        containerRef.current.appendChild(renderer.domElement);

        // SHADER MATERIAL
        const colors = colorStops.map(c => new THREE.Color(c));

        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: colors[0] },
                uColor2: { value: colors[1] },
                uColor3: { value: colors[2] },
                uAmplitude: { value: amplitude },
                uBlend: { value: blend },
                uSpeed: { value: speed },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform float uAmplitude;
        uniform float uBlend;
        uniform float uSpeed;
        uniform vec2 uResolution;
        varying vec2 vUv;

        // NOISE FUNCTIONS
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 uv = vUv;
          
          float n = snoise(uv * 2.0 + uTime * uSpeed * 0.1);
          float n2 = snoise(uv * 4.0 - uTime * uSpeed * 0.05);
          
          float wave = sin(uv.x * 3.0 + n * uAmplitude + uTime * uSpeed) * 0.5 + 0.5;
          float wave2 = sin(uv.y * 2.0 + n2 * uAmplitude * 0.5 - uTime * uSpeed * 0.8) * 0.5 + 0.5;
          
          float mixedWave = mix(wave, wave2, uBlend);
          
          vec3 color = mix(uColor1, uColor2, mixedWave);
          color = mix(color, uColor3, n * 0.5 + 0.5);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
            transparent: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // RENDER LOOP
        let request;
        const animate = (time) => {
            material.uniforms.uTime.value = time * 0.001;
            renderer.render(scene, camera);
            request = requestAnimationFrame(animate);
        };
        request = requestAnimationFrame(animate);

        // RESIZE
        const onResize = () => {
            setSize();
            material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(request);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, [colorStops, amplitude, blend, speed]);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
            }}
        />
    );
};

export default Aurora;
