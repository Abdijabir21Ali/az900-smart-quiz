export interface FollowUpContext {
  question: string;
  correctOption: string;
  chosenOption: string;
  standardExplanation: string;
  wrongExplanation: string;
  userQuestion: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const ENDPOINT = `${SUPABASE_URL}/functions/v1/gemini-followup`;

interface EdgeFunctionResponse {
  reply?: string;
  error?: string;
}

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  if (err instanceof Error) {
    return (
      err.name === 'AbortError' ||
      err.message.includes('aborted') ||
      err.message.includes('signal has been aborted')
    );
  }
  return false;
}

export async function askFollowUp(
  apiKey: string,
  ctx: FollowUpContext,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        apiKey,
        question: ctx.question,
        correctOption: ctx.correctOption,
        chosenOption: ctx.chosenOption,
        standardExplanation: ctx.standardExplanation,
        wrongExplanation: ctx.wrongExplanation,
        userQuestion: ctx.userQuestion,
      }),
    });

    const data: EdgeFunctionResponse = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || `Request failed (HTTP ${res.status}).`);
    }

    if (!data.reply) {
      throw new Error('No response received. Try rephrasing your question.');
    }

    return data.reply;
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error('The request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
