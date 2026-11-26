// Standardized camelCase JSON contract matching server/src/types/user.ts
// Always use relative '/api/...' URLs so Vite (dev) and Nginx (Ubuntu) proxy seamlessly.

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

export async function checkApiHealth(): Promise<{ status: string; db: string }> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error('Backend health check failed');
  }
  return res.json() as Promise<{ status: string; db: string }>;
}

export async function registerUser(_payload: RegisterUserRequest): Promise<UserDto> {
  // TODO (Pair D - Integration):
  // 1. Send POST '/api/users' with JSON headers and `JSON.stringify(_payload)`
  // 2. If `!res.ok`, parse the server's error message and throw `new Error(...)`
  // 3. Return parsed `UserDto`
  throw new Error('TODO: Implement registerUser -> POST /api/users');
}

export async function loginUser(_payload: LoginUserRequest): Promise<UserDto> {
  // TODO (Pair D - Integration):
  // 1. Send POST '/api/users/login' with JSON headers and `JSON.stringify(_payload)`
  // 2. If `!res.ok`, parse the server's error message and throw `new Error(...)`
  // 3. Return parsed `UserDto`
  throw new Error('TODO: Implement loginUser -> POST /api/users/login');
}
