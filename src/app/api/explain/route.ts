import { NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "You are Heuristic an AI that explains complex topics simply at the user level in their language. Use simple words real life examples short sentences no jargon. Explain like a smart friend not a textbook.";

type ExplainRequestBody = {
  text?: string;
  language?: string;
  level?: string;
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!rawBody.trim()) {
      return NextResponse.json(
        { error: "Request body cannot be empty." },
        { status: 400 }
      );
    }

    let body: ExplainRequestBody;
    try {
      body = JSON.parse(rawBody) as ExplainRequestBody;
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const text = body.text?.trim();
    const language = body.language?.trim();
    const level = body.level?.trim();

    if (!text || !language || !level) {
      return NextResponse.json(
        { error: "Text, language, and level are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Text: ${text}\nLanguage: ${language}\nLevel: ${level}`
          }
        ],
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      return NextResponse.json(
        { error: `Groq API error: ${errorPayload}` },
        { status: response.status }
      );
    }

    const rawGroqResponse = await response.text();
    if (!rawGroqResponse.trim()) {
      return NextResponse.json(
        { error: "Groq API returned an empty response." },
        { status: 502 }
      );
    }

    let data: { choices?: Array<{ message?: { content?: string } }> };
    try {
      data = JSON.parse(rawGroqResponse) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
    } catch {
      return NextResponse.json(
        { error: "Groq API returned invalid JSON." },
        { status: 502 }
      );
    }

    const explanation = data.choices?.[0]?.message?.content?.trim();
    if (!explanation) {
      return NextResponse.json(
        { error: "No explanation returned by Groq." },
        { status: 502 }
      );
    }

    return NextResponse.json({ explanation });
  } catch {
    return NextResponse.json(
      { error: "Invalid request or unexpected server error." },
      { status: 500 }
    );
  }
}
