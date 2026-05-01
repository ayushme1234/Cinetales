import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getTrending, posterUrl } from "../lib/tmdb";

export default function LoginPage({ collage }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const callbackUrl = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/";

  useEffect(() => {
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, router, callbackUrl]);

  return (
    <>
      <Head>
        <title>Sign in — CineTales</title>
      </Head>

      <main className="min-h-screen relative grid place-items-center px-4 py-16 overflow-hidden bg-[var(--bg)]">
        {/* Background poster collage */}
        <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-6 gap-3 p-6 opacity-[0.08] blur-md pointer-events-none">
          {collage.map((p, i) => (
            <div key={i} className="aspect-[2/3] relative rounded-lg overflow-hidden">
              <Image src={p} alt="" fill sizes="200px" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[rgba(10,10,10,0.85)] to-[rgba(10,10,10,0.6)]" />

        {/* Card */}
        <div className="relative z-10 w-full max-w-[420px] rounded-3xl border border-[var(--border-light)] bg-[rgba(17,17,17,0.92)] backdrop-blur-2xl p-10 md:p-12 shadow-2xl animate-slide-up">
          <Link href="/" className="flex items-center justify-center gap-2 mb-2">
            <span className="font-display text-4xl text-[var(--accent)] leading-none">C</span>
          </Link>
          <p className="text-center font-display text-2xl">CineTales</p>

          <div className="my-6 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />

          <h1 className="font-display text-3xl md:text-4xl text-center leading-tight">
            Your cinema,<br /><span className="italic text-[var(--accent)]">your story.</span>
          </h1>
          <p className="mt-3 text-center text-[var(--text-2)] text-sm">
            Sign in to track, rate, and build your watchlist.
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="mt-8 w-full inline-flex items-center justify-center gap-3 bg-white text-black font-medium py-3.5 rounded-full btn-press hover:shadow-lg hover:shadow-white/20 transition-all"
          >
            <GoogleLogo />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-[var(--text-3)] font-mono uppercase tracking-widest">
            No passwords · No spam · Free forever
          </p>
        </div>
      </main>
    </>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export async function getServerSideProps() {
  let collage = [];
  try {
    const t = await getTrending("week");
    collage = (t.results || [])
      .filter((m) => m.poster_path)
      .slice(0, 12)
      .map((m) => posterUrl(m.poster_path, "w342"));
  } catch (e) {
    console.error("Login collage failed:", e);
  }
  return { props: { collage } };
}
