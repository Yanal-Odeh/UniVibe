-- Migration: Add Performance Indexes for Approval Workflow
-- Generated: 2026-01-01
-- Run this after: npx prisma migrate dev --name add_approval_indexes

-- User indexes (for finding approvers by role and college)
CREATE INDEX IF NOT EXISTS "users_role_collegeId_idx" ON "users"("role", "collegeId");

-- Event indexes (for approval workflow queries)
CREATE INDEX IF NOT EXISTS "events_status_collegeId_idx" ON "events"("status", "collegeId");
CREATE INDEX IF NOT EXISTS "events_facultyLeaderApproval_collegeId_idx" ON "events"("facultyLeaderApproval", "collegeId");
CREATE INDEX IF NOT EXISTS "events_deanOfFacultyApproval_collegeId_idx" ON "events"("deanOfFacultyApproval", "collegeId");
CREATE INDEX IF NOT EXISTS "events_deanshipApproval_idx" ON "events"("deanshipApproval");

-- Notification indexes (for user notification queries)
CREATE INDEX IF NOT EXISTS "notifications_userId_read_idx" ON "notifications"("userId", "read");
CREATE INDEX IF NOT EXISTS "notifications_eventId_idx" ON "notifications"("eventId");
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- College index (for lookups by code)
CREATE INDEX IF NOT EXISTS "colleges_code_idx" ON "colleges"("code");

-- Verify indexes created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%_idx'
ORDER BY tablename, indexname;
