import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReviewRedirectClient from "./client";

export default async function ReviewRedirectPage({
    params,
}: {
    params: Promise<{ shortCode: string }>;
}) {
    const { shortCode } = await params;

    const shortLink = await prisma.shortLink.findUnique({
        where: { shortCode },
    });

    if (!shortLink) {
        notFound();
    }

    // Increment clicks
    await prisma.shortLink.update({
        where: { id: shortLink.id },
        data: { clicks: { increment: 1 } },
    });

    // productName field stores the placeId
    const placeId = shortLink.productName || "ChIJha8EDVZYqDsRMq-49v_wem0";

    return (
        <ReviewRedirectClient
            reviewText={shortLink.reviewText}
            customerName={shortLink.customerName}
            shopName={shortLink.shopName || "Kalyaa Jewellers"}
            placeId={placeId}
        />
    );
}
