import { CreateGoalRequestBody, CreateGoalResponseBody } from "@/app/constants";
import { HttpService } from "../http-service/http-service";
import { ApiUrl } from "@/app/enum/api-url.enum";

export class AIService extends HttpService {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_BASE_URL);
  }

  async createGoal(data: CreateGoalRequestBody) {
    const res = await this.post<CreateGoalResponseBody, CreateGoalRequestBody>(
      ApiUrl.GoalGenerate,
      data,
    );
    return res;
  }
}
