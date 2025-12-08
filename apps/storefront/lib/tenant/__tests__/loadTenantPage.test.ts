/**
 * @jest-environment node
 */

import { loadTenantPage } from "../loadTenantPage";
import * as payloadHelpers from "../payloadHelpers";
import { safeDeserialize } from "../../puck/safeDeserialize";
import { redis } from "../../cache/redis";

jest.mock("../payloadHelpers");
jest.mock("../../cache/redis", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));
jest.mock("../../puck/safeDeserialize", () => ({
  safeDeserialize: jest.fn((v) => JSON.parse(v)),
}));

describe("loadTenantPage", () => {
  const HOST = "acme.com";
  const SLUG = "home";
  const CACHE_KEY = `tenant:${HOST}:page:${SLUG}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns cached value if exists", async () => {
    const cachedValue = JSON.stringify({ ok: true });

    (redis.get as jest.Mock).mockResolvedValue(cachedValue);

    const result = await loadTenantPage(HOST, SLUG);

    expect(redis.get).toHaveBeenCalledWith(CACHE_KEY);
    expect(safeDeserialize).toHaveBeenCalledWith(cachedValue);
    expect(result).toEqual({ ok: true });

    // no fetch calls because cache hit
    expect(payloadHelpers.fetchTenant).not.toHaveBeenCalled();
  });

  test("throws if tenant is not found", async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);
    (payloadHelpers.fetchTenant as jest.Mock).mockResolvedValue(null);

    await expect(loadTenantPage(HOST, SLUG)).rejects.toThrow("Tenant not found");
  });

  test("fetches tenant, page, template and caches merged result", async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);

    const mockTenant = { id: "t1", hostname: HOST };
    const mockPage = { content: [{ type: "hero", text: "Hello" }] };
    const mockTemplate = { components: [{ type: "footer" }] };

    (payloadHelpers.fetchTenant as jest.Mock).mockResolvedValue(mockTenant);
    (payloadHelpers.fetchPuckPage as jest.Mock).mockResolvedValue(mockPage);
    (payloadHelpers.fetchTemplateSnapshot as jest.Mock).mockResolvedValue(mockTemplate);

    const result = await loadTenantPage(HOST, SLUG);

    expect(payloadHelpers.fetchTenant).toHaveBeenCalledWith(HOST);
    expect(payloadHelpers.fetchPuckPage).toHaveBeenCalledWith("t1", SLUG);
    expect(payloadHelpers.fetchTemplateSnapshot).toHaveBeenCalledWith("t1");

    const expectedMerged = {
      tenant: mockTenant,
      page: mockPage.content,
      template: mockTemplate.components,
    };

    expect(redis.set).toHaveBeenCalledWith(
      CACHE_KEY,
      JSON.stringify(expectedMerged),
      "EX",
      60
    );

    expect(result).toEqual(expectedMerged);
  });

  test("handles missing page gracefully (page = null)", async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);

    const mockTenant = { id: "t42", hostname: HOST };
    const mockTemplate = { components: [{ type: "banner" }] };

    (payloadHelpers.fetchTenant as jest.Mock).mockResolvedValue(mockTenant);
    (payloadHelpers.fetchPuckPage as jest.Mock).mockResolvedValue(null);
    (payloadHelpers.fetchTemplateSnapshot as jest.Mock).mockResolvedValue(mockTemplate);

    const result = await loadTenantPage(HOST, SLUG);

    expect(result.page).toBeNull();
    expect(result.template).toEqual(mockTemplate.components);
  });
});
