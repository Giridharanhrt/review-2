import { GoogleGenerativeAI } from "@google/generative-ai";

interface ReviewGenerationInput {
  orgName: string;
  orgType: string;
  attenderName?: string;
  shopLocation?: string;

  customerName: string;
  customerPhone?: string;

  purchaseType: string;

  satisfactionLevel: number;
  keyHighlights?: string;
  improvementAreas?: string;
  recommendationLikelihood: number;

  events?: string;

  brandLoyalty?: string;
  emotionalConnection?: string;
}

interface ReviewGenerationResult {
  success: boolean;
  review?: string;
  error?: string;
}

function getReviewClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function generateReview(
  input: ReviewGenerationInput,
  options?: { improvementHint?: string }
): Promise<ReviewGenerationResult> {
  try {
    const genAI = getReviewClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = buildReviewPrompt(input, options?.improvementHint);
    const result = await model.generateContent(prompt);
    const review = (await result.response).text().trim();

    return { success: true, review };
  } catch (error) {
    console.error("Review Generation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate review",
    };
  }
}

function buildReviewPrompt(input: ReviewGenerationInput, improvementHint?: string): string {
  return `Generate a short, authentic Google review for a jewellery store. The review must feel like a REAL person typed it on their phone — casual, warm, human.

BUSINESS:
- Name: ${input.orgName}
- Type: ${input.orgType}
${input.attenderName ? `- Served by: ${input.attenderName}` : ""}
${input.shopLocation ? `- Location: ${input.shopLocation}` : ""}

CUSTOMER:
- Name: ${input.customerName}
- Bought: ${input.purchaseType}

EXPERIENCE:
- Satisfaction: ${input.satisfactionLevel}/10
- Would recommend: ${input.recommendationLikelihood}/10
${input.events ? `- Occasion: ${input.events}` : ""}
${input.keyHighlights ? `- Highlights: ${input.keyHighlights}` : ""}
${input.improvementAreas ? `- Could improve: ${input.improvementAreas}` : ""}

${input.brandLoyalty ? `- Loyalty: ${input.brandLoyalty}` : ""}
${input.emotionalConnection ? `- Emotional connection: ${input.emotionalConnection}` : ""}

STRICT RULES:
1. Write EXACTLY 4 short sentences. No more, no less.
2. First person as ${input.customerName}. Sound like a real human, not a copywriter.
3. Mention ${input.orgName} by name naturally.
4. Keep it warm but not over-the-top. No corporate language.
5. Do NOT use any markdown, bullet points, stars, or formatting.
6. Do NOT use quotation marks around the review.
7. Do NOT add a greeting or sign-off.
8. Write it like someone typing a quick Google review on their phone — natural, genuine, slightly imperfect.
${improvementHint ? `\nIMPORTANT ADJUSTMENT: "${improvementHint}"\n` : ""}
Generate the review now (plain text, 4 sentences only):`;
}

export function checkApiStatus(): {
  configured: boolean;
  message: string;
  instructions?: string[];
} {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return {
      configured: false,
      message: "API not configured",
      instructions: [
        "1. Get API key from https://makersuite.google.com/app/apikey",
        "2. Add GOOGLE_API_KEY=your_key to .env file",
      ],
    };
  }
  return { configured: true, message: "API is configured" };
}

const reviewService = { generateReview, checkApiStatus };
export default reviewService;
