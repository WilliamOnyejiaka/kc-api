-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verified" BOOLEAN DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "isOauth" BOOLEAN NOT NULL DEFAULT false,
    "oAuthDetails" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberProfilePicture" (
    "id" SERIAL NOT NULL,
    "mimeType" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberId" INTEGER NOT NULL,

    CONSTRAINT "MemberProfilePicture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_phoneNumber_key" ON "Member"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfilePicture_memberId_key" ON "MemberProfilePicture"("memberId");

-- AddForeignKey
ALTER TABLE "MemberProfilePicture" ADD CONSTRAINT "MemberProfilePicture_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
