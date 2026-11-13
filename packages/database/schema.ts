import { bigint, boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { Invitation, Template } from '../editor-core/document';

// Auth IDs are opaque strings owned by Better Auth; domain IDs are UUIDs.
export const user = pgTable('users', {
  id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false), image: text('image'),
  role: text('role').notNull().default('user'), twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const session = pgTable('sessions', {
  id: text('id').primaryKey(), token: text('token').notNull().unique(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), ipAddress: text('ip_address'), userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const account = pgTable('auth_accounts', {
  id: text('id').primaryKey(), accountId: text('account_id').notNull(), providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'), refreshToken: text('refresh_token'), idToken: text('id_token'), scope: text('scope'), password: text('password'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }), refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const verification = pgTable('auth_verifications', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const twoFactor = pgTable('two_factors', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  secret: text('secret').notNull(), backupCodes: text('backup_codes').notNull(), verified: boolean('verified').notNull().default(true),
  failedVerificationCount: integer('failed_verification_count').notNull().default(0), lockedUntil: timestamp('locked_until', { withTimezone: true }),
});
export const rateLimit = pgTable('auth_rate_limits', {
  id: text('id').primaryKey(), key: text('key').notNull().unique(), count: integer('count').notNull(), lastRequest: bigint('last_request', { mode: 'number' }).notNull(),
});
export type SharedDetails = { host?: string; partner?: string; venue?: string; message?: string };
export const projects = pgTable('event_projects', {
  id: uuid('id').primaryKey().defaultRandom(), ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), occasion: text('occasion').notNull(), sharedDetails: jsonb('shared_details').$type<SharedDetails>().notNull().default({}),
  revision: integer('revision').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey(), projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  document: jsonb('document').$type<Invitation>().notNull(), revision: integer('revision').notNull(),
  assetId: uuid('asset_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const audit = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(), actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
  action: text('action').notNull(), resourceId: uuid('resource_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const portraitAssets = pgTable('invitation_portrait_assets', {
  invitationId: uuid('invitation_id').notNull(), slot: text('slot').notNull(), assetId: uuid('asset_id').notNull(),
});
export const assets = pgTable('private_assets', {
  id: uuid('id').primaryKey(), ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sourceHash: text('source_hash').notNull(), contentHash: text('content_hash').notNull(), byteSize: integer('byte_size').notNull(),
  width: integer('width').notNull(), height: integer('height').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const exportJobs = pgTable('export_jobs', {
  id: uuid('id').primaryKey(), ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  invitationId: uuid('invitation_id').notNull(), revision: integer('revision').notNull(), idempotencyKey: uuid('idempotency_key').notNull(),
  format: text('format').notNull(), title: text('title').notNull(), width: integer('width').notNull(), height: integer('height').notNull(),
  snapshotSvg: text('snapshot_svg').notNull(), snapshotHash: text('snapshot_hash').notNull(), rendererVersion: text('renderer_version').notNull(), templateHash: text('template_hash').notNull(),
  status: text('status').notNull().default('queued'), attempts: integer('attempts').notNull().default(0),
  leaseToken: uuid('lease_token'), leaseUntil: timestamp('lease_until', { withTimezone: true }), availableAt: timestamp('available_at', { withTimezone: true }).notNull().defaultNow(),
  errorCode: text('error_code'), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), completedAt: timestamp('completed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
export const templateVersions = pgTable('template_versions', {
  id: uuid('id').primaryKey(), familyId: uuid('family_id').notNull(), version: integer('version').notNull(),
  definition: jsonb('definition').$type<Template>().notNull(), contentHash: text('content_hash').notNull(), licenseNote: text('license_note').notNull(),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const templatePublications = pgTable('template_publications', {
  familyId: uuid('family_id').primaryKey(), versionId: uuid('version_id').notNull().references(() => templateVersions.id), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
