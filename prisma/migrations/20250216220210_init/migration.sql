-- CreateTable
CREATE TABLE "Bot_Appearance" (
    "id" SERIAL NOT NULL,
    "bot_id" TEXT NOT NULL,
    "company_logo" TEXT,
    "bot_avatar" TEXT,
    "accent_color" TEXT,
    "widget_icon" TEXT,
    "widget_position" TEXT,
    "input_placeholder" TEXT,
    "branding_enabled" BOOLEAN NOT NULL DEFAULT true,
    "widget_open_by_default" BOOLEAN NOT NULL DEFAULT false,
    "starter_questions" BOOLEAN DEFAULT true,

    CONSTRAINT "Bot_Appearance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bot_Appearance_bot_id_key" ON "Bot_Appearance"("bot_id");

-- CreateIndex
CREATE INDEX "Bot_Appearance_bot_id_idx" ON "Bot_Appearance"("bot_id");

-- AddForeignKey
ALTER TABLE "Bot_Appearance" ADD CONSTRAINT "Bot_Appearance_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
