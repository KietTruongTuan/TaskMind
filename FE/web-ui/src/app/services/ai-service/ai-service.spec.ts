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
    const spy = jest
      .spyOn(AIService.prototype, "post")
      .mockResolvedValue(MOCK_GOAL_RESPONSE_DATA);

    const result = await aiService.createGoal(MOCK_GOAL_REQUEST_DATA);

    expect(spy).toHaveBeenCalledWith(
      ApiUrl.GoalGenerate,
      MOCK_GOAL_REQUEST_DATA,
      { "headers": undefined }
    );
    expect(result).toEqual(MOCK_GOAL_RESPONSE_DATA);
  });

  it("should call post with the correct URL and data when formData", async () => {
    const spy = jest
      .spyOn(AIService.prototype, "post")
      .mockResolvedValue(MOCK_GOAL_RESPONSE_DATA);
    const formData = new FormData();
    formData.append("name", MOCK_GOAL_REQUEST_DATA.name);
    formData.append("description", MOCK_GOAL_REQUEST_DATA.description || "");
    formData.append("deadline", new Date(MOCK_GOAL_REQUEST_DATA.deadline).toISOString().split("T")[0]);
    formData.append("tag", MOCK_GOAL_REQUEST_DATA.tag?.toString() || "");
    formData.append("files", new File(["test"], "test.txt", { type: "text/plain" }));

    const result = await aiService.createGoal(formData);

    expect(spy).toHaveBeenCalledWith(
      ApiUrl.GoalGenerate,
      formData,
      { "headers": { "Content-Type": undefined } }
    );
    expect(result).toEqual(MOCK_GOAL_RESPONSE_DATA);
  });
});
