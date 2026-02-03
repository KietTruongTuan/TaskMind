import { GoalDetailResponseBody, SaveGoalRequestBody } from "@/app/constants";
import { HttpService } from "../http-service/http-service";
import { ApiUrl } from "@/app/enum/api-url.enum";

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
}
