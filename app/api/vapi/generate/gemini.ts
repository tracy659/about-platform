import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { response } = await request.json();

  try {
    const { text: responses } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare responses for Saudi Export Development Authority platform.
        The response is ${response}
        Please return only the response, without any additional text.
        The response are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        
        
        Thank you! <3
    `,
    });

    const About = {
      responses: JSON.parse(responses),
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("responses").add(About);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
// test tracy branch
