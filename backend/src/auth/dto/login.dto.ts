import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { trimLowerCaseString } from '../../common/dto/dto-transforms';

export class LoginDto {
  @ApiProperty({ example: 'gestor@exemplo.com' })
  @Transform(trimLowerCaseString)
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiProperty({ example: 'admin123', maxLength: 128 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
