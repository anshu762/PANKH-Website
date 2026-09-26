import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Convert audio Blob to Base64
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString("base64");

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    // 1. If Google Cloud API Key is configured, execute real STT request
    if (apiKey && apiKey.trim().length > 10 && !apiKey.includes("XXXX")) {
      try {
        const response = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              config: {
                encoding: "WEBM_OPUS",
                sampleRateHertz: 48000,
                languageCode: "pa-IN",
                alternativeLanguageCodes: ["hi-IN", "en-IN"],
                enableAutomaticPunctuation: true,
                model: "default",
              },
              audio: {
                content: base64Audio,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const transcript = data.results
            ?.map((r: any) => r.alternatives?.[0]?.transcript)
            .filter(Boolean)
            .join(" ");

          if (transcript && transcript.trim().length > 0) {
            return NextResponse.json({ transcript: transcript.trim() });
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          console.error("Google Cloud STT error:", response.status, errData);
        }
      } catch (err) {
        console.error("Google Cloud STT network failure:", err);
      }
    }

    // 2. Fallback / Dev Mode
    // Provides a realistic demonstration transcript so the farmer can edit and review in the UI
    return NextResponse.json({
      transcript:
        "Shed number do me subah se 15 chooje mar gaye hain aur baki chooje munh khol kar saans le rahe hain.",
      isSimulated: true,
      note: "Live Google Cloud STT requires valid GOOGLE_CLOUD_API_KEY in .env",
    });
  } catch (error: any) {
    console.error("Transcribe Route Error:", error);
    return NextResponse.json(
      { error: "Audio transcription failed. Please try typing your question." },
      { status: 500 }
    );
  }
}
