import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
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

  @ApiProperty({
    example: 'SenhaForte123',
    minLength: 8,
    maxLength: 72,
    description:
      'Mínimo 8 caracteres com pelo menos 1 letra maiúscula, 1 minúscula e 1 número',
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve possuir no mínimo 8 caracteres' })
  @MaxLength(72, { message: 'A senha deve possuir no máximo 72 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'A senha deve conter pelo menos 1 letra minúscula, 1 maiúscula e 1 número',
  })
  password: string;
}
