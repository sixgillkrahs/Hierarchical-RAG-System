import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleStorageScopes1712400000003
  implements MigrationInterface
{
  name = 'CreateRoleStorageScopes1712400000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "role_storage_scopes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "role_id" uuid NOT NULL,
        "path_prefix" text NOT NULL DEFAULT '',
        "capability" character varying(20) NOT NULL,
        "inherit_children" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_role_storage_scopes_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_role_storage_scopes_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_role_storage_scopes_role_id" ON "role_storage_scopes" ("role_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_role_storage_scopes_path_prefix" ON "role_storage_scopes" ("path_prefix")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_role_storage_scopes_role_prefix_capability" ON "role_storage_scopes" ("role_id", "path_prefix", "capability")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "UQ_role_storage_scopes_role_prefix_capability"',
    );
    await queryRunner.query('DROP INDEX "IDX_role_storage_scopes_path_prefix"');
    await queryRunner.query('DROP INDEX "IDX_role_storage_scopes_role_id"');
    await queryRunner.query('DROP TABLE "role_storage_scopes"');
  }
}
