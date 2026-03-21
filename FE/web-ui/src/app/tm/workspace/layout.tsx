import { LoadingOverlay } from "@/app/components/loading-overlay/loading-overlay";
import { NavigationBar } from "@/app/components/navigation-bar/navigation-bar";
import { TokenRefresherProvider } from "@/app/contexts/token-refresher-context/token-refresher-context";
import { Box } from "@radix-ui/themes";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TokenRefresherProvider>
        <LoadingOverlay isGlobal />
        <NavigationBar />
        <Box pt="9" height="100%">{children}</Box>
      </TokenRefresherProvider>
  );
}
