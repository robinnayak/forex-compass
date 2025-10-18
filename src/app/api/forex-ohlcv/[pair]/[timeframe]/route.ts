import { NextResponse } from "next/server";
import axios from 'axios';
import { DataPoint } from "@/types/technical";



export async function GET(request: Request, { params }: { params: { pair: string, timeframe: string } }) {
    const { pair, timeframe } = await params;
    const baseUrl = 'https://robinspt1999.github.io/forex-pair';
    const url = `${baseUrl}/${pair}${timeframe}.json`;

    try {
        const response = await axios.get<DataPoint[]>(url);
        return NextResponse.json({
            success: true,
            pair,
            timeframe,
            data: response.data
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