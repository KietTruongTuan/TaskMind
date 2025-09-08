import { Theme } from "@radix-ui/themes";
import "./layout.scss";
import "@radix-ui/themes/styles.css";
import { ThemeSwitcher } from "./contexts/theme-context/theme-context";
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
        <ThemeSwitcher>{children}</ThemeSwitcher>
      </body>
    </html>
  );
}
