import { NavigationBar } from "@/app/components/navigation-bar/navigation-bar";
import { ThemeToggle } from "@/app/components/theme-toggle/theme-toggle";
import { Box } from "@radix-ui/themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationBar userAvatar="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop" />
      {children}
    </>
  );
}
