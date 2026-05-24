import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({
    meta: [
      { title: "Pricing — CareerForge Pro" },
      { name: "description", content: "Simple pricing. Free to start, Pro when you're ready to scale your applications." },
    ],
  }),
});

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Forge your first resume on us.",
    features: ["1 resume forge", "ATS score & keywords", "PDF export", "Editorial template"],
    cta: "Start free",
    href: "/auth",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    desc: "For active job seekers and career-switchers.",
    features: ["Unlimited resume forges", "Cover letter generation", "Premium templates", "Priority AI model", "Version history"],
    cta: "Go Pro",
    href: "/auth",
    featured: true,
  },
];

function Pricing() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Pricing</div>
          <h1 className="mt-3 font-display text-6xl text-balance">Forge one, or forge them all.</h1>
          <p className="mt-4 text-muted-foreground">Cancel anytime. No card to start.</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl border p-8 ${
                t.featured ? "border-primary bg-card shadow-glow" : "border-border bg-card/40"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </div>
              )}
              <div className="font-display text-3xl">{t.name}</div>
              <div className="mt-2 flex items-end gap-1">
                <span className="font-display text-5xl">{t.price}</span>
                <span className="pb-2 text-sm text-muted-foreground">{t.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Link to={t.href}>
                <Button className="mt-8 w-full" variant={t.featured ? "default" : "secondary"}>
                  {t.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
          Stripe billing is coming online — Pro features are previewable now during early access.
        </p>
      </section>
    </div>
  );
}
