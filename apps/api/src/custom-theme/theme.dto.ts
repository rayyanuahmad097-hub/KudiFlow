import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ThemeScope } from '../entities/theme.entity';
import {
  ThemeBorderRadius,
  ThemeBreakpoints,
  ThemeColors,
  ThemeConfig,
  ThemeShadows,
  ThemeSpacing,
  ThemeTransitions,
  ThemeTypography,
  ThemeZIndex,
} from '../types/theme-config.types';

// ─── Nested config DTOs ──────────────────────────────────────────────────────

export class ThemeColorsDto implements Partial<ThemeColors> {
  @ApiPropertyOptional({ example: '#6366F1' })
  @IsOptional()
  @IsHexColor()
  primary?: string;

  @ApiPropertyOptional({ example: '#4F46E5' })
  @IsOptional()
  @IsHexColor()
  primaryHover?: string;

  @ApiPropertyOptional({ example: '#4338CA' })
  @IsOptional()
  @IsHexColor()
  primaryActive?: string;

  @ApiPropertyOptional({ example: '#8B5CF6' })
  @IsOptional()
  @IsHexColor()
  secondary?: string;

  @ApiPropertyOptional({ example: '#7C3AED' })
  @IsOptional()
  @IsHexColor()
  secondaryHover?: string;

  @ApiPropertyOptional({ example: '#6D28D9' })
  @IsOptional()
  @IsHexColor()
  secondaryActive?: string;

  @ApiPropertyOptional({ example: '#F59E0B' })
  @IsOptional()
  @IsHexColor()
  accent?: string;

  @ApiPropertyOptional({ example: '#F9FAFB' })
  @IsOptional()
  @IsHexColor()
  background?: string;

  @ApiPropertyOptional({ example: '#FFFFFF' })
  @IsOptional()
  @IsHexColor()
  surface?: string;

  @ApiPropertyOptional({ example: '#F3F4F6' })
  @IsOptional()
  @IsHexColor()
  surfaceRaised?: string;

  @ApiPropertyOptional({ example: '#FFFFFF' })
  @IsOptional()
  @IsHexColor()
  onPrimary?: string;

  @ApiPropertyOptional({ example: '#FFFFFF' })
  @IsOptional()
  @IsHexColor()
  onSecondary?: string;

  @ApiPropertyOptional({ example: '#EF4444' })
  @IsOptional()
  @IsHexColor()
  error?: string;

  @ApiPropertyOptional({ example: '#FEE2E2' })
  @IsOptional()
  @IsHexColor()
  errorLight?: string;

  @ApiPropertyOptional({ example: '#F59E0B' })
  @IsOptional()
  @IsHexColor()
  warning?: string;

  @ApiPropertyOptional({ example: '#FEF3C7' })
  @IsOptional()
  @IsHexColor()
  warningLight?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @IsHexColor()
  success?: string;

  @ApiPropertyOptional({ example: '#D1FAE5' })
  @IsOptional()
  @IsHexColor()
  successLight?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsHexColor()
  info?: string;

  @ApiPropertyOptional({ example: '#DBEAFE' })
  @IsOptional()
  @IsHexColor()
  infoLight?: string;

  @ApiPropertyOptional({ example: '#111827' })
  @IsOptional()
  @IsHexColor()
  textPrimary?: string;

  @ApiPropertyOptional({ example: '#6B7280' })
  @IsOptional()
  @IsHexColor()
  textSecondary?: string;

  @ApiPropertyOptional({ example: '#9CA3AF' })
  @IsOptional()
  @IsHexColor()
  textDisabled?: string;

  @ApiPropertyOptional({ example: '#FFFFFF' })
  @IsOptional()
  @IsHexColor()
  textInverse?: string;

  @ApiPropertyOptional({ example: '#E5E7EB' })
  @IsOptional()
  @IsHexColor()
  border?: string;

