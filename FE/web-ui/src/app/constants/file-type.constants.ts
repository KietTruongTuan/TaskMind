import { faFilePdf, faFileWord, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FileType } from "../enum/file-type.enum";

export const FileTypeDisplay: Record<FileType, { icon: IconDefinition }> = {
    [FileType.Pdf]: {
        icon: faFilePdf, 
    },
    [FileType.Docx]: {
        icon: faFileWord,
    }
};