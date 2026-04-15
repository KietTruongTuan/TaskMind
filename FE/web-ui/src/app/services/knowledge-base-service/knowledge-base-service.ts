import { HttpService } from "../http-service/http-service";
import { KnowledgeBaseUploadResponseBody } from "@/app/constants";
import { ApiUrl } from "@/app/enum/api-url.enum";

export class KnowledgeBaseService extends HttpService {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_BASE_URL);
  }

  async upload(data: FormData) {
    const res = await this.post<KnowledgeBaseUploadResponseBody, FormData>(
      ApiUrl.KnowledgeBaseUpload,
      data,
    );
    return res;
  }
}
