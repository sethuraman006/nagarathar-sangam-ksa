"use client";

import { useState, useEffect } from "react";

const pr = (i: number, max = 1) => ((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1 * max;

const ChettinadPattern = ({ opacity = 0.05, color = "#D4A853" }: { opacity?: number; color?: string }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="cPat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <circle cx="40" cy="40" r="18" fill="none" stroke={color} strokeWidth="0.7" />
        <circle cx="40" cy="40" r="8" fill="none" stroke={color} strokeWidth="0.5" />
        <path d="M40 22L40 0M40 58L40 80M22 40L0 40M58 40L80 40" stroke={color} strokeWidth="0.4" />
        <path d="M28 28L12 12M52 28L68 12M28 52L12 68M52 52L68 68" stroke={color} strokeWidth="0.3" />
        <rect x="36" y="36" width="8" height="8" fill="none" stroke={color} strokeWidth="0.4" transform="rotate(45 40 40)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cPat)" />
  </svg>
);

interface DoorEntranceProps {
  onComplete: () => void;
  darkMode?: boolean;
}

export default function DoorEntrance({ onComplete, darkMode = true }: DoorEntranceProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4400),
      setTimeout(() => setPhase(5), 5600),
      setTimeout(() => setPhase(6), 6800),
      setTimeout(() => onComplete(), 8000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const bg = darkMode ? "#060402" : "#F5E8D0";
  const woodLight = darkMode ? "#5A3D24" : "#8B6B3D";
  const woodDark = darkMode ? "#1A0E08" : "#5A3D24";
  const woodMid = darkMode ? "#3D2817" : "#6B4F30";
  const gold = "#D4A853";
  const goldDim = darkMode ? "#D4A85322" : "#B8860B33";
  const frameBg = darkMode ? "linear-gradient(180deg, #0D0906, #1A120A)" : "linear-gradient(180deg, #2C1810, #3D2817)";
  const rayColor = darkMode ? "#D4A853" : "#FFF8E8";

  const doorStyle = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    [side]: 0,
    top: 0,
    width: "50%",
    height: "100%",
    transformOrigin: `${side} center`,
    transform: phase >= 3
      ? `perspective(1200px) rotateY(${side === "left" ? "-82" : "82"}deg)`
      : "perspective(1200px) rotateY(0deg)",
    transition: phase >= 3 ? "transform 1.6s cubic-bezier(0.22, 1.2, 0.36, 1)" : "transform 0.3s",
    zIndex: 10,
    overflow: "hidden",
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: bg,
        opacity: phase >= 6 ? 0 : 1,
        transition: "opacity 1.2s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: phase >= 6 ? "none" : "all",
      }}
    >
      {/* Dust motes */}
      {[...Array(35)].map((_, i) => {
        const sz = 1.5 + pr(i, 3);
        return (
          <div key={i} className="absolute rounded-full" style={{
            width: sz, height: sz, background: gold,
            opacity: phase >= 1 ? (0.06 + pr(i + 50, 0.18)) : 0,
            top: `${5 + pr(i + 10, 90)}%`, left: `${2 + pr(i + 20, 96)}%`,
            animation: `doorDustFloat ${4 + pr(i + 30, 5)}s ease-in-out ${pr(i, 3)}s infinite`,
            transition: "opacity 1.5s",
            filter: sz < 2.5 ? "blur(0.5px)" : "none",
          }} />
        );
      })}

      {/* Main house structure */}
      <div className="relative" style={{
        width: "min(520px, 92vw)", height: "min(640px, 88vh)",
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "scale(1) translateY(0)" : "scale(0.85) translateY(30px)",
        transition: "all 1.2s cubic-bezier(0.16,1,0.3,1)",
        animation: phase >= 1 ? "doorCameraZoom 1.5s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
      }}>
        {/* Roof / Pediment */}
        <svg className="absolute -top-8 left-1/2 -translate-x-1/2" width="115%" viewBox="0 0 600 110" style={{ maxWidth: 600 }}>
          <defs>
            <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={woodLight} />
              <stop offset="100%" stopColor={woodDark} />
            </linearGradient>
            <linearGradient id="roofGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gold} stopOpacity="0" />
              <stop offset="50%" stopColor={gold} stopOpacity="0.8" />
              <stop offset="100%" stopColor={gold} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M10 100 L300 8 L590 100" fill="url(#roofGrad)" opacity="0.6" />
          <path d="M10 100 L300 8 L590 100" fill="none" stroke={gold} strokeWidth="2" opacity="0.7" />
          <path d="M50 100 L300 22 L550 100" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.3" />
          <path d="M285 18 L300 5 L315 18" fill={gold} opacity="0.5" />
          <circle cx="300" cy="45" r="22" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.5" />
          <circle cx="300" cy="45" r="12" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.4" />
          <circle cx="300" cy="45" r="5" fill={gold} opacity="0.3" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
            <ellipse key={a} cx="300" cy="45" rx="3" ry="10" fill="none" stroke={gold} strokeWidth="0.4" opacity="0.25" transform={`rotate(${a} 300 45)`} />
          ))}
          <line x1="0" y1="100" x2="600" y2="100" stroke="url(#roofGoldGrad)" strokeWidth="3" />
        </svg>

        {/* Pillars */}
        {(["left", "right"] as const).map(side => (
          <div key={side} className="absolute top-0 bottom-0" style={{ width: 40, [side]: -40 }}>
            <div className="h-full relative" style={{
              background: `linear-gradient(90deg, ${woodDark}, ${woodLight} 40%, ${woodMid} 80%, ${woodDark})`,
              borderLeft: `1px solid ${goldDim}`, borderRight: `1px solid ${goldDim}`,
            }}>
              <svg className="absolute top-0 left-0 w-full" height="50" viewBox="0 0 40 50">
                <rect x="0" y="40" width="40" height="10" fill={gold} opacity="0.15" />
                <path d="M5 45 Q20 20 35 45" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.4" />
                <path d="M10 45 Q20 28 30 45" fill="none" stroke={gold} strokeWidth="0.6" opacity="0.3" />
                <ellipse cx="20" cy="38" rx="4" ry="8" fill="none" stroke={gold} strokeWidth="0.5" opacity="0.3" />
                <ellipse cx="12" cy="40" rx="3" ry="7" fill="none" stroke={gold} strokeWidth="0.5" opacity="0.25" transform="rotate(-15 12 40)" />
                <ellipse cx="28" cy="40" rx="3" ry="7" fill="none" stroke={gold} strokeWidth="0.5" opacity="0.25" transform="rotate(15 28 40)" />
              </svg>
              {[8, 14, 20, 26, 32].map((x, i) => (
                <div key={i} className="absolute" style={{ left: x, top: 50, bottom: 40, width: 1, background: `linear-gradient(180deg, transparent, ${gold}11, transparent)` }} />
              ))}
              {[0.2, 0.4, 0.6, 0.8].map((p, i) => (
                <div key={i} className="absolute left-1 right-1" style={{ top: `${p * 100}%`, height: 2, background: `linear-gradient(90deg, transparent, ${gold}18, transparent)` }} />
              ))}
              <svg className="absolute bottom-0 left-0 w-full" height="40" viewBox="0 0 40 40">
                <rect x="0" y="0" width="40" height="8" fill={gold} opacity="0.12" />
                <path d="M5 5 Q20 25 35 5" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.35" />
                <path d="M10 5 Q20 18 30 5" fill="none" stroke={gold} strokeWidth="0.5" opacity="0.25" />
              </svg>
            </div>
          </div>
        ))}

        {/* Door Frame with Arch */}
        <div className="absolute inset-0 overflow-hidden" style={{
          borderRadius: "40% 40% 0 0 / 15% 15% 0 0",
          border: `3px solid ${goldDim}`, borderBottom: "none", background: frameBg,
        }}>
          <ChettinadPattern opacity={darkMode ? 0.04 : 0.06} color={gold} />

          <svg className="absolute top-0 left-0 w-full" height="80" viewBox="0 0 500 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="archGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={gold} stopOpacity="0.3" />
                <stop offset="100%" stopColor={gold} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 80 Q250 -20 500 80" fill="url(#archGlow)" />
            <path d="M0 80 Q250 -20 500 80" fill="none" stroke={gold} strokeWidth="2" opacity="0.5" />
            <path d="M20 80 Q250 0 480 80" fill="none" stroke={gold} strokeWidth="1" opacity="0.3" />
            <path d="M40 80 Q250 15 460 80" fill="none" stroke={gold} strokeWidth="0.6" opacity="0.2" />
            <path d="M240 8 L250 0 L260 8 L256 20 L244 20 Z" fill={gold} opacity="0.4" />
          </svg>

          {/* Light rays */}
          {phase >= 4 && [...Array(7)].map((_, i) => (
            <div key={i} className="absolute" style={{
              top: "10%", left: `${30 + (i - 3) * 8}%`,
              width: `${2 + pr(i + 70, 3)}%`, height: "90%",
              background: `linear-gradient(180deg, ${rayColor}00, ${rayColor}${darkMode ? "18" : "22"}, ${rayColor}00)`,
              transform: `rotate(${(i - 3) * 4}deg)`, transformOrigin: "top center",
              animation: `doorLightRay ${2 + pr(i + 60, 2)}s ease-in-out ${pr(i + 40, 1)}s infinite`,
              opacity: 0,
            }} />
          ))}

          {/* Light behind doors + Logo reveal */}
          <div className="absolute inset-0 flex items-center justify-center" style={{
            background: phase >= 4 ? `radial-gradient(ellipse at center, ${darkMode ? "#D4A85325" : "#FFF8E835"} 0%, transparent 70%)` : "transparent",
            transition: "background 1.5s",
          }}>
            <div className="relative" style={{
              opacity: phase >= 5 ? 1 : 0,
              transform: phase >= 5 ? "scale(1) translateY(-20px)" : "scale(0.6) translateY(10px)",
              transition: "all 1.2s cubic-bezier(0.16,1,0.3,1) 0.2s",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Nagarathar Sangam KSA" style={{ width: 340, height: "auto", filter: darkMode ? "invert(1) brightness(1)" : "none" }} />
              {/* Gold particle burst */}
              {phase >= 5 && [...Array(24)].map((_, i) => {
                const angle = (i / 24) * 360;
                const dist = 60 + pr(i + 80, 80);
                return (
                  <div key={i} className="absolute rounded-full" style={{
                    width: 2 + pr(i + 90, 4), height: 2 + pr(i + 90, 4),
                    background: gold, left: "50%", top: "45%",
                    animation: `doorParticleBurst 1.5s cubic-bezier(0.16,1,0.3,1) ${pr(i, 0.4)}s forwards`,
                    opacity: 0,
                    "--px": `${Math.cos(angle * Math.PI / 180) * dist}px`,
                    "--py": `${Math.sin(angle * Math.PI / 180) * dist}px`,
                  } as React.CSSProperties} />
                );
              })}
            </div>
          </div>

          {/* LEFT DOOR */}
          <div style={doorStyle("left")}>
            <div className="absolute inset-0" style={{
              background: `linear-gradient(135deg, ${woodMid} 0%, ${woodDark} 100%)`,
              borderRight: `2px solid ${gold}44`, boxShadow: `inset -30px 0 50px rgba(0,0,0,0.4)`,
            }}>
              <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.06 }}>
                <defs>
                  <pattern id="grainL" x="0" y="0" width="100" height="8" patternUnits="userSpaceOnUse">
                    <path d="M0 4 Q25 2 50 4 Q75 6 100 4" fill="none" stroke={gold} strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grainL)" />
              </svg>
              <div className="absolute inset-3 border rounded-t-2xl" style={{ borderColor: `${gold}25` }}>
                <div className="absolute top-3 left-3 right-3 h-2/5 border rounded-t-full overflow-hidden" style={{ borderColor: `${gold}20` }}>
                  <div className="absolute inset-3 border rounded-t-full" style={{ borderColor: `${gold}15` }} />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ opacity: phase >= 2 ? 0.35 : 0.1, transition: "opacity 1s" }}>
                    {[0, 30, 60, 90, 120, 150].map(r => <ellipse key={r} cx="50" cy="55" rx="8" ry="20" fill="none" stroke={gold} strokeWidth="0.6" transform={`rotate(${r} 50 55)`} />)}
                    <circle cx="50" cy="55" r="6" fill="none" stroke={gold} strokeWidth="0.8" />
                    <circle cx="50" cy="55" r="3" fill={gold} opacity="0.3" />
                  </svg>
                </div>
                <div className="absolute bottom-3 left-3 right-3 h-2/5 border overflow-hidden" style={{ borderColor: `${gold}20` }}>
                  <div className="absolute inset-3 border" style={{ borderColor: `${gold}15` }} />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ opacity: phase >= 2 ? 0.3 : 0.08, transition: "opacity 1s" }}>
                    <rect x="30" y="30" width="40" height="40" fill="none" stroke={gold} strokeWidth="0.6" transform="rotate(45 50 50)" />
                    <rect x="35" y="35" width="30" height="30" fill="none" stroke={gold} strokeWidth="0.5" transform="rotate(45 50 50)" />
                    <rect x="40" y="40" width="20" height="20" fill="none" stroke={gold} strokeWidth="0.4" transform="rotate(45 50 50)" />
                    <circle cx="50" cy="50" r="4" fill="none" stroke={gold} strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 200" preserveAspectRatio="none" style={{ opacity: phase >= 2 ? 0.65 : 0.15, transition: "opacity 1.2s", filter: phase >= 2 ? `drop-shadow(0 0 3px ${gold}44)` : "none" }}>
                <defs><radialGradient id="studGL"><stop offset="0%" stopColor="#F5E6C8" /><stop offset="60%" stopColor={gold} /><stop offset="100%" stopColor="#8B6914" /></radialGradient></defs>
                {[15, 30, 45, 60, 75, 85].map(y => [25, 50, 75].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="url(#studGL)" />))}
              </svg>
              <div className="absolute" style={{ top: "45%", right: 16 }}>
                <svg width="32" height="44" viewBox="0 0 32 44" style={{ filter: "drop-shadow(2px 3px 4px rgba(0,0,0,0.6))", opacity: phase >= 2 ? 1 : 0.3, transition: "opacity 0.8s" }}>
                  <circle cx="16" cy="12" r="8" fill={gold} opacity="0.5" /><circle cx="16" cy="12" r="6" fill="none" stroke="#F5E6C8" strokeWidth="0.8" opacity="0.4" />
                  <circle cx="16" cy="12" r="3" fill={gold} opacity="0.7" /><circle cx="16" cy="28" r="10" fill="none" stroke={gold} strokeWidth="2.5" opacity="0.8" />
                  <circle cx="16" cy="28" r="10" fill="none" stroke="#F5E6C8" strokeWidth="0.5" opacity="0.3" />
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT DOOR */}
          <div style={doorStyle("right")}>
            <div className="absolute inset-0" style={{
              background: `linear-gradient(225deg, ${woodMid} 0%, ${woodDark} 100%)`,
              borderLeft: `2px solid ${gold}44`, boxShadow: `inset 30px 0 50px rgba(0,0,0,0.4)`,
            }}>
              <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.06 }}>
                <defs>
                  <pattern id="grainR" x="0" y="0" width="100" height="8" patternUnits="userSpaceOnUse">
                    <path d="M0 4 Q25 6 50 4 Q75 2 100 4" fill="none" stroke={gold} strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grainR)" />
              </svg>
              <div className="absolute inset-3 border rounded-t-2xl" style={{ borderColor: `${gold}25` }}>
                <div className="absolute top-3 left-3 right-3 h-2/5 border rounded-t-full overflow-hidden" style={{ borderColor: `${gold}20` }}>
                  <div className="absolute inset-3 border rounded-t-full" style={{ borderColor: `${gold}15` }} />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ opacity: phase >= 2 ? 0.35 : 0.1, transition: "opacity 1s" }}>
                    {[0, 30, 60, 90, 120, 150].map(r => <ellipse key={r} cx="50" cy="55" rx="8" ry="20" fill="none" stroke={gold} strokeWidth="0.6" transform={`rotate(${r} 50 55)`} />)}
                    <circle cx="50" cy="55" r="6" fill="none" stroke={gold} strokeWidth="0.8" />
                    <circle cx="50" cy="55" r="3" fill={gold} opacity="0.3" />
                  </svg>
                </div>
                <div className="absolute bottom-3 left-3 right-3 h-2/5 border overflow-hidden" style={{ borderColor: `${gold}20` }}>
                  <div className="absolute inset-3 border" style={{ borderColor: `${gold}15` }} />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ opacity: phase >= 2 ? 0.3 : 0.08, transition: "opacity 1s" }}>
                    <rect x="30" y="30" width="40" height="40" fill="none" stroke={gold} strokeWidth="0.6" transform="rotate(45 50 50)" />
                    <rect x="35" y="35" width="30" height="30" fill="none" stroke={gold} strokeWidth="0.5" transform="rotate(45 50 50)" />
                    <rect x="40" y="40" width="20" height="20" fill="none" stroke={gold} strokeWidth="0.4" transform="rotate(45 50 50)" />
                    <circle cx="50" cy="50" r="4" fill="none" stroke={gold} strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 200" preserveAspectRatio="none" style={{ opacity: phase >= 2 ? 0.65 : 0.15, transition: "opacity 1.2s", filter: phase >= 2 ? `drop-shadow(0 0 3px ${gold}44)` : "none" }}>
                <defs><radialGradient id="studGR"><stop offset="0%" stopColor="#F5E6C8" /><stop offset="60%" stopColor={gold} /><stop offset="100%" stopColor="#8B6914" /></radialGradient></defs>
                {[15, 30, 45, 60, 75, 85].map(y => [25, 50, 75].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="url(#studGR)" />))}
              </svg>
              <div className="absolute" style={{ top: "45%", left: 16 }}>
                <svg width="32" height="44" viewBox="0 0 32 44" style={{ filter: "drop-shadow(2px 3px 4px rgba(0,0,0,0.6))", opacity: phase >= 2 ? 1 : 0.3, transition: "opacity 0.8s" }}>
                  <circle cx="16" cy="12" r="8" fill={gold} opacity="0.5" /><circle cx="16" cy="12" r="6" fill="none" stroke="#F5E6C8" strokeWidth="0.8" opacity="0.4" />
                  <circle cx="16" cy="12" r="3" fill={gold} opacity="0.7" /><circle cx="16" cy="28" r="10" fill="none" stroke={gold} strokeWidth="2.5" opacity="0.8" />
                  <circle cx="16" cy="28" r="10" fill="none" stroke="#F5E6C8" strokeWidth="0.5" opacity="0.3" />
                </svg>
              </div>
            </div>
          </div>

          {phase === 3 && <div className="absolute inset-0 pointer-events-none" style={{ animation: "doorCreak 0.6s ease-out" }} />}
        </div>

        {/* Athangudi Tile Threshold */}
        <div className="absolute -bottom-5 -left-14 -right-14 h-10" style={{
          background: `linear-gradient(180deg, ${woodMid}, ${woodDark})`, borderTop: `2px solid ${gold}44`, overflow: "hidden",
        }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 40" preserveAspectRatio="none">
            <defs>
              <pattern id="athangudi" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill={darkMode ? "#2C1810" : "#8B6B3D"} opacity="0.3" />
                <rect x="2" y="2" width="36" height="36" fill="none" stroke={gold} strokeWidth="0.5" opacity="0.25" />
                <rect x="10" y="10" width="20" height="20" fill="none" stroke="#C97B3A" strokeWidth="0.4" opacity="0.2" transform="rotate(45 20 20)" />
                <circle cx="20" cy="20" r="5" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.2" />
                <circle cx="20" cy="20" r="2" fill={gold} opacity="0.15" />
              </pattern>
            </defs>
            <rect width="400" height="40" fill="url(#athangudi)" />
          </svg>
          <svg className="absolute top-1 left-1/2 -translate-x-1/2" width="260" height="30" viewBox="0 0 260 30">
            <path d="M30 15 Q50 5 70 15 Q90 25 110 15 Q130 5 150 15 Q170 25 190 15 Q210 5 230 15" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.25" />
            <path d="M30 15 Q50 25 70 15 Q90 5 110 15 Q130 25 150 15 Q170 5 190 15 Q210 25 230 15" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.25" />
            {[30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230].map((cx, i) => (
              <circle key={i} cx={cx} cy={15} r="2" fill={gold} opacity="0.35" />
            ))}
          </svg>
        </div>

        <div className="absolute -bottom-12 left-0 right-0 h-8" style={{
          background: phase >= 3 ? `radial-gradient(ellipse at 50% 0%, ${darkMode ? "rgba(212,168,83,0.08)" : "rgba(212,168,83,0.12)"} 0%, transparent 80%)` : "transparent",
          transition: "background 1.5s",
        }} />
      </div>

      {/* Status text */}
      <div className="absolute bottom-12 text-center" style={{ opacity: phase >= 1 && phase < 6 ? 1 : 0, transition: "opacity 0.6s" }}>
        <p style={{ fontFamily: "'Cinzel', serif", color: darkMode ? "#8B7355" : "#6B5340", fontSize: 13, letterSpacing: 5 }}>
          {phase < 3 ? "WELCOME" : phase < 5 ? "VANAKKAM" : "நாகரத்தார் சங்கம்"}
        </p>
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 text-xs tracking-widest opacity-40 hover:opacity-80 transition-opacity"
        style={{ fontFamily: "'Cinzel', serif", color: darkMode ? "#8B7355" : "#6B5340" }}
      >
        SKIP →
      </button>
    </div>
  );
}
