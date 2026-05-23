import { GoalProvider } from "@/app/contexts/goal-context/goal-context";
import { AddGoalWrapper } from "./components/add-goal-wrapper/add-goal-wrapper";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";

export default async function AddGoalPage() {
  const { authenticationService } = await useServerSideService();

  const userProfile = await authenticationService.getProfile();
  return (
    <GoalProvider>
      <AddGoalWrapper userProfile={userProfile} />
    </GoalProvider>
  );
}
