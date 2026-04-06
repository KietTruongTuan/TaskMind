import { render, screen, waitFor } from "@testing-library/react";
import { SearchBar } from "./search-bar";
import { WebUrl } from "@/app/enum/web-url.enum";
import userEvent from "@testing-library/user-event";
import { MOCK_ROUTER_PUSH } from "../../../../jest.setup";
import { buildUrl } from "@/app/tm/utils";
import { SearchParams } from "@/app/enum/search-params.enum";
import { usePathname, useSearchParams } from "next/navigation";
import { Status } from "@/app/enum/status.enum";

describe("Searchbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should route to goal list with search params", async () => {
    (usePathname as jest.Mock).mockImplementation(() => WebUrl.GoalList);
    (useSearchParams as jest.Mock).mockImplementation(
      () => new URLSearchParams("?status=ToDo&tag=FE"),
    );
    render(<SearchBar value="" />);
    const searchBar = screen.getByPlaceholderText("Search");
    await userEvent.type(searchBar, "test");

    await waitFor(() => {
      expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(
        buildUrl(WebUrl.GoalList, undefined, {
          [SearchParams.Search]: "test",
          [SearchParams.Status]: [Status.ToDo],
          [SearchParams.StartDate]: undefined,
          [SearchParams.EndDate]: undefined,
          [SearchParams.Tag]: ["FE"],
          [SearchParams.Year]: undefined,
        }),
      );
    });
  });
});
