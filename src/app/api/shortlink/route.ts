import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function generateShortCode(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(req: Request) {
    try {
        const { reviewText, customerName, shopName, placeId } = await req.json();

        if (!reviewText || !customerName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const shortCode = generateShortCode();

        const shortLink = await prisma.shortLink.create({
            data: {
                shortCode,
                reviewText,
                customerName,
                shopName: shopName || "Kalyaa Jewellers",
                productName: placeId || null,
            },
        });

        const baseUrl = process.env.APP_URL || "https://kalyan-review-data.vercel.app";
        const url = `${baseUrl}/r/${shortLink.shortCode}`;

        return NextResponse.json({ success: true, url, shortCode: shortLink.shortCode });
    } catch (error) {
        console.error("Short link error:", error);
        return NextResponse.json(
            { error: "Failed to create link" },
            { status: 500 }
        );
    }
}
