import { render, screen } from "@testing-library/react";
import { CustomButton } from "./custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";

describe("Custom button", () => {
  it("should render active button", async () => {
    render(
      <CustomButton buttonType={ButtonType.Primary} isActive>
        Active Button
      </CustomButton>,
    );

    expect(await screen.findByText("Active Button")).toHaveClass("active");
  });
});
