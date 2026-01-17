import { Status } from "../enum/status.enum";

export interface DraftTask {
  id?: number;
  name: string;
  status: Status;
  deadline: Date;
  completedDate?: Date;
}
