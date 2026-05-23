import {
  LoginRequestBody,
  LoginResponseBody,
  RefreshTokenResponseBody,
  RegistrationRequestBody,
  RegistrationResponseBody,
  UserProfile,
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

  async getProfile() {
    return this.get<UserProfile>(ApiUrl.Me);
  }

  async logout() {
    this.clearAccessToken();
    return this.post(ApiUrl.LogOut);
  }

  async toggleLocalKnowledgeBase() {
    return this.post(ApiUrl.ToggleLocalKnowledgeBase);
  }

  async toggleGlobalKnowledgeBase() {
    return this.post(ApiUrl.ToggleGlobalKnowledgeBase);
  }
}
