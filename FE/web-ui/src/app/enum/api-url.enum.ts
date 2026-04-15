export enum ApiUrl {
  // Authentication
  Login = "/v1/accounts/login",
  Register = "/v1/accounts/register",
  RefreshToken = "/v1/accounts/token/refresh",
  LogOut = "/v1/accounts/logout",

  // Goals
  Goal = "/v1/goals",
  GoalTags = "/v1/goals/tags",

  //Goal Generate
  GoalGenerate = "/v1/goals/generate",

  // Tasks
  Task = "/v1/tasks",
  TaskProductivity = "/v1/tasks/productivity",

  // Knowledge Base
  KnowledgeBaseUpload = "/v1/knowledge-base/upload",
}
