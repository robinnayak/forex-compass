import { NextResponse } from "next/server";
import axios from 'axios';
import { DataPoint } from "@/types/technical";



export async function GET(request: Request, { params }: { params: { pair: string, timeframe: string } }) {
    const { pair, timeframe } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null;

    const baseUrl = 'https://robinspt1999.github.io/forex-pair';
    const url = `${baseUrl}/${pair}${timeframe}.json`;

    try {
        const response = await axios.get<DataPoint[]>(url);

        let data = response.data;

        if (limit && limit > 0) {
            data = data.slice(0, limit);
        }

        data = data.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        return NextResponse.json({
            success: true,
            pair,
            timeframe,
            data,
            total: response.data.length,
            limit: limit || null
        })
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            return NextResponse.json({
                success: false,
                error: error.message,
                status: error.response?.status
            }, {
                status: error.response?.status || 500
            });
        }
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch OHLCV data'
        }, {
            status: 500
        });
    }
}