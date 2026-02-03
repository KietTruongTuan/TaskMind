import { MOCK_GOAL_RESPONSE_DATA } from "@/app/constants";
import { GoalReview } from "../components/goal-review/goal-review";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GoalReview goalData={MOCK_GOAL_RESPONSE_DATA} />;
}
