-- 为各项目创建独立数据库和用户
-- 首次启动 postgres 时自动执行

-- quick-note 项目
CREATE USER quicknote WITH PASSWORD 'quicknote_password';
CREATE DATABASE quicknote OWNER quicknote;
GRANT ALL PRIVILEGES ON DATABASE quicknote TO quicknote;

-- 其他项目示例 (按需添加)
-- CREATE USER project2 WITH PASSWORD 'project2_password';
-- CREATE DATABASE project2 OWNER project2;
-- GRANT ALL PRIVILEGES ON DATABASE project2 TO project2;

-- 输出创建结果
\l
