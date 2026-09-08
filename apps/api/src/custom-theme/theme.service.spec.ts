import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ThemeScope } from '../entities/theme.entity';
import { ThemeRepository } from '../repositories/theme.repository';
import { ThemeService } from '../theme.service';
import { DEFAULT_THEME_CONFIG } from '../types/theme-config.types';
import {
  CreateThemeDto,
  ThemeOverrideDto,
  UpdateThemeDto,
} from '../dto/theme.dto';

// ─── Mock factory ─────────────────────────────────────────────────────────────

const makeTheme = (overrides: Partial<any> = {}) => ({
  id: 'theme-uuid-1',
  name: 'Test Theme',
  description: 'A test theme',
  scope: ThemeScope.GLOBAL,
  scopeOwnerId: null,
  parentThemeId: null,
  config: { ...DEFAULT_THEME_CONFIG },
  isDefault: false,
  isActive: true,
  isReadOnly: false,
  createdBy: null,
  updatedBy: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
  ...overrides,
});

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findActiveById: jest.fn(),
  findByScope: jest.fn(),
  findDefaultForScope: jest.fn(),
  unsetDefaultForScope: jest.fn(),
  softDelete: jest.fn(),
  findWithParent: jest.fn(),
  countByScope: jest.fn(),
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ThemeService', () => {
  let service: ThemeService;
  let repository: jest.Mocked<ReturnType<typeof mockRepository>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemeService,
        {
          provide: ThemeRepository,
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ThemeService>(ThemeService);
    repository = module.get(ThemeRepository);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create a theme with default config when no config provided', async () => {
      const dto: CreateThemeDto = { name: 'My Theme' };
      const saved = makeTheme({ name: 'My Theme' });

      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      const result = await service.create(dto, 'actor-id');

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My Theme', scope: ThemeScope.GLOBAL }),
      );
      expect(result.name).toBe('My Theme');
      expect(result.id).toBe('theme-uuid-1');
    });

    it('should deep-merge supplied config onto defaults', async () => {
      const dto: CreateThemeDto = {
        name: 'Custom',
        config: { colors: { primary: '#FF0000' } } as any,
      };
      const saved = makeTheme({ name: 'Custom' });
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      await service.create(dto);

      const createCall = repository.create.mock.calls[0][0];
      expect(createCall.config.colors.primary).toBe('#FF0000');
      // Other defaults preserved
      expect(createCall.config.colors.secondary).toBe(DEFAULT_THEME_CONFIG.colors.secondary);
    });

    it('should call unsetDefaultForScope when isDefault=true', async () => {
      const dto: CreateThemeDto = { name: 'Default Theme', isDefault: true };
      const saved = makeTheme({ isDefault: true });
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      await service.create(dto);

      expect(repository.unsetDefaultForScope).toHaveBeenCalledWith(
        ThemeScope.GLOBAL,
        undefined,
      );
    });

    it('should inherit parent config when parentThemeId provided', async () => {
      const parentTheme = makeTheme({
        id: 'parent-id',
        config: {
          ...DEFAULT_THEME_CONFIG,
          colors: { ...DEFAULT_THEME_CONFIG.colors, primary: '#PARENT' },
        },
      });

      repository.findActiveById.mockResolvedValue(parentTheme);
      repository.create.mockReturnValue(makeTheme());
      repository.save.mockResolvedValue(makeTheme());

      await service.create({ name: 'Child', parentThemeId: 'parent-id' });

      const createCall = repository.create.mock.calls[0][0];
      expect(createCall.config.colors.primary).toBe('#PARENT');
    });

    it('should throw NotFoundException if parent theme not found', async () => {
      repository.findActiveById.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Child', parentThemeId: 'missing-id' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for org-scope without scopeOwnerId', async () => {
      await expect(
        service.create({ name: 'Org Theme', scope: ThemeScope.ORGANIZATION }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException on unique name violation (pg code 23505)', async () => {
      repository.create.mockReturnValue(makeTheme());
      repository.save.mockRejectedValue({ code: '23505' });

      await expect(service.create({ name: 'Duplicate' })).rejects.toThrow(ConflictException);
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should return mapped theme DTOs', async () => {
      const themes = [makeTheme(), makeTheme({ id: 'theme-2', name: 'Second' })];
      repository.findByScope.mockResolvedValue(themes);

      const result = await service.findAll({ scope: ThemeScope.GLOBAL });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('theme-uuid-1');
      expect(result[1].id).toBe('theme-2');
    });

    it('should filter by isDefault when specified', async () => {
      const themes = [
        makeTheme({ isDefault: true }),
        makeTheme({ id: 'theme-2', isDefault: false }),
      ];
      repository.findByScope.mockResolvedValue(themes);

      const result = await service.findAll({ isDefault: true });
      expect(result).toHaveLength(1);
      expect(result[0].isDefault).toBe(true);
    });

    it('should return empty array when no themes found', async () => {
      repository.findByScope.mockResolvedValue([]);
      const result = await service.findAll({});
      expect(result).toHaveLength(0);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a theme DTO by id', async () => {
      repository.findActiveById.mockResolvedValue(makeTheme());
      const result = await service.findOne('theme-uuid-1');
      expect(result.id).toBe('theme-uuid-1');
    });

    it('should throw NotFoundException when theme not found', async () => {
      repository.findActiveById.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('should update name and description', async () => {
      const existing = makeTheme();
      const updated = makeTheme({ name: 'Updated Name', description: 'New desc' });
      repository.findActiveById.mockResolvedValue(existing);
      repository.save.mockResolvedValue(updated);

      const result = await service.update('theme-uuid-1', {
        name: 'Updated Name',
        description: 'New desc',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should deep-merge config patch onto existing config', async () => {
      const existing = makeTheme();
      repository.findActiveById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (t) => t);

      await service.update('theme-uuid-1', {
        config: { colors: { primary: '#PATCHED' } } as any,
      });

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            colors: expect.objectContaining({ primary: '#PATCHED' }),
          }),
        }),
      );
    });

    it('should call unsetDefaultForScope when promoting to default', async () => {
      const existing = makeTheme({ isDefault: false });
      repository.findActiveById.mockResolvedValue(existing);
      repository.save.mockResolvedValue(makeTheme({ isDefault: true }));

      await service.update('theme-uuid-1', { isDefault: true });

      expect(repository.unsetDefaultForScope).toHaveBeenCalled();
    });

    it('should throw NotFoundException when theme not found', async () => {
      repository.findActiveById.mockResolvedValue(null);
      await expect(service.update('missing', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for read-only themes', async () => {
      repository.findActiveById.mockResolvedValue(makeTheme({ isReadOnly: true }));
      await expect(service.update('theme-uuid-1', { name: 'Hack' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should soft-delete a non-default theme', async () => {
      repository.findActiveById.mockResolvedValue(makeTheme({ isDefault: false }));

      await service.remove('theme-uuid-1', 'actor');
      expect(repository.softDelete).toHaveBeenCalledWith('theme-uuid-1', 'actor');
    });

    it('should throw NotFoundException when theme not found', async () => {
      repository.findActiveById.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when deleting read-only theme', async () => {
      repository.findActiveById.mockResolvedValue(makeTheme({ isReadOnly: true }));
      await expect(service.remove('theme-uuid-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when deleting the default theme', async () => {
      repository.findActiveById.mockResolvedValue(makeTheme({ isDefault: true }));
      await expect(service.remove('theme-uuid-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── applyOverride ────────────────────────────────────────────────────────

  describe('applyOverride()', () => {
    it('should merge override into existing config', async () => {
      const existing = makeTheme();
      repository.findActiveById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (t) => t);

      const dto: ThemeOverrideDto = {
        overrides: { colors: { primary: '#OVERRIDE' } } as any,
      };
      const result = await service.applyOverride('theme-uuid-1', dto);

      expect(result.config.colors.primary).toBe('#OVERRIDE');
      // Other values intact
      expect(result.config.colors.secondary).toBe(DEFAULT_THEME_CONFIG.colors.secondary);
    });

    it('should throw NotFoundException when theme not found', async () => {
      repository.findActiveById.mockResolvedValue(null);
      await expect(
        service.applyOverride('missing', { overrides: {} as any }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for read-only themes', async () => {
      repository.findActiveById.mockResolvedValue(makeTheme({ isReadOnly: true }));
      await expect(
        service.applyOverride('theme-uuid-1', { overrides: {} as any }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── resetToDefault ───────────────────────────────────────────────────────

  describe('resetToDefault()', () => {
    it('should reset config to DEFAULT_THEME_CONFIG when no parent', async () => {
      const existing = makeTheme({
        config: {
          ...DEFAULT_THEME_CONFIG,
          colors: { ...DEFAULT_THEME_CONFIG.colors, primary: '#CUSTOM' },
        },
      });
      repository.findActiveById.mockResolvedValue(existing);
      repository.save.mockImplementation(async (t) => t);

      const result = await service.resetToDefault('theme-uuid-1');
      expect(result.config.colors.primary).toBe(DEFAULT_THEME_CONFIG.colors.primary);
    });

    it('should reset to parent config when parentThemeId set', async () => {
      const parentConfig = {
        ...DEFAULT_THEME_CONFIG,
        colors: { ...DEFAULT_THEME_CONFIG.colors, primary: '#PARENT' },
      };
      const existing = makeTheme({ parentThemeId: 'parent-id' });
      const parent = makeTheme({ id: 'parent-id', config: parentConfig });

      repository.findActiveById
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(parent);
      repository.save.mockImplementation(async (t) => t);

      const result = await service.resetToDefault('theme-uuid-1');
      expect(result.config.colors.primary).toBe('#PARENT');
    });
  });

  // ─── getCssVariables ──────────────────────────────────────────────────────

  describe('getCssVariables()', () => {
    it('should return CSS variables map and string', async () => {
      repository.findActiveById.mockResolvedValue(makeTheme());

      const result = await service.getCssVariables('theme-uuid-1');

      expect(result.cssVariables).toContain(':root {');
      expect(result.variables).toBeDefined();
      expect(typeof result.variables).toBe('object');
    });

    it('should include darkVariables when dark mode enabled', async () => {
      const theme = makeTheme({
        config: {
          ...DEFAULT_THEME_CONFIG,
          darkModeEnabled: true,
          darkModeColors: { background: '#000' },
        },
      });
      repository.findActiveById.mockResolvedValue(theme);

      const result = await service.getCssVariables('theme-uuid-1');
      expect(result.darkVariables).toBeDefined();
      expect(result.darkVariables!['--color-background']).toBe('#000');
    });

    it('should throw NotFoundException when theme not found', async () => {
      repository.findActiveById.mockResolvedValue(null);
      await expect(service.getCssVariables('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getDefaultTheme ──────────────────────────────────────────────────────

  describe('getDefaultTheme()', () => {
    it('should return default theme when found', async () => {
      const defaultTheme = makeTheme({ isDefault: true });
      repository.findDefaultForScope.mockResolvedValue(defaultTheme);

      const result = await service.getDefaultTheme(ThemeScope.GLOBAL);
      expect(result.isDefault).toBe(true);
    });

    it('should fallback to first active theme when no default set', async () => {
      const fallback = makeTheme({ isDefault: false });
      repository.findDefaultForScope.mockResolvedValue(null);
      repository.findByScope.mockResolvedValue([fallback]);

      const result = await service.getDefaultTheme(ThemeScope.GLOBAL);
      expect(result.id).toBe(fallback.id);
    });

    it('should return virtual default when no themes exist', async () => {
      repository.findDefaultForScope.mockResolvedValue(null);
      repository.findByScope.mockResolvedValue([]);

      const result = await service.getDefaultTheme(ThemeScope.GLOBAL);
      expect(result.id).toBe('default');
      expect(result.isReadOnly).toBe(true);
    });
  });

  // ─── clone ────────────────────────────────────────────────────────────────

  describe('clone()', () => {
    it('should create a new theme based on source config', async () => {
      const source = makeTheme({ name: 'Original' });
      const cloned = makeTheme({ id: 'clone-id', name: 'Clone' });

      repository.findActiveById.mockResolvedValueOnce(source);
      repository.create.mockReturnValue(cloned);
      repository.save.mockResolvedValue(cloned);

      const result = await service.clone('theme-uuid-1', 'Clone');
      expect(result.id).toBe('clone-id');
    });

    it('should throw NotFoundException when source theme not found', async () => {
      repository.findActiveById.mockResolvedValue(null);
      await expect(service.clone('missing', 'Clone')).rejects.toThrow(NotFoundException);
    });
  });
});
