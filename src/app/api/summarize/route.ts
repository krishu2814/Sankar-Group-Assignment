import { NextResponse } from "next/server";
import { Message, AISummary, SalesStatus } from "@/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: SalesStatus[] = [
  "Converted",
  "Interested",
  "Follow-up Required",
  "Not Interested",
  "Demo Requested",
  "No Response",
];

function fallbackAnalyze(transcripts: Message[]): AISummary {
  const userMessages = transcripts.filter((m) => m.sender === "user");

  if (userMessages.length === 0) {
    return {
      overview: "Call initiated but prospect did not provide audible responses.",
      customerRequirements: ["No explicit requirements gathered"],
      objections: ["Customer did not engage"],
      nextSteps: "Attempt follow-up call at a later scheduled time.",
      salesStatus: "No Response",
    };
  }

  const combinedUserText = userMessages.map((m) => m.text).join(" ").toLowerCase();

  let salesStatus: SalesStatus = "Interested";
  let nextSteps = "Follow up with standard product overview and schedule technical discovery.";
  const customerRequirements: string[] = [];
  const objections: string[] = [];

  // Detect requirements
  if (combinedUserText.includes("slack") || combinedUserText.includes("alert")) {
    customerRequirements.push("Real-time Slack / alerting integration");
  }
  if (combinedUserText.includes("aws") || combinedUserText.includes("k8s") || combinedUserText.includes("kubernetes")) {
    customerRequirements.push("AWS and Kubernetes cluster monitoring");
  }
  if (combinedUserText.includes("fast") || combinedUserText.includes("minute") || combinedUserText.includes("latency")) {
    customerRequirements.push("Sub-minute anomaly alert latency");
  }
  if (customerRequirements.length === 0) {
    customerRequirements.push("Automated cloud infrastructure monitoring and root cause analysis");
  }

  // Detect objections
  if (combinedUserText.includes("datadog") || combinedUserText.includes("cloudwatch") || combinedUserText.includes("already")) {
    objections.push("Currently utilizing competing monitoring tool (Datadog/CloudWatch)");
  }
  if (combinedUserText.includes("expensive") || combinedUserText.includes("budget") || combinedUserText.includes("cost")) {
    objections.push("Budget constraints and pricing sensitivity");
  }
  if (combinedUserText.includes("team") || combinedUserText.includes("boss") || combinedUserText.includes("discuss")) {
    objections.push("Requires internal team review before making a commitment");
  }
  if (objections.length === 0) {
    objections.push("None explicitly stated during initial call");
  }

  // Classify Status
  if (
    combinedUserText.includes("not interested") ||
    combinedUserText.includes("don't want") ||
    combinedUserText.includes("stop calling") ||
    combinedUserText.includes("no thanks")
  ) {
    salesStatus = "Not Interested";
    nextSteps = "Archive lead and mark as not interested in current quarter.";
  } else if (
    combinedUserText.includes("demo") ||
    combinedUserText.includes("show me") ||
    combinedUserText.includes("walkthrough") ||
    combinedUserText.includes("schedule") ||
    combinedUserText.includes("thursday") ||
    combinedUserText.includes("friday")
  ) {
    salesStatus = "Demo Requested";
    nextSteps = "Send calendar invitation for a 15-minute personalized live product walkthrough.";
  } else if (
    combinedUserText.includes("buy") ||
    combinedUserText.includes("sign up") ||
    combinedUserText.includes("starter plan") ||
    combinedUserText.includes("credit card")
  ) {
    salesStatus = "Converted";
    nextSteps = "Send onboarding link, generate tenant workspace, and assign customer success rep.";
  } else if (
    combinedUserText.includes("team") ||
    combinedUserText.includes("later") ||
    combinedUserText.includes("send email") ||
    combinedUserText.includes("think about it")
  ) {
    salesStatus = "Follow-up Required";
    nextSteps = "Email 1-page architecture PDF and check back in 3 business days.";
  }

  return {
    overview: `Prospect participated in a sales call discussing CloudPulse AI capabilities, monitoring workflows, and operational requirements.`,
    customerRequirements,
    objections,
    nextSteps,
    salesStatus,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transcripts: Message[] = body.transcripts || [];

    const userMessages = transcripts.filter((m) => m.sender === "user");

    if (userMessages.length === 0) {
      return NextResponse.json(fallbackAnalyze(transcripts));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(fallbackAnalyze(transcripts));
    }

    const conversationTranscript = transcripts
      .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
      .join("\n");

    const prompt = `You are a Senior B2B SaaS Sales Operations Analyst. Analyze this sales call transcript between our AI sales bot (ALEX) and a prospective customer.

TRANSCRIPT:
${conversationTranscript}

Provide a structured JSON response with EXACTLY the following keys:
{
  "overview": "A concise 2-sentence summary of what transpired during the call.",
  "customerRequirements": ["Requirement 1", "Requirement 2"],
  "objections": ["Objection 1", "Objection 2"],
  "nextSteps": "Recommended actionable next steps for the account executive.",
  "salesStatus": "ONE OF THE EXACT 6 STATUS VALUES BELOW"
}

ALLOWED VALUES FOR "salesStatus" (MUST BE EXACT MATCH):
1. "Converted" (agreed to purchase, buy, or start paid onboarding)
2. "Interested" (positive sentiment, asked good questions, likes product)
3. "Follow-up Required" (needs to talk to boss/team, requested info to review later)
4. "Not Interested" (explicitly declined, no fit, or asked to be removed)
5. "Demo Requested" (agreed to or requested a live demo/trial walkthrough)
6. "No Response" (customer was silent or didn't answer)

Respond with ONLY valid JSON, no markdown formatting or backticks.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!geminiRes.ok) {
      console.warn("Gemini summarizer failed, falling back to rule engine");
      return NextResponse.json(fallbackAnalyze(transcripts));
    }

    const data = await geminiRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const cleanedJsonText = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedJsonText);

    // Validate salesStatus
    const status: SalesStatus = VALID_STATUSES.includes(parsed.salesStatus)
      ? parsed.salesStatus
      : "Interested";

    const summary: AISummary = {
      overview: parsed.overview || "Sales call completed.",
      customerRequirements: Array.isArray(parsed.customerRequirements)
        ? parsed.customerRequirements
        : ["Cloud infrastructure monitoring"],
      objections: Array.isArray(parsed.objections) ? parsed.objections : ["None noted"],
      nextSteps: parsed.nextSteps || "Follow up with prospect.",
      salesStatus: status,
    };

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Summarize API route error:", error);
    const body = await req.json().catch(() => ({}));
    return NextResponse.json(fallbackAnalyze(body.transcripts || []));
  }
}
