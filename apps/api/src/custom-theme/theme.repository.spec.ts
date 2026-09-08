import { DataSource, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { ThemeRepository } from '../repositories/theme.repository';
import { Theme, ThemeScope } from '../entities/theme.entity';
import { DEFAULT_THEME_CONFIG } from '../types/theme-config.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeTheme = (overrides: Partial<Theme> = {}): Theme =>
  ({
    id: 'theme-1',
    name: 'Test',
    description: null,
    scope: ThemeScope.GLOBAL,
    scopeOwnerId: null,
    parentThemeId: null,
    config: DEFAULT_THEME_CONFIG,
    isDefault: false,
    isActive: true,
    isReadOnly: false,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as Theme);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ThemeRepository', () => {
  let repository: ThemeRepository;
  let dataSource: jest.Mocked<DataSource>;

  const mockQb = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    leftJoinAndMapOne: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue(undefined),
    getMany: jest.fn(),
    getOne: jest.fn(),
  } as unknown as jest.Mocked<SelectQueryBuilder<Theme>>;

  beforeEach(() => {
    const mockManager = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    } as any;

    dataSource = {
      createEntityManager: jest.fn().mockReturnValue(mockManager),
    } as unknown as jest.Mocked<DataSource>;

    repository = new ThemeRepository(dataSource);

    // Stub QueryBuilder methods
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQb as any);
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);
    jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);
    jest.spyOn(repository, 'count').mockResolvedValue(0);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findByScope()', () => {
    it('should query with correct scope filter', async () => {
      (mockQb.getMany as jest.Mock).mockResolvedValue([makeTheme()]);

      const result = await repository.findByScope(ThemeScope.GLOBAL);

      expect(mockQb.where).toHaveBeenCalledWith('theme.scope = :scope', {
        scope: ThemeScope.GLOBAL,
      });
      expect(result).toHaveLength(1);
    });

    it('should apply scopeOwnerId filter when provided', async () => {
      (mockQb.getMany as jest.Mock).mockResolvedValue([]);

      await repository.findByScope(ThemeScope.ORGANIZATION, 'org-123');

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'theme.scopeOwnerId = :scopeOwnerId',
        { scopeOwnerId: 'org-123' },
      );
    });

    it('should order by isDefault DESC then createdAt ASC', async () => {
      (mockQb.getMany as jest.Mock).mockResolvedValue([]);

      await repository.findByScope(ThemeScope.GLOBAL);

      expect(mockQb.orderBy).toHaveBeenCalledWith('theme.isDefault', 'DESC');
      expect(mockQb.addOrderBy).toHaveBeenCalledWith('theme.createdAt', 'ASC');
    });
  });

  describe('findDefaultForScope()', () => {
    it('should query for isDefault=true themes', async () => {
      (mockQb.getOne as jest.Mock).mockResolvedValue(makeTheme({ isDefault: true }));

      const result = await repository.findDefaultForScope(ThemeScope.GLOBAL);

      expect(mockQb.andWhere).toHaveBeenCalledWith('theme.isDefault = true');
      expect(result?.isDefault).toBe(true);
    });

    it('should return null when no default found', async () => {
      (mockQb.getOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findDefaultForScope(ThemeScope.GLOBAL);
      expect(result).toBeNull();
    });
  });

  describe('findActiveById()', () => {
    it('should call findOne with active and non-deleted filter', async () => {
      const theme = makeTheme();
      jest.spyOn(repository, 'findOne').mockResolvedValue(theme);

      const result = await repository.findActiveById('theme-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'theme-1', isActive: true, deletedAt: null },
      });
      expect(result).toEqual(theme);
    });

    it('should return null when theme not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.findActiveById('missing');
      expect(result).toBeNull();
    });
  });

  describe('unsetDefaultForScope()', () => {
    it('should issue update query to clear isDefault flags', async () => {
      await repository.unsetDefaultForScope(ThemeScope.GLOBAL);

      expect(mockQb.set).toHaveBeenCalledWith({ isDefault: false });
      expect(mockQb.execute).toHaveBeenCalled();
    });
  });

  describe('softDelete()', () => {
    it('should set deletedAt, isActive=false and updatedBy', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);

      await repository.softDelete('theme-1', 'actor-id');

      expect(repository.update).toHaveBeenCalledWith(
        'theme-1',
        expect.objectContaining({
          isActive: false,
          updatedBy: 'actor-id',
        }),
      );

      const updateArg = (repository.update as jest.Mock).mock.calls[0][1];
      expect(updateArg.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('countByScope()', () => {
    it('should count active, non-deleted themes in the scope', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(3);

      const result = await repository.countByScope(ThemeScope.GLOBAL);

      expect(repository.count).toHaveBeenCalledWith({
        where: { scope: ThemeScope.GLOBAL, isActive: true, deletedAt: null },
      });
      expect(result).toBe(3);
    });
  });
});
