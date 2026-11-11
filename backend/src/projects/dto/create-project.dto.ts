import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'UUID do cliente vinculado' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ example: 'Redesign E-commerce', maxLength: 180 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @ApiPropertyOptional({ example: 'Escopo completo de UI/UX e checkout' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.PROPOSAL })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ example: '2026-11-25' })
  @IsDateString()
  deadline: string;

  @ApiProperty({ example: 5000.0, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  chargedAmount: number;

  @ApiPropertyOptional({ example: 1500.0, default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  paidAmount?: number;

  @ApiPropertyOptional({ type: [String], description: 'Lista opcional de títulos de tarefas iniciais' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  initialTasks?: string[];
}

