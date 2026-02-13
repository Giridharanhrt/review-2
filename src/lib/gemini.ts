import { GoogleGenerativeAI } from "@google/generative-ai";

interface ReviewGenerationInput {
  orgName: string;
  orgType: string;
  attenderName?: string;
  shopLocation?: string;

  customerName: string;
  customerPhone?: string;
  customerFrom?: string;

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

function sentenceCount(text: string): number {
  const matches = text.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : 0;
}

function cleanReviewText(text: string): string {
  return text
    .replace(/[`*_#>-]/g, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreTone(satisfactionLevel: number, recommendationLikelihood: number): string {
  const combined = (satisfactionLevel + recommendationLikelihood) / 2;
  if (combined >= 9) return "highly delighted and enthusiastic";
  if (combined >= 7.5) return "warm, positive, and confident";
  if (combined >= 6) return "balanced, honest, and constructive";
  return "polite, realistic, and measured";
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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
      },
    });

    const prompt = buildReviewPrompt(input, options?.improvementHint);
    const result = await model.generateContent(prompt);
    let review = cleanReviewText((await result.response).text());

    // Repair pass when model misses exact sentence format.
    if (sentenceCount(review) !== 4) {
      const rewrite = await model.generateContent(
        `Rewrite this as EXACTLY 4 short natural sentences. Keep meaning same, plain text only:\n\n${review}`
      );
      review = cleanReviewText((await rewrite.response).text());
    }

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
  const toneCue = scoreTone(input.satisfactionLevel, input.recommendationLikelihood);

  return `Generate a short, authentic Google review for a jewellery store. The review must feel like a REAL person typed it on their phone — casual, warm, human.

BUSINESS:
- Name: ${input.orgName}
- Type: ${input.orgType}
${input.attenderName ? `- Served by: ${input.attenderName}` : ""}
${input.shopLocation ? `- Location: ${input.shopLocation}` : ""}

CUSTOMER:
- Name: ${input.customerName}
${input.customerFrom ? `- From: ${input.customerFrom}` : ""}
- Bought: ${input.purchaseType}

EXPERIENCE:
- Satisfaction: ${input.satisfactionLevel}/10
- Would recommend: ${input.recommendationLikelihood}/10
${input.events ? `- Occasion: ${input.events}` : ""}
${input.keyHighlights ? `- Highlights: ${input.keyHighlights}` : ""}
${input.improvementAreas ? `- Could improve: ${input.improvementAreas}` : ""}

${input.brandLoyalty ? `- Loyalty: ${input.brandLoyalty}` : ""}
${input.emotionalConnection ? `- Emotional connection: ${input.emotionalConnection}` : ""}
TARGET TONE:
- ${toneCue}
- Human, conversational, believable, specific.
- Sound like one customer sharing a genuine experience, not a marketing team.

STRICT RULES:
1. Write EXACTLY 4 short sentences. No more, no less.
2. First person as ${input.customerName}. Sound like a real human, not a copywriter.
3. Mention ${input.orgName} by name naturally.
4. Include at least one concrete detail (service behavior, design choice, feeling, or buying moment).
5. Do NOT use any markdown, bullet points, stars, or formatting.
6. Do NOT use quotation marks around the review.
7. Do NOT add a greeting or sign-off.
8. Avoid generic filler phrases like "highly recommended" unless supported by details.
9. No fake claims, no discounts/pricing promises, no exaggerated hype words.
10. Write it like someone typing a quick Google review on their phone — natural, genuine, slightly imperfect.
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
