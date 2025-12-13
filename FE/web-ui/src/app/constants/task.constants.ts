import { Status } from "../enum/status.enum";

export interface Task {
  id: number;
  name: string;
  position: number;
  status: Status;
  deadline: Date;
}
