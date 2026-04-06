import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryRagDto {
  @ApiProperty({
    example: 'How does hierarchical retrieval improve response quality?',
  })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'How many candidate chunks should be considered.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  topK?: number;

  @ApiPropertyOptional({
    type: [String],
    example: [
      'Parent chunk about ingestion.',
      'Child chunk about reranking.',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contextWindow?: string[];

  @ApiPropertyOptional({
    example: {
      tenantId: 'demo',
      source: 'knowledge-base',
    },
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, boolean | number | string>;
}

