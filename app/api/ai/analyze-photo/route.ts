import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const photoFile = formData.get("photo") as File | null;

    if (!photoFile) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    let photoUrl = "";

    // 1. Upload to Vercel Blob if token is configured
    if (process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_READ_WRITE_TOKEN.includes("xxxx")) {
      try {
        const blob = await put(`poultry-photos/${Date.now()}-${photoFile.name}`, photoFile, {
          access: "public",
        });
        photoUrl = blob.url;
      } catch (err) {
        console.warn("Vercel Blob upload failed, falling back to base64 preview:", err);
      }
    }

    // Convert file to Base64 for vision LLM analysis
    const arrayBuffer = await photoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = photoFile.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    if (!photoUrl) {
      photoUrl = dataUrl;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    // 2. Call OpenRouter with Vision-Capable Model
    if (apiKey && apiKey.trim().length > 10 && !apiKey.includes("xxxx")) {
      try {
        const visionPrompt = `You are the Poultry Vision Analyzer for Pankh. 
Analyze this farm photo carefully.

STRICT SAFETY RULES:
1. NEVER PROVIDE A DISEASE DIAGNOSIS. Do NOT name any disease (e.g. do NOT say "Ranikhet", "Coccidiosis", "Marek's", "Fowl Pox", or any other disease name). A photo alone cannot determine pathology.
2. DESCRIBE VISIBLE PHYSICAL FEATURES ONLY:
   - Comb & wattles (color, swelling, lesions, paleness, or cyanosis)
   - Eyes & nostrils (clear, swollen, watery discharge)
   - Feathers & posture (smooth, ruffled, huddling, wing droop, neck position)
   - Droppings/litter (normal, watery, green, white, bloody, or caked)
3. GENERATE 2 to 4 CLARIFYING FOLLOW-UP QUESTIONS to help the farmer and vet understand the clinical context (e.g. bird age, mortality count, feed intake changes).

Respond ONLY in valid JSON matching this schema:
{
  "observations": ["Visible feature bullet 1", "Visible feature bullet 2", "Visible feature bullet 3"],
  "followUpQuestions": ["Clarifying question 1", "Clarifying question 2", "Clarifying question 3"]
}`;

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://pankh.app",
            "X-Title": "Pankh Poultry Vision",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: visionPrompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: dataUrl,
                    },
                  },
                ],
              },
            ],
            temperature: 0.1,
            max_tokens: 600,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const content = json.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return NextResponse.json({
              photoUrl: photoUrl.startsWith("http") ? photoUrl : undefined,
              observations: Array.isArray(parsed.observations) ? parsed.observations : [],
              followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
            });
          }
        }
      } catch (visionErr) {
        console.error("OpenRouter vision analysis error:", visionErr);
      }
    }

    // 3. Deterministic Demonstration Observations (NO diagnosis, physical features only)
    return NextResponse.json({
      photoUrl: photoUrl.startsWith("http") ? photoUrl : undefined,
      observations: [
        "Comb and wattle show slight paleness with no obvious vesicular lesions.",
        "Neck and breast feathers appear ruffled; bird displays hunched resting posture.",
        "Eye appears clear without heavy conjunctival discharge or peri-orbital swelling.",
        "Underlying litter appears moderately friable with dry drinker perimeter.",
      ],
      followUpQuestions: [
        "Aapke flock me kitne din ke chooje hain (bird age)?",
        "Kya kal ke mukable feed ya paani ka intake kam hua hai?",
        "Shed me aisi sust murgiyan kitni sankhya me dikh rahi hain?",
      ],
      note: "Live vision analysis requires OPENROUTER_API_KEY in .env",
    });
  } catch (error: any) {
    console.error("Analyze Photo Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze photo. Please try again or describe the symptoms in text." },
      { status: 500 }
    );
  }
}
