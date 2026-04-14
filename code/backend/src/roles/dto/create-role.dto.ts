import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { StorageScopeDto } from './storage-scope.dto';

export class CreateRoleDto {
  @ApiProperty({
    example: 'content_editor',
    description: 'Unique machine-readable role name.',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Manage editorial workflows and publish content.',
    description: 'Human-readable role description.',
  })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    example: [
      '4d9a7f1b-bf37-4fba-9d62-f7a57bc27b53',
      '9d84467c-3db1-4224-9d10-dc9d820e90b0',
    ],
    description: 'Permission UUIDs assigned to the role.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  permissionIds?: string[];

  @ApiPropertyOptional({
    type: [StorageScopeDto],
    description: 'Optional storage subtree scopes assigned to the role.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StorageScopeDto)
  storageScopes?: StorageScopeDto[];
}
