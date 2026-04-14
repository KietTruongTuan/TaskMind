import { Status } from "../enum/status.enum";

export interface DraftTask {
  id?: string;
  index?: number;
  name: string;
  status: Status;
  deadline: Date;
  completedDate?: Date;
  goalId?: string;
  goalName?: string;
}

export interface Task {
  id: string;
  name: string;
  status: Status;
  deadline: Date;
  completedDate?: Date;
  goalId?: string;
  goalName?: string;
}

export interface TaskProductivityResponseBody {
  date: string;
  count: number;
  level: number;
}

export interface TaskListResponseBody {
  tasks: Task[];
  totalCount: number;
  toDoCount: number;
  inProgressCount: number;
  completedCount: number;
  onHoldCount: number;
  cancelledCount: number;
  overdueCount: number;
}

export interface DraftTaskRequestBody {
  name?: string;
  status?: Status;
  deadline?: Date;
}

export interface CreateTaskRequestBody {
  goalId: string;
  name: string;
  status: Status;
  deadline: Date;
}
