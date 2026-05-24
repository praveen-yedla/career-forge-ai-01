import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/SiteNav";
import { ArrowRight, Sparkles, Target, FileText, Zap, ShieldCheck, Gauge } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "CareerForge Pro — ATS-Proof Resumes, Forged by AI" },
      { name: "description", content: "Tailor your resume to any job description in under a minute. Beat the bots, land the interview." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-12 lg:py-32">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              AI Resume Architect — built for the 75% of resumes rejected by ATS
            </div>
            <h1 className="mt-6 font-display text-6xl leading-[0.95] text-balance lg:text-7xl">
              Resumes,{" "}
              <em className="text-primary">forged</em>{" "}
              for the job<br/>you actually want.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Paste a job description. Drop in your resume. Our AI agent extracts the keywords that matter,
              rewrites your bullet points to match, and ships a pixel-perfect PDF that walks past ATS filters.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" } as never}>
                <Button size="lg" className="h-12 px-6 text-base">
                  Forge my resume <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="ghost" className="h-12 px-6 text-base">See pricing</Button>
              </Link>
            </div>
            <div className="mt-10 flex gap-8 text-sm text-muted-foreground">
              <div><span className="font-display text-3xl text-foreground">92%</span><div>avg ATS score lift</div></div>
              <div><span className="font-display text-3xl text-foreground">47s</span><div>median forge time</div></div>
              <div><span className="font-display text-3xl text-foreground">1.6×</span><div>more interviews</div></div>
            </div>
          </div>

          {/* Floating resume preview */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="paper-sheet relative rotate-[2deg] rounded-sm p-8 transition-transform hover:rotate-0">
                <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Forged · v3</div>
                <div className="mt-2 font-display text-3xl text-neutral-900">Jordan Avery</div>
                <div className="mt-1 text-sm text-neutral-600">Senior Product Engineer · San Francisco</div>
                <div className="mt-4 h-px bg-neutral-300" />
                <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-700">Experience</div>
                <div className="mt-2 text-sm font-semibold text-neutral-900">Stripe · 2022 — Present</div>
                <ul className="mt-1 space-y-1.5 text-xs text-neutral-700">
                  <li>• Led <span className="bg-[oklch(0.92_0.12_70)] px-0.5">Python</span> migration of billing pipeline, cutting latency 38%.</li>
                  <li>• Shipped <span className="bg-[oklch(0.92_0.12_70)] px-0.5">distributed</span> rate-limiter handling 4B req/day.</li>
                  <li>• Mentored 6 engineers on <span className="bg-[oklch(0.92_0.12_70)] px-0.5">Agile</span> delivery cycles.</li>
                </ul>
                <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-700">Skills</div>
                <div className="mt-1 text-xs text-neutral-700">Python · Go · Kafka · PostgreSQL · Kubernetes · Leadership</div>
              </div>
              <div className="absolute -right-4 -top-4 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg">
                ATS Score: 96 ▲
              </div>
              <div className="absolute -bottom-4 left-6 rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
                <span className="text-primary">+14 keywords</span> matched
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-primary">The Forge</div>
            <h2 className="mt-3 font-display text-5xl text-balance">Four agents, one polished PDF.</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { i: Target, t: "JD Analysis Agent", d: "Parses your target job description and ranks the keywords that actually move the ATS needle." },
              { i: Sparkles, t: "Rewrite Agent", d: "Surgically rewrites each bullet to weave in critical terms — without losing your voice." },
              { i: Gauge, t: "ATS Score", d: "A live score from 0–100 so you know how well your resume will rank before you hit submit." },
              { i: FileText, t: "Pixel-perfect PDF", d: "Export a clean, recruiter-ready PDF in a typographic template ATS bots can parse perfectly." },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="group rounded-xl border border-border bg-background/60 p-6 transition-all hover:border-primary/60">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-2xl">{t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Workflow</div>
            <h2 className="mt-3 font-display text-5xl text-balance">From draft to forged in three steps.</h2>
            <p className="mt-4 text-muted-foreground">No templates to wrestle. No keyword guessing. Just paste, click, and download.</p>
          </div>
          <ol className="space-y-8">
            {[
              { n: "01", t: "Drop in your resume", d: "Paste your current resume text — any format works." },
              { n: "02", t: "Paste the job description", d: "Our agent reads the JD like a recruiter and a parser at the same time." },
              { n: "03", t: "Forge and download", d: "Get a rewritten resume, ATS score, and a polished PDF ready to send." },
            ].map((s) => (
              <li key={s.n} className="flex gap-6 border-l-2 border-primary/40 pl-6">
                <div className="font-mono text-sm text-primary">{s.n}</div>
                <div>
                  <div className="font-display text-2xl">{s.t}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="font-display text-6xl text-balance">Your next role is one forge away.</h2>
          <p className="mt-4 text-muted-foreground">Free plan includes one resume. No card required.</p>
          <Link to="/auth" search={{ mode: "signup" } as never}>
            <Button size="lg" className="mt-8 h-12 px-8 text-base">
              Start forging — it's free <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-3 w-3" /> Built on Lovable Cloud · © {new Date().getFullYear()} CareerForge Pro
        </div>
      </footer>
    </div>
  );
}
