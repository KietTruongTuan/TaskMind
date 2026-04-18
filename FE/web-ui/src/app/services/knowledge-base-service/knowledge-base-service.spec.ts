import { ApiUrl } from "@/app/enum/api-url.enum";
import { KnowledgeBaseService } from "./knowledge-base-service";
import { MOCK_KNOWLEDGE_BASE_LIST_RESPONSE_DATA, MOCK_KNOWLEDGE_BASE_UPLOAD_RESPONSE_DATA } from "@/app/constants";

describe("KnowledgeBaseService", () => {
    let knowledgeBaseService: KnowledgeBaseService;

    beforeEach(() => {
        jest.clearAllMocks();
        knowledgeBaseService = new KnowledgeBaseService();
    });

    it("should call upload with the correct URL and data", async () => {
        const spy = jest
            .spyOn(KnowledgeBaseService.prototype, "post")
            .mockResolvedValue(MOCK_KNOWLEDGE_BASE_UPLOAD_RESPONSE_DATA);

        const moclRequestData = new FormData();
        const result = await knowledgeBaseService.upload(moclRequestData);
        expect(spy).toHaveBeenCalledWith(ApiUrl.KnowledgeBase, moclRequestData, { "headers": { "Content-Type": undefined } });

        expect(result).toEqual(MOCK_KNOWLEDGE_BASE_UPLOAD_RESPONSE_DATA);
    });

    it("should call getFiles with the correct URL and data", async () => {
        const spy = jest
            .spyOn(KnowledgeBaseService.prototype, "get")
            .mockResolvedValue(MOCK_KNOWLEDGE_BASE_LIST_RESPONSE_DATA);

        const result = await knowledgeBaseService.getFiles();
        expect(spy).toHaveBeenCalledWith(ApiUrl.KnowledgeBase);

        expect(result).toEqual(MOCK_KNOWLEDGE_BASE_LIST_RESPONSE_DATA);
    });
});
