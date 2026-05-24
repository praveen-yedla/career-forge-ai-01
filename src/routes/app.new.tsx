import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { forgeResume } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, FileText, Briefcase } from "lucide-react";

export const Route = createFileRoute("/app/new")({
  component: NewForge,
});

function NewForge() {
  const navigate = useNavigate();
  const forge = useServerFn(forgeResume);
  const [title, setTitle] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeText.trim().length < 50) return toast.error("Please paste a longer resume (50+ characters).");
    if (jdText.trim().length < 50) return toast.error("Please paste a longer job description.");
    setLoading(true);
    try {
      const result = await forge({ data: { resumeText, jdText, title: title || undefined } });
      toast.success(`Forged! ATS score: ${result.ats_score}`);
      navigate({ to: "/app/$id", params: { id: result.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Forge failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="text-xs uppercase tracking-[0.3em] text-primary">New Forge</div>
      <h1 className="mt-2 font-display text-5xl">Tailor your resume.</h1>
      <p className="mt-2 text-sm text-muted-foreground">Paste in your current resume and the target job description. Our AI handles the rest.</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-8">
        <div>
          <Label htmlFor="title">Title (optional)</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Stripe — Staff Eng application" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" /> Your resume
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Paste plain text. Include experience, skills, education.</p>
            <Textarea
              className="mt-3 min-h-[360px] resize-y font-mono text-xs"
              placeholder={"Jane Doe\nSenior Engineer · jane@email.com\n\nExperience\nAcme Corp — Senior Engineer (2021–Present)\n• Led migration of monolith to microservices\n• Mentored 4 engineers\n\nSkills: Python, Go, AWS...\n\nEducation\nBS Computer Science — Stanford 2019"}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <div className="mt-2 text-right text-[10px] text-muted-foreground">{resumeText.length} chars</div>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Briefcase className="h-4 w-4 text-primary" /> Target job description
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Paste the full JD from the company's careers page.</p>
            <Textarea
              className="mt-3 min-h-[360px] resize-y font-mono text-xs"
              placeholder="About the role:\nWe're hiring a Senior Backend Engineer to scale our payments platform...\n\nRequirements:\n• 5+ years building distributed systems\n• Strong Python / Go\n• Experience with Kubernetes, Kafka\n..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
            <div className="mt-2 text-right text-[10px] text-muted-foreground">{jdText.length} chars</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/app" })}>Cancel</Button>
          <Button type="submit" disabled={loading} size="lg" className="px-8">
            {loading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" /> Forging…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Forge resume
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}
