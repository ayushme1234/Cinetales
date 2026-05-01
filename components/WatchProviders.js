import Image from "next/image";
import { logoUrl } from "../lib/tmdb";

/**
 * WatchProviders — shows where the title is available to stream/rent/buy.
 * Renders prominent provider cards (logo + name + access type).
 * Tapping a card opens TMDB's deep link (which routes to the provider).
 */
export default function WatchProviders({ providers }) {
  if (!providers) {
    return (
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-[var(--text-3)] mb-2">
          Where to watch
        </p>
        <p className="text-[var(--text-2)]">
          Streaming availability not listed for your region yet.
        </p>
      </div>
    );
  }

  const buckets = [
    { key: "flatrate", label: "Stream", color: "var(--go)" },
    { key: "free", label: "Free", color: "var(--go)" },
    { key: "ads", label: "With Ads", color: "var(--mid)" },
    { key: "rent", label: "Rent", color: "var(--mid)" },
    { key: "buy", label: "Buy", color: "var(--text-2)" },
  ];

  const hasAny = buckets.some((b) => Array.isArray(providers[b.key]) && providers[b.key].length);

  if (!hasAny) {
    return (
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-[var(--text-3)] mb-2">
          Where to watch
        </p>
        <p className="text-[var(--text-2)]">
          Not available for streaming in your region right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 md:p-8">
      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-[var(--text-3)]">
          Where to watch
        </p>
        {providers.region && (
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-[var(--text-3)]">
            Region: {providers.region}
          </span>
        )}
      </div>

      <div className="space-y-7">
        {buckets.map((bucket) => {
          const list = providers[bucket.key];
          if (!Array.isArray(list) || list.length === 0) return null;
          return (
            <div key={bucket.key}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: bucket.color }}
                />
                <h4 className="text-sm uppercase tracking-wider text-[var(--text-1)]">
                  {bucket.label}
                </h4>
                <span className="font-mono text-xs text-[var(--text-3)]">
                  · {list.length} {list.length === 1 ? "service" : "services"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {list.map((p) => (
                  <ProviderCard
                    key={`${bucket.key}-${p.provider_id}`}
                    provider={p}
                    href={providers.link}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-7 pt-5 border-t border-[var(--border)] text-xs text-[var(--text-3)] font-mono leading-relaxed">
        Streaming data via JustWatch / TMDB. Click a provider to open in TMDB.
      </p>
    </div>
  );
}

function ProviderCard({ provider, href }) {
  const logo = logoUrl(provider.logo_path, "w154");
  const inner = (
    <div className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--elevated)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[#1c1c1c] transition-all card-hover">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0 border border-[var(--border)]">
        {logo ? (
          <Image
            src={logo}
            alt={provider.provider_name}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs font-display text-black">
            {(provider.provider_name || "?")[0]}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
          {provider.provider_name}
        </p>
      </div>
    </div>
  );

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${provider.provider_name}`}
    >
      {inner}
    </a>
  ) : (
    inner
  );
}
