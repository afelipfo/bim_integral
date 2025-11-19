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
    role: "admin",
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

describe("BIM Technical Modules", () => {
  describe("BEP Router", () => {
    it("should create a new BEP", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.bep.create({
        projectId: 1,
        version: "1.0",
        informationRequirements: JSON.stringify({ test: "data" }),
        levelOfInformation: "LOI_3",
        commonDataEnvironment: "BIM 360",
        leadAppointedParty: "Acme Corp",
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("IFC Router", () => {
    it("should upload an IFC model", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ifc.upload({
        modelId: 1,
        fileName: "architecture.ifc",
        fileUrl: "https://example.com/model.ifc",
        fileSize: 1024000,
        ifcVersion: "IFC4",
        ifcSchema: "IFC4_ADD2",
        discipline: "architecture",
        lod: "LOD_300",
        elementCount: 1500,
        buildingStoreys: 5,
        spaces: 120,
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("Clash Detection Router", () => {
    it("should create a clash detection", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.clashes.create({
        projectId: 1,
        runId: "run-001",
        clashType: "hard",
        severity: "high",
        element1Id: "3x5Hj8kP5BwQc0000000001",
        element1Type: "IfcWall",
        element1Discipline: "architecture",
        element2Id: "3x5Hj8kP5BwQc0000000002",
        element2Type: "IfcBeam",
        element2Discipline: "structure",
        distance: 0.05,
        volume: 0.002,
        detectedBy: "AI",
      });

      expect(result).toEqual({ success: true });
    });

    it("should resolve a clash", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.clashes.resolve({
        clashId: 1,
        resolution: "Adjusted beam elevation by 100mm to clear wall",
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("COBie Router", () => {
    it("should create COBie data", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.cobie.create({
        projectId: 1,
        sheetType: "facility",
        name: "Main Building",
        category: "Commercial",
        data: JSON.stringify({
          projectName: "Test Project",
          siteName: "Test Site",
          linearUnits: "meters",
          areaUnits: "square meters",
        }),
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("Coordination Sessions Router", () => {
    it("should create a coordination session", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.coordination.create({
        projectId: 1,
        title: "Weekly Coordination Meeting",
        description: "Review clashes and design updates",
        sessionType: "clash_review",
        scheduledDate: new Date("2025-12-01T10:00:00Z"),
        participants: JSON.stringify([1, 2, 3]),
        disciplines: JSON.stringify(["architecture", "structure", "mep"]),
        agenda: "1. Review critical clashes\n2. Discuss design changes\n3. Assign action items",
      });

      expect(result).toEqual({ success: true });
    });

    it("should update session status", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.coordination.updateStatus({
        sessionId: 1,
        status: "in_progress",
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("Quality Checks Router", () => {
    it("should run automated quality checks", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.quality.runChecks({
        modelId: 1,
      });

      expect(result.success).toBe(true);
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
    });
  });
});
