import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ResumePaper, type RewrittenResume } from "@/components/ResumePaper";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/$id")({ component: ResumeView });

type Keyword = { term: string; importance: number; matched: boolean };

function ResumeView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const paperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState<{
    title: string;
    rewritten: RewrittenResume | null;
    keywords: Keyword[];
    ats_score: number | null;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: row, error } = await supabase
        .from("resumes")
        .select("title, rewritten, keywords, ats_score")
        .eq("id", id)
        .maybeSingle();
      if (error || !row) {
        toast.error("Resume not found");
        navigate({ to: "/app" });
        return;
      }
      setData({
        title: row.title,
        rewritten: row.rewritten as never,
        keywords: (row.keywords ?? []) as Keyword[],
        ats_score: row.ats_score,
      });
      setLoading(false);
    })();
  }, [id, navigate]);

  const downloadPdf = async () => {
    if (!paperRef.current) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(paperRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "pt", format: "letter" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgW = pageW;
      const imgH = imgW * ratio;
      if (imgH <= pageH) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgW, imgH);
      } else {
        // Multi-page slicing
        let remaining = imgH;
        let position = 0;
        while (remaining > 0) {
          pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
          remaining -= pageH;
          position -= pageH;
          if (remaining > 0) pdf.addPage();
        }
      }
      pdf.save(`${data?.title || "resume"}.pdf`);
    } catch (e) {
      console.error(e);
      toast.error("PDF export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !data || !data.rewritten) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const matched = data.keywords.filter((k) => k.matched).length;
  const total = data.keywords.length;
  const highlightTerms = data.keywords.filter((k) => k.matched).map((k) => k.term);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link to="/app" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to forges
        </Link>
        <Button onClick={downloadPdf} disabled={exporting}>
          {exporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting…</> : <><Download className="mr-2 h-4 w-4" /> Download PDF</>}
        </Button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Resume preview */}
        <div>
          <ResumePaper ref={paperRef} data={data.rewritten} highlight={highlightTerms} />
        </div>

        {/* Side panel: ATS score + keywords */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card/40 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-primary">ATS Score</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-7xl text-primary">{data.ats_score ?? "—"}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${data.ats_score ?? 0}%` }} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {matched} of {total} keywords matched in your resume.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Keywords</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.keywords
                .sort((a, b) => b.importance - a.importance)
                .map((k) => (
                  <span
                    key={k.term}
                    className={`rounded-md px-2 py-1 text-xs ${
                      k.matched
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground border border-border line-through"
                    }`}
                    title={`Importance ${k.importance}/10`}
                  >
                    {k.term}
                  </span>
                ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-6 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground">Tip</div>
            <p className="mt-2">Highlighted terms in the preview are the keywords successfully matched into your rewritten resume.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
