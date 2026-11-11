import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Tech Soluções Ltda', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: '(11) 99999-8888', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'contato@techsolucoes.com.br', maxLength: 160 })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({ example: 'Cliente VIP de consultoria' })
  @IsOptional()
  @IsString()
  notes?: string;
}

