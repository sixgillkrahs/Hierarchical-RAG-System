import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'documents' })
@Index('IDX_documents_folder_path', ['folderPath'])
@Index('IDX_documents_created_at', ['createdAt'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'folder_path', type: 'text', nullable: true })
  folderPath!: string | null;

  @Column({ name: 'original_filename', type: 'text' })
  originalFilename!: string;

  @Column({ name: 'object_name', type: 'text', unique: true })
  objectName!: string;

  @Column({ length: 255 })
  bucket!: string;

  @Column({
    name: 'content_type',
    length: 255,
    default: 'application/octet-stream',
  })
  contentType!: string;

  @Column({ type: 'integer' })
  size!: number;

  @Column({ type: 'text' })
  url!: string;

  @Column({ name: 'uploaded_by_user_id', type: 'uuid', nullable: true })
  uploadedByUserId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
