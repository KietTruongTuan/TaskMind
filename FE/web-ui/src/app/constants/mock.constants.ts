import { Status } from "../enum/status.enum";
import { LoginRequestBody, LoginResponseBody, RegistrationRequestBody, RegistrationResponseBody } from "./authentication.constants";
import {
  CreateGoalRequestBody,
  CreateGoalResponseBody,
} from "./goal.constants";

const getFutureDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
};

export const MOCK_GOAL_RESPONSE_DATA: CreateGoalResponseBody = {
  name: "Test Goal",
  description: "This is a test goal",
  status: Status.ToDo,
  deadline: getFutureDate(),
  tag: ["test", "goal"],
  completeCount: 0,
  taskCount: 3,
  tasks: [
    { id: 1, name: "Task 1", status: Status.ToDo, deadline: getFutureDate() },
    { id: 2, name: "Task 2", status: Status.ToDo, deadline: getFutureDate() },
  ],
};

export const MOCK_BLANK_GOAL_RESPONSE_DATA: CreateGoalResponseBody = {
  name: "",
  description: "",
  status: undefined as unknown as Status,
  deadline: null as unknown as Date,
  tag: undefined as unknown as string[],
  completeCount: 0,
  taskCount: 0,
  tasks: [],
};

export const MOCK_GOAL_REQUEST_DATA: CreateGoalRequestBody = {
  name: "Test Goal",
  description: "This is a test goal",
  tag: ["test", "goal"],
  deadline: new Date("2026-02-16"),
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
