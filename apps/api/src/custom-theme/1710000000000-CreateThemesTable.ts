import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateThemesTable1710000000000 implements MigrationInterface {
  name = 'CreateThemesTable1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "theme_scope_enum" AS ENUM ('global', 'organization', 'user')`);

    await queryRunner.createTable(
      new Table({
        name: 'themes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'description', type: 'varchar', length: '500', isNullable: true },
          {
            name: 'scope',
            type: 'enum',
            enumName: 'theme_scope_enum',
            default: "'global'",
          },
          { name: 'scope_owner_id', type: 'uuid', isNullable: true },
          { name: 'config', type: 'jsonb', isNullable: false },
          { name: 'is_default', type: 'boolean', default: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'is_read_only', type: 'boolean', default: false },
          { name: 'parent_theme_id', type: 'uuid', isNullable: true },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'themes',
      new TableIndex({
        name: 'IDX_themes_scope_is_default',
        columnNames: ['scope', 'is_default'],
      }),
    );

    await queryRunner.createIndex(
      'themes',
      new TableIndex({
        name: 'UQ_themes_name_scope',
        columnNames: ['name', 'scope'],
        isUnique: true,
        where: 'deleted_at IS NULL',
      }),
    );

    await queryRunner.createIndex(
      'themes',
      new TableIndex({
        name: 'IDX_themes_is_active_deleted',
        columnNames: ['is_active', 'deleted_at'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('themes', true, true, true);
    await queryRunner.query(`DROP TYPE IF EXISTS "theme_scope_enum"`);
  }
}
