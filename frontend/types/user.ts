export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserRegistrationRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
}

export type Role = "USER" | "VENUE" | "ADMIN";
