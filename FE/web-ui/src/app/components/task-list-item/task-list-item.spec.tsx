import { render, screen } from "@testing-library/react";
import { TaskListItem } from "./task-list-item";
import { Status } from "@/app/enum/status.enum";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

describe("Task list item", () => {
  it("should render active button", async () => {
    render(
      <ThemeProvider>
        <TaskListItem
          name="Task 1"
          status={Status.Completed}
          deadline={new Date("2026-02-16")}
        />
        ,
      </ThemeProvider>
    );

    expect(await screen.findByText("Task 1")).not.toHaveClass("subText");
  });
});
