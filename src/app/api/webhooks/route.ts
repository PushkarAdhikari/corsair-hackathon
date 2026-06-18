import { processWebhook } from "corsair";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { corsair } from '@/server/corsair'



export async function POST(request: NextRequest) {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        headers[key] = value;
    });

    const contentType = request.headers.get('content-type');

    let body: string | Record<string, unknown>;

    if (contentType?.includes('application/json')) {
        body = (await request.json()) as Record<string, unknown>;
    } else {
        const text = await request.text();
        body = text?.trim() ? text : {};
    }

    const tenantId = 'pushkar'

    const result = await processWebhook(corsair, headers, body, { tenantId });

    console.info('Plugin Processed:', result.plugin, result.action);

    const responseHeaders = result.response;
    const nextHeaders = new Headers();

    if (responseHeaders) {
        for (const [key, value] of Object.entries(responseHeaders)) {
            nextHeaders.set(key, String(value));
        }
    }

    if (!result.response) {
        return NextResponse.json(
            {
                success: false,
                message: 'No matching webhook handler found',
            },
            { status: 404 }
        )
    }

    if (result.response !== undefined) {
        return NextResponse.json(result.response, { headers: nextHeaders });
    }

    return new NextResponse(null, { status: 200, headers: nextHeaders });
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'webhook endpoint is active',
        timestamp: new Date().toISOString(),
    })
}