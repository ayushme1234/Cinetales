// CineTales — Region helper.
// Region is stored in a cookie ("region") and read on both server (SSR via
// req.cookies) and client (document.cookie). Default is India ("IN").

export const REGIONS = [
  { code: "IN", name: "India",            flag: "🇮🇳" },
  { code: "US", name: "United States",    flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom",   flag: "🇬🇧" },
  { code: "JP", name: "Japan",            flag: "🇯🇵" },
  { code: "KR", name: "South Korea",      flag: "🇰🇷" },
  { code: "ES", name: "Spain",            flag: "🇪🇸" },
  { code: "FR", name: "France",           flag: "🇫🇷" },
  { code: "DE", name: "Germany",          flag: "🇩🇪" },
  { code: "IT", name: "Italy",            flag: "🇮🇹" },
  { code: "BR", name: "Brazil",           flag: "🇧🇷" },
  { code: "MX", name: "Mexico",           flag: "🇲🇽" },
  { code: "CA", name: "Canada",           flag: "🇨🇦" },
  { code: "AU", name: "Australia",        flag: "🇦🇺" },
  { code: "CN", name: "China",            flag: "🇨🇳" },
  { code: "TR", name: "Turkey",           flag: "🇹🇷" },
];

export const DEFAULT_REGION = "IN";

const VALID_CODES = new Set(REGIONS.map((r) => r.code));

/**
 * Read region from request cookies (use in getServerSideProps).
 * Returns the default if missing or invalid.
 */
export function getRegionFromReq(req) {
  const code = req?.cookies?.region;
  if (code && VALID_CODES.has(code)) return code;
  return DEFAULT_REGION;
}

/**
 * Read region from browser document.cookie (use client-side).
 */
export function getRegionClient() {
  if (typeof document === "undefined") return DEFAULT_REGION;
  const m = document.cookie.match(/(?:^|; )region=([^;]+)/);
  if (m && VALID_CODES.has(m[1])) return m[1];
  return DEFAULT_REGION;
}

/**
 * Write region cookie + return whether it changed.
 */
export function setRegionClient(code) {
  if (typeof document === "undefined") return;
  if (!VALID_CODES.has(code)) return;
  // 1 year, path /, SameSite Lax so OAuth still works
  document.cookie = `region=${code}; path=/; max-age=31536000; SameSite=Lax`;
}

export function getRegionInfo(code) {
  return REGIONS.find((r) => r.code === code) || REGIONS[0];
}
