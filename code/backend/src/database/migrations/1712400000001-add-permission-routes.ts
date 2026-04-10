import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPermissionRoutes1712400000001 implements MigrationInterface {
  name = 'AddPermissionRoutes1712400000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "permissions"
      ADD COLUMN "route" character varying(255)
    `);

    await queryRunner.query(`
      UPDATE "permissions"
      SET "route" = CASE
        WHEN "code" IN ('users.read', 'users.manage') THEN '/users'
        WHEN "code" IN ('roles.read', 'roles.manage') THEN '/roles'
        WHEN "code" IN ('permissions.read', 'permissions.manage') THEN '/permissions'
        WHEN "code" IN ('storage.read', 'storage.manage') THEN '/storage'
        WHEN "code" IN ('rag.read', 'rag.query') THEN '/rag'
        WHEN "code" = 'system.read' THEN '/'
        ELSE '/'
      END
    `);

    await queryRunner.query(`
      ALTER TABLE "permissions"
      ALTER COLUMN "route" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "permissions"
      DROP COLUMN "route"
    `);
  }
}
