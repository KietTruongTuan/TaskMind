import { GoalReview } from "../components/goal-review/goal-review";
import { useServerSideService } from "@/app/hooks/useServerSideService";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { goalService } = await useServerSideService();
  const goalDetailData = await goalService.getById(id);
  return <GoalReview goalData={goalDetailData} />;
}
