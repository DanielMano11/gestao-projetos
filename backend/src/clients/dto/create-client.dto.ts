import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateClientDto {
  @ApiProperty({ example: 'Tech Soluções Ltda', maxLength: 150 })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: '(11) 99999-8888', maxLength: 30 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'contato@techsolucoes.com.br', maxLength: 160 })
  @IsOptional()
  @Transform(trimLowerCaseString)
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({ example: 'Cliente VIP de consultoria', maxLength: 2000 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
