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

  // Add mock corpus documents — re-fetch to get project created above if it was just inserted
  const checkoutProject = await prisma.researchProject.findFirst({
    where: { title: "Checkout abandonment analysis", workspace_id: workspace.id },
  });
  if (checkoutProject) {
    const existingSources = await prisma.source.count({ where: { project_id: checkoutProject.id } });
    if (existingSources === 0) {
      type SeedEntry = {
        url: string;
        title: string;
        content: string;
        sourceStatus: "PROCESSED" | "PROCESSING";
        screeningStatus: "INCLUDED" | "EXCLUDED" | "MAYBE" | "PENDING";
        relevanceScore: number | null;
      };

      const entries: SeedEntry[] = [
        // 5 INCLUDED
        {
          url: "https://baymard.com/research/checkout-usability",
          title: "Checkout Usability: An In-Depth Study of 50 E-commerce Sites",
          content: "Analysis of checkout flows across 50 major e-commerce sites reveals that mandatory account creation causes 28% of users to abandon purchases. Guest checkout reduces abandonment by up to 45% in A/B tests. Progressive disclosure of form fields further improves completion rates.",
          sourceStatus: "PROCESSED",
          screeningStatus: "INCLUDED",
          relevanceScore: 0.92,
        },
        {
          url: "https://nielsengroup.com/articles/mobile-checkout-abandonment",
          title: "Mobile Checkout Abandonment: Causes and UX Solutions",
          content: "Mobile users experience 85% higher cart abandonment compared to desktop. Primary causes include small touch targets, multi-step forms, and session timeouts. Implementing biometric payment and saved card details reduces mobile abandonment by 38%.",
          sourceStatus: "PROCESSED",
          screeningStatus: "INCLUDED",
          relevanceScore: 0.88,
        },
        {
          url: "https://nngroup.com/articles/checkout-progress-indicators",
          title: "Progress Indicators During Checkout: Effect on Abandonment Rates",
          content: "Step-by-step progress indicators during checkout reduce perceived effort and increase completion rates by 22%. Users who can see remaining steps are less likely to abandon mid-funnel. Visual clarity of progress significantly impacts trust and purchase intent.",
          sourceStatus: "PROCESSED",
          screeningStatus: "INCLUDED",
          relevanceScore: 0.85,
        },
        {
          url: "https://shopify.dev/blog/shipping-cost-transparency",
          title: "Unexpected Shipping Costs: The #1 Reason for Cart Abandonment",
          content: "Unexpected shipping costs at checkout are cited by 55% of abandoning shoppers as the primary reason. Showing estimated shipping costs on product pages or early in checkout reduces late-stage abandonment by 33%. Free shipping thresholds increase average order value.",
          sourceStatus: "PROCESSED",
          screeningStatus: "INCLUDED",
          relevanceScore: 0.82,
        },
        {
          url: "https://conversionxl.com/one-click-checkout-study",
          title: "One-Click Checkout: Conversion Impact Study Across 12 Retail Brands",
          content: "One-click checkout implementations across 12 retail brands showed average conversion lift of 29%. Stored payment credentials reduce checkout time from 4.2 minutes to under 30 seconds. Brands using one-click saw 18% increase in repeat purchase frequency.",
          sourceStatus: "PROCESSED",
          screeningStatus: "INCLUDED",
          relevanceScore: 0.75,
        },
        // 3 EXCLUDED
        {
          url: "https://marketingland.com/email-retargeting-abandoned-carts",
          title: "Email Retargeting Strategies for Abandoned Cart Recovery",
          content: "Email retargeting campaigns recover 5-8% of abandoned carts. Personalized subject lines and product images increase open rates by 40%. Sending within one hour of abandonment is critical for recovery effectiveness.",
          sourceStatus: "PROCESSED",
          screeningStatus: "EXCLUDED",
          relevanceScore: 0.28,
        },
        {
          url: "https://searchenginejournal.com/seo-product-pages",
          title: "SEO Best Practices for E-commerce Product Pages",
          content: "Structured data markup and optimized product titles improve organic search rankings by 35%. Page speed below 2 seconds reduces bounce rates significantly. Long-tail keyword targeting drives higher-intent traffic to product listings.",
          sourceStatus: "PROCESSED",
          screeningStatus: "EXCLUDED",
          relevanceScore: 0.18,
        },
        {
          url: "https://techcrunch.com/supply-chain-disruptions-2025",
          title: "Global Supply Chain Disruptions: Impact on E-commerce Inventory",
          content: "Supply chain disruptions in 2025 led to 22% increase in out-of-stock events across major retail platforms. Merchants using predictive inventory tools reduced stockouts by 40%. Consumer tolerance for backorders has declined significantly post-pandemic.",
          sourceStatus: "PROCESSED",
          screeningStatus: "EXCLUDED",
          relevanceScore: 0.15,
        },
        // 2 MAYBE
        {
          url: "https://uxdesign.cc/payment-form-ux-patterns",
          title: "Payment Form UX Patterns: Field Validation and Error Recovery",
          content: "Inline validation on payment forms reduces error rates by 22% and completion time by 18%. Real-time card type detection and formatting assistance lower perceived complexity. Error messages with specific guidance recover 65% of users who encounter form errors.",
          sourceStatus: "PROCESSED",
          screeningStatus: "MAYBE",
          relevanceScore: 0.55,
        },
        {
          url: "https://webflow.com/blog/trust-signals-checkout",
          title: "Trust Signals and Security Badges at Checkout: Conversion Effects",
          content: "Security badges and trust signals at checkout increase purchase completion by 7-15% among first-time buyers. SSL indicators and recognizable payment logos reduce anxiety. Placement near the payment button has stronger impact than site-wide footer placement.",
          sourceStatus: "PROCESSED",
          screeningStatus: "MAYBE",
          relevanceScore: 0.48,
        },
        // 2 PENDING (PROCESSING source status)
        {
          url: "https://arxiv.org/abs/2501.checkout-behavior-ml",
          title: "Predicting Checkout Abandonment with Machine Learning: A 2025 Dataset Study",
          content: "Machine learning models trained on clickstream data predict checkout abandonment with 78% accuracy. Key predictive features include scroll depth, time on payment page, and return visit count. Real-time intervention based on ML scoring recovers 12% of at-risk sessions.",
          sourceStatus: "PROCESSING",
          screeningStatus: "PENDING",
          relevanceScore: null,
        },
        {
          url: "https://hbr.org/2025/11/reducing-friction-in-digital-commerce",
          title: "Reducing Friction in Digital Commerce: A Field Experiment",
          content: "A field experiment with 50,000 shoppers demonstrated that reducing checkout steps from 5 to 3 increases conversion by 21%. Cognitive load reduction through simplified UI design has compound effects on completion and satisfaction scores.",
          sourceStatus: "PROCESSING",
          screeningStatus: "PENDING",
          relevanceScore: null,
        },
      ];

      for (const entry of entries) {
        const source = await prisma.source.create({
          data: {
            project_id: checkoutProject.id,
            url: entry.url,
            title: entry.title,
            type: "URL",
            status: entry.sourceStatus,
          },
        });

        await prisma.document.create({
          data: {
            project_id: checkoutProject.id,
            source_id: source.id,
            title: entry.title,
            content: entry.content,
            word_count: entry.content.split(/\s+/).length,
            relevance_score: entry.relevanceScore,
            screening_status: entry.screeningStatus,
          },
        });
      }

      console.log(`Seeded 12 corpus documents for "Checkout abandonment analysis"`);
    }
  }

  console.log(`Seed complete — workspace: ${workspace.id}, user: ${user.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
