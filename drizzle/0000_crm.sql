CREATE TABLE crm_workspace (id TEXT PRIMARY KEY NOT NULL, revision INTEGER NOT NULL DEFAULT 0, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE crm_audit (request_id TEXT PRIMARY KEY NOT NULL, revision INTEGER NOT NULL, actor TEXT NOT NULL, created_at TEXT NOT NULL, summary TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX crm_audit_created_at ON crm_audit(created_at);
