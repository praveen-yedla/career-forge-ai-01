import { forwardRef } from "react";

export type RewrittenResume = {
  name: string;
  headline: string;
  contact: string;
  summary: string;
  experience: { company: string; role: string; period: string; bullets: string[] }[];
  skills: string[];
  education: { school: string; degree: string; period: string }[];
};

type Props = { data: RewrittenResume; highlight?: string[] };

function highlightTerms(text: string, terms?: string[]) {
  if (!terms || terms.length === 0) return text;
  const sorted = [...terms].sort((a, b) => b.length - a.length).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`\\b(${sorted.join("|")})\\b`, "gi");
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? <mark key={i} className="bg-[#f4d58d] px-0.5 text-neutral-900">{p}</mark> : <span key={i}>{p}</span>
  );
}

export const ResumePaper = forwardRef<HTMLDivElement, Props>(({ data, highlight }, ref) => {
  return (
    <div
      ref={ref}
      className="paper-sheet mx-auto w-full max-w-[816px] rounded-sm p-12 text-neutral-900"
      style={{ fontFamily: "'Inter', sans-serif", minHeight: "1056px" }}
    >
      <div className="border-b-2 border-neutral-900 pb-4">
        <h1 className="font-display text-4xl leading-none text-neutral-900">{data.name}</h1>
        <div className="mt-1 text-sm text-neutral-700">{data.headline}</div>
        <div className="mt-2 text-xs text-neutral-600">{data.contact}</div>
      </div>

      {data.summary && (
        <section className="mt-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-700">Summary</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-800">
            {highlightTerms(data.summary, highlight)}
          </p>
        </section>
      )}

      <section className="mt-5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-700">Experience</h2>
        <div className="mt-2 space-y-4">
          {data.experience.map((e, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{e.role}</div>
                  <div className="text-[13px] text-neutral-700">{e.company}</div>
                </div>
                <div className="font-mono text-[11px] text-neutral-600">{e.period}</div>
              </div>
              <ul className="mt-1.5 space-y-1 text-[13px] leading-relaxed text-neutral-800">
                {e.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="text-neutral-500">•</span>
                    <span>{highlightTerms(b, highlight)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {data.skills?.length > 0 && (
        <section className="mt-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-700">Skills</h2>
          <p className="mt-1.5 text-[13px] text-neutral-800">
            {highlightTerms(data.skills.join(" · "), highlight)}
          </p>
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="mt-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-700">Education</h2>
          <div className="mt-2 space-y-2">
            {data.education.map((ed, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{ed.degree}</div>
                  <div className="text-[13px] text-neutral-700">{ed.school}</div>
                </div>
                <div className="font-mono text-[11px] text-neutral-600">{ed.period}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
});
ResumePaper.displayName = "ResumePaper";
