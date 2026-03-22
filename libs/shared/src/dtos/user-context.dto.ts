export class UserContextDto {
  sub!: string;
  email!: string;
}

export interface AuthenticatedRequest {
  user?: UserContextDto;
}
