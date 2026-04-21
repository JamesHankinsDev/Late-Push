import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MessageFlag } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Layer 2 DM classifier. Synchronous with message send — latency budget
 * ~300–700ms. If the API key is missing or the call errors, we fail OPEN
 * (treat as safe) rather than holding up the user. Layer 1 regex already
 * caught the hard stuff; this is for nuance.
 */
const SYSTEM_PROMPT = `
You classify DMs between skaters on Late Push — an anonymous,
alias-only skateboarding app. Users are told to keep contact details
private. Meeting at public spots to skate is the core use case.

Classify the message into EXACTLY ONE of these categories:

  safe            Normal coordination / encouragement / skate talk.
  pii_ask         Asking another user for real name, age, school,
                  employer, home address, or other private info.
  platform_move   Trying to move the conversation off Late Push
                  (Instagram, Snapchat, WhatsApp, Telegram, Discord,
                  phone number, SMS, etc.).
  pressure        Guilt, flattery, or persistence pushing the other
                  person to share personal info or meet privately
                  outside coordinated meetups.
  harassment      Threats, targeted abuse, intimidation.
  hate_speech     Slurs or identity-based attacks.
  explicit        Sexual content or sexual pressure.

Messages planning a meetup at a public skate spot are ALWAYS safe,
even when they include street names or neighborhood references
(e.g. "meet at the tennis courts in Medford at 3pm"). Don't flag
those. Flag when a user shares THEIR private info, asks for another
person's private info, or pushes for contact outside the app.

Return ONLY the category name, lowercase, nothing else.
`.trim();

type ClassifyRequest = {
  text: string;
  // Optional context — not used in the prompt today but would help
  // nuance later (trust level, recipient alias).
  trust?: string;
};

export async function POST(req: NextRequest) {
  let payload: ClassifyRequest;
  try {
    payload = (await req.json()) as ClassifyRequest;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const text = (payload?.text ?? "").toString().trim();
  if (!text) {
    return NextResponse.json({ flag: "safe" satisfies MessageFlag });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Fail-open: without the API key, Layer 1 is the only gate.
    return NextResponse.json({ flag: "safe" satisfies MessageFlag });
  }

  try {
    const result = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 20,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
    });

    const raw = result.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("")
      .trim()
      .toLowerCase();

    const flag = normalizeFlag(raw);
    return NextResponse.json({ flag });
  } catch (err) {
    console.error("moderation classify failed:", err);
    // Fail open — don't block users because the classifier is down.
    return NextResponse.json({ flag: "safe" satisfies MessageFlag });
  }
}

function normalizeFlag(raw: string): MessageFlag {
  const allowed: MessageFlag[] = [
    "safe",
    "pii_ask",
    "platform_move",
    "pressure",
    "harassment",
    "hate_speech",
    "explicit",
  ];
  // The model often responds with a period or quotes; strip to a bare word.
  const cleaned = raw.replace(/[^a-z_]/g, "");
  return (allowed.find((a) => a === cleaned) ?? "safe") as MessageFlag;
}
