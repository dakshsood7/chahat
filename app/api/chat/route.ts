import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured yet." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "You are Chahat, a helpful personal AI assistant. Reply clearly and naturally. Use Hindi or Hinglish when the user does.",
      input: message.trim(),
    });

    return NextResponse.json({
      reply: response.output_text || "I couldn't generate a response.",
    });
  } catch (error) {
    console.error("Chahat API error:", error);

    return NextResponse.json(
      { error: "Chahat couldn't process that message." },
      { status: 500 }
    );
  }
}