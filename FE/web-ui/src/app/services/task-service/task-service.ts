import { buildUrl } from "@/app/tm/utils";
import { HttpService } from "../http-service/http-service";
import { ApiUrl } from "@/app/enum/api-url.enum";
import {
  CreateTaskRequestBody,
  DraftTaskRequestBody,
  Task,
  TaskListResponseBody,
} from "@/app/constants";
import { SearchParams } from "@/app/enum/search-params.enum";

export class TaskService extends HttpService {
  constructor() {
    super(
      typeof window === "undefined"
        ? process.env.INTERNAL_API_BASE_URL ||
            process.env.NEXT_PUBLIC_API_BASE_URL
        : process.env.NEXT_PUBLIC_API_BASE_URL,
    );
  }

  async create(data: CreateTaskRequestBody) {
    const res = await this.post<Task, CreateTaskRequestBody>(ApiUrl.Task, data);
    return res;
  }

  async getAll(
    params?: Record<SearchParams, string | string[] | null | undefined>,
  ) {
    const url = buildUrl(ApiUrl.Task, undefined, params);
    const res = await this.get<TaskListResponseBody>(url);
    return res;
  }

  async update(id: string, data: DraftTaskRequestBody) {
    const url = buildUrl(ApiUrl.Task, id, undefined);
    const res = await this.patch<Task, DraftTaskRequestBody>(url, data);
    return res;
  }

  async remove(id: string) {
    const url = buildUrl(ApiUrl.Task, id, undefined);
    const res = await this.delete(url);
    return res;
  }
}
