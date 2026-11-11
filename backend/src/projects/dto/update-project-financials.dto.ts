import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  MAX_MONETARY_AMOUNT,
  trimString,
} from '../../common/dto/dto-transforms';

export class UpdateProjectFinancialsDto {
  @ApiProperty({ example: 5000.0, minimum: 0, maximum: MAX_MONETARY_AMOUNT })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_MONETARY_AMOUNT)
  chargedAmount: number;

  @ApiProperty({ example: 2500.0, minimum: 0, maximum: MAX_MONETARY_AMOUNT })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_MONETARY_AMOUNT)
  paidAmount: number;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 1500.0, minimum: 0.01, maximum: MAX_MONETARY_AMOUNT })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(MAX_MONETARY_AMOUNT)
  amount: number;

  @ApiPropertyOptional({ example: '2026-11-11' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ example: 'Parcela 1 - Entrada', maxLength: 200 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  note?: string;
}
