import {
  MOCK_GOAL_RESPONSE_DATA,
  SaveGoalRequestBody,
} from "@/app/constants";
import { ApiUrl } from "@/app/enum/api-url.enum";
import { GoalService } from "./goal-service";

describe("GoalService", () => {
  let goalService: GoalService;

  beforeEach(() => {
    jest.clearAllMocks();
    goalService = new GoalService();
  });

  it("should call post with the correct URL and data", async () => {
    const postSpy = jest
      .spyOn(GoalService.prototype, "post")
      .mockResolvedValue(MOCK_GOAL_RESPONSE_DATA);

    const result = await goalService.save(
      MOCK_GOAL_RESPONSE_DATA as SaveGoalRequestBody,
    );
    expect(postSpy).toHaveBeenCalledWith(
      ApiUrl.Goal,
      MOCK_GOAL_RESPONSE_DATA,
    );

    expect(result).toEqual(MOCK_GOAL_RESPONSE_DATA);
  });
});
