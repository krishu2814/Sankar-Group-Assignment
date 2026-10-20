import { NextResponse } from "next/server";
import { CLOUDPULSE_PRODUCT } from "@/lib/saasProduct";
import { Message } from "@/types";

export const dynamic = "force-dynamic";

function getRuleBasedFallback(userText: string): string {
  const lower = userText.toLowerCase();

  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much") || lower.includes("plan")) {
    return "Our plans start at just $49 a month for up to 10 servers, with flat pricing and zero surprise fees. Would you like me to send you the full pricing breakdown?";
  }
  if (lower.includes("datadog") || lower.includes("cloudwatch") || lower.includes("new relic") || lower.includes("competitor")) {
    return "Most of our customers actually used Datadog previously! CloudPulse runs alongside your current setup in 5 minutes and uses AI to pinpoint the exact root cause, cutting resolution time by 60%. Would you be open to seeing a quick 5-minute side-by-side demo?";
  }
  if (lower.includes("security") || lower.includes("privacy") || lower.includes("compliance") || lower.includes("soc")) {
    return "Security is our top priority. We are SOC-2 Type II certified and only collect operational telemetry, never inspecting application payloads or customer data. Does that meet your compliance requirements?";
  }
  if (lower.includes("demo") || lower.includes("trial") || lower.includes("try") || lower.includes("free")) {
    return "That sounds fantastic! We offer a 14-day fully featured free pilot with zero credit card required, plus a 15-minute walkthrough. What day this week works best for your team?";
  }
  if (lower.includes("not interested") || lower.includes("busy") || lower.includes("no thanks") || lower.includes("don't need")) {
    return "I completely understand and appreciate your honesty. If unexpected downtime ever becomes a headache in the future, please feel free to check out CloudPulse AI. Wishing you a great day!";
  }
  if (lower.includes("yes") || lower.includes("sure") || lower.includes("tell me more") || lower.includes("okay")) {
    return "Wonderful! CloudPulse deploys in under 5 minutes with a lightweight eBPF agent and begins auto-detecting anomalies right away. How many cloud servers or Kubernetes clusters is your team running?";
  }
  if (lower.includes("aws") || lower.includes("gcp") || lower.includes("azure") || lower.includes("kubernetes") || lower.includes("k8s")) {
    return "We have native one-click integrations for AWS, GCP, and Kubernetes! When a pod or node spikes in latency, our AI pinpoints the exact line of code or database query responsible. Would you like to test that on a staging cluster?";
  }

  return "Thanks for sharing that! Our goal with CloudPulse AI is to take the stress out of on-call alerts so your engineering team doesn't spend hours diagnosing outages. Would you be open to a quick 15-minute live demo this Thursday?";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: Message[] = body.messages || [];

    const lastUserMessage = [...messages].reverse().find((m) => m.sender === "user")?.text || "";

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful offline rule-based fallback
      const fallbackReply = getRuleBasedFallback(lastUserMessage);
      return NextResponse.json({ text: fallbackReply, source: "fallback" });
    }

    const systemPrompt = `You are Alex, an expert B2B SaaS Sales Representative for ${CLOUDPULSE_PRODUCT.name}.
Product Tagline: ${CLOUDPULSE_PRODUCT.tagline}
Product Overview: ${CLOUDPULSE_PRODUCT.overview}
Starter Plan: ${CLOUDPULSE_PRODUCT.pricing.starter}
Growth Plan: ${CLOUDPULSE_PRODUCT.pricing.growth}
Key Features: ${CLOUDPULSE_PRODUCT.keyFeatures.join("; ")}
Sales Goal: ${CLOUDPULSE_PRODUCT.salesGoal}

VOICE CALL RULES (MANDATORY):
1. Keep your reply between 1 and 3 sentences maximum. This is a voice call — long monologues lose prospects.
2. Be conversational, warm, and confident.
3. NEVER use markdown symbols (no asterisks, bolding, bullet points, hashes).
4. Address the customer's specific question or objection directly, highlight a key benefit, and end with a natural qualifying question.
5. If the prospect agrees to a demo or trial, acknowledge enthusiastically and confirm next steps.`;

    const conversationHistory = messages.map((m) => ({
      role: m.sender === "bot" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    // If conversation history doesn't start with user, adjust for Gemini API requirements
    const contents = [
      {
        role: "user",
        parts: [{ text: `System Instruction:\n${systemPrompt}\n\nStart the conversation.` }],
      },
      ...conversationHistory,
    ];

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.7,
        },
      }),
    });

    if (!geminiRes.ok) {
      console.warn("Gemini API call failed with status:", geminiRes.status);
      const fallbackReply = getRuleBasedFallback(lastUserMessage);
      return NextResponse.json({ text: fallbackReply, source: "fallback" });
    }

    const data = await geminiRes.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!candidateText) {
      const fallbackReply = getRuleBasedFallback(lastUserMessage);
      return NextResponse.json({ text: fallbackReply, source: "fallback" });
    }

    // Clean any accidental markdown symbols from AI output
    const cleanText = candidateText.replace(/[*_#`~[\]]/g, "").trim();

    return NextResponse.json({ text: cleanText, source: "gemini" });
  } catch (error: any) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { text: "I appreciate your insight. Could you tell me a bit more about how your team currently monitors your cloud stack?", source: "fallback-error" },
      { status: 200 }
    );
  }
}
