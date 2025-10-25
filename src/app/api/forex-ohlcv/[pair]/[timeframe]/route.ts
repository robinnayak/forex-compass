import { NextResponse } from "next/server";
import axios from 'axios';
import { DataPoint } from "@/types/technical";

export async function GET(request: Request, { params }: { params: { pair: string, timeframe: string } }) {
    const { pair, timeframe } = await params;
    const { searchParams } = new URL(request.url);
    
    // Improved parameter parsing with better defaults
    const to_limit = searchParams.has('to_limit') ? parseInt(searchParams.get('to_limit')!) : null;
    const from_limit = searchParams.has('from_limit') ? parseInt(searchParams.get('from_limit')!) : 0;

    // Validate parameters
    if (from_limit < 0) {
        return NextResponse.json({
            success: false,
            error: 'from_limit cannot be negative'
        }, { status: 400 });
    }

    if (to_limit !== null && to_limit <= from_limit) {
        return NextResponse.json({
            success: false,
            error: 'to_limit must be greater than from_limit'
        }, { status: 400 });
    }

    // Add maximum limit protection for performance
    const MAX_LIMIT = 1000;
    if (to_limit !== null && (to_limit - from_limit) > MAX_LIMIT) {
        return NextResponse.json({
            success: false,
            error: `Requested range too large. Maximum ${MAX_LIMIT} data points allowed per request.`
        }, { status: 400 });
    }

    const baseUrl = 'https://robinspt1999.github.io/forex-pair';
    const url = `${baseUrl}/${pair}${timeframe}.json`;

    try {
        const response = await axios.get<DataPoint[]>(url);

        let data = response.data;

        // Ensure data is sorted by timestamp (oldest first) - do this FIRST
        data = data.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Store total before slicing
        const totalAvailable = data.length;

        // Improved slicing logic - FIXED: Handle edge cases
        if (to_limit !== null) {
            // Return specific window: from_limit to to_limit
            data = data.slice(from_limit, Math.min(to_limit, totalAvailable));
        } else if (from_limit > 0) {
            // Return from from_limit to end
            data = data.slice(from_limit);
        }
        // Otherwise return all data (but respect MAX_LIMIT)
        else {
            data = data.slice(0, MAX_LIMIT);
        }

        // Calculate if more data is available
        const hasMore = to_limit ? to_limit < totalAvailable : (from_limit + data.length) < totalAvailable;

        console.log(`[API] ${pair}/${timeframe} returned ${data.length} points (${from_limit}-${to_limit || 'end'}) from total ${totalAvailable}, hasMore: ${hasMore}`);
        
        // Add caching headers for performance
        const headers = {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
        };

        return NextResponse.json({
            success: true,
            pair,
            timeframe,
            data,
            total: totalAvailable, // Total available in the source
            returned: data.length, // Actually returned in this response
            from_limit,
            to_limit,
            // Enhanced metadata for frontend
            metadata: {
                hasMore: hasMore,
                totalAvailable: totalAvailable,
                nextFrom: hasMore ? from_limit + data.length : null,
                range: {
                    start: from_limit,
                    end: to_limit ? Math.min(to_limit, totalAvailable) : Math.min(from_limit + data.length, totalAvailable),
                    total: totalAvailable
                }
            }
        }, { headers });
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[API] Error fetching ${pair}/${timeframe}:`, error.message);
            
            // Provide more specific error responses
            const status = error.response?.status || 500;
            let errorMessage = error.message;

            if (error.response?.status === 404) {
                errorMessage = `Data not found for pair ${pair} and timeframe ${timeframe}`;
            } else if (error.response?.status === 429) {
                errorMessage = 'Rate limit exceeded';
            }

            return NextResponse.json({
                success: false,
                error: errorMessage,
                pair,
                timeframe,
                status: error.response?.status
            }, { status });
        }
        
        console.error(`[API] Unknown error fetching ${pair}/${timeframe}:`, error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch OHLCV data',
            pair,
            timeframe
        }, { status: 500 });
    }
}