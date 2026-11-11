import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  trimLowerCaseString,
  trimString,
} from '../../common/dto/dto-transforms';

export class UpdateClientDto {
  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ maxLength: 30 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @Transform(trimLowerCaseString)
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
