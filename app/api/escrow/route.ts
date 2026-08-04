import { NextResponse } from "next/server";

const ALLOWED_OPERATIONS = new Set(["create", "funding_instructions", "fund_status", "release", "refund", "cancel"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      endpoint?: string;
      operation?: string;
      authorization?: string;
      payload?: unknown;
    };

    const endpoint = normalizeEndpoint(body.endpoint);
    const operation = body.operation?.trim();
    const startedAt = Date.now();

    if (!operation || !ALLOWED_OPERATIONS.has(operation)) {
      return NextResponse.json({ error: "Unsupported escrow operation." }, { status: 400 });
    }

    if (!body.authorization?.startsWith("Nostr ")) {
      return NextResponse.json({ error: "Missing Nostr HTTP Auth header." }, { status: 400 });
    }

    const upstream = await fetch(`${endpoint}/${operation}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: body.authorization,
      },
      body: JSON.stringify(body.payload ?? {}),
      cache: "no-store",
    });
    const text = await upstream.text();
    const elapsedMs = Date.now() - startedAt;

    if (!upstream.ok) {
      console.warn("[rollpot] escrow upstream error", {
        operation,
        status: upstream.status,
        elapsedMs,
        body: text.slice(0, 500),
      });
    }

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[rollpot] escrow proxy error", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Escrow request failed." }, { status: 400 });
  }
}

function normalizeEndpoint(endpoint: string | undefined) {
  if (!endpoint) {
    throw new Error("Missing escrow endpoint.");
  }

  const url = new URL(endpoint);

  if (url.protocol !== "https:") {
    throw new Error("Escrow endpoint must use HTTPS.");
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/$/, "");
}
