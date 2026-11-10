import { useState } from "react";
import { HUES } from "../data/hostels.js";

export default function Photo({ hostel, index = 0, className = "" }) {
  const rawSrc = hostel.photos?.[index];
  const [failed, setFailed] = useState(false);

  // Ensure path starts with / for public folder assets
  const src = rawSrc?.startsWith("/") ? rawSrc : rawSrc ? `/${rawSrc}` : null;

  if (src && !failed) {
    return (
      <img
        className={className}
        src={src}
        alt={`${hostel.name} photo ${index + 1}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className={className}
      style={{ background: HUES[(hostel.id + index) % HUES.length] }}
      aria-hidden="true"
    >
      🏠
    </div>
  );
}