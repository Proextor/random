import React, { useState, useEffect } from "react";
import BlurText from "@/components/ui/BlurText";
import Aurora from "@/components/background/Aurora";

export default function Intro({ onEnter }) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            onMouseMove={(e) => {
                setPos({ x: e.clientX, y: e.clientY });
            }}
            style={{
                position: "fixed",
                inset: 0,
                background: "radial-gradient(circle at center, #0b0f1a 0%, #05060a 70%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 999,
                color: "white",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                overflow: "hidden"
            }}>

            {/* Aurora Background — Intro Only */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: "none"
                }}
            >
                <Aurora
                    colorStops={["#0b1228", "#1b2b6b", "#0b1228"]}
                    amplitude={0.7}
                    blend={0.5}
                    speed={0.5}
                />
            </div>

            {/* GLOWS (Soft gradients, no filters) */}
            <div style={{
                position: "absolute",
                top: pos.y - 150,
                left: pos.x - 150,
                width: "300px",
                height: "300px",
                background: "radial-gradient(circle, rgba(120,160,255,0.08) 0%, transparent 60%)",
                pointerEvents: "none",
                transition: "top 0.1s linear, left 0.1s linear",
                zIndex: 1
            }} />

            <div style={{
                position: "absolute",
                width: "800px",
                height: "800px",
                background: "radial-gradient(circle, rgba(80,120,255,0.06) 0%, transparent 60%)",
                zIndex: 1
            }} />

            {/* CONTENT — Positioned above Aurora and Glows */}
            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    textAlign: "center"
                }}
            >
                <BlurText
                    text="We build experiences"
                    delay={120}
                    animateBy="words"
                    direction="top"
                    className="text-center font-bold tracking-tight"
                    style={{
                        fontSize: "clamp(48px, 8vw, 96px)",
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        background: "linear-gradient(180deg, #ffffff 0%, #cfd6ff 50%, #7aa2ff 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}
                />

                <div
                    style={{
                        fontSize: "clamp(18px, 2vw, 24px)",
                        color: "rgba(255,255,255,0.5)",
                        marginTop: "16px",
                        letterSpacing: "0.1em",
                        opacity: visible ? 1 : 0,
                        transition: "opacity 1s ease",
                        transitionDelay: "0.3s"
                    }}
                >
                    not websites
                </div>

                <button
                    onClick={onEnter}
                    style={{
                        marginTop: "3rem",
                        padding: "12px 28px",
                        borderRadius: "999px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(255,255,255,0.05)",
                        color: "white",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 0 0 rgba(255,255,255,0)"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(255,255,255,0.15)";
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = "0 0 20px rgba(120,160,255,0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(255,255,255,0.05)";
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "0 0 0 rgba(255,255,255,0)";
                    }}
                >
                    Enter
                </button>
            </div>
        </div>
    );
}
