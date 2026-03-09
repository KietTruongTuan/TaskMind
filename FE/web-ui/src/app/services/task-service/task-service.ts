import { buildUrl } from "@/app/tm/utils";
import { HttpService } from "../http-service/http-service";
import { ApiUrl } from "@/app/enum/api-url.enum";
import { DraftTask, DraftTaskRequestBody, Task } from "@/app/constants";

export class TaskService extends HttpService {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_BASE_URL);
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
