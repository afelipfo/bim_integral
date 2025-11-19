import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Dashboard
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getDashboardStats(ctx.user.id);
    }),
  }),

  // Projects Module
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getProjectsByUser(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(["planning", "design", "construction", "completed", "on_hold"]).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        budget: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createProject({
          ...input,
          createdBy: ctx.user.id,
          completionPercentage: 0,
          actualCost: 0,
        });
        
        // Add creator as project owner
        const projectId = Number((result as any).insertId || 0);
        if (projectId > 0) {
          await db.addProjectMember({
            projectId,
            userId: ctx.user.id,
            role: "owner",
          });
        }
        
        return { success: true, projectId };
      }),
    
    members: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectMembers(input.projectId);
      }),
    
    addMember: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        userId: z.number(),
        role: z.enum(["owner", "architect", "engineer_structural", "engineer_mep", "contractor", "viewer"]),
      }))
      .mutation(async ({ input }) => {
        await db.addProjectMember(input);
        return { success: true };
      }),
  }),

  // BIM Core Module
  bimModels: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getModelsByProject(input.projectId);
      }),
    
    latest: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLatestModels(input.projectId);
      }),
    
    upload: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        discipline: z.enum(["architecture", "structural", "mep", "civil", "landscape"]),
        fileUrl: z.string(),
        fileKey: z.string(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createBimModel({
          ...input,
          uploadedBy: ctx.user.id,
          version: 1,
          isLatest: true,
        });
        return { success: true };
      }),
  }),

  // Analytics Module
  analytics: router({
    projectMetrics: protectedProcedure
      .input(z.object({ 
        projectId: z.number(),
        days: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getProjectMetrics(input.projectId, input.days);
      }),
    
    projectSummary: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const project = await db.getProjectById(input.projectId);
        const issues = await db.getIssuesByProject(input.projectId);
        const models = await db.getModelsByProject(input.projectId);
        
        const openIssues = issues.filter(i => i.status === 'open' || i.status === 'in_progress');
        const criticalIssues = issues.filter(i => i.priority === 'critical');
        const aiDetectedIssues = issues.filter(i => i.detectedByAI);
        
        return {
          project,
          stats: {
            totalIssues: issues.length,
            openIssues: openIssues.length,
            criticalIssues: criticalIssues.length,
            aiDetectedIssues: aiDetectedIssues.length,
            totalModels: models.length,
            budgetUtilization: project?.budget && project?.actualCost 
              ? (project.actualCost / project.budget) * 100 
              : 0,
          },
        };
      }),
  }),

  // Communications Module
  communications: router({
    channels: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChannelsByProject(input.projectId);
      }),
    
    createChannel: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        type: z.enum(["general", "technical", "coordination", "announcements"]),
        isPrivate: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createChannel({
          ...input,
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),
    
    messages: protectedProcedure
      .input(z.object({ 
        channelId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getChannelMessages(input.channelId, input.limit);
      }),
    
    sendMessage: protectedProcedure
      .input(z.object({
        channelId: z.number(),
        content: z.string(),
        attachmentUrl: z.string().optional(),
        replyToId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createMessage({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // Issues and RFIs Module
  issues: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getIssuesByProject(input.projectId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getIssueById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string(),
        description: z.string(),
        type: z.enum(["issue", "rfi", "clash", "observation"]),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        discipline: z.enum(["architecture", "structural", "mep", "civil", "general"]).optional(),
        modelId: z.number().optional(),
        assignedTo: z.number().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createIssue({
          ...input,
          createdBy: ctx.user.id,
          status: "open",
        });
        return { success: true };
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateIssueStatus(input.id, input.status);
        return { success: true };
      }),
    
    comments: protectedProcedure
      .input(z.object({ issueId: z.number() }))
      .query(async ({ input }) => {
        return await db.getIssueComments(input.issueId);
      }),
    
    addComment: protectedProcedure
      .input(z.object({
        issueId: z.number(),
        content: z.string(),
        attachmentUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.addIssueComment({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // AI Module
  ai: router({
    analyses: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAIAnalysesByProject(input.projectId);
      }),
    
    runClashDetection: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        modelId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Create analysis record
        const result = await db.createAIAnalysis({
          projectId: input.projectId,
          modelId: input.modelId,
          analysisType: "clash_detection",
          status: "processing",
          createdBy: ctx.user.id,
        });
        
        // Simulate AI analysis (in production, this would be async)
        // For demo purposes, we'll create some mock clashes
        setTimeout(async () => {
          const mockResults = {
            clashes: [
              {
                id: 1,
                type: "hard_clash",
                severity: "high",
                description: "Structural beam intersects with HVAC duct",
                location: { x: 10.5, y: 20.3, z: 3.2 },
              },
              {
                id: 2,
                type: "soft_clash",
                severity: "medium",
                description: "Insufficient clearance between pipe and wall",
                location: { x: 15.2, y: 18.7, z: 2.8 },
              },
            ],
            summary: "2 clashes detected",
          };
          
          const analysisId = Number((result as any).insertId || 0);
          if (analysisId > 0) {
            await db.updateAIAnalysis(analysisId, {
            status: "completed",
            results: JSON.stringify(mockResults),
            confidence: 0.92,
            recommendations: "Review structural-MEP coordination in zones A and B",
            completedAt: new Date(),
          });
          }
        }, 2000);
        
        return { success: true, analysisId: Number((result as any).insertId || 0) };
      }),
    
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Eres un asistente experto en metodología BIM (Building Information Modeling). Ayudas a profesionales de la construcción con consultas sobre proyectos, coordinación, análisis y mejores prácticas BIM. Responde de manera clara, concisa y profesional en español.",
            },
            {
              role: "user",
              content: input.message,
            },
          ],
        });
        
        return {
          response: response.choices[0]?.message?.content || "Lo siento, no pude procesar tu consulta.",
        };
      }),
  }),

  // Empleabilidad Module
  empleabilidad: router({
    trainingResources: publicProcedure.query(async () => {
      return await db.getAllTrainingResources();
    }),
    
    resourcesByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await db.getTrainingResourcesByCategory(input.category);
      }),
    
    myCertifications: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCertifications(ctx.user.id);
    }),
    
    addCertification: protectedProcedure
      .input(z.object({
        name: z.string(),
        issuer: z.string().optional(),
        issueDate: z.date().optional(),
        expiryDate: z.date().optional(),
        credentialUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.addUserCertification({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // Documents Module
  documents: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDocumentsByProject(input.projectId);
      }),
    
    upload: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        category: z.enum(["contract", "drawing", "specification", "report", "photo", "other"]),
        fileUrl: z.string(),
        fileKey: z.string(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createDocument({
          ...input,
          uploadedBy: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // Notifications Module
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserNotifications(ctx.user.id);
    }),
    
    unread: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotifications(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
  }),

  // ==================== BIM Technical Modules ====================
  
  // BIM Execution Plan (BEP) Module
  bep: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBEPsByProject(input.projectId);
      }),
    
    active: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getActiveBEP(input.projectId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        version: z.string(),
        informationRequirements: z.string().optional(),
        levelOfInformation: z.enum(["LOI_1", "LOI_2", "LOI_3", "LOI_4", "LOI_5", "LOI_6"]).optional(),
        commonDataEnvironment: z.string().optional(),
        leadAppointedParty: z.string().optional(),
        taskTeamLeaders: z.string().optional(),
        deliverables: z.string().optional(),
        milestones: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createBEP({
          ...input,
          createdBy: ctx.user.id,
          status: "draft",
        });
        return { success: true };
      }),
    
    approve: protectedProcedure
      .input(z.object({ bepId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.approveBEP(input.bepId, ctx.user.id);
        return { success: true };
      }),
  }),

  // IFC Model Management Module
  ifc: router({
    list: protectedProcedure
      .input(z.object({ modelId: z.number() }))
      .query(async ({ input }) => {
        return await db.getIFCModelsByBIMModel(input.modelId);
      }),
    
    byDiscipline: protectedProcedure
      .input(z.object({ 
        modelId: z.number(),
        discipline: z.enum(["architecture", "structure", "mep", "civil", "landscape"])
      }))
      .query(async ({ input }) => {
        return await db.getIFCModelsByDiscipline(input.modelId, input.discipline);
      }),
    
    federated: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFederatedModels(input.projectId);
      }),
    
    upload: protectedProcedure
      .input(z.object({
        modelId: z.number(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number().optional(),
        ifcVersion: z.string().optional(),
        ifcSchema: z.string().optional(),
        discipline: z.enum(["architecture", "structure", "mep", "civil", "landscape"]),
        lod: z.enum(["LOD_100", "LOD_200", "LOD_300", "LOD_350", "LOD_400", "LOD_500"]),
        elementCount: z.number().optional(),
        buildingStoreys: z.number().optional(),
        spaces: z.number().optional(),
        isFederated: z.boolean().optional(),
        federatedModels: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createIFCModel({
          ...input,
          uploadedBy: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // Clash Detection Module
  clashes: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getClashesByProject(input.projectId);
      }),
    
    byRun: protectedProcedure
      .input(z.object({ runId: z.string() }))
      .query(async ({ input }) => {
        return await db.getClashesByRun(input.runId);
      }),
    
    active: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getActiveClashes(input.projectId);
      }),
    
    stats: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getClashStatsByProject(input.projectId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        runId: z.string(),
        clashType: z.enum(["hard", "soft", "clearance", "duplicate"]),
        severity: z.enum(["critical", "high", "medium", "low"]),
        element1Id: z.string(),
        element1Type: z.string().optional(),
        element1Discipline: z.string().optional(),
        element2Id: z.string(),
        element2Type: z.string().optional(),
        element2Discipline: z.string().optional(),
        clashPoint: z.string().optional(),
        distance: z.number().optional(),
        volume: z.number().optional(),
        assignedTo: z.number().optional(),
        detectedBy: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createClashDetection(input);
        return { success: true };
      }),
    
    resolve: protectedProcedure
      .input(z.object({
        clashId: z.number(),
        resolution: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.resolveClash(input.clashId, ctx.user.id, input.resolution);
        return { success: true };
      }),
  }),

  // COBie Data Module
  cobie: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCOBieByProject(input.projectId);
      }),
    
    bySheet: protectedProcedure
      .input(z.object({ 
        projectId: z.number(),
        sheetType: z.enum([
          "facility", "floor", "space", "zone", "type", "component",
          "system", "assembly", "connection", "spare", "resource",
          "job", "impact", "document", "attribute", "coordinate"
        ])
      }))
      .query(async ({ input }) => {
        return await db.getCOBieBySheet(input.projectId, input.sheetType);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        sheetType: z.enum([
          "facility", "floor", "space", "zone", "type", "component",
          "system", "assembly", "connection", "spare", "resource",
          "job", "impact", "document", "attribute", "coordinate"
        ]),
        name: z.string(),
        createdBy: z.string().optional(),
        createdOn: z.date().optional(),
        category: z.string().optional(),
        extSystem: z.string().optional(),
        extObject: z.string().optional(),
        extIdentifier: z.string().optional(),
        data: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createCOBieData({
          ...input,
          uploadedBy: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // Coordination Sessions Module
  coordination: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCoordinationSessionsByProject(input.projectId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        sessionType: z.enum(["clash_review", "design_review", "coordination", "approval"]),
        scheduledDate: z.date().optional(),
        participants: z.string().optional(),
        disciplines: z.string().optional(),
        agenda: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createCoordinationSession({
          ...input,
          organizer: ctx.user.id,
          status: "scheduled",
        });
        return { success: true };
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateSessionStatus(input.sessionId, input.status);
        return { success: true };
      }),
  }),

  // Model Quality Checks Module
  quality: router({
    list: protectedProcedure
      .input(z.object({ modelId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQualityChecksByModel(input.modelId);
      }),
    
    latest: protectedProcedure
      .input(z.object({ modelId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLatestQualityCheck(input.modelId);
      }),
    
    runChecks: protectedProcedure
      .input(z.object({ modelId: z.number() }))
      .mutation(async ({ input }) => {
        const results = await db.runAutomatedQualityChecks(input.modelId);
        return { success: true, results };
      }),
  }),
});

export type AppRouter = typeof appRouter;
