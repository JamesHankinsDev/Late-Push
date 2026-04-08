import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildCoachPrompt, buildMonthlySummaryPrompt } from "@/lib/prompts/skateCoach";
import { Session, UserProfile } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, session, profile, sessions } = body as {
      type: "session" | "monthly";
      session?: Session;
      profile: UserProfile;
      sessions: Session[];
    };

    let prompt: string;

    if (type === "monthly") {
      prompt = buildMonthlySummaryPrompt(profile, sessions);
    } else if (type === "session" && session) {
      prompt = buildCoachPrompt(session, profile, sessions);
    } else {
      return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { error: "Failed to generate coaching response" },
      { status: 500 }
    );
  }
}
