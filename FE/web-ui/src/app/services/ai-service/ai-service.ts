import { CreateGoalRequestBody, CreateGoalResponseBody } from "@/app/constants";
import { HttpService } from "../http-service/http-service";
import { ApiUrl } from "@/app/enum/api-url.enum";

export class AIService extends HttpService {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_BASE_URL);
  }

  async createGoal(data: CreateGoalRequestBody | FormData, config?: import("axios").AxiosRequestConfig) {
    const isFormData = data instanceof FormData;
    const res = await this.post<
      CreateGoalResponseBody,
      CreateGoalRequestBody | FormData
    >(ApiUrl.GoalGenerate, data, {
      ...config,
      headers: {
        ...config?.headers,
        ...(isFormData ? { "Content-Type": undefined } : {}),
      },
    });
    return res;
  }
}
