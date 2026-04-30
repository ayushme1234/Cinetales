import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Github, Linkedin, Mail, ExternalLink, MapPin, Briefcase, GraduationCap, Award, Code2, Sparkles, FileText, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About the Creator — CineTales",
  description: "Meet Ayush — full-stack AI engineer who built CineTales.",
};

const SKILLS = [
  { group: "AI & LLM Engineering", items: ["Agentic RAG", "LangChain", "Tool Calling", "Llama (Ollama)", "ChromaDB", "Prompt Engineering"], color: "brut-acid" },
  { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Three.js", "Chart.js"], color: "brut-pink" },
  { group: "Backend & Cloud", items: ["FastAPI", "Node.js", "REST APIs", "Vercel", "Railway", "CI/CD"], color: "brut-cobalt" },
  { group: "Salesforce CRM", items: ["LWC", "Apex", "SOQL/SOSL", "Flows", "Custom Objects", "SFDX"], color: "brut-tangerine" },
];

const PROJECTS = [
  { name: "AI-Powered Salesforce Assistant", tag: "Agentic RAG", desc: "Locally-hosted Llama autonomously chooses between semantic doc search, code retrieval, or direct LLM response.", link: "https://salesforce-ai-assistance.vercel.app/" },
  { name: "LWC Geek", tag: "EdTech", desc: "Interactive LWC learning platform with iframe sandbox, multi-tab editor, and Apex lifecycle simulator.", link: "https://lwcgeek.vercel.app/" },
  { name: "Velocyte", tag: "Tooling", desc: "Precision typing lab with WPM tracking, dual themes (Minimal + Breach Mode with matrix rain).", link: "https://velocyte.vercel.app/" },
  { name: "Myntra × Salesforce", tag: "E-commerce", desc: "Storefront wired to Salesforce Custom Objects + Apex REST. Cart, orders, real CRM data flow.", link: "https://myntraxsalesforce.vercel.app/" },
  { name: "QuickRide OS", tag: "Salesforce-native", desc: "Ride-hailing OS — driver onboarding, dispatch, surge pricing, settlements via flows + LWC.", link: "https://quickride-psi.vercel.app/" },
  { name: "JS Geek", tag: "EdTech", desc: "Closures, hoisting, event loop, prototypes — explained with interactive SVG visualizations.", link: "https://js-geek.vercel.app/" },
];

const JOURNEY = [
  { when: "Jan 2026 — Present", role: "Salesforce Domain Intern", where: "Cognizant Technology Solutions", desc: "Production work on enterprise Salesforce platforms — Apex, LWC, workflow automation in live client environments." },
  { when: "Jun — Jul 2025", role: "Embedded Systems & IoT Intern", where: "IC Centre, Jadavpur University", desc: "Real-time sensor data analysis. Designed biometric data acquisition with low-latency Wi-Fi/Bluetooth pipelines." },
  { when: "2024 — Present", role: "Independent Builder", where: "Self-directed projects", desc: "Shipped 9+ live products — agentic RAG, e-commerce, ed-tech, Salesforce platforms — all deployed end-to-end." },
  { when: "2022 — 2026", role: "B.Tech ECE", where: "Netaji Subhash Engineering College", desc: "CGPA 7.5/10. SIH internal qualifier. 200+ DSA problems on LeetCode, GFG, HackerRank." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b-[2.5px] border-ink">
          <div className="dots absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 md:pt-24">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-8">
                <span className="fade-up inline-flex items-center gap-2 rounded-full brut-soft bg-acid px-3 py-1 text-xs font-bold uppercase tracking-widest">
                  <Sparkles size={12} /> About the creator
                </span>
                <h1 className="display-xl mt-5 text-[16vw] leading-[0.85] md:text-[9rem]">
                  <span className="fade-up-1 block">Built by</span>
                  <span className="fade-up-2 block">
                    <span className="bg-electric px-3 text-cream">Ayush.</span>
                  </span>
                </h1>
                <p className="fade-up-3 mt-7 max-w-2xl text-lg leading-relaxed text-ink/80">
                  <span className="serif-italic">Full-stack AI engineer.</span>{" "}
                  Building <span className="font-bold">agentic RAG systems</span> and{" "}
                  <span className="font-bold">Salesforce platforms</span>. B.Tech ECE 2026 ·
                  currently shipping at Cognizant.
                </p>

                <div className="fade-up-4 mt-7 flex flex-wrap gap-3">
                  <a
                    href="https://nextfolio-rouge.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl brut brut-cobalt px-5 py-3 text-sm font-bold uppercase tracking-wider"
                  >
                    Full portfolio <ExternalLink size={16} />
                  </a>
                  <a
                    href="https://github.com/ayushme1234"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl brut brut-cream px-5 py-3 text-sm font-bold uppercase tracking-wider"
                  >
                    <Github size={16} /> GitHub
                  </a>
                  <a
                    href="https://nextfolio-rouge.vercel.app/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl brut brut-cream px-5 py-3 text-sm font-bold uppercase tracking-wider"
                  >
                    <FileText size={16} /> Resume
                  </a>
                </div>
              </div>

              <div className="md:col-span-4">
                <div className="fade-up-3 grid grid-cols-2 gap-3">
                  <Stat label="Projects" value="9+" color="brut-acid" />
                  <Stat label="DSA solved" value="200+" color="brut-pink" />
                  <Stat label="CGPA" value="7.5" color="brut-cobalt" />
                  <Stat label="Years coding" value="4+" color="brut-tangerine" />
                </div>

                <div className="fade-up-4 mt-4 rounded-2xl bg-cream p-5 brut tilt-r">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/60">
                    <MapPin size={12} /> Based in
                  </div>
                  <p className="display-xl mt-1 text-2xl">Kolkata, IN</p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/60">
                    <Briefcase size={12} /> Open to
                  </div>
                  <p className="font-bold">Full-time roles · 2026</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY THIS APP */}
        <section className="bg-ink py-20 text-cream">
          <div className="mx-auto max-w-4xl px-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">
              // why CineTales exists
            </p>
            <h2 className="display-xl mt-3 text-4xl md:text-6xl">
              "I wanted one tab to <br />
              <span className="serif-italic font-normal italic text-acid">
                find anything worth watching."
              </span>"
            </h2>
            <p className="mt-7 text-lg leading-relaxed text-cream/80">
              Letterboxd is great for cinephiles. IMDb is a database. Moctale is fun but limited.
              CineTales is my take — a single search across films, shows, and anime, with one-tap
              verdicts (Go for it / Timepass / Skip it), trailer playback, and AI that actually
              understands vibes. Built solo in a weekend with{" "}
              <span className="text-acid">Next.js, NextAuth, Prisma, TMDB, and Llama 3.3 on Groq</span>.
            </p>
          </div>
        </section>

        {/* SKILLS */}
        <section className="mx-auto max-w-7xl px-5 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/60">// the toolkit</p>
          <h2 className="display-xl mt-3 text-4xl md:text-6xl">
            What I work with <span className="serif-italic font-normal italic">daily.</span>
          </h2>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {SKILLS.map((s) => (
              <div key={s.group} className="rounded-2xl bg-cream p-6 brut">
                <span
                  className={`inline-block rounded-full ${s.color} px-3 py-1 text-xs font-bold uppercase tracking-widest brut-soft`}
                >
                  {s.group}
                </span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.items.map((i) => (
                    <span
                      key={i}
                      className="rounded-lg border-2 border-ink bg-cream px-3 py-1 text-sm font-bold"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        <section className="border-y-[2.5px] border-ink bg-cream py-20">
          <div className="mx-auto max-w-7xl px-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/60">
              // selected work
            </p>
            <h2 className="display-xl mt-3 text-4xl md:text-6xl">
              Things I've <span className="serif-italic font-normal italic">shipped.</span>
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((p, i) => {
                const colors = ["brut-acid", "brut-pink", "brut-cobalt", "brut-tangerine"];
                const c = colors[i % colors.length];
                return (
                  <a
                    key={p.name}
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-2xl bg-cream p-6 brut transition hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`rounded-full ${c} px-3 py-1 text-[10px] font-bold uppercase tracking-widest brut-soft`}
                      >
                        {p.tag}
                      </span>
                      <ExternalLink size={16} className="opacity-40 transition group-hover:opacity-100" />
                    </div>
                    <h3 className="display-xl mt-4 text-2xl leading-tight">{p.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{p.desc}</p>
                  </a>
                );
              })}
            </div>
            <div className="mt-10 text-center">
              <a
                href="https://nextfolio-rouge.vercel.app/#work"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl brut brut-pink px-5 py-3 text-sm font-bold uppercase tracking-wider"
              >
                See all 9+ projects <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* JOURNEY */}
        <section className="mx-auto max-w-4xl px-5 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/60">
            // how I got here
          </p>
          <h2 className="display-xl mt-3 text-4xl md:text-6xl">
            The <span className="serif-italic font-normal italic">journey.</span>
          </h2>
          <ol className="mt-10 space-y-6">
            {JOURNEY.map((j, i) => (
              <li key={i} className="relative rounded-2xl bg-cream p-6 brut">
                <span className="absolute -left-3 -top-3 grid h-9 w-9 place-items-center rounded-full bg-electric text-sm font-bold text-cream brut-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="font-mono text-xs uppercase tracking-widest text-ink/50">
                  {j.when}
                </div>
                <h3 className="mt-1 text-xl font-bold">{j.role}</h3>
                <p className="text-sm font-bold text-electric">{j.where}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{j.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CERTIFICATIONS */}
        <section className="bg-electric py-20 text-cream">
          <div className="mx-auto max-w-7xl px-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-80">
              // verified
            </p>
            <h2 className="display-xl mt-3 text-4xl md:text-6xl">
              Certifications.
            </h2>
            <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "AI Engineer Certification", org: "One Roadmap · 2025", icon: Sparkles },
                { name: "Full Stack Developer", org: "Certified Track · 2024", icon: Code2 },
                { name: "Python Certification", org: "Programming Track · 2024", icon: Code2 },
                { name: "Salesforce Developer Fundamentals", org: "Trailhead · Active", icon: Award },
              ].map((c) => (
                <div key={c.name} className="rounded-2xl bg-ink p-5 text-cream brut-soft">
                  <c.icon size={22} className="text-acid" />
                  <h3 className="mt-3 font-bold leading-tight">{c.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-widest text-cream/60">{c.org}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-5 py-24 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/60">
            // let's talk
          </p>
          <h2 className="display-xl mt-3 text-5xl md:text-7xl">
            Got a <span className="serif-italic font-normal italic">project?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink/70">
            Drop a message — I read everything personally and reply within 48 hours.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:[email protected]"
              className="inline-flex items-center gap-2 rounded-xl brut brut-pink px-5 py-3 text-sm font-bold uppercase tracking-wider"
            >
              <Mail size={16} /> Email me
            </a>
            <a
              href="https://www.linkedin.com/in/ayush-8b9623223/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl brut brut-cobalt px-5 py-3 text-sm font-bold uppercase tracking-wider"
            >
              <Linkedin size={16} /> LinkedIn
            </a>
            <a
              href="https://github.com/ayushme1234"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl brut brut-cream px-5 py-3 text-sm font-bold uppercase tracking-wider"
            >
              <Github size={16} /> GitHub
            </a>
          </div>
          <p className="mt-9 font-mono text-xs uppercase tracking-widest text-ink/50">
            Designed & built by Ayush · Kolkata, IN · 2026
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-2xl ${color} p-4 brut text-center`}>
      <div className="display-xl text-3xl">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</div>
    </div>
  );
}
