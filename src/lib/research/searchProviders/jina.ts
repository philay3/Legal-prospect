// src/lib/research/searchProviders/jina.ts

export async function fetchJina(url: string, timeoutMs = 15000): Promise<string> {
  const targetUrl = `https://r.jina.ai/${url}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      Accept: "text/plain",
      "X-With-Links-Summary": "true",
    };

    if (process.env.JINA_API_KEY) {
      headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;
    }

    const res = await fetch(targetUrl, {
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Jina Reader returned status ${res.status}`);
    }

    return await res.text();
  } finally {
    clearTimeout(timeoutId);
  }
}
