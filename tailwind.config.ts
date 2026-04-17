import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#7f13ec",
                "primary-glow": "#bd5aff",
                "accent": "#d913ec",
                "secondary": "#00d4ff",
                "background-light": "#f7f6f8",
                "background-dark": "#0a0a0a",
                "surface-dark": "#141118",
                "glass-dark": "rgba(20, 17, 24, 0.7)",
                "glass-border": "rgba(255, 255, 255, 0.08)",
                "glass-bg": "rgba(255, 255, 255, 0.03)",
                "panel-dark": "#161b22",
                "panel-lighter": "#21262d",
                "border-dark": "#30363d",
                // Semantic colors from Project Synopsis
                "fundamentals": "#2d2d2d", // Matte Grey
                "research": "#00f2ff",     // Cyan
                "quantum": "#7f13ec",      // Deep Purple
                // Complexity Dashboard Colors
                "neon-cyan": "#00f2ff",
                "neon-orange": "#ff9f0a",
                "neon-red": "#ff2a4d",
                "cyber-purple": "#b026ff",
                "cyber-purple-light": "#d485ff",
                "surface-dark-matte": "#121926",
                "surface-darker-matte": "#080c14",
                // Lecture Mode Colors
                "lecture-primary": "#ec1313",
                "lecture-bg": "#221010",
                "lecture-bg-light": "#f8f6f6",
                "lecture-canvas": "#0f0b0b",
                "lecture-panel": "#1a1212",
                "lecture-border": "#392828",
                // Quantum IDE Colors (for Grover's Algorithm)
                "primary-quantum": "#d946ef",
                "primary-dark": "#a21caf",
                "primary-purple": "#8b5cf6",
                "accent-cyan": "#22d3ee",
                "panel-dark-quantum": "#1a1025",
                "border-dark-quantum": "#342245",
                "text-dim-quantum": "#a78bfa",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "mono": ["Fira Code", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "hero-glow": "radial-gradient(circle at center, rgba(146, 19, 236, 0.15) 0%, rgba(5, 5, 10, 0) 70%)",
                "grid-pattern": "linear-gradient(to right, #302839 1px, transparent 1px), linear-gradient(to bottom, #302839 1px, transparent 1px)",
                "radial-glow": "radial-gradient(circle at center, rgba(127, 19, 236, 0.15) 0%, transparent 70%)",
                "circuit-pattern": "radial-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px)",
            },
            boxShadow: {
                "neon": "0 0 10px #d946ef, 0 0 30px #d946ef",
                "neon-secondary": "0 0 10px #8b5cf6, 0 0 30px #8b5cf6",
                "cinematic": "0 20px 40px -10px rgba(0,0,0,0.6)",
                "gate": "0 4px 0 #a21caf, 0 5px 10px rgba(0,0,0,0.5)",
            },
            animation: {
                "float": "float 6s ease-in-out infinite",
                "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "spin-slow": "spin 15s linear infinite",
                "morph": "morph 8s ease-in-out infinite",
                "glow": "glow 2s ease-in-out infinite",
            },
            keyframes: {
                glow: {
                    "0%, 100%": { boxShadow: "0 0 5px #13ecda" },
                    "50%": { boxShadow: "0 0 20px #13ecda" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 10px #9213ec, 0 0 20px #9213ec" },
                    "50%": { boxShadow: "0 0 20px #bd5aff, 0 0 40px #bd5aff" },
                },
                morph: {
                    "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
                    "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
