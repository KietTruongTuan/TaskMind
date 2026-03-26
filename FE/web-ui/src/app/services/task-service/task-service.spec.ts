import {
  DraftTaskRequestBody,
  MOCK_TASK_LIST_RESPONSE_DATA,
  MOCK_TASK_REQUEST_DATA,
  MOCK_TASK_RESPONSE_DATA,
  Task,
} from "@/app/constants";
import { TaskService } from "./task-service";
import { ApiUrl } from "@/app/enum/api-url.enum";
import { SearchParams } from "@/app/enum/search-params.enum";

describe("TaskService", () => {
  let taskService: TaskService;

  beforeEach(() => {
    jest.clearAllMocks();
    taskService = new TaskService();
  });

  it("should call create with the correct URL and data", async () => {
    const spy = jest
      .spyOn(TaskService.prototype, "post")
      .mockResolvedValue(MOCK_TASK_REQUEST_DATA);

    const result = await taskService.create(MOCK_TASK_REQUEST_DATA);
    expect(spy).toHaveBeenCalledWith(ApiUrl.Task, MOCK_TASK_REQUEST_DATA);

    expect(result).toEqual(MOCK_TASK_REQUEST_DATA);
  });

  it("should call getAll with the correct URL and data", async () => {
    const spy = jest
      .spyOn(TaskService.prototype, "get")
      .mockResolvedValue(MOCK_TASK_LIST_RESPONSE_DATA);

    const result = await taskService.getAll(
      {} as Record<SearchParams, string | string[] | null | undefined>,
    );
    expect(spy).toHaveBeenCalledWith(ApiUrl.Task);

    expect(result).toEqual(MOCK_TASK_LIST_RESPONSE_DATA);
  });

  it("should call update with the correct URL and data", async () => {
    const mockUpdatedTaskData = {
      ...MOCK_TASK_RESPONSE_DATA,
      name: "Edited Task",
    } as Task;
    const spy = jest
      .spyOn(TaskService.prototype, "patch")
      .mockResolvedValue(mockUpdatedTaskData);

    const result = await taskService.update(MOCK_TASK_RESPONSE_DATA.id, {
      name: "Edited Task",
    } as DraftTaskRequestBody);
    expect(spy).toHaveBeenCalledWith(
      `${ApiUrl.Task}/${MOCK_TASK_RESPONSE_DATA.id}`,
      { name: "Edited Task" },
    );

    expect(result).toEqual(mockUpdatedTaskData);
  });

  it("should call remove with the correct URL and data", async () => {
    const spy = jest
      .spyOn(TaskService.prototype, "delete")
      .mockResolvedValue(undefined);

    const result = await taskService.remove(MOCK_TASK_RESPONSE_DATA.id);
    expect(spy).toHaveBeenCalledWith(
      `${ApiUrl.Task}/${MOCK_TASK_RESPONSE_DATA.id}`,
    );

    expect(result).toEqual(undefined);
  });
});
