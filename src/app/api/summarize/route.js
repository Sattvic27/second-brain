import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        summary: "Missing GEMINI_API_KEY",
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize the following text in 2-3 clear sentences:\n\n${text}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("🔥 Gemini REST Response:", data);
    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Unable to summarize.";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("🔥 Gemini REST Error:", error);
    return NextResponse.json({
      summary: "Gemini REST API error.",
    });
  }
}
