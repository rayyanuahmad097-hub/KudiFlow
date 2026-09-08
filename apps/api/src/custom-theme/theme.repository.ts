import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Theme, ThemeScope } from '../entities/theme.entity';

@Injectable()
export class ThemeRepository extends Repository<Theme> {
  constructor(private readonly dataSource: DataSource) {
    super(Theme, dataSource.createEntityManager());
  }

  async findByScope(scope: ThemeScope, scopeOwnerId?: string): Promise<Theme[]> {
    const qb = this.createQueryBuilder('theme')
      .where('theme.scope = :scope', { scope })
      .andWhere('theme.isActive = true')
      .andWhere('theme.deletedAt IS NULL')
      .orderBy('theme.isDefault', 'DESC')
      .addOrderBy('theme.createdAt', 'ASC');

    if (scopeOwnerId) {
      qb.andWhere('theme.scopeOwnerId = :scopeOwnerId', { scopeOwnerId });
    }

    return qb.getMany();
  }

  async findDefaultForScope(scope: ThemeScope, scopeOwnerId?: string): Promise<Theme | null> {
    const qb = this.createQueryBuilder('theme')
      .where('theme.scope = :scope', { scope })
      .andWhere('theme.isDefault = true')
      .andWhere('theme.isActive = true')
      .andWhere('theme.deletedAt IS NULL');

    if (scopeOwnerId) {
      qb.andWhere('theme.scopeOwnerId = :scopeOwnerId', { scopeOwnerId });
    }

    return qb.getOne();
  }

  async findActiveById(id: string): Promise<Theme | null> {
    return this.findOne({
      where: { id, isActive: true, deletedAt: null },
    });
  }

  async unsetDefaultForScope(scope: ThemeScope, scopeOwnerId?: string): Promise<void> {
    const qb = this.createQueryBuilder()
      .update(Theme)
      .set({ isDefault: false })
      .where('scope = :scope', { scope })
      .andWhere('isDefault = true');

    if (scopeOwnerId) {
      qb.andWhere('scopeOwnerId = :scopeOwnerId', { scopeOwnerId });
    }

    await qb.execute();
  }

  async findWithParent(id: string): Promise<Theme | null> {
    return this.createQueryBuilder('theme')
      .leftJoinAndMapOne(
        'theme.parent',
        Theme,
        'parent',
        'parent.id = theme.parentThemeId',
      )
      .where('theme.id = :id', { id })
      .andWhere('theme.deletedAt IS NULL')
      .getOne();
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    await this.update(id, {
      deletedAt: new Date(),
      isActive: false,
      updatedBy: deletedBy,
    });
  }

  async countByScope(scope: ThemeScope): Promise<number> {
    return this.count({ where: { scope, isActive: true, deletedAt: null } });
  }
}
