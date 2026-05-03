import { HttpService } from "../http-service/http-service";
import { KnowledgeBaseDeleteRequestBody, KnowledgeBaseResponseBody } from "@/app/constants";
import { ApiUrl } from "@/app/enum/api-url.enum";

export class KnowledgeBaseService extends HttpService {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_BASE_URL);
  }

  async upload(data: FormData) {
    const res = await this.post<KnowledgeBaseResponseBody, FormData>(
      ApiUrl.KnowledgeBase,
      data,
      { headers: { "Content-Type": undefined } },
    );
    return res;
  }

  async getFiles() {
    const res = await this.get<KnowledgeBaseResponseBody[]>(
      ApiUrl.KnowledgeBase,
    );
    return res;
  }
  async remove(data: KnowledgeBaseDeleteRequestBody) {
    const res = await this.delete<undefined, KnowledgeBaseDeleteRequestBody>(
      ApiUrl.KnowledgeBase,
      data,
    );
    return res;
  }
}
