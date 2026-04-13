import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class DeleteFoldersDto {
  @ApiProperty({
    example: [
      'documents/contracts/2025',
      'documents/contracts/2026',
    ],
    description: 'Folder-like paths that should be deleted recursively.',
  })
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  folder_paths!: string[];
}
