import "./layout.scss";
import "@radix-ui/themes/styles.css";
import "react-tooltip/dist/react-tooltip.css";
import { ThemeProvider } from "../contexts/theme-context/theme-context";
import { ToastProvider } from "../contexts/toast-context/toast-context";
import { RouteLoadingProvider } from "../contexts/route-loading-context/route-loading-context";
import { SaasProvider } from "@saas-ui/react";

export const metadata = {
  title: "TaskMind",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          <RouteLoadingProvider>
            <ToastProvider>
              <SaasProvider>{children}</SaasProvider>
            </ToastProvider>
          </RouteLoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
