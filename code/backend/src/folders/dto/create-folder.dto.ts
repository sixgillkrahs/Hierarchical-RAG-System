import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({
    example: 'documents/contracts/2026',
    description: 'Folder-like path that will be normalized by the AI backend.',
  })
  @IsString()
  @IsNotEmpty()
  folder_path!: string;
}
