import { Goal } from "lucide-react";
import { GoalCategory } from "../enum/goal.enum";
import { Status } from "../enum/status.enum";
import { Task } from "./task.constants";

export interface GoalRequestBody {
  name: string;
  description: string;
  category: string[];
  due_date: Date;
}

export interface CreateGoalResponseBody {
  id: number;
  name: string;
  description: string;
}

export interface Goal {
  id: number;
  name: string;
  description: string;
  category: GoalCategory | string[];
  deadline: Date;
  completedDate?: Date;
  status: Status;
  tasks: Task[];
}