  @ApiPropertyOptional({ example: '#6366F1' })
  @IsOptional()
  @IsHexColor()
  borderFocus?: string;

  @ApiPropertyOptional({ example: '#F3F4F6' })
  @IsOptional()
  @IsHexColor()
  divider?: string;
}

export class ThemeTypographyDto implements Partial<ThemeTypography> {
  @ApiPropertyOptional({ example: "'Inter', sans-serif" })
  @IsOptional()
  @IsString()
  fontFamilyHeading?: string;

  @ApiPropertyOptional({ example: "'Inter', sans-serif" })
  @IsOptional()
  @IsString()
  fontFamilyBody?: string;

  @ApiPropertyOptional({ example: "'JetBrains Mono', monospace" })
  @IsOptional()
  @IsString()
  fontFamilyMono?: string;

  @ApiPropertyOptional({ example: '0.75rem' })
  @IsOptional()
  @IsString()
  fontSizeXs?: string;

  @ApiPropertyOptional({ example: '0.875rem' })
  @IsOptional()
  @IsString()
  fontSizeSm?: string;

  @ApiPropertyOptional({ example: '1rem' })
  @IsOptional()
  @IsString()
  fontSizeBase?: string;

  @ApiPropertyOptional({ example: '1.125rem' })
  @IsOptional()
  @IsString()
  fontSizeLg?: string;

  @ApiPropertyOptional({ example: '1.25rem' })
  @IsOptional()
  @IsString()
  fontSizeXl?: string;

  @ApiPropertyOptional({ example: '1.5rem' })
  @IsOptional()
  @IsString()
  fontSize2xl?: string;

  @ApiPropertyOptional({ example: '1.875rem' })
  @IsOptional()
  @IsString()
  fontSize3xl?: string;

  @ApiPropertyOptional({ example: '2.25rem' })
  @IsOptional()
  @IsString()
  fontSize4xl?: string;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsNumber()
  fontWeightLight?: number;

  @ApiPropertyOptional({ example: 400 })
  @IsOptional()
  @IsNumber()
  fontWeightRegular?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  fontWeightMedium?: number;

  @ApiPropertyOptional({ example: 600 })
  @IsOptional()
  @IsNumber()
  fontWeightSemibold?: number;

  @ApiPropertyOptional({ example: 700 })
  @IsOptional()
  @IsNumber()
  fontWeightBold?: number;

  @ApiPropertyOptional({ example: 1.25 })
  @IsOptional()
  @IsNumber()
  lineHeightTight?: number;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber()
  lineHeightNormal?: number;

  @ApiPropertyOptional({ example: 1.75 })
  @IsOptional()
  @IsNumber()
  lineHeightRelaxed?: number;
}

export class ThemeSpacingDto implements Partial<ThemeSpacing> {
  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  unit?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  xs?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  sm?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsNumber()
  md?: number;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  @IsNumber()
  lg?: number;

  @ApiPropertyOptional({ example: 32 })
  @IsOptional()
  @IsNumber()
  xl?: number;

  @ApiPropertyOptional({ example: 48 })
  @IsOptional()
  @IsNumber()
  xxl?: number;
}

export class ThemeBorderRadiusDto implements Partial<ThemeBorderRadius> {
  @ApiPropertyOptional({ example: '0px' })
  @IsOptional()
  @IsString()
  none?: string;

  @ApiPropertyOptional({ example: '2px' })
  @IsOptional()
  @IsString()
  sm?: string;

  @ApiPropertyOptional({ example: '4px' })
  @IsOptional()
  @IsString()
  base?: string;

  @ApiPropertyOptional({ example: '8px' })
  @IsOptional()
  @IsString()
  lg?: string;

  @ApiPropertyOptional({ example: '12px' })
  @IsOptional()
  @IsString()
  xl?: string;

  @ApiPropertyOptional({ example: '9999px' })
  @IsOptional()
  @IsString()
  full?: string;
}

