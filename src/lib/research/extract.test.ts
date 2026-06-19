import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractPageContent } from "./extract";
import { fetchDirect, fetchPageContent } from "./searchProviders/tavily";

vi.mock("./searchProviders/tavily", () => {
  return {
    fetchDirect: vi.fn(),
    fetchPageContent: vi.fn(),
  };
});

const mockFetchDirect = fetchDirect as any;
const mockFetchPageContent = fetchPageContent as any;

describe("extractPageContent dispatcher", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should default to Tavily mode if EXTRACT_PROVIDER is unset", async () => {
    delete process.env.EXTRACT_PROVIDER;
    mockFetchPageContent.mockResolvedValue("tavily text");

    const result = await extractPageContent("https://test.com");
    expect(result).toBe("tavily text");
    expect(mockFetchPageContent).toHaveBeenCalledWith("https://test.com");
    expect(mockFetchDirect).not.toHaveBeenCalled();
  });

  it("should use Tavily mode if EXTRACT_PROVIDER is tavily", async () => {
    process.env.EXTRACT_PROVIDER = "tavily";
    mockFetchPageContent.mockResolvedValue("tavily text");

    const result = await extractPageContent("https://test.com");
    expect(result).toBe("tavily text");
    expect(mockFetchPageContent).toHaveBeenCalledWith("https://test.com");
    expect(mockFetchDirect).not.toHaveBeenCalled();
  });

  it("should fallback to Tavily mode if EXTRACT_PROVIDER is unknown (e.g. foo)", async () => {
    process.env.EXTRACT_PROVIDER = "foo";
    mockFetchPageContent.mockResolvedValue("tavily text");

    const result = await extractPageContent("https://test.com");
    expect(result).toBe("tavily text");
    expect(mockFetchPageContent).toHaveBeenCalledWith("https://test.com");
    expect(mockFetchDirect).not.toHaveBeenCalled();
  });

  it("should try direct fetch first if EXTRACT_PROVIDER is direct", async () => {
    process.env.EXTRACT_PROVIDER = "direct";
    mockFetchDirect.mockResolvedValue("direct text");

    const result = await extractPageContent("https://test.com");
    expect(result).toBe("direct text");
    expect(mockFetchDirect).toHaveBeenCalledWith("https://test.com");
    expect(mockFetchPageContent).not.toHaveBeenCalled();
  });

  it("should resolve direct with normalized values like ' Direct '", async () => {
    process.env.EXTRACT_PROVIDER = " Direct ";
    mockFetchDirect.mockResolvedValue("direct text");

    const result = await extractPageContent("https://test.com");
    expect(result).toBe("direct text");
    expect(mockFetchDirect).toHaveBeenCalledWith("https://test.com");
    expect(mockFetchPageContent).not.toHaveBeenCalled();
  });

  it("should fall back to Tavily if direct fetch throws an error", async () => {
    process.env.EXTRACT_PROVIDER = "direct";
    mockFetchDirect.mockRejectedValue(new Error("Direct fetch failed"));
    mockFetchPageContent.mockResolvedValue("tavily fallback text");

    const result = await extractPageContent("https://test.com");
    expect(result).toBe("tavily fallback text");
    expect(mockFetchDirect).toHaveBeenCalledWith("https://test.com");
    expect(mockFetchPageContent).toHaveBeenCalledWith("https://test.com");
  });

  it("should fall back to Tavily if direct fetch returns empty string", async () => {
    process.env.EXTRACT_PROVIDER = "direct";
    mockFetchDirect.mockResolvedValue("");
    mockFetchPageContent.mockResolvedValue("tavily fallback text");

    const result = await extractPageContent("https://test.com");
    expect(result).toBe("tavily fallback text");
    expect(mockFetchDirect).toHaveBeenCalledWith("https://test.com");
    expect(mockFetchPageContent).toHaveBeenCalledWith("https://test.com");
  });

  it("should fall back to Tavily if direct fetch returns whitespace only", async () => {
    process.env.EXTRACT_PROVIDER = "direct";
    mockFetchDirect.mockResolvedValue("   ");
    mockFetchPageContent.mockResolvedValue("tavily fallback text");

    const result = await extractPageContent("https://test.com");
    expect(result).toBe("tavily fallback text");
    expect(mockFetchDirect).toHaveBeenCalledWith("https://test.com");
    expect(mockFetchPageContent).toHaveBeenCalledWith("https://test.com");
  });
});
