-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');

-- CreateEnum
CREATE TYPE "ExchangeStatus" AS ENUM ('Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Award', 'Deduction', 'Payment');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "location" TEXT,
    "bio" TEXT,
    "profilePicture" TEXT,
    "pointsBalance" INTEGER NOT NULL DEFAULT 100,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "learningPreferences" JSONB NOT NULL DEFAULT '{"mode":"both","maxDistance":10}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "skillID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "skillLevel" "SkillLevel" NOT NULL DEFAULT 'Beginner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkillOffered" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "skillID" TEXT NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL DEFAULT 'Beginner',
    "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSkillOffered_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exchange" (
    "id" TEXT NOT NULL,
    "requesterID" TEXT NOT NULL,
    "providerID" TEXT NOT NULL,
    "skillID" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL DEFAULT 'Beginner',
    "description" TEXT,
    "status" "ExchangeStatus" NOT NULL DEFAULT 'Pending',
    "sessionType" TEXT NOT NULL DEFAULT 'Exchange',
    "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scheduledDate" TIMESTAMP(3),
    "durationHours" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "isMutualExchange" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exchange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "exchangeID" TEXT NOT NULL,
    "senderID" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "exchangeID" TEXT NOT NULL,
    "raterID" TEXT NOT NULL,
    "ratedUserID" TEXT NOT NULL,
    "reviewText" TEXT,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "description" TEXT,
    "exchangeID" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userID_key" ON "User"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_skillID_key" ON "Skill"("skillID");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkillOffered_userID_skillID_key" ON "UserSkillOffered"("userID", "skillID");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_exchangeID_raterID_key" ON "Rating"("exchangeID", "raterID");

-- AddForeignKey
ALTER TABLE "UserSkillOffered" ADD CONSTRAINT "UserSkillOffered_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillOffered" ADD CONSTRAINT "UserSkillOffered_skillID_fkey" FOREIGN KEY ("skillID") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exchange" ADD CONSTRAINT "Exchange_requesterID_fkey" FOREIGN KEY ("requesterID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exchange" ADD CONSTRAINT "Exchange_providerID_fkey" FOREIGN KEY ("providerID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exchange" ADD CONSTRAINT "Exchange_skillID_fkey" FOREIGN KEY ("skillID") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_exchangeID_fkey" FOREIGN KEY ("exchangeID") REFERENCES "Exchange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_exchangeID_fkey" FOREIGN KEY ("exchangeID") REFERENCES "Exchange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_raterID_fkey" FOREIGN KEY ("raterID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_ratedUserID_fkey" FOREIGN KEY ("ratedUserID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_exchangeID_fkey" FOREIGN KEY ("exchangeID") REFERENCES "Exchange"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
