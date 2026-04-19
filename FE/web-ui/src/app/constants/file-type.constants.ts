import {
  faFilePdf,
  faFileWord,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FileType } from "../enum/file-type.enum";

export const FileTypeDisplay: Record<
  FileType,
  { icon: IconDefinition; color: string }
> = {
  [FileType.Pdf]: {
    icon: faFilePdf,
    color: "var(--pdf-file-color)",
  },
  [FileType.Docx]: {
    icon: faFileWord,
    color: "var(--docx-icon-color)",
  },
};
