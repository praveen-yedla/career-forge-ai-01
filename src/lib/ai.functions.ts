import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const inputSchema = z.object({
  resumeText: z.string().min(50).max(20000),
  jdText: z.string().min(50).max(20000),
  title: z.string().min(1).max(200).optional(),
});

export type ForgeResult = {
  id: string;
  ats_score: number;
  keywords: { term: string; importance: number; matched: boolean }[];
  rewritten: {
    name: string;
    headline: string;
    contact: string;
    summary: string;
    experience: { company: string; role: string; period: string; bullets: string[] }[];
    skills: string[];
    education: { school: string; degree: string; period: string }[];
  };
};

const TOOL = {
  type: "function" as const,
  function: {
    name: "emit_forge",
    description: "Return ATS analysis and a fully rewritten resume tailored to the job description.",
    parameters: {
      type: "object",
      properties: {
        ats_score: { type: "integer", minimum: 0, maximum: 100, description: "Estimated ATS match score 0-100." },
        keywords: {
          type: "array",
          description: "Top 10-15 keywords extracted from the JD, ranked by importance.",
          items: {
            type: "object",
            properties: {
              term: { type: "string" },
              importance: { type: "integer", minimum: 1, maximum: 10 },
              matched: { type: "boolean", description: "Whether the term appears in the rewritten resume." },
            },
            required: ["term", "importance", "matched"],
            additionalProperties: false,
          },
        },
        rewritten: {
          type: "object",
          properties: {
            name: { type: "string" },
            headline: { type: "string", description: "1-line professional headline tuned to the JD." },
            contact: { type: "string", description: "Single line: email · phone · location · links" },
            summary: { type: "string", description: "2-4 sentence professional summary tailored to the JD." },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  role: { type: "string" },
                  period: { type: "string" },
                  bullets: { type: "array", items: { type: "string" }, description: "3-5 rewritten bullets weaving in JD keywords naturally." },
                },
                required: ["company", "role", "period", "bullets"],
                additionalProperties: false,
              },
            },
            skills: { type: "array", items: { type: "string" } },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  school: { type: "string" },
                  degree: { type: "string" },
                  period: { type: "string" },
                },
                required: ["school", "degree", "period"],
                additionalProperties: false,
              },
            },
          },
          required: ["name", "headline", "contact", "summary", "experience", "skills", "education"],
          additionalProperties: false,
        },
      },
      required: ["ats_score", "keywords", "rewritten"],
      additionalProperties: false,
    },
  },
};

export const forgeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway not configured");

    // Enforce free plan: 1 resume cap
    const { data: profile } = await supabase.from("profiles").select("plan, resumes_used").eq("id", userId).maybeSingle();
    if (profile && profile.plan === "free" && (profile.resumes_used ?? 0) >= 1) {
      throw new Error("Free plan limit reached. Upgrade to Pro for unlimited forges.");
    }

    const system = `You are CareerForge, an elite resume strategist. You receive a candidate's raw resume and a target job description.
Your job:
1. Semantically extract the top 10-15 ATS keywords from the JD, ranked 1-10 by importance (skills, tools, methodologies, soft skills).
2. Rewrite the candidate's resume to naturally incorporate as many of those keywords as possible without lying or inventing experience. Preserve facts (companies, dates, titles, schools). Strengthen bullet points with action verbs and quantified outcomes.
3. Compute an honest ATS match score 0-100 reflecting keyword coverage and quality.
4. Mark each keyword 'matched: true' only if it appears in your rewritten resume.
Always call the emit_forge function. Never write prose outside the tool call.`;

    const user = `JOB DESCRIPTION:\n${data.jdText}\n\n---\n\nCANDIDATE RESUME:\n${data.resumeText}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "emit_forge" } },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error("AI service error. Please try again.");
    }

    const json = await res.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("Malformed AI response");
    let parsed: Omit<ForgeResult, "id">;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new Error("Failed to parse AI output");
    }

    const title = data.title?.trim() || `${parsed.rewritten.headline || "Forged Resume"} — ${new Date().toLocaleDateString()}`;

    const { data: inserted, error: insertErr } = await supabase
      .from("resumes")
      .insert({
        user_id: userId,
        title,
        jd_text: data.jdText,
        original_text: data.resumeText,
        rewritten: parsed.rewritten as never,
        keywords: parsed.keywords as never,
        ats_score: parsed.ats_score,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) throw new Error(insertErr?.message ?? "Failed to save resume");

    // Increment usage
    await supabase.from("profiles").update({ resumes_used: (profile?.resumes_used ?? 0) + 1 }).eq("id", userId);

    return { id: inserted.id, ...parsed } satisfies ForgeResult;
  });
