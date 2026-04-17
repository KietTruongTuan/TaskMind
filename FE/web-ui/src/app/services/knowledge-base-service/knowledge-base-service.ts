import { HttpService } from "../http-service/http-service";
import { KnowledgeBaseResponseBody, KnowledgeBaseUploadResponseBody } from "@/app/constants";
import { ApiUrl } from "@/app/enum/api-url.enum";

export class KnowledgeBaseService extends HttpService {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_BASE_URL);
  }

  async upload(data: FormData) {
    const res = await this.post<KnowledgeBaseUploadResponseBody, FormData>(
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
}
