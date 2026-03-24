import { render, screen, waitFor } from "@testing-library/react";
import { WebUrl } from "@/app/enum/web-url.enum";
import userEvent from "@testing-library/user-event";
import { MOCK_ROUTER_PUSH } from "../../../../jest.setup";
import { buildUrl } from "@/app/tm/utils";
import { SearchParams } from "@/app/enum/search-params.enum";
import { usePathname, useSearchParams } from "next/navigation";
import { Status } from "@/app/enum/status.enum";
import { FilterDropDown } from "./filter-dropdown";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

describe("FilterDropdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should route to goal list with search params", async () => {
    (usePathname as jest.Mock).mockImplementation(() => WebUrl.GoalList);
    (useSearchParams as jest.Mock).mockImplementation(
      () => new URLSearchParams("?status=ToDo&tag=FE"),
    );
    render(
      <ThemeProvider>
        <FilterDropDown
          filterOptions={[
            {
              label: "Status",
              searchParamKey: SearchParams.Status,
              options: Object.values(Status),
            },
            {
              label: "Tag",
              searchParamKey: SearchParams.Tag,
              options: ["FE", "BE", "Fullstack"],
            },
          ]}
          value={{
            [SearchParams.Status]: [],
            [SearchParams.Tag]: [],
            [SearchParams.Search]: [],
            [SearchParams.StartDate]: [],
            [SearchParams.EndDate]: [],
          }}
        />
      </ThemeProvider>,
    );
    const filterTrigger = screen.getByTestId("filter-dropdown-trigger");
    await userEvent.click(filterTrigger);
    const statusCheckbox = screen.getByRole("checkbox", {
      name: Status.ToDo,
    });
    await userEvent.click(statusCheckbox);
    const tagCheckbox = screen.getByRole("checkbox", { name: "FE" });
    await userEvent.click(tagCheckbox);
    const applyButton = screen.getByRole("button", { name: /filter/i });
    await userEvent.click(applyButton);

    await waitFor(() => {
      expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(
        buildUrl(WebUrl.GoalList, undefined, {
          [SearchParams.Search]: "",
          [SearchParams.Status]: [Status.ToDo],
          [SearchParams.StartDate]: undefined,
          [SearchParams.EndDate]: undefined,
          [SearchParams.Tag]: ["FE"],
        }),
      );
    });
  });
});
