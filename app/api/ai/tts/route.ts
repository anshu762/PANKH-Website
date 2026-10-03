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

    // Determine optimal voice target
    const isGurmukhi = /[\u0A00-\u0A7F]/.test(text);
    const isHindi = /[\u0900-\u097F]/.test(text);
    const targetLang = isGurmukhi ? "pa-IN" : isHindi ? "hi-IN" : "en-IN";
    const voiceName = isGurmukhi ? "pa-IN-Wavenet-A" : isHindi ? "hi-IN-Neural2-A" : "en-IN-Neural2-A";

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
                languageCode: targetLang,
                name: voiceName,
              },
              audioConfig: {
                audioEncoding: "MP3",
                speakingRate: 1.0,
                pitch: 0.0,
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

    // 2. Return signal to use browser speech synthesis API with detected optimal language
    return NextResponse.json({
      fallbackToBrowser: true,
      textToSpeak: text,
      suggestedLang: targetLang,
    });
  } catch (error: any) {
    console.error("TTS Route Error:", error);
    return NextResponse.json(
      { error: "Text-to-speech synthesis failed." },
      { status: 500 }
    );
  }
}
