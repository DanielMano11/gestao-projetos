import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  MAX_MONETARY_AMOUNT,
  trimString,
  trimStringArray,
} from '../../common/dto/dto-transforms';

export class CreateProjectDto {
  @ApiProperty({ description: 'UUID do cliente vinculado' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ example: 'Redesign E-commerce', maxLength: 180 })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @ApiPropertyOptional({
    example: 'Escopo completo de UI/UX e checkout',
    maxLength: 5000,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.PROPOSAL })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ example: '2026-11-25' })
  @IsDateString()
  deadline: string;

  @ApiProperty({ example: 5000.0, minimum: 0, maximum: MAX_MONETARY_AMOUNT })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_MONETARY_AMOUNT)
  chargedAmount: number;

  @ApiPropertyOptional({
    example: 1500.0,
    default: 0,
    minimum: 0,
    maximum: MAX_MONETARY_AMOUNT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_MONETARY_AMOUNT)
  paidAmount?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Lista opcional de títulos de tarefas iniciais (máx. 100 itens)',
  })
  @IsOptional()
  @Transform(trimStringArray)
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(200, { each: true })
  initialTasks?: string[];
}
