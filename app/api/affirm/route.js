import { NextResponse } from "next/server";

const sampleAffirmations = [
  "I am capable, confident, and resilient.",
  "Each day I move closer to my goals with clarity and purpose.",
  "Success flows to me because I take consistent inspired action.",
  "I radiate positive energy and attract great opportunities.",
  "My mind is focused, calm, and powerful."
];

export async function POST(req) {
  try {
    let { prompt } = await req.json();

    // 🧹 Clean up any unwanted instruction text if it sneaks in
    if (prompt) {
      prompt = prompt.replace(/Return them each on a separate line.?:?/gi, "").trim();
    }

    const randomSet = Array.from({ length: 3 }, () =>
      sampleAffirmations[Math.floor(Math.random() * sampleAffirmations.length)]
    );

    return NextResponse.json({
      affirmations: [
        `✨ Here are some affirmations for *${prompt || "you"}*:`,
        "",
        ...randomSet,
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
