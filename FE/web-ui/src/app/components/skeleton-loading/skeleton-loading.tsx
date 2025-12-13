import { Skeleton } from "@radix-ui/themes";
import styles from "./skeleton-loading.module.scss";

export function SkeletonLoading({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <Skeleton loading={isLoading} className={styles.loadingBg} mb="1">
      {children}
    </Skeleton>
  );
}
