import "./layout.scss";
import "@radix-ui/themes/styles.css";
import { ThemeProvider } from "../contexts/theme-context/theme-context";
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
