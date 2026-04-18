import { cookies } from "next/headers";
import { useServerSideService } from "./useServerSideService"; // Update with actual path
import {
  aiService,
  authenticationService,
  goalService,
  knowledgeBaseService,
  taskService,
} from "../../constants";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("../../constants", () => ({
  aiService: {
    setAccessToken: jest.fn(),
  },
  goalService: {
    setAccessToken: jest.fn(),
  },
  taskService: {
    setAccessToken: jest.fn(),
  },
  knowledgeBaseService: {
    setAccessToken: jest.fn(),
  },
  authenticationService: {
    refresh: jest.fn(),
    refreshInstance: {
      defaults: {
        headers: {
          common: {},
        },
      },
    },
  },
}));

describe("useServerSideService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    authenticationService["refreshInstance"].defaults.headers.common = {};
  });

  it("should retrieve cookie, refresh token, and set access token on services", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: "mock_refresh_token" }),
    };
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);

    const mockRefreshResponse = { data: { access: "new_mock_access_token" } };
    (authenticationService.refresh as jest.Mock).mockResolvedValue(
      mockRefreshResponse,
    );

    const result = await useServerSideService();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("refresh_token");

    expect(
      authenticationService["refreshInstance"].defaults.headers.common[
        "Cookie"
      ],
    ).toBe("refresh_token=mock_refresh_token");

    expect(authenticationService.refresh).toHaveBeenCalled();

    expect(goalService.setAccessToken).toHaveBeenCalledWith(
      "new_mock_access_token",
    );
    expect(aiService.setAccessToken).toHaveBeenCalledWith(
      "new_mock_access_token",
    );
    expect(taskService.setAccessToken).toHaveBeenCalledWith(
      "new_mock_access_token",
    );

    expect(result).toEqual({
      goalService,
      aiService,
      taskService,
      knowledgeBaseService,
      accessToken: "new_mock_access_token",
    });
  });

  it("should handle missing access token without calling setAccessToken", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue(undefined),
    };
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);

    const mockRefreshResponse = { data: {} };
    (authenticationService.refresh as jest.Mock).mockResolvedValue(
      mockRefreshResponse,
    );

    const result = await useServerSideService();

    expect(
      authenticationService["refreshInstance"].defaults.headers.common[
        "Cookie"
      ],
    ).toBe("refresh_token=undefined");

    expect(goalService.setAccessToken).not.toHaveBeenCalled();
    expect(aiService.setAccessToken).not.toHaveBeenCalled();
    expect(taskService.setAccessToken).not.toHaveBeenCalled();
    expect(knowledgeBaseService.setAccessToken).not.toHaveBeenCalled();
    expect(result.accessToken).toBeUndefined();
  });
});
