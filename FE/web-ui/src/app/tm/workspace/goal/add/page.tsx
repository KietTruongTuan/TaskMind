import { GoalProvider } from "@/app/contexts/goal-context/goal-context";
import { AddGoalWrapper } from "./components/add-goal-wrapper/add-goal-wrapper";

export default async function AddGoalPage() {
  return (
    <GoalProvider>
      <AddGoalWrapper />
    </GoalProvider>
  );
}
