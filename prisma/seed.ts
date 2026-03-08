import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@harkly.ru" },
    update: {},
    create: { email: "demo@harkly.ru", name: "Demo User" },
  });

  // Demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: { name: "Demo Workspace", slug: "demo" },
  });

  // Workspace membership
  await prisma.workspaceMember.upsert({
    where: { workspace_id_user_id: { workspace_id: workspace.id, user_id: user.id } },
    update: {},
    create: { workspace_id: workspace.id, user_id: user.id, role: "OWNER" },
  });

  // Research projects
  const existing = await prisma.researchProject.findMany({ where: { workspace_id: workspace.id } });

  if (!existing.find((p) => p.title === "Checkout abandonment analysis")) {
    await prisma.researchProject.create({
      data: {
        title: "Checkout abandonment analysis",
        frame_type: "PICO",
        frame_data: {
          p: "E-commerce customers",
          i: "Abandonment triggers",
          c: "Completed purchases",
          o: "Abandonment rate reduction",
          t: "Q2 2026",
        },
        workspace_id: workspace.id,
        user_id: user.id,
      },
    });
  }

  if (!existing.find((p) => p.title === "Onboarding friction research")) {
    await prisma.researchProject.create({
      data: {
        title: "Onboarding friction research",
        frame_type: "HMW",
        frame_data: {
          hmw: "How might we reduce onboarding friction?",
          user: "New users",
          context: "First 7 days",
          goal: "Complete setup",
          constraint: "Limited guidance",
        },
        workspace_id: workspace.id,
        user_id: user.id,
      },
    });
  }

  console.log(`Seed complete — workspace: ${workspace.id}, user: ${user.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
