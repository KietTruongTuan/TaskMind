import {
  GoalDetailResponseBody,
  GoalListItemResponseBody,
  SaveGoalRequestBody,
} from "@/app/constants";
import { HttpService } from "../http-service/http-service";
import { ApiUrl } from "@/app/enum/api-url.enum";
import { GoalSearchParams } from "@/app/enum/search-params.enum";
import { buildUrl } from "@/app/tm/utils";

export class GoalService extends HttpService {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_BASE_URL);
  }

  async save(data: SaveGoalRequestBody) {
    const res = await this.post<GoalDetailResponseBody, SaveGoalRequestBody>(
      ApiUrl.Goal,
      data,
    );
    return res;
  }

  async getAll(params: Record<GoalSearchParams, string | null | undefined>) {
    const url = buildUrl(ApiUrl.Goal, undefined, params);
    console.log("Full URL:", url);
    const res = await this.get<GoalListItemResponseBody[]>(url);
    return res;
  }
}
