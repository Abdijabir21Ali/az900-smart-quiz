import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";

const SYSTEM_PROMPT = `You are an AZ-900 study assistant. After a user answers a question incorrectly, you receive: the question, the correct option, the user's chosen option, the standard explanation, and the wrong-answer explanation.
Your task: in no more than 3 sentences, explain why the user's choice is wrong, using the wrong-answer explanation provided. Tone: peer-to-peer, like a classmate helping a classmate. No formal language.
Never invent Azure service names or features. Do not add information that is not in the provided explanations.
If the user asks a follow-up, answer only from the provided explanations. If it falls outside that scope, say: "Check the official Microsoft Learn docs for this point."
Never use the word 'actually' or open with 'Great question.'`;

interface RequestBody {
  apiKey: string;
  question: string;
  correctOption: string;
  chosenOption: string;
  standardExplanation: string;
  wrongExplanation: string;
  userQuestion: string;
}

interface InteractionStep {
  type?: string;
  content?: Array<{ type?: string; text?: string }>;
}

interface InteractionResponse {
  steps?: InteractionStep[];
  error?: { message?: string };
}

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error) {
    return (
      err.name === "AbortError" ||
      err.message.includes("aborted") ||
      err.message.includes("signal")
    );
  }
  return false;
}

function extractText(data: InteractionResponse): string | null {
  const steps = data?.steps;
  if (!steps || !Array.isArray(steps)) return null;

  for (const step of steps) {
    if (step.type === "model_output" && step.content) {
      for (const part of step.content) {
        if (part.type === "text" && part.text) {
          return part.text;
        }
      }
    }
  }
  return null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: RequestBody = await req.json();

    if (!body.apiKey || !body.userQuestion) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (apiKey, userQuestion)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const input = `Question: ${body.question}
Correct answer: ${body.correctOption}
Student's chosen answer: ${body.chosenOption}
Standard explanation: ${body.standardExplanation}
Why other answers are wrong: ${body.wrongExplanation}

The student's follow-up question: "${body.userQuestion}"`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let geminiRes: Response;
    try {
      geminiRes = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": body.apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: GEMINI_MODEL,
          input,
          system_instruction: SYSTEM_PROMPT,
          generation_config: { thinking_level: "low" },
          store: false,
        }),
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (isAbortError(fetchErr)) {
        return new Response(
          JSON.stringify({ error: "Gemini took too long to respond. Please try again." }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw fetchErr;
    }
    clearTimeout(timeoutId);

    const data: InteractionResponse = await geminiRes.json();

    if (!geminiRes.ok) {
      const msg = data?.error?.message || `Gemini API error (HTTP ${geminiRes.status}).`;
      return new Response(
        JSON.stringify({ error: msg }),
        {
          status: geminiRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const text = extractText(data);
    if (!text) {
      return new Response(
        JSON.stringify({ error: "Gemini returned an empty response. Try rephrasing your question." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ reply: text.trim() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
