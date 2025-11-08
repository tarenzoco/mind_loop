import { NextResponse } from "next/server";

// 🔹 Preset affirmations as fallback
const sampleAffirmations = [
  "I am capable, confident, and resilient.",
  "Each day I move closer to my goals with clarity and purpose.",
  "Success flows to me because I take consistent inspired action.",
  "I radiate positive energy and attract great opportunities.",
  "My mind is focused, calm, and powerful.",
  "I have everything I need within me to succeed.",
  "I choose progress over perfection every day.",
  "My focus and consistency create unstoppable results."
];

// 🔒 Words to block or sanitize (for user safety)
const bannedWords = ["kill", "suicide", "die", "hate", "hurt", "murder", "harm", "weapon", "blood"];

export async function POST(req) {
  try {
    let { prompt, count } = await req.json();

    // ✅ Sanitize prompt
    if (prompt) {
      prompt = prompt.replace(/Return them each on a separate line.?:?/gi, "").trim();
      const lower = prompt.toLowerCase();
      if (bannedWords.some(word => lower.includes(word))) {
        return NextResponse.json({
          affirmations: [
            "⚠️ Let's keep this positive.",
            "If you're feeling low, please reach out to someone who cares about you.",
            "You matter — take a breath, and know that support is always available."
          ].join("\n")
        });
      }
    }

    // ✅ Determine how many affirmations to return (default 1)
    const num = count === 3 ? 3 : 1;

    // ✅ Random unique selection (no duplicates)
    const affirmations = [];
    const used = new Set();
    while (affirmations.length < num) {
      const pick = sampleAffirmations[Math.floor(Math.random() * sampleAffirmations.length)];
      if (!used.has(pick)) {
        affirmations.push(pick);
        used.add(pick);
      }
    }

    // ✅ Final response
    return NextResponse.json({
      affirmations: [
        `✨ Affirmations for *${prompt || "you"}*:`,
        "",
        ...affirmations
      ].join("\n")
    });
  } catch (error) {
    console.error("Affirmation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate affirmations." },
      { status: 500 }
    );
  }
}
