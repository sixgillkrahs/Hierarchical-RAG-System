import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFolderDto {
  @ApiProperty({
    example: 'documents/contracts/2026',
    description: 'Folder-like path that should be deleted recursively.',
  })
  @IsString()
  @IsNotEmpty()
  folder_path!: string;
}
