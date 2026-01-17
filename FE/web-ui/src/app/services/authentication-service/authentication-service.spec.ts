import {
  MOCK_LOGIN_REQUEST_DATA,
  MOCK_LOGIN_RESPONSE_DATA,
  MOCK_REGISTER_REQUEST_DATA,
  MOCK_REGISTER_RESPONSE_DATA,
} from "@/app/constants";
import { ApiUrl } from "@/app/enum/api-url.enum";
import { AuthenticationService } from "./authentication-service";

describe("AuthenticationService", () => {
  let authenticationService: AuthenticationService;

  beforeEach(() => {
    jest.clearAllMocks();
    authenticationService = new AuthenticationService();
  });

  it("should call login with the correct URL and data", async () => {
    const postSpy = jest
      .spyOn(AuthenticationService.prototype, "post")
      .mockResolvedValue(MOCK_LOGIN_RESPONSE_DATA);

    const result = await authenticationService.login(MOCK_LOGIN_REQUEST_DATA);
    expect(postSpy).toHaveBeenCalledWith(
      ApiUrl.Login,
      MOCK_LOGIN_REQUEST_DATA
    );

    expect(result).toEqual(MOCK_LOGIN_RESPONSE_DATA);
  });

  it("should call register with the correct URL and data", async () => {
    const postSpy = jest
      .spyOn(AuthenticationService.prototype, "post")
      .mockResolvedValue(MOCK_REGISTER_RESPONSE_DATA);

    const result = await authenticationService.register(MOCK_REGISTER_REQUEST_DATA);
    expect(postSpy).toHaveBeenCalledWith(
      ApiUrl.Register,
      MOCK_REGISTER_REQUEST_DATA
    );

    expect(result).toEqual(MOCK_REGISTER_RESPONSE_DATA);
  });
});
