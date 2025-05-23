"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
//test
import { db } from "@/firebase/admin";
import { feedbackSchema, responseSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
         You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
         Transcript:
         ${formattedTranscript}

         Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
         - **Communication Skills**: Clarity, articulation, structured responses.
         - **Technical Knowledge**: Understanding of key concepts for the role.
         - **Problem-Solving**: Ability to analyze problems and propose solutions.
         - **Cultural & Role Fit**: Alignment with company values and job role.
         - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
         `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}
console.log("outside createResponse first");
export async function createResponse(params: CreateResponseParams) {
  const { transcript, response } = params;
  console.log("inside createResponse first");
  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");
    console.log("formattedTranscript:", formattedTranscript);
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: responseSchema,
      prompt: `
        You are an AI assistant for the Saudi Exports Authority’s participation in the Baghdad International Fair.
        Your job is to generate a clear and relevant response to the selected topic based on the transcript and user interest.

        Selected Topic: ${response}

        Transcript:
        ${formattedTranscript}

        Please provide a complete and formal response to the selected topic.
      `,
      system:
        "You are a professional assistant generating informative and polite responses based on a selected topic.",
    });

    const responseData = {
      finalResponse: object.finalResponse,
      topic: response,
      createdAt: new Date().toISOString(),
    };

    const responseRef = db.collection("responses").doc();
    await responseRef.set(responseData);

    return { success: true, response: object.finalResponse };
  } catch (error) {
    console.error("Error generating response:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
