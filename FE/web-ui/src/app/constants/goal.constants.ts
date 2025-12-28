import { Status } from "../enum/status.enum";
import { DraftTask } from "./task.constants";

export interface CreateGoalRequestBody {
  name: string;
  description: string;
  tag?: string[];
  deadline: Date;
}

export interface CreateGoalResponseBody {
  name: string;
  description: string;
  status: Status;
  deadline: string;
  tag?: string[];
  completeCount: number;
  taskCount: number;
  tasks: DraftTask[];
  completedDate?: Date;
}

