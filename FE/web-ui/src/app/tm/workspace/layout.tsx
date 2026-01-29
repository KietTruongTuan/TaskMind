import { LoadingOverlay } from "@/app/components/loading-overlay/loading-overlay";
import { NavigationBar } from "@/app/components/navigation-bar/navigation-bar";
import { SideBar } from "@/app/components/side-bar/side-bar";
import { TokenRefresherProvider } from "@/app/contexts/token-refresher-context/token-refresher-context";
import { Box, Flex, ScrollArea } from "@radix-ui/themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TokenRefresherProvider>
      <LoadingOverlay isGlobal />
      <NavigationBar />
      <Flex pt="8" height="100vh" width="100%">
        <SideBar />
        <Flex width="100%">
          <ScrollArea type="auto" scrollbars="vertical">
            <Box px="4">{children}</Box>
          </ScrollArea>
        </Flex>
      </Flex>
    </TokenRefresherProvider>
  );
}
