import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchJina } from "./jina";

describe("fetchJina", () => {
  const originalKey = process.env.JINA_API_KEY;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalKey === undefined) delete process.env.JINA_API_KEY;
    else process.env.JINA_API_KEY = originalKey;
  });

  it("requests the page through r.jina.ai with the original URL appended", async () => {
    process.env.JINA_API_KEY = "jina-test-key";
    fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => "page text" });

    const result = await fetchJina("https://smith-law.com/contact");

    expect(result).toBe("page text");
    expect(fetchMock.mock.calls[0][0]).toBe("https://r.jina.ai/https://smith-law.com/contact");
  });

  it("sends the API key as a Bearer token when one is set", async () => {
    process.env.JINA_API_KEY = "jina-test-key";
    fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => "ok" });

    await fetchJina("https://example.com");

    const options = fetchMock.mock.calls[0][1];
    expect(options.headers.Authorization).toBe("Bearer jina-test-key");
  });

  it("omits the Authorization header when no key is set", async () => {
    delete process.env.JINA_API_KEY;
    fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => "ok" });

    await fetchJina("https://example.com");

    const options = fetchMock.mock.calls[0][1];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("throws when the response is not ok", async () => {
    process.env.JINA_API_KEY = "jina-test-key";
    fetchMock.mockResolvedValue({ ok: false, status: 429, text: async () => "rate limited" });

    await expect(fetchJina("https://example.com")).rejects.toThrow();
  });
});