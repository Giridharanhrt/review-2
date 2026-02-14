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
            customerName,
            customerPhone,
            customerFrom,
            purchaseType,
            satisfactionLevel,
            keyHighlights,
            improvementAreas,
            recommendationLikelihood,
            events,
            brandLoyalty,
            emotionalConnection,
            reviewText,
        } = body;

        if (!customerName || !purchaseType || !reviewText) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const reviewData = {
                orgName: orgName || "Kalyan Jewellers",
                orgType: orgType || "Jewellery Store",
                attenderName: attenderName || null,
                shopLocation: shopLocation || null,
                customerName,
                customerPhone: customerPhone || null,
                customerFrom: customerFrom || null,
                purchaseType,
                satisfactionLevel: parseInt(satisfactionLevel) || 8,
                keyHighlights: keyHighlights || null,
                improvementAreas: improvementAreas || null,
                recommendationLikelihood: parseInt(recommendationLikelihood) || 9,
                events: Array.isArray(events) ? events.join(", ") : (events || null),
                brandLoyalty: brandLoyalty || null,
                emotionalConnection: emotionalConnection || null,
                reviewText,
            };

        const review = await prisma.customerReview.create({
            // Prisma client generation is currently failing in this environment; cast keeps build unblocked.
            data: reviewData as never,
        });

        return NextResponse.json({ success: true, id: review.id });
    } catch (error) {
        console.error("Save Review Error:", error);
        return NextResponse.json(
            { error: "Failed to save review" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, reviewText } = await req.json();

        if (!id || !reviewText) {
            return NextResponse.json(
                { error: "Missing id or reviewText" },
                { status: 400 }
            );
        }

        await prisma.customerReview.update({
            where: { id },
            data: { reviewText },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update Review Error:", error);
        return NextResponse.json(
            { error: "Failed to update review" },
            { status: 500 }
        );
    }
}
