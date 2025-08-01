import { NextResponse } from "next/server";


export async function GET() {
    const res = await fetch('https://robinnayak.github.io/horoscope_host_api/education-data.json');
    if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch education data' }, { status: 500 });
    }
    const data = await res.json();
    // console.log(data);
    return NextResponse.json(data);
}