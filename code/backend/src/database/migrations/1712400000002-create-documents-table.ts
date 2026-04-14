import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentsTable1712400000002 implements MigrationInterface {
  name = 'CreateDocumentsTable1712400000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "folder_path" text,
        "original_filename" text NOT NULL,
        "object_name" text NOT NULL,
        "bucket" character varying(255) NOT NULL,
        "content_type" character varying(255) NOT NULL DEFAULT 'application/octet-stream',
        "size" integer NOT NULL,
        "url" text NOT NULL,
        "uploaded_by_user_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_documents_object_name" UNIQUE ("object_name"),
        CONSTRAINT "FK_documents_uploaded_by_user" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_documents_folder_path" ON "documents" ("folder_path")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_documents_created_at" ON "documents" ("created_at")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_documents_uploaded_by_user_id" ON "documents" ("uploaded_by_user_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_documents_uploaded_by_user_id"');
    await queryRunner.query('DROP INDEX "IDX_documents_created_at"');
    await queryRunner.query('DROP INDEX "IDX_documents_folder_path"');
    await queryRunner.query('DROP TABLE "documents"');
  }
}
