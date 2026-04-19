import { FileType } from "../enum/file-type.enum";
import { FileStatus, Status } from "../enum/status.enum";
import {
  LoginRequestBody,
  LoginResponseBody,
  RefreshTokenResponseBody,
  RegistrationRequestBody,
  RegistrationResponseBody,
} from "./authentication.constants";
import {
  CreateGoalRequestBody,
  CreateGoalResponseBody,
  GoalDetailResponseBody,
  GoalListItemResponseBody,
  GoalListResponseBody,
} from "./goal.constants";
import { KnowledgeBaseResponseBody } from "./knowledge-base.constants";
import {
  CreateTaskRequestBody,
  DraftTask,
  Task,
  TaskListResponseBody,
} from "./task.constants";

const getFutureDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
};
export const MOCK_ACCESS_TOKEN: RefreshTokenResponseBody = {
  access: "mocked_access_token",
};

export const MOCK_GOAL_RESPONSE_DATA: CreateGoalResponseBody = {
  name: "Test Goal",
  description: "This is a test goal",
  status: Status.ToDo,
  deadline: getFutureDate(),
  tag: ["test", "goal"],
  completedCount: 0,
  taskCount: 3,
  tasks: [
    { id: "1", name: "Task 1", status: Status.ToDo, deadline: getFutureDate() },
    { id: "2", name: "Task 2", status: Status.ToDo, deadline: getFutureDate() },
  ],
};

export const MOCK_TASK_RESPONSE_DATA: Task = {
  id: "1",
  name: "Task 1",
  status: Status.ToDo,
  deadline: getFutureDate(),
};

export const MOCK_TASK_REQUEST_DATA: CreateTaskRequestBody = {
  name: "Task 1",
  status: Status.ToDo,
  deadline: getFutureDate(),
  goalId: "1",
};

export const MOCK_TASK_LIST_RESPONSE_DATA: Task[] = [
  {
    id: "1",
    name: "Task 1",
    status: Status.ToDo,
    deadline: getFutureDate(),
    goalId: "1",
    goalName: "Goal 1",
  },
  {
    id: "2",
    name: "Task 2",
    status: Status.InProgress,
    deadline: getFutureDate(),
    goalId: "1",
    goalName: "Goal 1",
  },
  {
    id: "3",
    name: "Task 3",
    status: Status.OnHold,
    deadline: getFutureDate(),
    goalId: "2",
    goalName: "Goal 2",
  },
];

export const MOCK_TASK_LIST_RESPONSE_DATA_WITH_STATS: TaskListResponseBody = {
  tasks: MOCK_TASK_LIST_RESPONSE_DATA,
  toDoCount: 1,
  inProgressCount: 1,
  onHoldCount: 1,
  completedCount: 0,
  cancelledCount: 0,
  overdueCount: 0,
  totalCount: 3,
};

export const MOCK_DRAFT_TASK_LIST_RESPONSE_DATA: DraftTask[] = [
  {
    name: "Task 1",
    status: Status.ToDo,
    deadline: getFutureDate(),
  },
  {
    name: "Task 2",
    status: Status.InProgress,
    deadline: getFutureDate(),
  },
  {
    name: "Task 3",
    status: Status.OnHold,
    deadline: getFutureDate(),
  },
];

export const MOCK_GOAL_DETAIL_RESPONSE_DATA = {
  ...MOCK_GOAL_RESPONSE_DATA,
  id: "1",
} as GoalDetailResponseBody;

export const MOCK_BLANK_GOAL_RESPONSE_DATA: CreateGoalResponseBody = {
  name: "",
  description: "",
  status: undefined as unknown as Status,
  deadline: null as unknown as Date,
  tag: undefined as unknown as string[],
  completedCount: 0,
  taskCount: 0,
  tasks: [],
};

export const MOCK_GOAL_LIST_DATA: GoalListItemResponseBody[] = [
  {
    id: "1",
    name: "Test Goal 1",
    description: "This is a test goal",
    status: Status.ToDo,
    deadline: getFutureDate(),
    tag: ["test", "goal"],
    completedCount: 0,
    taskCount: 0,
  },
  {
    id: "2",
    name: "Test Goal 2",
    description: "This is a test goal",
    status: Status.InProgress,
    deadline: getFutureDate(),
    tag: ["test", "goal"],
    completedCount: 1,
    taskCount: 3,
  },
  {
    id: "3",
    name: "Test Goal 3",
    description: "This is a test goal",
    status: Status.Completed,
    deadline: getFutureDate(),
    tag: ["test", "goal"],
    completedDate: getFutureDate(),
    completedCount: 3,
    taskCount: 3,
  },
  {
    id: "4",
    name: "Test Goal 4",
    description: "This is a test goal",
    status: Status.Completed,
    deadline: getFutureDate(),
    tag: ["test", "goal"],
    completedCount: 5,
    taskCount: 5,
  },
];

export const MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS: GoalListResponseBody = {
  goals: MOCK_GOAL_LIST_DATA,
  toDoCount: 1,
  inProgressCount: 1,
  onHoldCount: 1,
  completedCount: 0,
  cancelledCount: 0,
  overdueCount: 0,
  totalCount: 3,
};

export const MOCK_GOAL_REQUEST_DATA: CreateGoalRequestBody = {
  name: "Test Goal",
  description: "This is a test goal",
  tag: ["test", "goal"],
  deadline: new Date("2100-02-16"),
};

export const MOCK_LOGIN_REQUEST_DATA: LoginRequestBody = {
  email: "test@example.com",
  password: "password123",
};

export const MOCK_LOGIN_RESPONSE_DATA: LoginResponseBody = {
  message: "Login successfully",
  access: "mocked_jwt_token",
};

export const MOCK_REGISTER_REQUEST_DATA: RegistrationRequestBody = {
  username: "testuser",
  email: "test@example.com",
  password: "password123",
};

export const MOCK_REGISTER_RESPONSE_DATA: RegistrationResponseBody = {
  message: "Register successfully",
};

export const MOCK_KNOWLEDGE_BASE_UPLOAD_RESPONSE_DATA: KnowledgeBaseResponseBody = {
  id: "1",
  name: "File1.pdf",
  fileType: FileType.Pdf,
  size: "1 MB",
  uploadDate: getFutureDate(),
  status: FileStatus.Pending,
  message: "File uploaded successfully",
};

export const MOCK_KNOWLEDGE_BASE_LIST_RESPONSE_DATA: KnowledgeBaseResponseBody[] = [
  MOCK_KNOWLEDGE_BASE_UPLOAD_RESPONSE_DATA,
  {
    id: "2",
    name: "File2.pdf",
    fileType: FileType.Pdf,
    size: "2 MB",
    uploadDate: getFutureDate(),
    status: FileStatus.Processing,
    message: "File uploaded successfully",
  },
  {
    id: "3",
    name: "File3.pdf",
    fileType: FileType.Pdf,
    size: "3 MB",
    uploadDate: getFutureDate(),
    status: FileStatus.Success,
    message: "File uploaded successfully",
  },
  {
    id: "4",
    name: "File4.pdf",
    fileType: FileType.Pdf,
    size: "4 MB",
    uploadDate: getFutureDate(),
    status: FileStatus.Failed,
    message: "File uploaded successfully",
  },
];