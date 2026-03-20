import { AIService } from "../services/ai-service/ai-service";
import { AuthenticationService } from "../services/authentication-service/authentication-service";
import { GoalService } from "../services/goal-service/goal-service";
import { TaskService } from "../services/task-service/task-service";

export const authenticationService = new AuthenticationService();
export const aiService = new AIService();
export const goalService = new GoalService();
export const taskService = new TaskService();
