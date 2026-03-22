import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty()
  email!: string;
}
