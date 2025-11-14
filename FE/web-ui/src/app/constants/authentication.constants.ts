export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RegistrationRequestBody {
  username: string;
  email: string;
  password: string;
}

export interface RegistrationResponseBody {
  message: string;
}

export interface LoginResponseBody {
  message: string;
  access: string;
}

export interface RefreshTokenResponseBody {
  access: string;
}
