/**
 * @jest-environment node
 */
import {
  MOCK_GOAL_REQUEST_DATA,
  MOCK_GOAL_RESPONSE_DATA,
} from "@/app/constants";
import { AIService } from "./ai-service";
import { ApiUrl } from "@/app/enum/api-url.enum";

jest.mock("../http-service/http-service", () => {
  return {
    HttpService: class MockHttpService {
      _receivedUrl: string;

      constructor(url: string) {
        this._receivedUrl = url;
      }

      post() {
        return Promise.resolve();
      }
    },
  };
});

describe("AIService", () => {
  let aiService: AIService;
  const originalEnv = process.env;
  const internalUrl = "http://internal-api.test";
  const publicUrl = "http://public-api.test";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.INTERNAL_API_BASE_URL = internalUrl;
    process.env.NEXT_PUBLIC_API_BASE_URL = publicUrl;
    aiService = new AIService();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should call post with the correct URL and data", async () => {
    const postSpy = jest
      .spyOn(AIService.prototype, "post")
      .mockResolvedValue(MOCK_GOAL_RESPONSE_DATA);

    const result = await aiService.createGoal(MOCK_GOAL_REQUEST_DATA);

    expect(postSpy).toHaveBeenCalledWith(
      ApiUrl.GoalGenerate,
      MOCK_GOAL_REQUEST_DATA,
    );
    expect(result).toEqual(MOCK_GOAL_RESPONSE_DATA);
  });

  it("should use INTERNAL_API_BASE_URL when window is undefined (Server-side)", () => {
    const serverSideService = new AIService();

    expect((serverSideService as any)._receivedUrl).toBe(internalUrl);
  });

  it("should use NEXT_PUBLIC_API_BASE_URL when window is defined (Client-side)", () => {
    global.window = {} as any;

    const clientSideService = new AIService();
    
    expect((clientSideService as any)._receivedUrl).toBe(publicUrl);

    delete (global as any).window;
  });
});