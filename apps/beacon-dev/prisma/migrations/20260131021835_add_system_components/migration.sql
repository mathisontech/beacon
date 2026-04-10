-- CreateTable
CREATE TABLE "SystemComponent" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "inputs" JSONB NOT NULL DEFAULT '[]',
    "triggers" JSONB NOT NULL DEFAULT '[]',
    "outputs" JSONB NOT NULL DEFAULT '[]',
    "databaseEffects" JSONB NOT NULL DEFAULT '[]',
    "subcomponents" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemComponent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SystemComponent_module_idx" ON "SystemComponent"("module");

-- CreateIndex
CREATE INDEX "SystemComponent_module_order_idx" ON "SystemComponent"("module", "order");
