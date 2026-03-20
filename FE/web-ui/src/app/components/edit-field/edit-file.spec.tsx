import { render, screen } from "@testing-library/react";
import { EditField } from "./edit-field";
import userEvent from "@testing-library/user-event";

describe("Task list item", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render editField without action", async () => {
    render(
      <EditField
        iconSize={12}
        fieldName="test-field"
        fieldSize="1"
        fieldLength="50%"
        type="text"
        value={"test"}
        isEditing={true}
        isDetailCard
      >
        Test edit field
      </EditField>,
    );

    const editField = await screen.findByTestId("edit-test-field-input");
    await userEvent.clear(editField);
    await userEvent.type(editField, "Edit name");
    editField.blur();

    expect(editField).toBeInTheDocument();
  });
});