export class ThemeConfigDto {
  @ApiPropertyOptional({ type: ThemeColorsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeColorsDto)
  colors?: ThemeColorsDto;

  @ApiPropertyOptional({ type: ThemeColorsDto, description: 'Dark mode color overrides' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeColorsDto)
  darkModeColors?: ThemeColorsDto;

  @ApiPropertyOptional({ type: ThemeTypographyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeTypographyDto)
  typography?: ThemeTypographyDto;

  @ApiPropertyOptional({ type: ThemeSpacingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeSpacingDto)
  spacing?: ThemeSpacingDto;

  @ApiPropertyOptional({ type: ThemeBorderRadiusDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeBorderRadiusDto)
  borderRadius?: ThemeBorderRadiusDto;

  @ApiPropertyOptional({ description: 'Enable dark mode support', example: false })
  @IsOptional()
  @IsBoolean()
  darkModeEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Custom CSS variables map',
    example: { '--custom-ribbon': '#FF0000' },
  })
  @IsOptional()
  @IsObject()
  customCssVariables?: Record<string, string>;
}

// ─── Primary DTOs ────────────────────────────────────────────────────────────

export class CreateThemeDto {
  @ApiProperty({ example: 'KudiFlow Dark', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Dark theme for KudiFlow dashboard', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: ThemeScope, default: ThemeScope.GLOBAL })
  @IsOptional()
  @IsEnum(ThemeScope)
  scope?: ThemeScope;

  @ApiPropertyOptional({ description: 'Owner ID for organization/user-scoped themes' })
  @IsOptional()
  @IsUUID()
  scopeOwnerId?: string;

  @ApiPropertyOptional({ description: 'Inherit from this theme ID and override' })
  @IsOptional()
  @IsUUID()
  parentThemeId?: string;

  @ApiPropertyOptional({ type: ThemeConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeConfigDto)
  config?: ThemeConfigDto;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateThemeDto extends PartialType(CreateThemeDto) {}

export class ThemeOverrideDto {
  @ApiProperty({ type: ThemeConfigDto, description: 'Partial config overrides to apply' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ThemeConfigDto)
  overrides: ThemeConfigDto;
}

export class ApplyThemeDto {
  @ApiProperty({ description: 'Theme ID to apply' })
  @IsUUID()
  themeId: string;

  @ApiPropertyOptional({ enum: ThemeScope })
  @IsOptional()
  @IsEnum(ThemeScope)
  scope?: ThemeScope;

  @ApiPropertyOptional({ description: 'Scope owner ID (org or user)' })
  @IsOptional()
  @IsUUID()
  scopeOwnerId?: string;
}

export class ThemeQueryDto {
  @ApiPropertyOptional({ enum: ThemeScope })
  @IsOptional()
  @IsEnum(ThemeScope)
  scope?: ThemeScope;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  scopeOwnerId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by default theme only' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export class ThemeResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description: string | null;
  @ApiProperty({ enum: ThemeScope }) scope: ThemeScope;
  @ApiPropertyOptional() scopeOwnerId: string | null;
  @ApiProperty() config: ThemeConfig;
  @ApiProperty() isDefault: boolean;
  @ApiProperty() isActive: boolean;
  @ApiProperty() isReadOnly: boolean;
  @ApiPropertyOptional() parentThemeId: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class ThemeCssVariablesResponseDto {
  @ApiProperty({ description: 'Generated CSS variables string' })
  cssVariables: string;

  @ApiProperty({ description: 'CSS variables as key-value map' })
  variables: Record<string, string>;

  @ApiProperty({ description: 'Dark mode CSS variables map (if enabled)' })
  darkVariables?: Record<string, string>;
}

export class ThemePreviewResponseDto {
  @ApiProperty({ type: ThemeResponseDto }) theme: ThemeResponseDto;
  @ApiProperty({ type: ThemeCssVariablesResponseDto }) css: ThemeCssVariablesResponseDto;
}
