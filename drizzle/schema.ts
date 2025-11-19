import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, float } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "architect", "engineer", "contractor"]).default("user").notNull(),
  // Empleabilidad fields
  title: varchar("title", { length: 255 }),
  company: varchar("company", { length: 255 }),
  skills: text("skills"), // JSON array of skills
  certifications: text("certifications"), // JSON array of certifications
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - Core BIM projects
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["planning", "design", "construction", "completed", "on_hold"]).default("planning").notNull(),
  // Geographic data
  latitude: float("latitude"),
  longitude: float("longitude"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  // Project metrics
  budget: float("budget"),
  actualCost: float("actualCost"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  completionPercentage: int("completionPercentage").default(0),
  // Metadata
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project team members
 */
export const projectMembers = mysqlTable("projectMembers", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "architect", "engineer_structural", "engineer_mep", "contractor", "viewer"]).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = typeof projectMembers.$inferInsert;

/**
 * BIM Models - 3D models and versions
 */
export const bimModels = mysqlTable("bimModels", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  discipline: mysqlEnum("discipline", ["architecture", "structural", "mep", "civil", "landscape"]).notNull(),
  fileUrl: text("fileUrl").notNull(), // S3 URL
  fileKey: text("fileKey").notNull(), // S3 key
  fileType: varchar("fileType", { length: 50 }), // IFC, RVT, etc
  fileSize: int("fileSize"), // bytes
  version: int("version").default(1).notNull(),
  isLatest: boolean("isLatest").default(true).notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BimModel = typeof bimModels.$inferSelect;
export type InsertBimModel = typeof bimModels.$inferInsert;

/**
 * Issues and RFIs (Request for Information)
 */
export const issues = mysqlTable("issues", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: mysqlEnum("type", ["issue", "rfi", "clash", "observation"]).notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  // Location data
  modelId: int("modelId"),
  locationX: float("locationX"),
  locationY: float("locationY"),
  locationZ: float("locationZ"),
  // Assignment
  createdBy: int("createdBy").notNull(),
  assignedTo: int("assignedTo"),
  discipline: mysqlEnum("discipline", ["architecture", "structural", "mep", "civil", "general"]),
  // AI detection
  detectedByAI: boolean("detectedByAI").default(false),
  aiConfidence: float("aiConfidence"),
  // Timestamps
  dueDate: timestamp("dueDate"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Issue = typeof issues.$inferSelect;
export type InsertIssue = typeof issues.$inferInsert;

/**
 * Issue comments and discussions
 */
export const issueComments = mysqlTable("issueComments", {
  id: int("id").autoincrement().primaryKey(),
  issueId: int("issueId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachmentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IssueComment = typeof issueComments.$inferSelect;
export type InsertIssueComment = typeof issueComments.$inferInsert;

/**
 * Documents and files
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["contract", "drawing", "specification", "report", "photo", "other"]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  fileType: varchar("fileType", { length: 50 }),
  fileSize: int("fileSize"),
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["issue", "comment", "model_update", "project_update", "ai_alert", "system"]).notNull(),
  relatedId: int("relatedId"), // ID of related entity (issue, project, etc)
  relatedType: varchar("relatedType", { length: 50 }), // Type of related entity
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Project analytics/metrics snapshots
 */
export const projectMetrics = mysqlTable("projectMetrics", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  date: timestamp("date").notNull(),
  // Cost metrics
  budgetSpent: float("budgetSpent"),
  budgetRemaining: float("budgetRemaining"),
  // Progress metrics
  completionPercentage: int("completionPercentage"),
  tasksCompleted: int("tasksCompleted"),
  tasksTotal: int("tasksTotal"),
  // Issue metrics
  issuesOpen: int("issuesOpen"),
  issuesResolved: int("issuesResolved"),
  // Team metrics
  activeMembers: int("activeMembers"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectMetric = typeof projectMetrics.$inferSelect;
export type InsertProjectMetric = typeof projectMetrics.$inferInsert;

/**
 * BIM Execution Plan (BEP) - ISO 19650 compliance
 */
export const bimExecutionPlans = mysqlTable("bimExecutionPlans", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["draft", "approved", "active", "archived"]).default("draft").notNull(),
  // ISO 19650 compliance
  informationRequirements: text("informationRequirements"), // JSON
  levelOfInformation: mysqlEnum("levelOfInformation", ["LOI_1", "LOI_2", "LOI_3", "LOI_4", "LOI_5", "LOI_6"]),
  commonDataEnvironment: varchar("commonDataEnvironment", { length: 255 }),
  // Roles and responsibilities
  leadAppointedParty: varchar("leadAppointedParty", { length: 255 }),
  taskTeamLeaders: text("taskTeamLeaders"), // JSON array
  // Deliverables
  deliverables: text("deliverables"), // JSON array of deliverables
  milestones: text("milestones"), // JSON array
  // Metadata
  createdBy: int("createdBy").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BIMExecutionPlan = typeof bimExecutionPlans.$inferSelect;
export type InsertBIMExecutionPlan = typeof bimExecutionPlans.$inferInsert;

/**
 * IFC Model Files - Federated model management
 */
export const ifcModels = mysqlTable("ifcModels", {
  id: int("id").autoincrement().primaryKey(),
  modelId: int("modelId").notNull(), // References bimModels
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize"), // in bytes
  ifcVersion: varchar("ifcVersion", { length: 50 }), // IFC2x3, IFC4, IFC4x3
  ifcSchema: varchar("ifcSchema", { length: 100 }),
  // Model metadata
  discipline: mysqlEnum("discipline", ["architecture", "structure", "mep", "civil", "landscape"]).notNull(),
  lod: mysqlEnum("lod", ["LOD_100", "LOD_200", "LOD_300", "LOD_350", "LOD_400", "LOD_500"]).notNull(),
  // IFC statistics
  elementCount: int("elementCount"),
  buildingStoreys: int("buildingStoreys"),
  spaces: int("spaces"),
  // Federation
  isFederated: boolean("isFederated").default(false),
  federatedModels: text("federatedModels"), // JSON array of model IDs
  // Metadata
  uploadedBy: int("uploadedBy").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  lastModified: timestamp("lastModified").defaultNow().onUpdateNow().notNull(),
});

export type IFCModel = typeof ifcModels.$inferSelect;
export type InsertIFCModel = typeof ifcModels.$inferInsert;

/**
 * Clash Detection Results - Coordination issues
 */
export const clashDetections = mysqlTable("clashDetections", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  runId: varchar("runId", { length: 100 }).notNull(), // Unique run identifier
  runDate: timestamp("runDate").defaultNow().notNull(),
  // Clash details
  clashType: mysqlEnum("clashType", ["hard", "soft", "clearance", "duplicate"]).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
  status: mysqlEnum("status", ["new", "active", "reviewed", "approved", "resolved", "ignored"]).default("new").notNull(),
  // Involved elements
  element1Id: varchar("element1Id", { length: 255 }).notNull(), // IFC GUID
  element1Type: varchar("element1Type", { length: 100 }),
  element1Discipline: varchar("element1Discipline", { length: 50 }),
  element2Id: varchar("element2Id", { length: 255 }).notNull(), // IFC GUID
  element2Type: varchar("element2Type", { length: 100 }),
  element2Discipline: varchar("element2Discipline", { length: 50 }),
  // Geometric data
  clashPoint: text("clashPoint"), // JSON {x, y, z}
  distance: float("distance"), // Distance between elements
  volume: float("volume"), // Clash volume
  // Resolution
  assignedTo: int("assignedTo"),
  resolvedBy: int("resolvedBy"),
  resolvedAt: timestamp("resolvedAt"),
  resolution: text("resolution"),
  // Metadata
  detectedBy: varchar("detectedBy", { length: 100 }), // "AI" or "Manual" or "Navisworks"
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClashDetection = typeof clashDetections.$inferSelect;
export type InsertClashDetection = typeof clashDetections.$inferInsert;

/**
 * COBie Data - Construction Operations Building Information Exchange
 */
export const cobieData = mysqlTable("cobieData", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  sheetType: mysqlEnum("sheetType", [
    "facility", "floor", "space", "zone", "type", "component",
    "system", "assembly", "connection", "spare", "resource",
    "job", "impact", "document", "attribute", "coordinate"
  ]).notNull(),
  // COBie fields (simplified)
  name: varchar("name", { length: 255 }).notNull(),
  createdBy: varchar("createdBy", { length: 255 }),
  createdOn: timestamp("createdOn"),
  category: varchar("category", { length: 255 }),
  extSystem: varchar("extSystem", { length: 255 }),
  extObject: varchar("extObject", { length: 255 }),
  extIdentifier: varchar("extIdentifier", { length: 255 }),
  // Additional data as JSON
  data: text("data"), // JSON with all COBie fields
  // Metadata
  uploadedBy: int("uploadedBy").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type COBieData = typeof cobieData.$inferSelect;
export type InsertCOBieData = typeof cobieData.$inferInsert;

/**
 * Model Coordination Sessions - Collaborative review
 */
export const coordinationSessions = mysqlTable("coordinationSessions", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sessionType: mysqlEnum("sessionType", ["clash_review", "design_review", "coordination", "approval"]).notNull(),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  // Session details
  scheduledDate: timestamp("scheduledDate"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  // Participants
  organizer: int("organizer").notNull(),
  participants: text("participants"), // JSON array of user IDs
  disciplines: text("disciplines"), // JSON array of disciplines involved
  // Agenda and outcomes
  agenda: text("agenda"),
  decisions: text("decisions"), // JSON array
  actionItems: text("actionItems"), // JSON array
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoordinationSession = typeof coordinationSessions.$inferSelect;
export type InsertCoordinationSession = typeof coordinationSessions.$inferInsert;

/**
 * Model Quality Checks - ISO 19650 validation
 */
export const modelQualityChecks = mysqlTable("modelQualityChecks", {
  id: int("id").autoincrement().primaryKey(),
  modelId: int("modelId").notNull(),
  checkDate: timestamp("checkDate").defaultNow().notNull(),
  checkType: mysqlEnum("checkType", [
    "geometry", "metadata", "naming", "classification",
    "coordinates", "units", "duplicates", "iso19650"
  ]).notNull(),
  status: mysqlEnum("status", ["passed", "failed", "warning"]).notNull(),
  // Check results
  issuesFound: int("issuesFound").default(0),
  criticalIssues: int("criticalIssues").default(0),
  warnings: int("warnings").default(0),
  // Detailed results
  results: text("results"), // JSON with detailed check results
  recommendations: text("recommendations"),
  // Metadata
  checkedBy: varchar("checkedBy", { length: 100 }), // "AI" or user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ModelQualityCheck = typeof modelQualityChecks.$inferSelect;
export type InsertModelQualityCheck = typeof modelQualityChecks.$inferInsert;

/**
 * AI Analysis results
 */
export const aiAnalyses = mysqlTable("aiAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  modelId: int("modelId"),
  analysisType: mysqlEnum("analysisType", ["clash_detection", "risk_prediction", "cost_optimization", "schedule_analysis", "quality_check"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  results: text("results"), // JSON with analysis results
  confidence: float("confidence"),
  recommendations: text("recommendations"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type AiAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAiAnalysis = typeof aiAnalyses.$inferInsert;

/**
 * Training resources for empleabilidad module
 */
export const trainingResources = mysqlTable("trainingResources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["bim_basics", "software_training", "methodology", "standards", "case_study"]).notNull(),
  type: mysqlEnum("type", ["video", "article", "course", "webinar", "document"]).notNull(),
  url: text("url"),
  duration: int("duration"), // minutes
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingResource = typeof trainingResources.$inferSelect;
export type InsertTrainingResource = typeof trainingResources.$inferInsert;

/**
 * User certifications and achievements
 */
export const userCertifications = mysqlTable("userCertifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  issuer: varchar("issuer", { length: 255 }),
  issueDate: timestamp("issueDate"),
  expiryDate: timestamp("expiryDate"),
  credentialUrl: text("credentialUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserCertification = typeof userCertifications.$inferSelect;
export type InsertUserCertification = typeof userCertifications.$inferInsert;

/**
 * Communication channels/forums
 */
export const channels = mysqlTable("channels", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["general", "technical", "coordination", "announcements"]).notNull(),
  isPrivate: boolean("isPrivate").default(false).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = typeof channels.$inferInsert;

/**
 * Messages in channels
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachmentUrl"),
  replyToId: int("replyToId"), // For threading
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
