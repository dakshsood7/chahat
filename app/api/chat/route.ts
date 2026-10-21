
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 8000;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is missing. Add it in Vercel Environment Variables."
        },
        { status: 500 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request." },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      !("messages" in body) ||
      !Array.isArray(body.messages)
    ) {
      return NextResponse.json(
        { error: "Send a messages array." },
        { status: 400 }
      );
    }

    const rawMessages = body.messages as unknown[];

    if (
      rawMessages.length === 0 ||
      rawMessages.length > MAX_MESSAGES
    ) {
      return NextResponse.json(
        {
          error: `Send between 1 and ${MAX_MESSAGES} messages.`
        },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = [];

    for (const item of rawMessages) {
      if (!item || typeof item !== "object") {
        return NextResponse.json(
          { error: "Invalid message format." },
          { status: 400 }
        );
      }

      const candidate = item as Record<string, unknown>;

      if (
        (candidate.role !== "user" &&
          candidate.role !== "assistant") ||
        typeof candidate.content !== "string" ||
        !candidate.content.trim() ||
        candidate.content.length > MAX_MESSAGE_LENGTH
      ) {
        return NextResponse.json(
          { error: "A message has an invalid role or content." },
          { status: 400 }
        );
      }

      messages.push({
        role: candidate.role,
        content: candidate.content.trim()
      });
    }

    if (messages[messages.length - 1].role !== "user") {
      return NextResponse.json(
        { error: "The latest message must be from the user." },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions:
        "You are Chahat, a capable personal AI assistant. " +
        "Be helpful, honest, practical, and clear. " +
        "Reply in Hindi or Hinglish when the user uses it. " +
        "Use conversation context provided in the input. " +
        "Never claim to have performed actions you have not performed. " +
        "If you do not know something, say so.",
      input: messages.map((message) => ({
        role: message.role,
        content: message.content
      })),
      max_output_tokens: 1200
    });

    const reply = response.output_text?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "Chahat returned an empty reply. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Chahat API error:", error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Check OPENAI_API_KEY." },
          { status: 401 }
        );
      }

      if (error.status === 429) {
        return NextResponse.json(
          {
            error:
              "OpenAI rate limit or API quota reached. Check your API usage and billing."
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Chahat could not process the request. Check the Vercel Function Logs."
      },
      { status: 500 }
    );
  }
}
