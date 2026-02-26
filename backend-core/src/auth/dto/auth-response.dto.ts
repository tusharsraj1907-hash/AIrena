// Using string types instead of enums for SQLite compatibility

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    avatarUrl?: string;
  };
  requiresOtp?: boolean;
  message?: string;
}

