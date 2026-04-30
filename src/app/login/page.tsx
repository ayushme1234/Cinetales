"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/");
  }, [status, router]);

  return (
    <main className="dots min-h-screen bg-cream">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-10">
        <div className="grid w-full gap-8 md:grid-cols-2 md:gap-16">
          {/* LEFT — branding */}
          <div className="flex flex-col justify-center">
            <Link href="/" className="display-xl text-4xl">CineTales</Link>
            <h1 className="display-xl mt-6 text-5xl leading-[0.9] md:text-7xl">
              Press play <br />
              <span className="bg-acid px-2">on the good ones.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink/80">
              Build your watchlist. Track what you've watched. Decide where to stream — all without
              the homework.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "One-tap Google sign in",
                "Free forever, ad-light",
                "Your data stays yours",
              ].map((s) => (
                <li key={s} className="flex items-center gap-3 font-medium">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-electric text-cream brut">
                    ✓
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — sign in card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl bg-cream p-8 brut tilt-r">
              <div className="text-xs font-bold uppercase tracking-widest text-ink/60">
                Welcome
              </div>
              <h2 className="display-xl mt-1 text-4xl">Sign in</h2>
              <p className="mt-2 text-ink/70">
                Use your Google account. No new passwords to remember.
              </p>

              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl brut brut-cream px-6 py-4 text-base font-bold"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="mt-6 text-center text-xs text-ink/50">
                By continuing you agree to our{" "}
                <Link href="/terms" className="underline">Terms</Link> &{" "}
                <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </div>

              <div className="mt-6 rounded-xl bg-acid p-3 font-mono text-xs">
                <span className="font-bold">PSST →</span> set up your{" "}
                <code>GOOGLE_CLIENT_ID</code> & <code>GOOGLE_CLIENT_SECRET</code> in{" "}
                <code>.env</code> for this button to work.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.2 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.9 36.1 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
