// Standardized camelCase JSON contract shared with client/src/services/api.ts

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface RegisterUserRequest {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
}

export interface LoginUserRequest {
  email: string;
  password?: string;
}
