import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Daniel Mano' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'daniel@exemplo.com' })
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiProperty({ example: 'senhaSegura123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

