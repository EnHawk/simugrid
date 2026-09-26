// Logo Resmi SimuGrid (SDG 7 & SDG 11)
// Ikon Vektor Beresolusi Tinggi Menggabungkan Matriks Mikrogrid (Solar, Wind, Battery, Smart City) & S-Lightning Energy Nexus

import React, { useId } from 'react';

export default function SimuGridLogo({
  size = 38,
  className = '',
  isLight = false,
  animated = false,
  showGlow = true
}) {
  const rawId = useId();
  const id = `sg-logo-${rawId.replace(/:/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none ${animated ? 'hover:scale-105 active:scale-95 transition-transform duration-200' : ''} ${className}`}
    >
      <defs>
        {/* Background Card Gradient */}
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isLight ? '#FFFFFF' : '#081320'} />
          <stop offset="50%" stopColor={isLight ? '#F0FDF4' : '#041F1A'} />
          <stop offset="100%" stopColor={isLight ? '#E0F2FE' : '#020C14'} />
        </linearGradient>

        {/* Dynamic Border Gradient */}
        <linearGradient id={`${id}-border`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity={isLight ? 0.7 : 0.85} />
          <stop offset="50%" stopColor="#06B6D4" stopOpacity={isLight ? 0.5 : 0.6} />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity={isLight ? 0.7 : 0.85} />
        </linearGradient>

        {/* S-Conduit Full Spectrum Clean Energy Gradient (Solar -> Emerald -> Cyan -> Blue) */}
        <linearGradient id={`${id}-energy`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="28%" stopColor="#10B981" />
          <stop offset="70%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Plasma Flash Core Gradient */}
        <linearGradient id={`${id}-core`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>

        {/* Glowing Aura Filter */}
        {showGlow && (
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation={isLight ? 1.5 : 2.5}
              floodColor="#10B981"
              floodOpacity={isLight ? 0.35 : 0.6}
            />
          </filter>
        )}
      </defs>

      {/* Outer Squircle Container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill={`url(#${id}-bg)`}
        stroke={`url(#${id}-border)`}
        strokeWidth="1.5"
      />

      {/* 4-Quadrant Microgrid Tiles (The 4 Pillars of SimuGrid) */}
      <g opacity={isLight ? 0.75 : 0.55}>
        {/* Top-Left: Solar Generation Tile */}
        <rect
          x="7"
          y="7"
          width="14"
          height="14"
          rx="4"
          fill={isLight ? '#FEF3C7' : '#0F2C24'}
          stroke="#F59E0B"
          strokeWidth="0.8"
          strokeOpacity={isLight ? 0.45 : 0.3}
        />

        {/* Top-Right: Wind Power Tile */}
        <rect
          x="27"
          y="7"
          width="14"
          height="14"
          rx="4"
          fill={isLight ? '#E0F2FE' : '#082535'}
          stroke="#06B6D4"
          strokeWidth="0.8"
          strokeOpacity={isLight ? 0.45 : 0.3}
        />

        {/* Bottom-Left: Battery Storage Tile */}
        <rect
          x="7"
          y="27"
          width="14"
          height="14"
          rx="4"
          fill={isLight ? '#ECFDF5' : '#07241F'}
          stroke="#10B981"
          strokeWidth="0.8"
          strokeOpacity={isLight ? 0.45 : 0.3}
        />

        {/* Bottom-Right: Smart Microgrid Consumer Tile */}
        <rect
          x="27"
          y="27"
          width="14"
          height="14"
          rx="4"
          fill={isLight ? '#EEF2FF' : '#111833'}
          stroke="#6366F1"
          strokeWidth="0.8"
          strokeOpacity={isLight ? 0.45 : 0.3}
        />
      </g>

      {/* Microgrid Bus Circuit Tracks */}
      <path
        d="M 14 24 H 34 M 24 14 V 34"
        stroke={isLight ? '#059669' : '#22D3EE'}
        strokeOpacity={isLight ? 0.35 : 0.28}
        strokeWidth="1"
        strokeDasharray="1.5 2"
      />

      {/* 4 Power Node Junction Terminals */}
      <circle cx="14" cy="14" r="1.8" fill="#F59E0B" opacity="0.9" />
      <circle cx="34" cy="14" r="1.8" fill="#06B6D4" opacity="0.9" />
      <circle cx="14" cy="34" r="1.8" fill="#10B981" opacity="0.9" />
      <circle cx="34" cy="34" r="1.8" fill="#6366F1" opacity="0.9" />

      {/* The Hero "S" Energy Lightning Conduit */}
      <g filter={showGlow ? `url(#${id}-glow)` : undefined}>
        {/* Main Geometric "S" Flow Ribbon */}
        <path
          d="M 33 11.5 C 33 11.5, 23 11.5, 19 11.5 C 15 11.5, 12.5 14, 12.5 17.5 C 12.5 21, 15.5 22.5, 18.5 22.5 L 28.5 22.5 L 18 36.5 L 23.5 27.5 L 15.5 27.5 C 15.5 27.5, 25 27.5, 29 27.5 C 33 27.5, 35.5 30, 35.5 33.5 C 35.5 37, 32.5 37.5, 28.5 37.5 L 15 37.5"
          fill="none"
          stroke={`url(#${id}-energy)`}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Lightning Plasma Core */}
        <path
          d="M 28 14.5 L 18.5 27.5 L 24 27.5 L 19 34"
          fill="none"
          stroke={`url(#${id}-core)`}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Power Core Star */}
        <circle cx="23.5" cy="24.5" r="1.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
