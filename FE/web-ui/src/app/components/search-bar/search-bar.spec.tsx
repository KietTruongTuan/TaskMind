import { render, screen, waitFor } from "@testing-library/react";
import { SearchBar } from "./search-bar";
import { WebUrl } from "@/app/enum/web-url.enum";
import userEvent from "@testing-library/user-event";
import { MOCK_ROUTER_PUSH } from "../../../../jest.setup";
import { buildUrl } from "@/app/tm/utils";
import { SearchParams } from "@/app/enum/search-params.enum";

describe("Searchbar", () => {
  it("should route to goal list with search params", async () => {
    render(<SearchBar url={WebUrl.GoalList} value="" />);
    const searchBar = screen.getByPlaceholderText("Search");
    await userEvent.type(searchBar, "test");
    
    await waitFor(() => {
      expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(
        buildUrl(WebUrl.GoalList, undefined, {
          [SearchParams.Search]: "test",
          [SearchParams.Status]: undefined,
          [SearchParams.StartDate]: undefined,
          [SearchParams.EndDate]: undefined,
          [SearchParams.Tag]: undefined,
        }),
      );
    });
  });
});
