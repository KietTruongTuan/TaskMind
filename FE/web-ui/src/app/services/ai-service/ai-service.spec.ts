import {
  MOCK_GOAL_REQUEST_DATA,
  MOCK_GOAL_RESPONSE_DATA,
} from "@/app/constants";
import { AIService } from "./ai-service";
import { ApiUrl } from "@/app/enum/api-url.enum";

describe("AIService", () => {
  let aiService: AIService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
  });

  it("should call post with the correct URL and data", async () => {
    const postSpy = jest
      .spyOn(AIService.prototype, "post")
      .mockResolvedValue(MOCK_GOAL_RESPONSE_DATA);

    const result = await aiService.createGoal(MOCK_GOAL_REQUEST_DATA);
    expect(postSpy).toHaveBeenCalledWith(
      ApiUrl.GoalGenerate,
      MOCK_GOAL_REQUEST_DATA
    );

    expect(result).toEqual(MOCK_GOAL_RESPONSE_DATA);
  });
});
