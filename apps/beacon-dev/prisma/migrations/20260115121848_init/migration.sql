-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'ACCOUNT_MANAGER', 'ANALYST', 'SUPPORT');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('public', 'em', 'supporting_group');

-- CreateEnum
CREATE TYPE "MapDatasetStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'ACTIVE', 'ARCHIVED', 'ERROR');

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "EmployeeRole" NOT NULL,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutTime" TIMESTAMP(3),
    "sessionDuration" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationType" TEXT NOT NULL,
    "primaryContact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "jurisdiction" TEXT,
    "state" TEXT,
    "boundingBox" JSONB,
    "plan" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'TRIAL',
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAssignment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "userType" "UserType" NOT NULL DEFAULT 'public',
    "region" TEXT,
    "accountCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3),
    "totalSessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PublicUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageMetric" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "userId" TEXT,
    "metricType" TEXT NOT NULL,
    "endpoint" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "metadata" JSONB,

    CONSTRAINT "UsageMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "targetId" TEXT,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapDataset" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT,
    "version" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,
    "boundingBox" JSONB,
    "status" "MapDatasetStatus" NOT NULL DEFAULT 'UPLOADING',
    "processedAt" TIMESTAMP(3),
    "s3Bucket" TEXT,
    "s3Key" TEXT,
    "fileSize" BIGINT,
    "metadata" JSONB,

    CONSTRAINT "MapDataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "location" JSONB,
    "affectedUsers" INTEGER NOT NULL DEFAULT 0,
    "alertsSent" INTEGER NOT NULL DEFAULT 0,
    "helpRequestsCreated" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_username_key" ON "Employee"("username");

-- CreateIndex
CREATE INDEX "Employee_employeeId_idx" ON "Employee"("employeeId");

-- CreateIndex
CREATE INDEX "Employee_email_idx" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_role_idx" ON "Employee"("role");

-- CreateIndex
CREATE INDEX "LoginHistory_employeeId_idx" ON "LoginHistory"("employeeId");

-- CreateIndex
CREATE INDEX "LoginHistory_loginTime_idx" ON "LoginHistory"("loginTime");

-- CreateIndex
CREATE INDEX "LoginHistory_employeeId_loginTime_idx" ON "LoginHistory"("employeeId", "loginTime");

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientId_key" ON "Client"("clientId");

-- CreateIndex
CREATE INDEX "Client_clientId_idx" ON "Client"("clientId");

-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
CREATE INDEX "Client_state_idx" ON "Client"("state");

-- CreateIndex
CREATE INDEX "ClientAssignment_clientId_idx" ON "ClientAssignment"("clientId");

-- CreateIndex
CREATE INDEX "ClientAssignment_employeeId_idx" ON "ClientAssignment"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAssignment_clientId_employeeId_key" ON "ClientAssignment"("clientId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicUser_userId_key" ON "PublicUser"("userId");

-- CreateIndex
CREATE INDEX "PublicUser_userId_idx" ON "PublicUser"("userId");

-- CreateIndex
CREATE INDEX "PublicUser_userType_idx" ON "PublicUser"("userType");

-- CreateIndex
CREATE INDEX "PublicUser_region_idx" ON "PublicUser"("region");

-- CreateIndex
CREATE INDEX "UsageMetric_clientId_timestamp_idx" ON "UsageMetric"("clientId", "timestamp");

-- CreateIndex
CREATE INDEX "UsageMetric_userId_timestamp_idx" ON "UsageMetric"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "UsageMetric_metricType_timestamp_idx" ON "UsageMetric"("metricType", "timestamp");

-- CreateIndex
CREATE INDEX "UsageMetric_timestamp_idx" ON "UsageMetric"("timestamp");

-- CreateIndex
CREATE INDEX "ActivityLog_employeeId_timestamp_idx" ON "ActivityLog"("employeeId", "timestamp");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_timestamp_idx" ON "ActivityLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "MapDataset_datasetId_key" ON "MapDataset"("datasetId");

-- CreateIndex
CREATE INDEX "MapDataset_datasetId_idx" ON "MapDataset"("datasetId");

-- CreateIndex
CREATE INDEX "MapDataset_type_idx" ON "MapDataset"("type");

-- CreateIndex
CREATE INDEX "MapDataset_status_idx" ON "MapDataset"("status");

-- CreateIndex
CREATE INDEX "MapDataset_type_status_idx" ON "MapDataset"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_incidentId_key" ON "Incident"("incidentId");

-- CreateIndex
CREATE INDEX "Incident_clientId_idx" ON "Incident"("clientId");

-- CreateIndex
CREATE INDEX "Incident_type_idx" ON "Incident"("type");

-- CreateIndex
CREATE INDEX "Incident_startTime_idx" ON "Incident"("startTime");

-- CreateIndex
CREATE INDEX "Incident_clientId_startTime_idx" ON "Incident"("clientId", "startTime");

-- CreateIndex
CREATE INDEX "Incident_type_startTime_idx" ON "Incident"("type", "startTime");

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAssignment" ADD CONSTRAINT "ClientAssignment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAssignment" ADD CONSTRAINT "ClientAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageMetric" ADD CONSTRAINT "UsageMetric_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageMetric" ADD CONSTRAINT "UsageMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PublicUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
