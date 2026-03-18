-- CreateEnum
CREATE TYPE "ChefRole" AS ENUM ('EXECUTIVE_CHEF', 'HEAD_CHEF', 'SOUS_CHEF', 'CHEF_DE_PARTIE', 'DEMI_CHEF', 'COMMIS', 'PASTRY_CHEF', 'PRIVATE_CHEF', 'CULINARY_INSTRUCTOR', 'CULINARY_CONSULTANT', 'CULINARY_STUDENT', 'STAGIAIRE');

-- CreateEnum
CREATE TYPE "KitchenStation" AS ENUM ('GARDE_MANGER', 'SAUCIER', 'ROTISSEUR', 'POISSONNIER', 'ENTREMETIER', 'PATISSIER', 'BOULANGER', 'TOURNANT');

-- CreateEnum
CREATE TYPE "RecipeDifficulty" AS ENUM ('PROFESSIONAL', 'ADVANCED_PROFESSIONAL', 'R_AND_D');

-- CreateEnum
CREATE TYPE "WasteType" AS ENUM ('PREP_WASTE', 'PLATE_WASTE', 'SPOILAGE', 'OVERPRODUCTION', 'EXPIRED', 'QUALITY_REJECT');

-- CreateEnum
CREATE TYPE "SupplierCertification" AS ENUM ('ORGANIC', 'BIODYNAMIC', 'MSC', 'ASC', 'FAIR_TRADE', 'REGENERATIVE', 'CARBON_NEUTRAL', 'B_CORP', 'DOP_AOC', 'HALAL', 'KOSHER');

