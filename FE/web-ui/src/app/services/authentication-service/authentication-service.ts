import {
  LoginRequestBody,
  LoginResponseBody,
  RefreshTokenResponseBody,
  RegistrationRequestBody,
  RegistrationResponseBody,
} from "@/app/constants";
import { HttpService } from "../http-service/http-service";
import { ApiUrl } from "@/app/enum/api-url.enum";

export class AuthenticationService extends HttpService {
  constructor() {
    super();
  }

  async login(data: LoginRequestBody) {
    const res = await this.post<LoginResponseBody, LoginRequestBody>(
      ApiUrl.LocalLogin,
      data,
    );
    if (res.access) {
      this.setAccessToken(res.access);
    }
    return res;
  }

  async register(data: RegistrationRequestBody) {
    return this.post<RegistrationResponseBody, RegistrationRequestBody>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${ApiUrl.Register}`,
      data,
    );
  }

  async refresh(options?: { noRotation?: boolean }) {
    const url = options?.noRotation
      ? `${ApiUrl.LocalRefreshToken}?no_rotation=true`
      : ApiUrl.LocalRefreshToken;
    const res = await this.refreshInstance.post<RefreshTokenResponseBody>(url);
    return res;
  }

  async logout() {
    this.clearAccessToken();
    return this.post(ApiUrl.LocalLogOut);
  }
}
