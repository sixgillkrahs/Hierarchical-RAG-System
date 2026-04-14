import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class StorageScopeDto {
  @ApiPropertyOptional({
    example: 'cto/contracts',
    description: 'Folder path prefix. Leave empty for root-wide scope.',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value : ''))
  pathPrefix?: string;

  @ApiProperty({
    example: 'manage',
    enum: ['read', 'manage'],
  })
  @IsIn(['read', 'manage'])
  capability!: 'read' | 'manage';

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the scope applies to descendant folders.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  inheritChildren?: boolean;
}
