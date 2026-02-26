import React from 'react';

// Use Orbitron font for the logo text if not globally imported
// @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap');

export const AnimatedLogo: React.FC<{
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
    showText?: boolean;
    className?: string;
}> = ({ size = 'md', showText = true, className = '' }) => {

    // Scale factors based on size prop
    const scaleMap = {
        sm: 0.5,
        md: 0.7, // Adjusted for typical nav bar size
        lg: 1,
        xl: 1.5,
        hero: 2,
    };

    const scale = scaleMap[size];

    // Base size from original CSS is 80px for icon wrapper
    const wrapperSize = 80 * scale;
    const textSize = 2.8 * scale; // in rem

    return (
        <div className={`airena-logo flex items-center gap-5 ${className}`} style={{ '--logo-scale': scale } as React.CSSProperties}>
            <style>{`
                .airena-logo {
                    text-decoration: none;
                    user-select: none;
                    perspective: 1000px;
                }

                .logo-icon-wrapper {
                    position: relative;
                    width: ${wrapperSize}px;
                    height: ${wrapperSize}px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .airena-logo:hover .logo-icon-wrapper {
                    transform: scale(1.1) rotate(5deg);
                }

                .shield-base {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 242, 255, 0.03);
                    border: 1.5px solid rgba(0, 242, 255, 0.2);
                    border-radius: 16px 16px 32px 32px;
                    backdrop-filter: blur(8px);
                    box-shadow: 0 0 20px rgba(0, 242, 255, 0.1);
                    animation: shield-breathe 4s infinite ease-in-out;
                }

                .orbital-ring {
                    position: absolute;
                    width: 90%;
                    height: 90%;
                    border: 1px dashed rgba(188, 71, 255, 0.4);
                    border-radius: 50%;
                    animation: rotate-orbit 10s linear infinite;
                }

                .orbital-dot {
                    position: absolute;
                    top: -3px;
                    left: 50%;
                    width: ${6 * scale}px;
                    height: ${6 * scale}px;
                    background: #bc47ff;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #bc47ff;
                }

                .helmet-svg {
                    width: ${48 * scale}px;
                    height: ${48 * scale}px;
                    z-index: 2;
                    filter: drop-shadow(0 0 10px #00f2ff);
                    animation: float-helmet 3s infinite ease-in-out;
                }

                .brand-text {
                    font-family: 'Orbitron', sans-serif;
                    font-size: ${textSize}rem;
                    font-weight: 900;
                    line-height: 1;
                    background: linear-gradient(90deg, #00f2ff, #bc47ff, #00f2ff);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-transform: uppercase;
                    letter-spacing: -0.01em;
                    animation: shine-text 5s linear infinite;
                }

                /* Keyframe Animations */
                @keyframes shield-breathe {
                    0%, 100% { border-color: rgba(0, 242, 255, 0.2); box-shadow: 0 0 15px rgba(0, 242, 255, 0.1); }
                    50% { border-color: rgba(188, 71, 255, 0.5); box-shadow: 0 0 25px rgba(188, 71, 255, 0.2); }
                }

                @keyframes float-helmet {
                    0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 10px #00f2ff); }
                    50% { transform: translateY(-${5 * scale}px); filter: drop-shadow(0 0 15px #bc47ff); }
                }

                @keyframes rotate-orbit {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes shine-text {
                    to { background-position: 200% center; }
                }
            `}</style>

            <div className="logo-icon-wrapper">
                <div className="orbital-ring">
                    <div className="orbital-dot"></div>
                </div>
                <div className="shield-base"></div>
                <svg className="helmet-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Crest */}
                    <path d="M50 5 L75 18 L75 35 L50 22 L25 35 L25 18 Z" fill="#bc47ff" fillOpacity="0.8" />
                    <path d="M50 12 L65 20 L65 30 L50 22 L35 30 L35 20 Z" fill="#00f2ff" />

                    {/* Face */}
                    <path d="M22 42 C22 28 78 28 78 42 L78 72 C78 88 50 98 50 98 C50 98 22 88 22 72 Z"
                        stroke="#00f2ff" strokeWidth="3" />

                    {/* Jaw */}
                    <path d="M42 60 L32 82 M58 60 L68 82" stroke="#bc47ff" strokeWidth="4" strokeLinecap="round" />

                    {/* Core */}
                    <circle cx="50" cy="58" r="6" fill="#00f2ff">
                        <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                </svg>
            </div>
            {showText && <span className="brand-text">AIrena</span>}
        </div>
    );
};
