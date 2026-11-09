-- MySQL 示例表（模板项目可替换成自己的业务表）。
-- 一份迁移文件只放一条 SQL；由 npm run db:migrate 顺序执行。
CREATE TABLE IF NOT EXISTS app_settings (
  `key`        VARCHAR(255) PRIMARY KEY,
  `value`      TEXT NOT NULL,
  `updated_at` TEXT NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
