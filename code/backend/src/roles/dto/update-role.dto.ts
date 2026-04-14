import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

import { StorageScopeDto } from './storage-scope.dto';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'content_editor',
    description: 'Updated unique machine-readable role name.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    example: 'Manage editorial workflows, review drafts, and publish content.',
    description: 'Updated human-readable role description.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({
    example: [
      '4d9a7f1b-bf37-4fba-9d62-f7a57bc27b53',
      '9d84467c-3db1-4224-9d10-dc9d820e90b0',
    ],
    description:
      'Replacement permission UUID list. Send an empty array to clear all permissions.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  permissionIds?: string[];

  @ApiPropertyOptional({
    type: [StorageScopeDto],
    description:
      'Replacement storage subtree scopes. Send an empty array to clear all role storage scopes.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StorageScopeDto)
  storageScopes?: StorageScopeDto[];
}
