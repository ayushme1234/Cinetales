import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MediaCard } from "@/components/media-card";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 1800;

export default async function TrendingPage() {
  let day: any[] = [];
  let week: any[] = [];
  try {
    const [d, w] = await Promise.all([tmdbApi.trending("day"), tmdbApi.trending("week")]);
    day = d.results;
    week = w.results;
  } catch (e) {
    console.error(e);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <span className="inline-block rounded-full brut brut-pink px-3 py-1 text-xs font-bold uppercase tracking-widest text-cream">
          Hot right now
        </span>
        <h1 className="display-xl mt-3 text-5xl md:text-7xl">Trending.</h1>

        <Section label="Today">
          <Grid items={day} />
        </Section>
        <Section label="This week">
          <Grid items={week} />
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="display-xl text-3xl md:text-4xl">{label}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Grid({ items }: { items: any[] }) {
  if (!items.length) return <p className="text-ink/60">No data.</p>;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((m) => (
        <MediaCard key={`${m.media_type}-${m.id}`} item={m} />
      ))}
    </div>
  );
}
