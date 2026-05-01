// CineTales — ProfileAvatar.
// Circular avatar that uses TMDB profile_path if present, otherwise renders
// a clean SVG silhouette (no broken images, no random letters).
// Responsive: scales between mobile and desktop sizes via Tailwind classes.

import Image from "next/image";
import { profileUrl } from "../lib/tmdb";

export default function ProfileAvatar({ profilePath, name, size = 120 }) {
  const src = profilePath ? profileUrl(profilePath, "w185") : null;

  return (
    <div
      className="relative shrink-0 rounded-full overflow-hidden bg-elevated border border-border w-[88px] h-[88px] md:w-[120px] md:h-[120px]"
      style={{
        // Allow caller to override via inline-style if size != 120
        ...(size !== 120
          ? { width: size, height: size, maxWidth: "none" }
          : {}),
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={name || "Profile"}
          fill
          sizes="120px"
          className="object-cover"
        />
      ) : (
        <PersonSilhouette />
      )}
    </div>
  );
}

/* Default silhouette — neutral, light-toned for visibility on dark UI */
function PersonSilhouette() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="profile-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2638" />
          <stop offset="100%" stopColor="#1c1828" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#profile-bg)" />
      <circle cx="50" cy="38" r="16" fill="#a09bb0" opacity="0.75" />
      <path
        d="M 18 100 C 18 75, 30 64, 50 64 C 70 64, 82 75, 82 100 Z"
        fill="#a09bb0"
        opacity="0.75"
      />
    </svg>
  );
}
