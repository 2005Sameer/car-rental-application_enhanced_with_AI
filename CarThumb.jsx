import React from "react";
import CarGlyph from "./CarGlyph.jsx";

// Shows the uploaded photo when a car has one, falling back to the
// generated SVG glyph otherwise. Used anywhere a car appears as a
// small/medium thumbnail (tables, lists) — CarCard and CarDetailsPage
// render the full-size version inline instead of using this.
export default function CarThumb({ car, size = 44 }) {
  if (car.imageUrl) {
    return (
      <img
        src={car.imageUrl}
        alt={car.name}
        style={{ width: size, height: size, objectFit: "cover", borderRadius: 6, border: "1px solid var(--edge)", flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <CarGlyph tone={car.tone} type={car.type} />
    </div>
  );
}
