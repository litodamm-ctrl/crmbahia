CREATE TABLE crm_conversation_entries (id TEXT PRIMARY KEY NOT NULL, lead_uid TEXT NOT NULL, channel TEXT NOT NULL, kind TEXT NOT NULL, body TEXT NOT NULL, actor TEXT NOT NULL, created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX crm_conversation_lead_time ON crm_conversation_entries(lead_uid, created_at);
