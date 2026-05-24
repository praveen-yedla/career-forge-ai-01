import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

type Resume = {
  id: string;
  title: string;
  ats_score: number | null;
  created_at: string;
};

function Dashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<"free" | "pro">("free");

  const load = async () => {
    setLoading(true);
    const [{ data: rs }, { data: prof }] = await Promise.all([
      supabase.from("resumes").select("id,title,ats_score,created_at").order("created_at", { ascending: false }),
      supabase.from("profiles").select("plan").maybeSingle(),
    ]);
    setResumes(rs ?? []);
    if (prof?.plan === "pro") setPlan("pro");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setResumes((r) => r.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Workshop</div>
          <h1 className="mt-2 font-display text-5xl">Your forges</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Plan: <span className="text-foreground capitalize">{plan}</span> · {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}
          </p>
        </div>
        <Link to="/app/new"><Button><Plus className="mr-1 h-4 w-4" /> New forge</Button></Link>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-xl border border-border bg-card/40" />)}
          </div>
        ) : resumes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="h-6 w-6" /></div>
            <h2 className="mt-4 font-display text-3xl">No forges yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Drop in your resume and a job description to get started.</p>
            <Link to="/app/new"><Button className="mt-6">Forge your first resume</Button></Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => (
              <Link
                key={r.id}
                to="/app/$id"
                params={{ id: r.id }}
                className="group relative flex flex-col rounded-xl border border-border bg-card/40 p-6 transition-all hover:border-primary/60"
              >
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                  {r.ats_score != null && (
                    <div className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                      ATS {r.ats_score}
                    </div>
                  )}
                </div>
                <div className="mt-4 font-display text-2xl line-clamp-2">{r.title}</div>
                <div className="mt-auto pt-4 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); remove(r.id); }}
                  className="absolute right-3 top-3 hidden rounded-md p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive group-hover:block"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
