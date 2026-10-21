
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing in Vercel." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const message = body.message;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    if (message.length > 4000) {
      return NextResponse.json(
        { error: "Message is too long. Keep it under 4000 characters." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: "You are Chahat AI, a helpful, friendly AI assistant. Reply clearly and naturally. When useful, respond in the user's language."
            }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: message.trim() }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 700
          }
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", response.status, data);

      return NextResponse.json(
        {
          error:
            response.status === 429
              ? "Gemini free-tier quota reached. Try again later."
              : response.status === 401 || response.status === 403
              ? "Gemini API key or project access problem."
              : "Gemini could not respond. Please try again."
        },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("");

    if (!reply) {
      return NextResponse.json(
        { error: "No response received from Gemini." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);

    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
