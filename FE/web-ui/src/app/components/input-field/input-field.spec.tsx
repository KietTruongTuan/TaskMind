import { render, screen } from "@testing-library/react";
import { InputField } from "./input-field";
import userEvent from "@testing-library/user-event";
import { useForm, FormProvider } from "react-hook-form";
import * as Form from "@radix-ui/react-form";

function renderWithForm(children: React.ReactNode) {
  const Wrapper = () => {
    const methods = useForm();
    return (
      <FormProvider {...methods}>
        <Form.Root>{children}</Form.Root>
      </FormProvider>
    );
  };

  return render(<Wrapper />);
}

describe("InputField", () => {
  it("should show the text when toggle the eye icon button", async () => {
    renderWithForm(
      <InputField
        name="password"
        type="password"
        placeholder="Enter your password"
      />
    );

    const input = await screen.findByPlaceholderText("Enter your password");
    const toggleButton = await screen.findByTestId("toggle-password-button");
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(toggleButton);

    expect(input).toHaveAttribute("type", "text");
  });
});
