import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "Text is required for speech synthesis" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    // 1. If Google Cloud API Key is configured, execute real TTS request
    if (apiKey && apiKey.trim().length > 10 && !apiKey.includes("XXXX")) {
      try {
        const response = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              input: { text: text.slice(0, 1000) },
              voice: {
                languageCode: "pa-IN",
                name: "pa-IN-Wavenet-A",
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: 0.95,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.audioContent) {
            const audioBuffer = Buffer.from(data.audioContent, "base64");
            return new NextResponse(audioBuffer, {
              status: 200,
              headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.length.toString(),
                "Cache-Control": "public, max-age=86400",
              },
            });
          }
        }
      } catch (err) {
        console.error("Google Cloud TTS network failure:", err);
      }
    }

    // 2. Return signal to use browser speech synthesis API if external key is unconfigured
    return NextResponse.json({
      fallbackToBrowser: true,
      textToSpeak: text,
      suggestedLang: "pa-IN",
    });
  } catch (error: any) {
    console.error("TTS Route Error:", error);
    return NextResponse.json(
      { error: "Text-to-speech synthesis failed." },
      { status: 500 }
    );
  }
}
