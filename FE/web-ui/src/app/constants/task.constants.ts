import { Status } from "../enum/status.enum";

export interface DraftTask {
  id?: string;
  name: string;
  status: Status;
  deadline: Date;
  completedDate?: Date;
}

export interface Task {
  id: string;
  name: string;
  status: Status;
  deadline: Date;
  completedDate?: Date;
}

export interface DraftTaskRequestBody {
  name?: string;
  status?: Status;
  deadline?: Date;
}
