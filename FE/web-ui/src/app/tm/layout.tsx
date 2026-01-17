import "./layout.scss";
import "@radix-ui/themes/styles.css";
import { ThemeProvider } from "../contexts/theme-context/theme-context";
import { ToastProvider } from "../contexts/toast-context/toast-context";
import { RouteLoadingProvider } from "../contexts/route-loading-context/route-loading-context";
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
            <ToastProvider>{children}</ToastProvider>
          </RouteLoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
