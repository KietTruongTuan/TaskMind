import { Status } from "../enum/status.enum";

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
  [Status.OnHold]: { title: "On Hold" },
  [Status.Cancel]: { title: "Cancelled" },
  [Status.Overdue]: { title: "Overdue" },
};
