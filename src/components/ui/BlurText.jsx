import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const BlurText = ({
    text = "",
    delay = 200,
    className = "",
    style = {},
    direction = "top",
    threshold = 0.1,
    rootMargin = "0px",
    animationFrom,
    animationTo,
    animateBy = "words", // 'words' or 'letters'
    onAnimationComplete,
}) => {
    const elements = animateBy === "words" ? text.split(" ") : text.split("");
    const [inView, setInView] = useState(false);
    const ref = useRef();

    // Default animations if not provided
    const defaultFrom = animationFrom || {
        filter: "blur(10px)",
        opacity: 0,
        y: direction === "top" ? -40 : 40,
    };
    const defaultTo = animationTo || {
        filter: "blur(0px)",
        opacity: 1,
        y: 0,
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(ref.current);
                }
            },
            { threshold, rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    const containerStyle = {
        ...style,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        background: "none", // Background must be on the children for clipping
        WebkitBackgroundClip: "none",
        WebkitTextFillColor: "initial",
    };

    const itemStyle = {
        background: style.background || "none",
        WebkitBackgroundClip: style.WebkitBackgroundClip || "none",
        WebkitTextFillColor: style.WebkitTextFillColor || "initial",
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing || "normal",
        whiteSpace: "pre",
    };

    return (
        <div
            ref={ref}
            className={`blur-text ${className}`}
            style={containerStyle}
        >
            {elements.map((el, i) => (
                <motion.span
                    key={i}
                    initial={defaultFrom}
                    animate={inView ? defaultTo : defaultFrom}
                    transition={{
                        duration: 0.8,
                        delay: (i * delay) / 1000,
                        ease: [0.215, 0.61, 0.355, 1],
                    }}
                    onAnimationComplete={
                        i === elements.length - 1 ? onAnimationComplete : undefined
                    }
                    className="inline-block"
                    style={itemStyle}
                >
                    {el === " " ? "\u00A0" : el}
                    {animateBy === "words" && i < elements.length - 1 && "\u00A0"}
                </motion.span>
            ))}
        </div>
    );
};

export default BlurText;
