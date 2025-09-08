import {
  AuthResponseBody,
  LoginRequestBody,
  RegistrationRequestBody,
} from "@/app/constants";
import { HttpService } from "../http-service/http-service";

export class AuthenticationService extends HttpService {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_URL);
  }

  async login(data: LoginRequestBody) {
    return this.post<AuthResponseBody, LoginRequestBody>("/auth/login", data);
  }

  async register(data: RegistrationRequestBody) {
    return this.post<AuthResponseBody, RegistrationRequestBody>(
      "/auth/register",
      data
    );
  }
}
