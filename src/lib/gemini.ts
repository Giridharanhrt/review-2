import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Review Generation Service
 * 
 * Generates personalized, high-quality customer reviews based on customer
 * and organization information.
 * 
 * Environment Variables:
 * GOOGLE_API_KEY=your_api_key
 */

interface ReviewGenerationInput {
  // Organization Info
  orgName: string;
  orgType: string;
  attenderName?: string;
  shopLocation?: string;
  orgDescription?: string;

  // Customer Info
  customerName: string;
  customerPhone?: string;

  // Purchase Info
  purchaseType: string;
  purchaseFrequency: string;
  purchaseDuration?: string;

  // Experience Info
  satisfactionLevel: number; // 1-10
  keyHighlights?: string;
  improvementAreas?: string;
  recommendationLikelihood: number; // 1-10

  // Event/Occasion
  events?: string;

  // Psychological/Behavioral
  shoppingMotivation?: string;
  priceSensitivity?: string;
  brandLoyalty?: string;
  emotionalConnection?: string;
}

interface ReviewGenerationResult {
  success: boolean;
  review?: string;
  customerMessage?: string;
  error?: string;
}

/**
 * Initialize review generation client
 */
function getReviewClient() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate a customer review
 */
export async function generateReview(
  input: ReviewGenerationInput,
  options?: {
    improvementHint?: string;
    regenerateType?: "review" | "customerMessage" | "both";
  }
): Promise<ReviewGenerationResult> {
  try {
    const genAI = getReviewClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const regenerateType = options?.regenerateType || "both";
    const hint = options?.improvementHint;

    const reviewPrompt = buildReviewPrompt(input, hint && (regenerateType === "review" || regenerateType === "both") ? hint : undefined);
    const customerMessagePrompt = buildCustomerMessagePrompt(input, hint && (regenerateType === "customerMessage" || regenerateType === "both") ? hint : undefined);

    const [reviewResult, messageResult] = await Promise.all([
      model.generateContent(reviewPrompt),
      model.generateContent(customerMessagePrompt),
    ]);

    const review = (await reviewResult.response).text().trim();
    const customerMessage = (await messageResult.response).text().trim();

    return {
      success: true,
      review,
      customerMessage,
    };
  } catch (error) {
    console.error("Review Generation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate review",
    };
  }
}

/**
 * Build the prompt for review generation
 */
function buildReviewPrompt(input: ReviewGenerationInput, improvementHint?: string): string {
  return `Generate a realistic, detailed customer review for a business based on the following information:

BUSINESS INFORMATION:
- Business Name: ${input.orgName}
- Business Type: ${input.orgType}
${input.attenderName ? `- Attender/Salesperson: ${input.attenderName}` : ""}
${input.shopLocation ? `- Shop Location: ${input.shopLocation}` : ""}
${input.orgDescription ? `- Description: ${input.orgDescription}` : ""}

CUSTOMER INFORMATION:
- Customer Name: ${input.customerName}
- Purchase Type: ${input.purchaseType}
- Purchase Frequency: ${input.purchaseFrequency}
${input.purchaseDuration ? `- Duration as Customer: ${input.purchaseDuration}` : ""}

EXPERIENCE DETAILS:
- Overall Satisfaction (1-10): ${input.satisfactionLevel}
${input.events ? `- Occasion/Event: ${input.events}` : ""}
${input.keyHighlights ? `- Key Highlights: ${input.keyHighlights}` : ""}
${input.improvementAreas ? `- Areas for Improvement: ${input.improvementAreas}` : ""}
- Likelihood to Recommend (1-10): ${input.recommendationLikelihood}

BEHAVIORAL INSIGHTS:
${input.shoppingMotivation ? `- Shopping Motivation: ${input.shoppingMotivation}` : ""}
${input.priceSensitivity ? `- Price Sensitivity: ${input.priceSensitivity}` : ""}
${input.brandLoyalty ? `- Brand Loyalty: ${input.brandLoyalty}` : ""}
${input.emotionalConnection ? `- Emotional Connection: ${input.emotionalConnection}` : ""}

REQUIREMENTS:
1. Write in first person as ${input.customerName}
2. Make it sound natural and authentic (not overly promotional)
3. Include specific details about the purchase experience
4. Mention ${input.orgName} by name${input.shopLocation ? ` and the location` : ""}
5. Keep it between 150-250 words
6. Include both positive aspects and (if applicable) minor constructive feedback for credibility
7. End with a clear recommendation statement
8. Use conversational, friendly language
${improvementHint ? `\nSPECIAL FOCUS: The user wants to improve the following aspect: "${improvementHint}". Pay special attention to this feedback and adjust the review accordingly.\n` : ""}
Generate the review now:`;
}

/**
 * Build the prompt for customer thank-you WhatsApp message
 */
function buildCustomerMessagePrompt(input: ReviewGenerationInput, improvementHint?: string): string {
  return `Generate a heartfelt, warm, and delightful WhatsApp thank-you message to send to a customer who just visited our jewellery store. The message should make them feel truly special and appreciated.

CONTEXT:
- Store Name: ${input.orgName}
- Customer Name: ${input.customerName}
${input.attenderName ? `- Served by: ${input.attenderName}` : ""}
${input.shopLocation ? `- Store Location: ${input.shopLocation}` : ""}
- What they purchased: ${input.purchaseType}
${input.events ? `- Occasion: ${input.events}` : ""}
${input.purchaseFrequency ? `- Customer type: ${input.purchaseFrequency}` : ""}

REQUIREMENTS:
1. Start with a warm, cheerful greeting using the customer's name — make it feel personal and genuine
2. Thank them sincerely for choosing ${input.orgName} — express genuine gratitude for their trust
3. Mention their specific purchase (${input.purchaseType}) in a way that makes them feel excited about it
${input.events ? `4. Congratulate or wish them beautifully for their occasion (${input.events}) — make them feel celebrated` : "4. Add a warm, personal touch that makes them smile"}
5. Make them feel like a valued member of the ${input.orgName} family, not just a customer
6. Gently invite them to visit again — frame it as "we'd love to see you again" rather than a sales push
7. Keep it short, sweet, and elegant — MAX 4-5 sentences, perfect for WhatsApp
8. Use a warm, gracious, and polished tone — think luxury hospitality
9. Do NOT use any markdown formatting, hashtags, or special symbols
10. Do NOT include any links or URLs
11. End with a warm sign-off from ${input.orgName}
12. Write in simple, elegant English that feels effortlessly classy
${improvementHint ? `\nSPECIAL FOCUS: The user wants to improve: "${improvementHint}". Adjust the message accordingly.\n` : ""}
Generate the WhatsApp message now:`;
}

/**
 * Check API configuration status
 */
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

  return {
    configured: true,
    message: "API is configured",
  };
}

const reviewService = {
  generateReview,
  checkApiStatus,
};

export default reviewService;
