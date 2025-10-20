import { NextResponse } from "next/server";
import axios from 'axios';
import { DataPoint } from "@/types/technical";

export async function GET(request: Request, { params }: { params: { pair: string, timeframe: string } }) {
    const { pair, timeframe } = await params; // Remove await - params is not a Promise
    const { searchParams } = new URL(request.url);
    
    // Fix parameter parsing - use 0 as default for from_limit, null for to_limit
    const to_limit = searchParams.get('to_limit') ? parseInt(searchParams.get('to_limit')!) : null;
    const from_limit = searchParams.get('from_limit') ? parseInt(searchParams.get('from_limit')!) : 0;

    const baseUrl = 'https://robinspt1999.github.io/forex-pair';
    const url = `${baseUrl}/${pair}${timeframe}.json`;

    try {
        const response = await axios.get<DataPoint[]>(url);

        let data = response.data;

        // Fix the slicing logic - it was conflicting
        if (to_limit !== null && to_limit > 0) {
            // If both from_limit and to_limit are provided, slice accordingly
            data = data.slice(from_limit, to_limit);
        } else if (from_limit > 0) {
            // If only from_limit is provided, slice from that point
            data = data.slice(from_limit);
        }
        // If neither is provided (or to_limit is 0), return all data

        // Ensure data is sorted by timestamp (oldest first)
        data = data.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        console.log(`[API] ${pair}/${timeframe} returned ${data.length} points (${from_limit}-${to_limit}) from total ${response.data.length}`);
        
        return NextResponse.json({
            success: true,
            pair,
            timeframe,
            data,
            total: response.data.length,
            returned: data.length,
            to_limit: to_limit,
            from_limit: from_limit
        });
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[API] Error fetching ${pair}/${timeframe}:`, error.message);
            return NextResponse.json({
                success: false,
                error: error.message,
                status: error.response?.status
            }, {
                status: error.response?.status || 500
            });
        }
        console.error(`[API] Unknown error fetching ${pair}/${timeframe}:`, error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch OHLCV data'
        }, {
            status: 500
        });
    }
}