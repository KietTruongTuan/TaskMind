import {
  DraftGoalRequestBody,
  GoalDetailResponseBody,
  GoalListItemResponseBody,
  SaveGoalRequestBody,
} from "@/app/constants";
import { HttpService } from "../http-service/http-service";
import { ApiUrl } from "@/app/enum/api-url.enum";
import { SearchParams } from "@/app/enum/search-params.enum";
import { buildUrl } from "@/app/tm/utils";

export class GoalService extends HttpService {
  constructor() {
    super(
      typeof window === "undefined"
        ? process.env.INTERNAL_API_BASE_URL ||
            process.env.NEXT_PUBLIC_API_BASE_URL
        : process.env.NEXT_PUBLIC_API_BASE_URL,
    );
  }

  async save(data: SaveGoalRequestBody) {
    const res = await this.post<GoalDetailResponseBody, SaveGoalRequestBody>(
      ApiUrl.Goal,
      data,
    );
    return res;
  }

  async getAll(params?: Record<SearchParams, string | string[] | null | undefined>) {
    const url = buildUrl(ApiUrl.Goal, undefined, params);
    const res = await this.get<GoalListItemResponseBody[]>(url);
    return res;
  }

  async getById(id: string) {
    const url = buildUrl(ApiUrl.Goal, id, undefined);
    const res = await this.get<GoalDetailResponseBody>(url);
    return res;
  }

  async update(id: string, data: DraftGoalRequestBody) {
    const url = buildUrl(ApiUrl.Goal, id, undefined);
    const res = await this.patch<GoalDetailResponseBody, DraftGoalRequestBody>(
      url,
      data,
    );
    return res;
  }

  async remove(id: string) {
    const url = buildUrl(ApiUrl.Goal, id, undefined);
    const res = await this.delete(url);
    return res;
  }
}
