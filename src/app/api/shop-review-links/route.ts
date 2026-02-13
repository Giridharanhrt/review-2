import { NextResponse } from "next/server";
import shopLocations from "@/data/shop-locations.json";

type ShopLocation = {
    value: string;
    label: string;
    address: string;
    placeId: string;
};

export async function GET() {
    const locations = (shopLocations as ShopLocation[]).map((location) => ({
        ...location,
        reviewUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(location.placeId)}`,
    }));

    return NextResponse.json({ locations });
}
