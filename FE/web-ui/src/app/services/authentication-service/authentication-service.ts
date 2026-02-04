import {
  LoginRequestBody,
  LoginResponseBody,
  RefreshTokenResponseBody,
  RegistrationRequestBody,
  RegistrationResponseBody,
} from "@/app/constants";
import { HttpService } from "../http-service/http-service";
import { ApiUrl } from "@/app/enum/api-url.enum";
import { AxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _isRefresh?: boolean;
}

export class AuthenticationService extends HttpService {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_BASE_URL);
  }

  async login(data: LoginRequestBody) {
    const res = await this.post<LoginResponseBody, LoginRequestBody>(
      ApiUrl.Login,
      data,
    );
    if (res.access) {
      this.setAccessToken(res.access);
    }
    return res;
  }

  async register(data: RegistrationRequestBody) {
    return this.post<RegistrationResponseBody, RegistrationRequestBody>(
      ApiUrl.Register,
      data,
    );
  }

  async refresh(options?: { noRotation?: boolean }) {
    const url = options?.noRotation
      ? `${ApiUrl.RefreshToken}?no_rotation=true`
      : ApiUrl.RefreshToken;
    const res = await this.refreshInstance.post<RefreshTokenResponseBody>(
      url,
      undefined,
      {
        withCredentials: true,
        _isRefresh: true,
      } as CustomAxiosRequestConfig,
    );
    return res;
  }

  async logout() {
    this.clearAccessToken();
    return this.post<RegistrationResponseBody>(ApiUrl.LogOut);
  }
}
