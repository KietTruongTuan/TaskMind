export enum ApiUrl {
  // Authentication
  Login = "/v1/accounts/login",
  LocalLogin = "/api/auth/login",
  Register = "/v1/accounts/register",
  RefreshToken = "/v1/accounts/token/refresh",
  LocalRefreshToken = "/api/auth/refresh",
  LogOut = "/v1/accounts/logout",
  LocalLogOut = "/api/auth/logout",

  // Goals
  Goal = "/v1/goals",

  //Goal Generate
  GoalGenerate = "/v1/goals/generate",
}
