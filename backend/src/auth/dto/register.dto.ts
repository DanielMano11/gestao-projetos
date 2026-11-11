import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  trimLowerCaseString,
  trimString,
} from '../../common/dto/dto-transforms';

export class RegisterDto {
  @ApiProperty({ example: 'Daniel Mano' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'daniel@exemplo.com' })
  @Transform(trimLowerCaseString)
  @IsEmail()
  @MaxLength(160)
  email: string;

  @ApiProperty({ example: 'senhaSegura123', minLength: 6, maxLength: 128 })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}
