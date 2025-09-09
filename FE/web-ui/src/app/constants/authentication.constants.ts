export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RegistrationRequestBody {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponseBody {
  token: string;
  user: {
    name: string;
    email: string;
  };
}
