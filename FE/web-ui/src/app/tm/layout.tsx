import "./layout.scss";
import "@radix-ui/themes/styles.css";
import { ThemeProvider } from "../contexts/theme-context/theme-context";
import { ToastProvider } from "../contexts/toast-context/toast-context";
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
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
