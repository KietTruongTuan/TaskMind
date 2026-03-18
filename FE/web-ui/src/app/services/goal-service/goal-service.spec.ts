import {
  DraftGoalRequestBody,
  GoalDetailResponseBody,
  MOCK_GOAL_DETAIL_RESPONSE_DATA,
  MOCK_GOAL_LIST_DATA,
  MOCK_GOAL_RESPONSE_DATA,
  SaveGoalRequestBody,
} from "@/app/constants";
import { ApiUrl } from "@/app/enum/api-url.enum";
import { GoalService } from "./goal-service";
import { Status } from "@/app/enum/status.enum";
import { GoalSearchParams } from "@/app/enum/search-params.enum";

describe("GoalService", () => {
  let goalService: GoalService;

  beforeEach(() => {
    jest.clearAllMocks();
    goalService = new GoalService();
  });

  it("should call save with the correct URL and data", async () => {
    const postSpy = jest
      .spyOn(GoalService.prototype, "post")
      .mockResolvedValue(MOCK_GOAL_RESPONSE_DATA);

    const result = await goalService.save(
      MOCK_GOAL_RESPONSE_DATA as SaveGoalRequestBody,
    );
    expect(postSpy).toHaveBeenCalledWith(ApiUrl.Goal, MOCK_GOAL_RESPONSE_DATA);

    expect(result).toEqual(MOCK_GOAL_RESPONSE_DATA);
  });

  it("should call getAll with the correct URL and data", async () => {
    const postSpy = jest
      .spyOn(GoalService.prototype, "get")
      .mockResolvedValue(MOCK_GOAL_LIST_DATA);

    const result = await goalService.getAll(
      {} as Record<GoalSearchParams, string | null | undefined>,
    );
    expect(postSpy).toHaveBeenCalledWith(ApiUrl.Goal);

    expect(result).toEqual(MOCK_GOAL_LIST_DATA);
  });

  it("should call getAll with status filter with the correct URL and data", async () => {
    const mockStatusFilterGoalListData = MOCK_GOAL_LIST_DATA.filter(
      (goal) => goal.status === Status.ToDo,
    );
    const postSpy = jest
      .spyOn(GoalService.prototype, "get")
      .mockResolvedValue(mockStatusFilterGoalListData);

    const result = await goalService.getAll({
      [GoalSearchParams.Status]: Status.ToDo,
    } as Record<GoalSearchParams, string | null | undefined>);
    expect(postSpy).toHaveBeenCalledWith(
      `${ApiUrl.Goal}?status=${Status.ToDo}`,
    );

    expect(result).toEqual(mockStatusFilterGoalListData);
  });

  it("should call getById with the correct URL and data", async () => {
    const postSpy = jest
      .spyOn(GoalService.prototype, "get")
      .mockResolvedValue(MOCK_GOAL_DETAIL_RESPONSE_DATA);

    const result = await goalService.getById(MOCK_GOAL_DETAIL_RESPONSE_DATA.id);
    expect(postSpy).toHaveBeenCalledWith(
      `${ApiUrl.Goal}/${MOCK_GOAL_DETAIL_RESPONSE_DATA.id}`,
    );

    expect(result).toEqual(MOCK_GOAL_DETAIL_RESPONSE_DATA);
  });

  it("should call update with the correct URL and data", async () => {
    const mockUpdatedGoalData = {
      ...MOCK_GOAL_DETAIL_RESPONSE_DATA,
      name: "Edited Goal",
    } as GoalDetailResponseBody;
    const postSpy = jest
      .spyOn(GoalService.prototype, "patch")
      .mockResolvedValue(mockUpdatedGoalData);

    const result = await goalService.update(MOCK_GOAL_DETAIL_RESPONSE_DATA.id, {
      name: "Edited Goal",
    } as DraftGoalRequestBody);
    expect(postSpy).toHaveBeenCalledWith(
      `${ApiUrl.Goal}/${MOCK_GOAL_DETAIL_RESPONSE_DATA.id}`,
      { name: "Edited Goal" },
    );

    expect(result).toEqual(mockUpdatedGoalData);
  });

  it("should call remove with the correct URL and data", async () => {
    const postSpy = jest
      .spyOn(GoalService.prototype, "delete")
      .mockResolvedValue(undefined);

    const result = await goalService.remove(MOCK_GOAL_DETAIL_RESPONSE_DATA.id);
    expect(postSpy).toHaveBeenCalledWith(
      `${ApiUrl.Goal}/${MOCK_GOAL_DETAIL_RESPONSE_DATA.id}`,
    );

    expect(result).toEqual(undefined);
  });
});
