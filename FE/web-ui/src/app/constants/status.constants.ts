import {
  CheckCheck,
  CheckCircle,
  CircleAlert,
  CircleDashed,
  CirclePause,
  CirclePlay,
  LoaderCircle,
} from "lucide-react";
import { FileStatus, Status } from "../enum/status.enum";

export const StatusDisplay: Record<Status, { title: string }> = {
  [Status.ToDo]: {
    title: "To do",
  },
  [Status.InProgress]: {
    title: "In progress",
  },
  [Status.Completed]: {
    title: "Completed",
  },
  [Status.OnHold]: { title: "On hold" },
  [Status.Cancelled]: { title: "Cancelled" },
  [Status.Overdue]: { title: "Overdue" },
};

export const FileStatusDisplay: Record<
  FileStatus,
  {
    icon: React.ElementType;
    messageIcon: React.ElementType;
    color: string;
    message: string;
    isSpinning?: boolean;
  }
> = {
  [FileStatus.Success]: {
    icon: CheckCircle,
    messageIcon: CheckCheck,
    color: "var(--status-completed)",
    message:
      "File processing complete. The document is now available in your knowledge base.",
    isSpinning: false,
  },
  [FileStatus.Pending]: {
    icon: CircleDashed,
    messageIcon: CirclePlay,
    color: "var(--status-in-progress)",
    message: "File uploaded successfully. Processing will start shortly.",
    isSpinning: false,
  },
  [FileStatus.Processing]: {
    icon: LoaderCircle,
    messageIcon: CirclePause,
    color: "var(--status-in-progress)",
    message: "Extracting and analyzing your document.",
    isSpinning: true,
  },
  [FileStatus.Failed]: {
    icon: CircleAlert,
    messageIcon: CircleAlert,
    color: "var(--status-cancel)",
    message:
      "An error occurred during file processing. Please try again later.",
    isSpinning: false,
  },
};
