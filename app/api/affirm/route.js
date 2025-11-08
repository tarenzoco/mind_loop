import { NextResponse } from "next/server";

const sampleAffirmations = [
  "I am capable, confident, and resilient.",
  "Each day I move closer to my goals with clarity and purpose.",
  "Success flows to me because I take consistent inspired action.",
  "I radiate positive energy and attract great opportunities.",
  "My mind is focused, calm, and powerful.",
  "I attract success effortlessly and naturally.",
  "Discipline and consistency build my legacy."
];

export async function POST(req) {
  try {
    const { mode = "1x", prompt } = await req.json();

    // Set how many affirmations to generate
    const count = mode === "3x" ? 3 : 1;

    // Randomly select affirmations
    const randomSet = Array.from({ length: count }, () =>
      sampleAffirmations[Math.floor(Math.random() * sampleAffirmations.length)]
    );

    return NextResponse.json({
      affirmations: [
        `✨ Here are your ${count} affirmations${prompt ? ` for *${prompt}*` : ""}:`,
        "",
        ...randomSet
      ].join("\n")
    });
  } catch (error) {
    console.error("Affirmation Error:", error);
    return NextResponse.json({ error: "Failed to generate affirmations." }, { status: 500 });
  }
}
