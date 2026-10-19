
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing-api-key",
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body.message !== "string" ||
      !body.message.trim()
    ) {
      return NextResponse.json(
        { error: "Please enter a valid message." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "missing-api-key") {
      return NextResponse.json(
        {
          error:
            "OpenAI API key is missing. Add OPENAI_API_KEY in Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "You are Chahat, a helpful personal AI assistant. Reply naturally and clearly. Use Hindi or Hinglish when the user does. Be friendly, practical, and concise.",
      input: body.message.trim(),
    });

    const reply = response.output_text?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "Chahat received no response. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Chahat API error:", error);

    if (error instanceof OpenAI.APIError) {
      const status =
        error.status === 401
          ? 401
          : error.status === 429
            ? 429
            : 502;

      const message =
        error.status === 401
          ? "OpenAI API key is invalid. Check your Vercel environment variable."
          : error.status === 429
            ? "OpenAI API quota or rate limit reached. Check your API billing and limits."
            : "OpenAI service error. Please try again later.";

      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(
      { error: "Chahat could not process your request. Check Vercel Function Logs." },
      { status: 500 }
    );
  }
}
