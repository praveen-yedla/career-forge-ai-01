import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Flame } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (s: Record<string, unknown>) => ({ mode: (s.mode as string) === "signup" ? "signup" : "signin" }),
  head: () => ({ meta: [{ title: "Sign in — CareerForge Pro" }] }),
});

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  fullName: z.string().trim().min(1).max(100).optional(),
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName: isSignup ? fullName : undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/app" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground"><Flame className="h-4 w-4" /></span>
          <span className="font-display text-xl">CareerForge <span className="text-primary">Pro</span></span>
        </Link>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-4xl">{isSignup ? "Forge your account." : "Welcome back."}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignup ? "Free plan, no card. One resume forge to start." : "Sign in to keep forging."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {isSignup && (
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@work.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "..." : isSignup ? "Create account" : "Sign in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <Button variant="secondary" className="w-full" onClick={onGoogle}>Continue with Google</Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "New here?"}{" "}
            <button onClick={() => setIsSignup(!isSignup)} className="text-primary hover:underline">
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>

        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} CareerForge Pro</div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-border lg:block">
        <div className="absolute inset-0 grain" />
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="paper-sheet w-full max-w-md -rotate-2 rounded-sm p-10">
            <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Sample forge</div>
            <div className="mt-1 font-display text-4xl text-neutral-900">Alex Chen</div>
            <div className="text-sm text-neutral-600">Staff Software Engineer</div>
            <div className="mt-4 h-px bg-neutral-300" />
            <p className="mt-4 text-xs leading-relaxed text-neutral-700">
              Architected a <span className="bg-[oklch(0.92_0.12_70)] px-0.5">distributed event-driven</span> platform serving
              200M+ users with 99.99% uptime, leveraging <span className="bg-[oklch(0.92_0.12_70)] px-0.5">Kubernetes</span> and{" "}
              <span className="bg-[oklch(0.92_0.12_70)] px-0.5">Kafka</span>.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-neutral-600">
              <div className="rounded border border-neutral-300 p-2"><div className="font-display text-lg text-neutral-900">98</div>ATS</div>
              <div className="rounded border border-neutral-300 p-2"><div className="font-display text-lg text-neutral-900">17</div>Keywords</div>
              <div className="rounded border border-neutral-300 p-2"><div className="font-display text-lg text-neutral-900">A+</div>Grade</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
