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
    super(process.env.NEXT_PUBLIC_API_BASE_URL);
  }

  async login(data: LoginRequestBody) {
    const res = await this.post<LoginResponseBody, LoginRequestBody>(
      ApiUrl.Login,
      data
    );
    if (res.access) {
      this.setAccessToken(res.access);
    }
    return res;
  }

  async register(data: RegistrationRequestBody) {
    return this.post<RegistrationResponseBody, RegistrationRequestBody>(
      ApiUrl.Register,
      data
    );
  }

  async refresh(refreshToken?: string) {
    const headers: Record<string, string> = {};
    if (refreshToken) {
      headers["Cookie"] = `refresh_token=${refreshToken}`;
    }
    const res = await this.post<RefreshTokenResponseBody>(
      ApiUrl.RefreshToken,
      undefined,
      {
        headers,
        withCredentials: !refreshToken,
      }
    );
    if (res.access) {
      this.setAccessToken(res.access);
    }
    return res;
  }

  async logout() {
    this.clearAccessToken();
    return this.post<undefined>(ApiUrl.LogOut);
  }
}
