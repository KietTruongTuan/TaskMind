import {
  DraftTaskRequestBody,
  MOCK_TASK_RESPONSE_DATA,
  Task,
} from "@/app/constants";
import { TaskService } from "./task-service";
import { ApiUrl } from "@/app/enum/api-url.enum";

describe("TaskService", () => {
  let taskService: TaskService;

  beforeEach(() => {
    jest.clearAllMocks();
    taskService = new TaskService();
  });

  it("should call update with the correct URL and data", async () => {
    const mockUpdatedTaskData = {
      ...MOCK_TASK_RESPONSE_DATA,
      name: "Edited Task",
    } as Task;
    const postSpy = jest
      .spyOn(TaskService.prototype, "patch")
      .mockResolvedValue(mockUpdatedTaskData);

    const result = await taskService.update(MOCK_TASK_RESPONSE_DATA.id, {
      name: "Edited Task",
    } as DraftTaskRequestBody);
    expect(postSpy).toHaveBeenCalledWith(
      `${ApiUrl.Task}/${MOCK_TASK_RESPONSE_DATA.id}`,
      { name: "Edited Task" },
    );

    expect(result).toEqual(mockUpdatedTaskData);
  });

  it("should call remove with the correct URL and data", async () => {
    const postSpy = jest
      .spyOn(TaskService.prototype, "delete")
      .mockResolvedValue(undefined);

    const result = await taskService.remove(MOCK_TASK_RESPONSE_DATA.id);
    expect(postSpy).toHaveBeenCalledWith(
      `${ApiUrl.Task}/${MOCK_TASK_RESPONSE_DATA.id}`,
    );

    expect(result).toEqual(undefined);
  });
});
