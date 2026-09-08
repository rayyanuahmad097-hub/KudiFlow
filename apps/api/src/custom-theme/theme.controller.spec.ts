import { Test, TestingModule } from '@nestjs/testing';
import { ThemeController } from '../theme.controller';
import { ThemeService } from '../theme.service';
import { ThemeScope } from '../entities/theme.entity';
import { DEFAULT_THEME_CONFIG } from '../types/theme-config.types';
import { CreateThemeDto, ThemeOverrideDto, UpdateThemeDto } from '../dto/theme.dto';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeResponse = (overrides: Partial<any> = {}) => ({
  id: 'theme-uuid-1',
  name: 'Test Theme',
  description: null,
  scope: ThemeScope.GLOBAL,
  scopeOwnerId: null,
  parentThemeId: null,
  config: DEFAULT_THEME_CONFIG,
  isDefault: false,
  isActive: true,
  isReadOnly: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockRequest = (userId = 'user-123') => ({ user: { id: userId } } as any);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ThemeController', () => {
  let controller: ThemeController;
  let service: jest.Mocked<ThemeService>;

  beforeEach(async () => {
    const mockService: Partial<jest.Mocked<ThemeService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      applyOverride: jest.fn(),
      resetToDefault: jest.fn(),
      clone: jest.fn(),
      getCssVariables: jest.fn(),
      getPreview: jest.fn(),
      getDefaultTheme: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThemeController],
      providers: [{ provide: ThemeService, useValue: mockService }],
    }).compile();

    controller = module.get<ThemeController>(ThemeController);
    service = module.get(ThemeService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── POST /themes ─────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should call service.create with dto and actorId', async () => {
      const dto: CreateThemeDto = { name: 'New Theme' };
      const expected = makeResponse({ name: 'New Theme' });
      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto, mockRequest());

      expect(service.create).toHaveBeenCalledWith(dto, 'user-123');
      expect(result).toEqual(expected);
    });

    it('should handle request without user gracefully', async () => {
      const dto: CreateThemeDto = { name: 'Anon Theme' };
      service.create.mockResolvedValue(makeResponse());

      await controller.create(dto, {} as any);
      expect(service.create).toHaveBeenCalledWith(dto, undefined);
    });
  });

  // ─── GET /themes ──────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should return array of themes', async () => {
      const themes = [makeResponse(), makeResponse({ id: 'theme-2' })];
      service.findAll.mockResolvedValue(themes);

      const result = await controller.findAll({ scope: ThemeScope.GLOBAL });
      expect(result).toHaveLength(2);
      expect(service.findAll).toHaveBeenCalledWith({ scope: ThemeScope.GLOBAL });
    });

    it('should return empty array when no themes exist', async () => {
      service.findAll.mockResolvedValue([]);
      const result = await controller.findAll({});
      expect(result).toEqual([]);
    });
  });

  // ─── GET /themes/default ──────────────────────────────────────────────────

  describe('getDefault()', () => {
    it('should call getDefaultTheme with global scope by default', async () => {
      const theme = makeResponse({ isDefault: true });
      service.getDefaultTheme.mockResolvedValue(theme);

      const result = await controller.getDefault();
      expect(service.getDefaultTheme).toHaveBeenCalledWith(ThemeScope.GLOBAL, undefined);
      expect(result.isDefault).toBe(true);
    });

    it('should pass scope and scopeOwnerId to service', async () => {
      service.getDefaultTheme.mockResolvedValue(makeResponse());

      await controller.getDefault(ThemeScope.ORGANIZATION, 'org-id');
      expect(service.getDefaultTheme).toHaveBeenCalledWith(ThemeScope.ORGANIZATION, 'org-id');
    });
  });

  // ─── GET /themes/:id ──────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a single theme', async () => {
      const theme = makeResponse();
      service.findOne.mockResolvedValue(theme);

      const result = await controller.findOne('theme-uuid-1');
      expect(result).toEqual(theme);
      expect(service.findOne).toHaveBeenCalledWith('theme-uuid-1');
    });
  });

  // ─── PATCH /themes/:id ────────────────────────────────────────────────────

  describe('update()', () => {
    it('should call service.update with correct params', async () => {
      const dto: UpdateThemeDto = { name: 'Updated' };
      const updated = makeResponse({ name: 'Updated' });
      service.update.mockResolvedValue(updated);

      const result = await controller.update('theme-uuid-1', dto, mockRequest());

      expect(service.update).toHaveBeenCalledWith('theme-uuid-1', dto, 'user-123');
      expect(result.name).toBe('Updated');
    });
  });

  // ─── DELETE /themes/:id ───────────────────────────────────────────────────

  describe('remove()', () => {
    it('should call service.remove and return void', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('theme-uuid-1', mockRequest());

      expect(service.remove).toHaveBeenCalledWith('theme-uuid-1', 'user-123');
      expect(result).toBeUndefined();
    });
  });

  // ─── POST /themes/:id/override ────────────────────────────────────────────

  describe('applyOverride()', () => {
    it('should call service.applyOverride with overrides dto', async () => {
      const dto: ThemeOverrideDto = {
        overrides: { colors: { primary: '#FF0000' } } as any,
      };
      const result = makeResponse();
      service.applyOverride.mockResolvedValue(result);

      await controller.applyOverride('theme-uuid-1', dto, mockRequest());
      expect(service.applyOverride).toHaveBeenCalledWith('theme-uuid-1', dto, 'user-123');
    });
  });

  // ─── POST /themes/:id/reset ───────────────────────────────────────────────

  describe('resetToDefault()', () => {
    it('should call service.resetToDefault', async () => {
      service.resetToDefault.mockResolvedValue(makeResponse());

      await controller.resetToDefault('theme-uuid-1', mockRequest());
      expect(service.resetToDefault).toHaveBeenCalledWith('theme-uuid-1', 'user-123');
    });
  });

  // ─── POST /themes/:id/clone ───────────────────────────────────────────────

  describe('clone()', () => {
    it('should call service.clone with name and actorId', async () => {
      service.clone.mockResolvedValue(makeResponse({ name: 'Cloned' }));

      const result = await controller.clone('theme-uuid-1', 'Cloned', mockRequest());

      expect(service.clone).toHaveBeenCalledWith('theme-uuid-1', 'Cloned', 'user-123');
      expect(result.name).toBe('Cloned');
    });
  });

  // ─── GET /themes/:id/css ─────────────────────────────────────────────────

  describe('getCssVariables()', () => {
    it('should return css variables bundle', async () => {
      const cssResponse = {
        cssVariables: ':root { --color-primary: #6366F1; }',
        variables: { '--color-primary': '#6366F1' },
        darkVariables: undefined,
      };
      service.getCssVariables.mockResolvedValue(cssResponse);

      const result = await controller.getCssVariables('theme-uuid-1');

      expect(result.cssVariables).toContain(':root');
      expect(result.variables['--color-primary']).toBe('#6366F1');
    });
  });

  // ─── GET /themes/:id/preview ──────────────────────────────────────────────

  describe('getPreview()', () => {
    it('should return theme with css preview', async () => {
      const previewResponse = {
        theme: makeResponse(),
        css: {
          cssVariables: ':root { }',
          variables: {},
        },
      };
      service.getPreview.mockResolvedValue(previewResponse);

      const result = await controller.getPreview('theme-uuid-1');
      expect(result.theme).toBeDefined();
      expect(result.css).toBeDefined();
    });
  });
});
