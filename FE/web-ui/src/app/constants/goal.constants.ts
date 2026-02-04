import { Status } from "../enum/status.enum";
import { DraftTask, Task } from "./task.constants";

export interface CreateGoalRequestBody {
  name: string;
  description?: string;
  tag?: string[];
  deadline: Date;
}

export interface SaveGoalRequestBody {
  name: string;
  description: string;
  status: Status;
  deadline: Date;
  tag?: string[];
  tasks: DraftTask[];
}

export interface CreateGoalResponseBody extends GoalResponseBody {
  tasks: DraftTask[];
}

export interface GoalDetailResponseBody extends GoalResponseBody {
  id: string;
  tasks: Task[];
}

export interface GoalListItemResponseBody extends GoalResponseBody {
  id: string;
}
  
export interface GoalResponseBody {
  name: string;
  description: string;
  status: Status;
  deadline: Date;
  tag?: string[];
  completedCount: number;
  taskCount: number;
  completedDate?: Date;
}
