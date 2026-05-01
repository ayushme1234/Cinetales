/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Surfaces ────────────────────────────────────────
        bg: "#0a0710",            // deep near-black with purple undertone
        surface: "#13101a",       // card base
        elevated: "#1c1828",      // raised surface (modal, dropdown)
        border: "#252132",        // default divider
        "border-light": "#332e44",// hover/focus divider

        // ── Text ────────────────────────────────────────────
        "text-1": "#f6f4fb",      // near white with faint lavender
        "text-2": "#a09bb0",      // mid muted
        "text-3": "#5d586d",      // dim muted

        // ── Accent (signature lavender/purple) ──────────────
        accent: "#a855f7",        // primary purple (vivid, eye-catching)
        "accent-hover": "#b975ff",
        "accent-soft": "#d8b4fe", // soft lavender for delicate accents
        "accent-deep": "#7c3aed", // deeper purple for pressed states
        "accent-dim": "rgba(168,85,247,0.16)",
        "accent-glow": "rgba(168,85,247,0.32)",

        // ── Verdict tiers (4 tiers like Moctale) ───────────
        skip: "#f87171",          // coral red
        mid: "#fbbf24",           // warm amber (timepass)
        go: "#4ade80",            // mint green (go for it)
        perfection: "#e879f9",    // magenta (perfection — top tier)

        // ── Special accents ─────────────────────────────────
        hot: "#fb923c",           // fire orange for trending/interest counts
      },
      fontFamily: {
        display: ["'DM Serif Display'", "serif"],
        sans: ["'Outfit'", "system-ui", "sans-serif"],
        mono: ["'DM Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest2: "0.18em",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.6s ease forwards",
        marquee: "marquee 60s linear infinite",
        "marquee-reverse": "marqueeReverse 60s linear infinite",
        "pulse-accent": "pulseAccent 2.4s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
        float: "float 6s ease-in-out infinite",
      },
      backgroundImage: {
        "purple-radial":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168,85,247,0.18), transparent 70%)",
        "purple-corner":
          "radial-gradient(ellipse 60% 80% at 0% 0%, rgba(168,85,247,0.14), transparent 60%)",
      },
    },
  },
  plugins: [],
};
