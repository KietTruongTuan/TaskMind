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
    console.log("data", data);
    console.log("url", process.env.NEXT_PUBLIC_API_BASE_URL);
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

  async refresh() {
    const res = await this.refreshInstance.post<RefreshTokenResponseBody>(
      ApiUrl.RefreshToken,
    );
    return res;
  }

  async logout() {
    this.clearAccessToken();
    return this.post(ApiUrl.LogOut);
  }
}
