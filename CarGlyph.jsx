import React from "react";

const TONE_HEX = { amber: "#ffb020", teal: "#3fd6c4", slate: "#6b7178" };

export default function CarGlyph({ tone = "slate", type, className = "" }) {
  const stroke = TONE_HEX[tone] || TONE_HEX.slate;
  return (
    <svg viewBox="0 0 240 120" className={className} style={{ width: "100%" }} aria-hidden="true">
      <ellipse cx="120" cy="98" rx="98" ry="8" fill="rgba(0,0,0,0.35)" />
      <path d="M28 78 L40 48 Q52 30 78 28 L162 28 Q188 30 200 48 L212 78 Z" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M62 46 L82 32 L150 32 L172 46 Z" fill="none" stroke={stroke} strokeWidth="2.5" opacity="0.6" />
      <line x1="118" y1="32" x2="118" y2="46" stroke={stroke} strokeWidth="2" opacity="0.5" />
      <circle cx="68" cy="80" r="17" fill="none" stroke={stroke} strokeWidth="3.5" />
      <circle cx="68" cy="80" r="6" fill={stroke} opacity="0.7" />
      <circle cx="176" cy="80" r="17" fill="none" stroke={stroke} strokeWidth="3.5" />
      <circle cx="176" cy="80" r="6" fill={stroke} opacity="0.7" />
      <line x1="30" y1="78" x2="210" y2="78" stroke={stroke} strokeWidth="3.5" />
      {type === "Electric" && (
        <path d="M124 46 L110 66 L120 66 L112 84 L136 58 L124 58 Z" fill={stroke} opacity="0.85" />
      )}
    </svg>
  );
}
