-- CreateTable
CREATE TABLE "Bot_QA" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Bot_QA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bot_Training" (
    "id" SERIAL NOT NULL,
    "bot_id" TEXT NOT NULL,
    "prompt_type" TEXT NOT NULL,
    "prompt_content" TEXT NOT NULL,
    "category" TEXT,
    "context" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bot_Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training_Coverage" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "total_unique_queries" INTEGER NOT NULL,
    "covered_intents" INTEGER NOT NULL,
    "measure_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Training_Coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "resolution_status" TEXT,
    "minutes" INTEGER,
    "sentiment_score" DOUBLE PRECISION,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conv_Messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_type" TEXT NOT NULL,
    "message_text" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "response_time" INTEGER,
    "used_knowledge_base" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Conv_Messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Knowledge_Queries" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "query_text" TEXT NOT NULL,
    "was_successful" BOOLEAN NOT NULL,
    "response_score" DOUBLE PRECISION,
    "confidence_score" DOUBLE PRECISION,

    CONSTRAINT "Knowledge_Queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnrecognizedQueries" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "query_text" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnrecognizedQueries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Csat" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "rating_score" INTEGER NOT NULL,
    "feedback_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Csat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bot_QA_bot_id_idx" ON "Bot_QA"("bot_id");

-- CreateIndex
CREATE INDEX "Bot_Training_bot_id_idx" ON "Bot_Training"("bot_id");

-- CreateIndex
CREATE INDEX "Training_Coverage_bot_id_idx" ON "Training_Coverage"("bot_id");

-- CreateIndex
CREATE INDEX "Conversation_bot_id_idx" ON "Conversation"("bot_id");

-- CreateIndex
CREATE INDEX "Conv_Messages_conversation_id_idx" ON "Conv_Messages"("conversation_id");

-- CreateIndex
CREATE INDEX "Knowledge_Queries_message_id_idx" ON "Knowledge_Queries"("message_id");

-- CreateIndex
CREATE INDEX "UnrecognizedQueries_message_id_idx" ON "UnrecognizedQueries"("message_id");

-- CreateIndex
CREATE INDEX "Csat_conversation_id_idx" ON "Csat"("conversation_id");

-- AddForeignKey
ALTER TABLE "Bot_QA" ADD CONSTRAINT "Bot_QA_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bot_Training" ADD CONSTRAINT "Bot_Training_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training_Coverage" ADD CONSTRAINT "Training_Coverage_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conv_Messages" ADD CONSTRAINT "Conv_Messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Knowledge_Queries" ADD CONSTRAINT "Knowledge_Queries_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Conv_Messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnrecognizedQueries" ADD CONSTRAINT "UnrecognizedQueries_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Conv_Messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Csat" ADD CONSTRAINT "Csat_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
