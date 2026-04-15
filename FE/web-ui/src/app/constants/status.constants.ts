import {
  CheckCheck,
  CheckCircle,
  CircleAlert,
  CircleDashed,
  Loader,
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
  { icon: React.ElementType; messageIcon: React.ElementType; color: string }
> = {
  [FileStatus.Done]: {
    icon: CheckCircle,
    messageIcon: CheckCheck,
    color: "var(--status-completed)",
  },
  [FileStatus.Processing]: {
    icon: CircleDashed,
    messageIcon: Loader,
    color: "var(--status-in-progress)",
  },
  [FileStatus.Failed]: {
    icon: CircleAlert,
    messageIcon: CircleAlert,
    color: "var(--status-cancel)",
  },
};
