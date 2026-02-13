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

function normalizeResolvedPlaceId(rawId: string): string {
    if (!rawId) return "";
    if (rawId.startsWith("places/")) return rawId.replace("places/", "");
    return rawId;
}

async function resolvePlaceIdFromQuery(query: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey || !query?.trim()) return null;

    try {
        const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "places.id",
            },
            body: JSON.stringify({
                textQuery: query.trim(),
                languageCode: "en",
                regionCode: "IN",
                maxResultCount: 1,
            }),
        });

        if (!response.ok) return null;
        const data = (await response.json()) as { places?: Array<{ id?: string }> };
        const resolved = normalizeResolvedPlaceId(data?.places?.[0]?.id || "");
        return resolved || null;
    } catch {
        return null;
    }
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

        const providedPlaceTarget = (placeId || "").trim();
        const hasValidPlaceId = providedPlaceTarget.startsWith("ChI");
        const resolvedPlaceId = hasValidPlaceId
            ? providedPlaceTarget
            : (await resolvePlaceIdFromQuery(providedPlaceTarget));
        if (!resolvedPlaceId) {
            return NextResponse.json(
                { error: "Could not resolve Google Place ID for this location. Review-box-only mode requires a valid place ID." },
                { status: 422 }
            );
        }

        const shortLink = await prisma.shortLink.create({
            data: {
                shortCode,
                reviewText,
                customerName,
                shopName: shopName || "Kalyaa Jewellers",
                productName: resolvedPlaceId,
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
