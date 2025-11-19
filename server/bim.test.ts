import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    title: null,
    company: null,
    skills: null,
    certifications: null,
    bio: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Dashboard Router", () => {
  it("should return dashboard stats for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.dashboard.stats();

    expect(stats).toBeDefined();
    expect(stats).toHaveProperty("totalProjects");
    expect(stats).toHaveProperty("activeIssues");
    expect(stats).toHaveProperty("completedTasks");
    expect(stats).toHaveProperty("teamMembers");
    expect(typeof stats.totalProjects).toBe("number");
  });
});

describe("Projects Router", () => {
  it("should list projects for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.list();

    expect(Array.isArray(projects)).toBe(true);
  });

  it("should create a new project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      name: "Test Project",
      description: "A test BIM project",
      status: "planning",
      budget: 100000,
    });

    expect(result.success).toBe(true);
    expect(typeof result.projectId).toBe("number");
    expect(result.projectId).toBeGreaterThanOrEqual(0);
  });
});

describe("BIM Models Router", () => {
  it("should list models for a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const models = await caller.bimModels.list({ projectId: 1 });

    expect(Array.isArray(models)).toBe(true);
  });

  it("should get latest models for a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const models = await caller.bimModels.latest({ projectId: 1 });

    expect(Array.isArray(models)).toBe(true);
  });
});

describe("Analytics Router", () => {
  it("should return project summary", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.analytics.projectSummary({ projectId: 1 });

    expect(summary).toBeDefined();
    expect(summary).toHaveProperty("stats");
    expect(summary.stats).toHaveProperty("totalIssues");
    expect(summary.stats).toHaveProperty("openIssues");
    expect(summary.stats).toHaveProperty("totalModels");
  });

  it("should return project metrics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const metrics = await caller.analytics.projectMetrics({ 
      projectId: 1,
      days: 30,
    });

    expect(Array.isArray(metrics)).toBe(true);
  });
});

describe("AI Router", () => {
  it("should list AI analyses for a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const analyses = await caller.ai.analyses({ projectId: 1 });

    expect(Array.isArray(analyses)).toBe(true);
  });

  it("should handle AI chat requests", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const response = await caller.ai.chat({ 
      message: "¿Qué es BIM?",
      projectId: 1,
    });

    expect(response).toBeDefined();
    expect(response).toHaveProperty("response");
    expect(typeof response.response).toBe("string");
  });

  it("should run clash detection", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.runClashDetection({ 
      projectId: 1,
    });

    expect(result.success).toBe(true);
    expect(typeof result.analysisId).toBe("number");
    expect(result.analysisId).toBeGreaterThanOrEqual(0);
  });
});

describe("Communications Router", () => {
  it("should list channels for a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const channels = await caller.communications.channels({ projectId: 1 });

    expect(Array.isArray(channels)).toBe(true);
  });

  it("should list messages for a channel", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const messages = await caller.communications.messages({ 
      channelId: 1,
      limit: 50,
    });

    expect(Array.isArray(messages)).toBe(true);
  });
});

describe("Issues Router", () => {
  it("should list issues for a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const issues = await caller.issues.list({ projectId: 1 });

    expect(Array.isArray(issues)).toBe(true);
  });

  it("should create a new issue", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.issues.create({
      projectId: 1,
      title: "Test Issue",
      description: "A test issue for BIM coordination",
      type: "issue",
      priority: "medium",
    });

    expect(result.success).toBe(true);
  });
});

describe("Empleabilidad Router", () => {
  it("should list training resources", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const resources = await caller.empleabilidad.trainingResources();

    expect(Array.isArray(resources)).toBe(true);
  });

  it("should list user certifications", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const certifications = await caller.empleabilidad.myCertifications();

    expect(Array.isArray(certifications)).toBe(true);
  });
});

describe("Documents Router", () => {
  it("should list documents for a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const documents = await caller.documents.list({ projectId: 1 });

    expect(Array.isArray(documents)).toBe(true);
  });
});

describe("Notifications Router", () => {
  it("should list notifications for user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.list();

    expect(Array.isArray(notifications)).toBe(true);
  });

  it("should list unread notifications", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.unread();

    expect(Array.isArray(notifications)).toBe(true);
  });
});
