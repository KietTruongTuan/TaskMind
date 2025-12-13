import { Avatar, DropdownMenu, Flex, Skeleton, Text } from "@radix-ui/themes";
import { AlertDialogPopUp } from "../alert-dialog-pop-up/alert-dialog-pop-up";
import { authenticationService, UserPayload } from "@/app/constants";
import { LogOut } from "lucide-react";
import styles from "./avatar-menu.module.scss";
import { useTokenRefresherContext } from "@/app/contexts/token-refresher-context/token-refresher-context";
import { SkeletonLoading } from "../skeleton-loading/skeleton-loading";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import { WebUrl } from "@/app/enum/web-url.enum";

export function AvatarMenu() {
  const { route } = useRouteLoadingContext();
  const { user, loading } = useTokenRefresherContext();

  const username = user ? user.username.charAt(0).toUpperCase() : "";

  const onLogOut = async () => {
    await authenticationService.logout();
    route(WebUrl.Dashboard);
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Flex>
          <SkeletonLoading isLoading={loading}>
            <Avatar
              mr={{ initial: "3", md: "0" }}
              className={styles.avatarBox}
              fallback={username}
            />
          </SkeletonLoading>
        </Flex>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content variant="soft">
        <AlertDialogPopUp
          title="Are you sure"
          description="This action will log out your account"
          actionText="Log Out"
          action={onLogOut}
        >
          <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
            <Flex align="center" gap="3">
              <Text>Log Out</Text>
              <LogOut size={15} />
            </Flex>
          </DropdownMenu.Item>
        </AlertDialogPopUp>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
