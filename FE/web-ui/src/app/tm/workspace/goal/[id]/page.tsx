import { GoalProvider } from "@/app/contexts/goal-context/goal-context";
import { GoalReview } from "../components/goal-review/goal-review";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { goalService } = await useServerSideService();
  const goalDetailData = await goalService.getById(id);
  return (
    <GoalProvider>
      <GoalReview goalData={goalDetailData} />
    </GoalProvider>
  );
}
