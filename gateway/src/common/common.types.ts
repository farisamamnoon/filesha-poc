export interface JwtUser {
  userId: string;
  email: string;
}

export interface UserData {
  id: string;
  email: string;
}

export interface Response<T> {
  statusCode: number;
  data: T;
  error?: string;
  message?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  success: boolean;
  error?: string;
  message?: string;
}
