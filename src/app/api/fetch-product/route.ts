import { NextResponse } from "next/server";
import { promises as dns } from "node:dns";
import { isIP } from "node:net";

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 2_000_000;

function isPrivateIPv4(ip: string): boolean {
  const octets = ip.split(".").map(Number);
  if (octets.length !== 4 || octets.some(Number.isNaN)) return true;
  const [a, b] = octets;

  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  if (lower.startsWith("::ffff:")) {
    return isPrivateIPv4(lower.replace("::ffff:", ""));
  }
  return false;
}

async function assertPublicHost(hostname: string): Promise<void> {
  const version = isIP(hostname);
  if (version === 4 && isPrivateIPv4(hostname)) {
    throw new Error("Refusing to fetch a private address");
  }
  if (version === 6 && isPrivateIPv6(hostname)) {
    throw new Error("Refusing to fetch a private address");
  }
  if (version) return;

  if (hostname === "localhost" || hostname.endsWith(".local")) {
    throw new Error("Refusing to fetch a private address");
  }

  const records = await dns.lookup(hostname, { all: true });
  for (const record of records) {
    if (record.family === 4 && isPrivateIPv4(record.address)) {
      throw new Error("Refusing to fetch a private address");
    }
    if (record.family === 6 && isPrivateIPv6(record.address)) {
      throw new Error("Refusing to fetch a private address");
    }
  }
}

function extractMeta(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
      "i"
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtmlEntities(match[1]);
  }
  return undefined;
}

function extractTitleTag(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : undefined;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function readLimited(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let received = 0;
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_BYTES) {
      await reader.cancel();
      break;
    }
    result += decoder.decode(value, { stream: true });
  }

  return result;
}

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "A product URL is required" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL" }, { status: 400 });
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return NextResponse.json({ error: "Only http(s) links are supported" }, { status: 400 });
  }

  try {
    await assertPublicHost(url.hostname);
  } catch {
    return NextResponse.json({ error: "That URL can't be fetched" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "SpeckleLinkPreview/1.0 (+https://speckle.app)",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `The retailer site responded with ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "That link doesn't point to a product page" },
        { status: 415 }
      );
    }

    const finalUrl = new URL(response.url || url.toString());
    await assertPublicHost(finalUrl.hostname);

    const html = await readLimited(response);

    const productName =
      extractMeta(html, "og:title") ??
      extractMeta(html, "twitter:title") ??
      extractTitleTag(html) ??
      "";

    const description =
      extractMeta(html, "og:description") ??
      extractMeta(html, "twitter:description") ??
      extractMeta(html, "description") ??
      "";

    let imageUrl =
      extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image") ?? "";
    if (imageUrl) {
      try {
        imageUrl = new URL(imageUrl, finalUrl).toString();
      } catch {
        imageUrl = "";
      }
    }

    const retailer =
      extractMeta(html, "og:site_name") ?? finalUrl.hostname.replace(/^www\./, "");

    return NextResponse.json({
      sourceUrl: finalUrl.toString(),
      retailer,
      productName,
      description,
      imageUrl,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Timed out fetching that link" }, { status: 504 });
    }
    return NextResponse.json({ error: "Couldn't reach that link" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
