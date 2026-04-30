"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: number;
}

/**
 * 5 stars × 2 (half) = 10-point scale.
 * Hover preview, click to set, click same value to unset.
 */
export function StarRater({ value, onChange, disabled, size = 28 }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value ?? 0;

  return (
    <div className="select-none">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => {
          const fullThreshold = i * 2;       // 2,4,6,8,10
          const halfThreshold = i * 2 - 1;   // 1,3,5,7,9
          const filled = display >= fullThreshold;
          const half = !filled && display >= halfThreshold;

          return (
            <div
              key={i}
              className="relative"
              style={{ width: size, height: size }}
            >
              {/* Empty star background */}
              <Star
                size={size}
                className="absolute inset-0 text-ink/20"
                strokeWidth={2}
              />
              {/* Filled portion (clipped for half) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: half ? "50%" : filled ? "100%" : "0%" }}
              >
                <Star
                  size={size}
                  className="text-acid"
                  fill="currentColor"
                  strokeWidth={2}
                />
              </div>
              {/* Click areas — left half + right half */}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Rate ${halfThreshold} out of 10`}
                onMouseEnter={() => setHover(halfThreshold)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onChange(value === halfThreshold ? 0 : halfThreshold)}
                className="absolute left-0 top-0 h-full w-1/2 cursor-pointer disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={disabled}
                aria-label={`Rate ${fullThreshold} out of 10`}
                onMouseEnter={() => setHover(fullThreshold)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onChange(value === fullThreshold ? 0 : fullThreshold)}
                className="absolute right-0 top-0 h-full w-1/2 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="display-xl text-2xl">{display.toFixed(1)}</span>
        <span className="text-ink/50">/ 10</span>
        {value && hover === null && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-2 text-xs font-bold text-electric hover:underline"
            disabled={disabled}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
