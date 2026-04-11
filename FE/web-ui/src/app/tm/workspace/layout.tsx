import { LoadingOverlay } from "@/app/components/loading-overlay/loading-overlay";
import { NavigationBar } from "@/app/components/navigation-bar/navigation-bar";
import { SideBar } from "@/app/components/side-bar/side-bar";
import { TokenRefresherProvider } from "@/app/contexts/token-refresher-context/token-refresher-context";
import { Box, Flex, ScrollArea } from "@radix-ui/themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TokenRefresherProvider>
      <LoadingOverlay isGlobal />
      <Flex height="100vh" width="100%" overflow="hidden">
        <SideBar />
        <Flex direction="column" height="100%" flexGrow="1" minHeight="0">
          <NavigationBar />
          <Box flexGrow="1" minHeight="0">
            <ScrollArea scrollbars="vertical">
              <Box px="7" pb="4">
                {children}
              </Box>
            </ScrollArea>
          </Box>
        </Flex>
      </Flex>
    </TokenRefresherProvider>
  );
}
