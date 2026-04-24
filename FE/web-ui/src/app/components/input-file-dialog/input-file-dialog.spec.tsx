import { render, screen } from "@testing-library/react";
import { InputFileDialog } from "./input-file-dialog";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import userEvent from "@testing-library/user-event";

describe("InputDialog", () => {
  it("should render page", async () => {
    render(
      <ToastProvider>
        <InputFileDialog files={[]} setFiles={() => {}} />
      </ToastProvider>,
    );
    await userEvent.click(await screen.findByTestId("dialog-trigger"));
    const file = new File(["test content"], "test-file.pdf", {
      type: "application/pdf",
    });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await userEvent.upload(input, file);
    expect(await screen.findByTestId("dialog-trigger")).toBeInTheDocument();
  });
});
