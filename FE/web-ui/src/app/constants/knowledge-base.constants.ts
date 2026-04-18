import { FileType } from "../enum/file-type.enum";
import { FileStatus } from "../enum/status.enum";

export interface KnowledgeBaseResponseBody {
  id: string;
  name: string;
  fileType: FileType;
  size: string;
  uploadDate: Date;
  status: FileStatus;
  message?: string;
}