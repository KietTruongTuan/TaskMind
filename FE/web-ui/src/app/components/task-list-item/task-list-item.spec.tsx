import { render, screen } from "@testing-library/react";
import { TaskListItem } from "./task-list-item";
import { Status } from "@/app/enum/status.enum";

describe("Task list item", () => {
  it("should render active button", async () => {
    render(
      <TaskListItem
        name="Task 1"
        status={Status.Completed}
        deadline={new Date("2026-02-16")}
      />,
    );

    expect(await screen.findByText("Task 1")).not.toHaveClass("subText");
  });
});
