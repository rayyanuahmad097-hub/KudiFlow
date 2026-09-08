import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ThemeController } from '../theme.controller';
import { ThemeService } from '../theme.service';
import { ThemeScope } from '../entities/theme.entity';
import { DEFAULT_THEME_CONFIG } from '../types/theme-config.types';

// ─── Mock service setup ───────────────────────────────────────────────────────

const makeThemeResponse = (overrides: Partial<any> = {}) => ({
  id: 'e2e-theme-1',
  name: 'E2E Theme',
  description: 'E2E test theme',
  scope: ThemeScope.GLOBAL,
  scopeOwnerId: null,
  parentThemeId: null,
  config: DEFAULT_THEME_CONFIG,
  isDefault: false,
  isActive: true,
  isReadOnly: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const mockThemeService = {
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

// ─── E2E Suite ───────────────────────────────────────────────────────────────

describe('Theme API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThemeController],
      providers: [{ provide: ThemeService, useValue: mockThemeService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(() => app.close());
  afterEach(() => jest.clearAllMocks());

  // ─── POST /themes ──────────────────────────────────────────────────────────

  describe('POST /themes', () => {
    it('should create a theme and return 201', async () => {
      const payload = { name: 'KudiFlow Dark' };
      mockThemeService.create.mockResolvedValue(makeThemeResponse({ name: 'KudiFlow Dark' }));

      const { status, body } = await request(app.getHttpServer())
        .post('/themes')
        .send(payload);

      expect(status).toBe(201);
      expect(body.name).toBe('KudiFlow Dark');
      expect(body.id).toBeDefined();
    });

    it('should return 400 when name is missing', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/themes')
        .send({});

      expect(status).toBe(400);
    });

    it('should return 400 when name exceeds max length', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/themes')
        .send({ name: 'a'.repeat(101) });

      expect(status).toBe(400);
    });

    it('should create theme with config overrides', async () => {
      const payload = {
        name: 'Custom Red Theme',
        config: {
          colors: { primary: '#FF0000' },
        },
      };
      mockThemeService.create.mockResolvedValue(makeThemeResponse({ name: 'Custom Red Theme' }));

      const { status, body } = await request(app.getHttpServer())
        .post('/themes')
        .send(payload);

      expect(status).toBe(201);
      expect(body.name).toBe('Custom Red Theme');
    });

    it('should return 400 for invalid hex color', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/themes')
        .send({
          name: 'Bad Color Theme',
          config: { colors: { primary: 'not-a-color' } },
        });

      expect(status).toBe(400);
    });
  });

  // ─── GET /themes ──────────────────────────────────────────────────────────

  describe('GET /themes', () => {
    it('should return theme list', async () => {
      mockThemeService.findAll.mockResolvedValue([
        makeThemeResponse(),
        makeThemeResponse({ id: 'e2e-theme-2', name: 'Second Theme' }),
      ]);

      const { status, body } = await request(app.getHttpServer()).get('/themes');

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(2);
    });

    it('should accept scope query param', async () => {
      mockThemeService.findAll.mockResolvedValue([]);

      const { status } = await request(app.getHttpServer())
        .get('/themes')
        .query({ scope: 'global' });

      expect(status).toBe(200);
      expect(mockThemeService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ scope: 'global' }),
      );
    });
  });

  // ─── GET /themes/default ──────────────────────────────────────────────────

  describe('GET /themes/default', () => {
    it('should return the default theme', async () => {
      mockThemeService.getDefaultTheme.mockResolvedValue(
        makeThemeResponse({ isDefault: true }),
      );

      const { status, body } = await request(app.getHttpServer()).get('/themes/default');

      expect(status).toBe(200);
      expect(body.isDefault).toBe(true);
    });
  });

  // ─── GET /themes/:id ──────────────────────────────────────────────────────

  describe('GET /themes/:id', () => {
    it('should return a single theme', async () => {
      mockThemeService.findOne.mockResolvedValue(makeThemeResponse());

      const { status, body } = await request(app.getHttpServer())
        .get('/themes/e2e-theme-1');

      expect(status).toBe(200);
      expect(body.id).toBe('e2e-theme-1');
    });
  });

  // ─── PATCH /themes/:id ────────────────────────────────────────────────────

  describe('PATCH /themes/:id', () => {
    it('should update theme name', async () => {
      mockThemeService.update.mockResolvedValue(
        makeThemeResponse({ name: 'Updated Name' }),
      );

      const { status, body } = await request(app.getHttpServer())
        .patch('/themes/e2e-theme-1')
        .send({ name: 'Updated Name' });

      expect(status).toBe(200);
      expect(body.name).toBe('Updated Name');
    });
  });

  // ─── DELETE /themes/:id ───────────────────────────────────────────────────

  describe('DELETE /themes/:id', () => {
    it('should soft-delete a theme and return 204', async () => {
      mockThemeService.remove.mockResolvedValue(undefined);

      const { status } = await request(app.getHttpServer())
        .delete('/themes/e2e-theme-1');

      expect(status).toBe(204);
    });
  });

  // ─── POST /themes/:id/override ────────────────────────────────────────────

  describe('POST /themes/:id/override', () => {
    it('should apply color overrides and return updated theme', async () => {
      const overridePayload = { overrides: { colors: { primary: '#00FF00' } } };
      mockThemeService.applyOverride.mockResolvedValue(makeThemeResponse());

      const { status, body } = await request(app.getHttpServer())
        .post('/themes/e2e-theme-1/override')
        .send(overridePayload);

      expect(status).toBe(201);
    });

    it('should reject override with invalid color', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/themes/e2e-theme-1/override')
        .send({ overrides: { colors: { primary: 'invalid' } } });

      expect(status).toBe(400);
    });
  });

  // ─── POST /themes/:id/reset ───────────────────────────────────────────────

  describe('POST /themes/:id/reset', () => {
    it('should reset theme and return 201', async () => {
      mockThemeService.resetToDefault.mockResolvedValue(makeThemeResponse());

      const { status } = await request(app.getHttpServer())
        .post('/themes/e2e-theme-1/reset');

      expect(status).toBe(201);
    });
  });

  // ─── POST /themes/:id/clone ───────────────────────────────────────────────

  describe('POST /themes/:id/clone', () => {
    it('should clone a theme with a new name', async () => {
      mockThemeService.clone.mockResolvedValue(
        makeThemeResponse({ id: 'cloned-id', name: 'My Clone' }),
      );

      const { status, body } = await request(app.getHttpServer())
        .post('/themes/e2e-theme-1/clone')
        .send({ name: 'My Clone' });

      expect(status).toBe(201);
      expect(body.name).toBe('My Clone');
    });
  });

  // ─── GET /themes/:id/css ──────────────────────────────────────────────────

  describe('GET /themes/:id/css', () => {
    it('should return CSS variables string and map', async () => {
      mockThemeService.getCssVariables.mockResolvedValue({
        cssVariables: ':root { --color-primary: #6366F1; }',
        variables: { '--color-primary': '#6366F1' },
        darkVariables: undefined,
      });

      const { status, body } = await request(app.getHttpServer())
        .get('/themes/e2e-theme-1/css');

      expect(status).toBe(200);
      expect(body.cssVariables).toContain(':root');
      expect(body.variables['--color-primary']).toBe('#6366F1');
    });
  });

  // ─── GET /themes/:id/preview ──────────────────────────────────────────────

  describe('GET /themes/:id/preview', () => {
    it('should return theme + css bundle', async () => {
      mockThemeService.getPreview.mockResolvedValue({
        theme: makeThemeResponse(),
        css: {
          cssVariables: ':root { }',
          variables: {},
        },
      });

      const { status, body } = await request(app.getHttpServer())
        .get('/themes/e2e-theme-1/preview');

      expect(status).toBe(200);
      expect(body.theme).toBeDefined();
      expect(body.css).toBeDefined();
    });
  });
});
