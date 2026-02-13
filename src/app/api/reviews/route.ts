import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            orgName,
            orgType,
            attenderName,
            shopLocation,
            orgDescription,
            customerName,
            customerPhone,
            purchaseType,
            purchaseFrequency,
            purchaseDuration,
            satisfactionLevel,
            keyHighlights,
            improvementAreas,
            recommendationLikelihood,
            events,
            shoppingMotivation,
            priceSensitivity,
            brandLoyalty,
            emotionalConnection,
            reviewText,
            customerMessage,
        } = body;

        if (!customerName || !purchaseType || !purchaseFrequency || !reviewText) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const review = await prisma.customerReview.create({
            data: {
                orgName: orgName || "Kalyaa Jewellers",
                orgType: orgType || "Jewellery Store",
                attenderName: attenderName || null,
                shopLocation: shopLocation || null,
                orgDescription: orgDescription || null,
                customerName,
                customerPhone: customerPhone || null,
                purchaseType,
                purchaseFrequency,
                purchaseDuration: purchaseDuration || null,
                satisfactionLevel: parseInt(satisfactionLevel) || 8,
                keyHighlights: keyHighlights || null,
                improvementAreas: improvementAreas || null,
                recommendationLikelihood: parseInt(recommendationLikelihood) || 9,
                events: Array.isArray(events) ? events.join(", ") : (events || null),
                shoppingMotivation: Array.isArray(shoppingMotivation) ? shoppingMotivation.join(", ") : (shoppingMotivation || null),
                priceSensitivity: priceSensitivity || null,
                brandLoyalty: brandLoyalty || null,
                emotionalConnection: emotionalConnection || null,
                reviewText,
                customerMessage: customerMessage || null,
            },
        });

        return NextResponse.json({
            success: true,
            id: review.id,
        });
    } catch (error) {
        console.error("Save Review Error:", error);
        return NextResponse.json(
            { error: "Failed to save review" },
            { status: 500 }
        );
    }
}