-- CreateEnum
CREATE TYPE "RecipeVisibility" AS ENUM ('PRIVATE', 'PRO_ONLY', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ScalingType" AS ENUM ('LINEAR', 'CUSTOM', 'NON_SCALABLE');

-- CreateEnum
CREATE TYPE "CrawlStatus" AS ENUM ('PENDING', 'CRAWLING', 'EXTRACTED', 'NORMALIZED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ExtractionTier" AS ENUM ('JSON_LD', 'LLM_EXTRACTION', 'VISION_OCR');

-- CreateEnum
CREATE TYPE "AllergenType" AS ENUM ('GLUTEN', 'CRUSTACEANS', 'MOLLUSKS', 'PEANUTS', 'TREE_NUTS', 'SESAME', 'CELERY', 'MUSTARD', 'SOY', 'MILK', 'EGGS', 'FISH', 'LUPIN', 'SULFITES');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChefProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "profileImage" TEXT,
    "coverImage" TEXT,
    "website" TEXT,
    "michaelinStars" INTEGER NOT NULL DEFAULT 0,
    "michaelinYear" INTEGER,
    "currentRole" "ChefRole" NOT NULL,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "currentRestaurantId" TEXT,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "recipeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChefProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChefProfile_currentRestaurantId_fkey" FOREIGN KEY ("currentRestaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserFollower" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFollower_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserFollower_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CuisineTaxonomy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "CuisineTaxonomy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CuisineTaxonomy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TechniqueTaxonomy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "TechniqueTaxonomy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TechniqueTaxonomy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "cuisineId" TEXT,
    "difficulty" "RecipeDifficulty" NOT NULL,
    "recipeCourse" TEXT,
    "yieldValue" REAL NOT NULL,
    "yieldUnit" TEXT NOT NULL,
    "prepTimeMinutes" INTEGER NOT NULL,
    "cookTimeMinutes" INTEGER NOT NULL,
    "restTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalTimeMinutes" INTEGER NOT NULL,
    "servingsMin" INTEGER NOT NULL DEFAULT 1,
    "servingsMax" INTEGER NOT NULL DEFAULT 8,
    "foodCostValue" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "foodCostCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "foodCostPercentage" REAL NOT NULL DEFAULT 0,
    "scalingType" "ScalingType" NOT NULL DEFAULT 'LINEAR',
    "platingNotes" TEXT,
    "platingDimensions" JSONB,
    "temperature" INTEGER,
    "sustainabilityScore" REAL,
    "carbonfootprint" REAL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "visibility" "RecipeVisibility" NOT NULL DEFAULT 'PRIVATE',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recipe_cuisineId_fkey" FOREIGN KEY ("cuisineId") REFERENCES "CuisineTaxonomy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IngredientGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IngredientGroup_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "ingredientGroupId" TEXT,
    "supplierId" TEXT,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "alternativeUnits" JSONB,
    "unitCost" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "costCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "totalCost" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "isOrganic" BOOLEAN NOT NULL DEFAULT false,
    "isLocal" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ingredient_ingredientGroupId_fkey" FOREIGN KEY ("ingredientGroupId") REFERENCES "IngredientGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ingredient_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AllergenFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT,
    "ingredientId" TEXT,
    "allergenType" "AllergenType" NOT NULL,
    "severity" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AllergenFlag_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AllergenFlag_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Substitution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "originalIngredient" TEXT NOT NULL,
    "substitutionIngredient" TEXT NOT NULL,
    "quantityAdjustment" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Substitution_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScalingRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "ingredientName" TEXT NOT NULL,
    "baseYield" REAL NOT NULL,
    "scalingFactor" REAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "ScalingRule_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecipeStepGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeStepGroup_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "stepGroupId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER,
    "temperature" INTEGER,
    "temperatureRange" TEXT,
    "isPlatingStep" BOOLEAN NOT NULL DEFAULT false,
    "canBePreparedAhead" BOOLEAN NOT NULL DEFAULT false,
    "prepAheadHours" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeStep_stepGroupId_fkey" FOREIGN KEY ("stepGroupId") REFERENCES "RecipeStepGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RecipeStepToTechniqueTaxonomy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RecipeStepToTechniqueTaxonomy_A_fkey" FOREIGN KEY ("A") REFERENCES "RecipeStep" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RecipeStepToTechniqueTaxonomy_B_fkey" FOREIGN KEY ("B") REFERENCES "TechniqueTaxonomy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CareerEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chefProfileId" TEXT NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "position" "ChefRole" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "achievements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerEntry_chefProfileId_fkey" FOREIGN KEY ("chefProfileId") REFERENCES "ChefProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Accolade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chefProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "year" INTEGER NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Accolade_chefProfileId_fkey" FOREIGN KEY ("chefProfileId") REFERENCES "ChefProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "cuisineId" TEXT,
    "michaelinStars" INTEGER NOT NULL DEFAULT 0,
    "seatingCapacity" INTEGER,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Restaurant_cuisineId_fkey" FOREIGN KEY ("cuisineId") REFERENCES "CuisineTaxonomy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RestaurantMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "chefProfileId" TEXT NOT NULL,
    "role" "ChefRole" NOT NULL,
    "station" "KitchenStation",
    "joinDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    CONSTRAINT "RestaurantMember_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RestaurantMember_chefProfileId_fkey" FOREIGN KEY ("chefProfileId") REFERENCES "ChefProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WasteLogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "wasteType" "WasteType" NOT NULL,
    "ingredient" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "estimatedCost" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "costCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "reason" TEXT,
    "notes" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WasteLogEntry_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "country" TEXT,
    "region" TEXT,
    "certifications" TEXT[],
    "avgRating" REAL NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "SupplierProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "minOrder" INTEGER NOT NULL,
    "currentPrice" DECIMAL(8,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "isOrganic" BOOLEAN NOT NULL DEFAULT false,
    "isFairTrade" BOOLEAN NOT NULL DEFAULT false,
    "isLocal" BOOLEAN NOT NULL DEFAULT false,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "leadTimeDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupplierProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupplierPriceFeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierPriceFeed_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupplierReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "qualityScore" INTEGER,
    "reliabilityScore" INTEGER,
    "communicationScore" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierReview_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RestaurantSupplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "RestaurantSupplier_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RestaurantSupplier_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDelivery" TIMESTAMP(3),
    "actualDelivery" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(8,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    CONSTRAINT "OrderLineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Masterclass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chefProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT,
    "level" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "episodeCount" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    CONSTRAINT "Masterclass_chefProfileId_fkey" FOREIGN KEY ("chefProfileId") REFERENCES "ChefProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "masterclassId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "techniqueTimestamps" JSONB,
    "transcription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Episode_masterclassId_fkey" FOREIGN KEY ("masterclassId") REFERENCES "Masterclass" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MasterclassProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "masterclassId" TEXT NOT NULL,
    "completedEpisodes" INTEGER NOT NULL DEFAULT 0,
    "progressPercentage" REAL NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "MasterclassProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MasterclassProgress_masterclassId_fkey" FOREIGN KEY ("masterclassId") REFERENCES "Masterclass" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "restaurantName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "position" "ChefRole" NOT NULL,
    "station" "KitchenStation",
    "experienceLevel" TEXT NOT NULL,
    "yearsExperienceMin" INTEGER NOT NULL DEFAULT 0,
    "yearsExperienceMax" INTEGER,
    "salaryMin" DECIMAL(10,2),
    "salaryMax" DECIMAL(10,2),
    "salaryCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "jobType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobListingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    CONSTRAINT "JobApplication_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecruitmentMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecruitmentMessage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrawledRecipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceUrl" TEXT NOT NULL,
    "sourceTitle" TEXT,
    "sourceSiteName" TEXT,
    "extractionTier" "ExtractionTier" NOT NULL,
    "extractionTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidenceScore" REAL NOT NULL,
    "rawHtml" TEXT,
    "rawJson" JSONB,
    "normalizedData" JSONB,
    "status" "CrawlStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "publishedAsRecipeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "CrawlJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "targetUrls" TEXT[],
    "crawledCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Comment_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ChefProfileToCuisineTaxonomy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ChefProfileToCuisineTaxonomy_A_fkey" FOREIGN KEY ("A") REFERENCES "ChefProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ChefProfileToCuisineTaxonomy_B_fkey" FOREIGN KEY ("B") REFERENCES "CuisineTaxonomy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChefProfile_userId_key" ON "ChefProfile"("userId");

-- CreateIndex
CREATE INDEX "ChefProfile_userId_idx" ON "ChefProfile"("userId");

-- CreateIndex
CREATE INDEX "ChefProfile_currentRestaurantId_idx" ON "ChefProfile"("currentRestaurantId");

-- CreateIndex
CREATE INDEX "ChefProfile_followerCount_idx" ON "ChefProfile"("followerCount");

-- CreateIndex
CREATE INDEX "ChefProfile_createdAt_idx" ON "ChefProfile"("createdAt");

-- CreateIndex
CREATE INDEX "UserFollower_followerId_idx" ON "UserFollower"("followerId");

-- CreateIndex
CREATE INDEX "UserFollower_followingId_idx" ON "UserFollower"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollower_followerId_followingId_key" ON "UserFollower"("followerId", "followingId");

-- CreateIndex
CREATE UNIQUE INDEX "CuisineTaxonomy_name_key" ON "CuisineTaxonomy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CuisineTaxonomy_slug_key" ON "CuisineTaxonomy"("slug");

-- CreateIndex
CREATE INDEX "CuisineTaxonomy_parentId_idx" ON "CuisineTaxonomy"("parentId");

-- CreateIndex
CREATE INDEX "CuisineTaxonomy_level_idx" ON "CuisineTaxonomy"("level");

-- CreateIndex
CREATE UNIQUE INDEX "TechniqueTaxonomy_name_key" ON "TechniqueTaxonomy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TechniqueTaxonomy_slug_key" ON "TechniqueTaxonomy"("slug");

-- CreateIndex
CREATE INDEX "TechniqueTaxonomy_parentId_idx" ON "TechniqueTaxonomy"("parentId");

-- CreateIndex
CREATE INDEX "TechniqueTaxonomy_level_idx" ON "TechniqueTaxonomy"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_slug_key" ON "Recipe"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_userId_slug_key" ON "Recipe"("userId", "slug");

-- CreateIndex
CREATE INDEX "Recipe_userId_idx" ON "Recipe"("userId");

-- CreateIndex
CREATE INDEX "Recipe_cuisineId_idx" ON "Recipe"("cuisineId");

-- CreateIndex
CREATE INDEX "Recipe_difficulty_idx" ON "Recipe"("difficulty");

-- CreateIndex
CREATE INDEX "Recipe_visibility_idx" ON "Recipe"("visibility");

-- CreateIndex
CREATE INDEX "Recipe_isPublished_idx" ON "Recipe"("isPublished");

-- CreateIndex
CREATE INDEX "Recipe_createdAt_idx" ON "Recipe"("createdAt");

-- CreateIndex
CREATE INDEX "Recipe_foodCostPercentage_idx" ON "Recipe"("foodCostPercentage");

-- CreateIndex
CREATE INDEX "IngredientGroup_recipeId_idx" ON "IngredientGroup"("recipeId");

-- CreateIndex
CREATE INDEX "Ingredient_recipeId_idx" ON "Ingredient"("recipeId");

-- CreateIndex
CREATE INDEX "Ingredient_ingredientGroupId_idx" ON "Ingredient"("ingredientGroupId");

-- CreateIndex
CREATE INDEX "Ingredient_supplierId_idx" ON "Ingredient"("supplierId");

-- CreateIndex
CREATE INDEX "AllergenFlag_recipeId_idx" ON "AllergenFlag"("recipeId");

-- CreateIndex
CREATE INDEX "AllergenFlag_ingredientId_idx" ON "AllergenFlag"("ingredientId");

-- CreateIndex
CREATE INDEX "AllergenFlag_allergenType_idx" ON "AllergenFlag"("allergenType");

-- CreateIndex
CREATE INDEX "Substitution_recipeId_idx" ON "Substitution"("recipeId");

-- CreateIndex
CREATE INDEX "ScalingRule_recipeId_idx" ON "ScalingRule"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeStepGroup_recipeId_idx" ON "RecipeStepGroup"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeStep_recipeId_idx" ON "RecipeStep"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeStep_stepGroupId_idx" ON "RecipeStep"("stepGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "_RecipeStepToTechniqueTaxonomy_AB_unique" ON "_RecipeStepToTechniqueTaxonomy"("A", "B");

-- CreateIndex
CREATE INDEX "_RecipeStepToTechniqueTaxonomy_B_idx" ON "_RecipeStepToTechniqueTaxonomy"("B");

-- CreateIndex
CREATE INDEX "CareerEntry_chefProfileId_idx" ON "CareerEntry"("chefProfileId");

-- CreateIndex
CREATE INDEX "Accolade_chefProfileId_idx" ON "Accolade"("chefProfileId");

-- CreateIndex
CREATE INDEX "Accolade_year_idx" ON "Accolade"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");

-- CreateIndex
CREATE INDEX "Restaurant_cuisineId_idx" ON "Restaurant"("cuisineId");

-- CreateIndex
CREATE INDEX "Restaurant_city_idx" ON "Restaurant"("city");

-- CreateIndex
CREATE INDEX "Restaurant_michaelinStars_idx" ON "Restaurant"("michaelinStars");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantMember_restaurantId_chefProfileId_key" ON "RestaurantMember"("restaurantId", "chefProfileId");

-- CreateIndex
CREATE INDEX "RestaurantMember_restaurantId_idx" ON "RestaurantMember"("restaurantId");

-- CreateIndex
CREATE INDEX "RestaurantMember_chefProfileId_idx" ON "RestaurantMember"("chefProfileId");

-- CreateIndex
CREATE INDEX "WasteLogEntry_restaurantId_idx" ON "WasteLogEntry"("restaurantId");

-- CreateIndex
CREATE INDEX "WasteLogEntry_wasteType_idx" ON "WasteLogEntry"("wasteType");

-- CreateIndex
CREATE INDEX "WasteLogEntry_loggedAt_idx" ON "WasteLogEntry"("loggedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_slug_key" ON "Supplier"("slug");

-- CreateIndex
CREATE INDEX "SupplierProduct_supplierId_idx" ON "SupplierProduct"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierProduct_sku_idx" ON "SupplierProduct"("sku");

-- CreateIndex
CREATE INDEX "SupplierPriceFeed_supplierId_idx" ON "SupplierPriceFeed"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierPriceFeed_effectiveDate_idx" ON "SupplierPriceFeed"("effectiveDate");

-- CreateIndex
CREATE INDEX "SupplierReview_supplierId_idx" ON "SupplierReview"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantSupplier_restaurantId_supplierId_key" ON "RestaurantSupplier"("restaurantId", "supplierId");

-- CreateIndex
CREATE INDEX "RestaurantSupplier_restaurantId_idx" ON "RestaurantSupplier"("restaurantId");

-- CreateIndex
CREATE INDEX "RestaurantSupplier_supplierId_idx" ON "RestaurantSupplier"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_supplierId_idx" ON "Order"("supplierId");

-- CreateIndex
CREATE INDEX "Order_orderDate_idx" ON "Order"("orderDate");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderLineItem_orderId_idx" ON "OrderLineItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Masterclass_slug_key" ON "Masterclass"("slug");

-- CreateIndex
CREATE INDEX "Masterclass_chefProfileId_idx" ON "Masterclass"("chefProfileId");

-- CreateIndex
CREATE INDEX "Episode_masterclassId_idx" ON "Episode"("masterclassId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterclassProgress_userId_masterclassId_key" ON "MasterclassProgress"("userId", "masterclassId");

-- CreateIndex
CREATE INDEX "MasterclassProgress_userId_idx" ON "MasterclassProgress"("userId");

-- CreateIndex
CREATE INDEX "MasterclassProgress_masterclassId_idx" ON "MasterclassProgress"("masterclassId");

-- CreateIndex
CREATE UNIQUE INDEX "JobListing_slug_key" ON "JobListing"("slug");

-- CreateIndex
CREATE INDEX "JobListing_position_idx" ON "JobListing"("position");

-- CreateIndex
CREATE INDEX "JobListing_city_idx" ON "JobListing"("city");

-- CreateIndex
CREATE INDEX "JobListing_isActive_idx" ON "JobListing"("isActive");

-- CreateIndex
CREATE INDEX "JobListing_createdAt_idx" ON "JobListing"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobListingId_userId_key" ON "JobApplication"("jobListingId", "userId");

-- CreateIndex
CREATE INDEX "JobApplication_jobListingId_idx" ON "JobApplication"("jobListingId");

-- CreateIndex
CREATE INDEX "JobApplication_userId_idx" ON "JobApplication"("userId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE INDEX "RecruitmentMessage_applicationId_idx" ON "RecruitmentMessage"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "CrawledRecipe_sourceUrl_key" ON "CrawledRecipe"("sourceUrl");

-- CreateIndex
CREATE INDEX "CrawledRecipe_sourceUrl_idx" ON "CrawledRecipe"("sourceUrl");

-- CreateIndex
CREATE INDEX "CrawledRecipe_status_idx" ON "CrawledRecipe"("status");

-- CreateIndex
CREATE INDEX "CrawledRecipe_extractionTier_idx" ON "CrawledRecipe"("extractionTier");

-- CreateIndex
CREATE INDEX "CrawledRecipe_createdAt_idx" ON "CrawledRecipe"("createdAt");

-- CreateIndex
CREATE INDEX "CrawlJob_status_idx" ON "CrawlJob"("status");

-- CreateIndex
CREATE INDEX "Comment_recipeId_idx" ON "Comment"("recipeId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Like_recipeId_userId_key" ON "Like"("recipeId", "userId");

-- CreateIndex
CREATE INDEX "Like_recipeId_idx" ON "Like"("recipeId");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_ChefProfileToCuisineTaxonomy_AB_unique" ON "_ChefProfileToCuisineTaxonomy"("A", "B");

-- CreateIndex
CREATE INDEX "_ChefProfileToCuisineTaxonomy_B_idx" ON "_ChefProfileToCuisineTaxonomy"("B");
