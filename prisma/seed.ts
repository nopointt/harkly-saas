import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
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

  // Seed extractions for checkout project
  if (checkoutProject) {
    const existingExtractions = await prisma.extraction.count({ where: { project_id: checkoutProject.id } });
    if (existingExtractions === 0) {
      // Get INCLUDED documents to attach extractions to
      const includedDocs = await prisma.document.findMany({
        where: { project_id: checkoutProject.id, screening_status: "INCLUDED" },
      });

      if (includedDocs.length > 0) {
        type ExtractionSeed = {
          docIndex: number;
          type: "FACT" | "METRIC" | "QUOTE" | "THEME" | "CONTRADICTION";
          content: string;
          confidence: number;
          verified: boolean;
          rejected: boolean;
          metadata?: Record<string, unknown>;
        };

        const extractionSeeds: ExtractionSeed[] = [
          // Facts (15 total: 5 verified, 5 pending, 5 rejected)
          { docIndex: 0, type: "FACT", content: "Guest checkout reduces cart abandonment by up to 45% in A/B tests compared to mandatory account creation", confidence: 0.92, verified: true, rejected: false },
          { docIndex: 0, type: "FACT", content: "Mandatory account creation causes 28% of users to abandon purchases during checkout", confidence: 0.89, verified: true, rejected: false },
          { docIndex: 1, type: "FACT", content: "Mobile users experience 85% higher cart abandonment compared to desktop users", confidence: 0.88, verified: true, rejected: false },
          { docIndex: 2, type: "FACT", content: "Progress indicators during checkout reduce perceived effort and increase completion rates", confidence: 0.85, verified: true, rejected: false },
          { docIndex: 3, type: "FACT", content: "Showing estimated shipping costs early in checkout reduces late-stage abandonment by 33%", confidence: 0.82, verified: true, rejected: false },
          { docIndex: 4, type: "FACT", content: "One-click checkout implementations showed average conversion lift of 29% across 12 retail brands", confidence: 0.79, verified: false, rejected: false },
          { docIndex: 0, type: "FACT", content: "Progressive disclosure of form fields improves checkout completion rates", confidence: 0.75, verified: false, rejected: false },
          { docIndex: 1, type: "FACT", content: "Biometric payment reduces mobile abandonment by 38%", confidence: 0.72, verified: false, rejected: false },
          { docIndex: 2, type: "FACT", content: "Visual clarity of progress significantly impacts trust and purchase intent", confidence: 0.70, verified: false, rejected: false },
          { docIndex: 3, type: "FACT", content: "Free shipping thresholds increase average order value for e-commerce sites", confidence: 0.68, verified: false, rejected: false },
          { docIndex: 4, type: "FACT", content: "Stored payment credentials reduce checkout time from 4.2 minutes to under 30 seconds", confidence: 0.65, verified: false, rejected: true },
          { docIndex: 0, type: "FACT", content: "Session timeouts are a primary cause of checkout abandonment on mobile", confidence: 0.61, verified: false, rejected: true },
          { docIndex: 1, type: "FACT", content: "Small touch targets on mobile checkout forms significantly increase abandonment", confidence: 0.58, verified: false, rejected: true },
          { docIndex: 2, type: "FACT", content: "Multi-step forms contribute to higher abandonment rates than single-page checkout", confidence: 0.55, verified: false, rejected: true },
          { docIndex: 3, type: "FACT", content: "Users who can see remaining checkout steps are less likely to abandon mid-funnel", confidence: 0.52, verified: false, rejected: true },

          // Metrics (8 total)
          { docIndex: 0, type: "METRIC", content: "45% reduction in abandonment with guest checkout (A/B test result)", confidence: 0.94, verified: false, rejected: false },
          { docIndex: 1, type: "METRIC", content: "85% higher cart abandonment on mobile vs desktop", confidence: 0.91, verified: false, rejected: false },
          { docIndex: 2, type: "METRIC", content: "22% increase in completion rates with step-by-step progress indicators", confidence: 0.87, verified: false, rejected: false },
          { docIndex: 3, type: "METRIC", content: "55% of abandoning shoppers cite unexpected shipping costs as primary reason", confidence: 0.85, verified: false, rejected: false },
          { docIndex: 4, type: "METRIC", content: "29% average conversion lift from one-click checkout across 12 brands", confidence: 0.82, verified: false, rejected: false },
          { docIndex: 0, type: "METRIC", content: "28% of users abandon due to mandatory account creation requirement", confidence: 0.90, verified: false, rejected: false },
          { docIndex: 1, type: "METRIC", content: "38% reduction in mobile abandonment with biometric payment option", confidence: 0.78, verified: false, rejected: false },
          { docIndex: 4, type: "METRIC", content: "18% increase in repeat purchase frequency with one-click checkout", confidence: 0.73, verified: false, rejected: false },

          // Quotes (10 total: 5 verified)
          { docIndex: 0, type: "QUOTE", content: "\"Guest checkout reduces abandonment by up to 45% in A/B tests\"", confidence: 0.95, verified: true, rejected: false },
          { docIndex: 1, type: "QUOTE", content: "\"Mobile users experience 85% higher cart abandonment compared to desktop\"", confidence: 0.92, verified: true, rejected: false },
          { docIndex: 2, type: "QUOTE", content: "\"Users who can see remaining steps are less likely to abandon mid-funnel\"", confidence: 0.88, verified: true, rejected: false },
          { docIndex: 3, type: "QUOTE", content: "\"Unexpected shipping costs at checkout are cited by 55% of abandoning shoppers\"", confidence: 0.85, verified: true, rejected: false },
          { docIndex: 4, type: "QUOTE", content: "\"Brands using one-click saw 18% increase in repeat purchase frequency\"", confidence: 0.79, verified: true, rejected: false },
          { docIndex: 0, type: "QUOTE", content: "\"Mandatory account creation causes 28% of users to abandon purchases\"", confidence: 0.91, verified: false, rejected: false },
          { docIndex: 1, type: "QUOTE", content: "\"Implementing biometric payment and saved card details reduces mobile abandonment by 38%\"", confidence: 0.84, verified: false, rejected: false },
          { docIndex: 2, type: "QUOTE", content: "\"Step-by-step progress indicators during checkout reduce perceived effort\"", confidence: 0.78, verified: false, rejected: false },
          { docIndex: 3, type: "QUOTE", content: "\"Showing estimated shipping costs on product pages reduces late-stage abandonment by 33%\"", confidence: 0.82, verified: false, rejected: false },
          { docIndex: 4, type: "QUOTE", content: "\"One-click checkout implementations across 12 retail brands showed average conversion lift of 29%\"", confidence: 0.75, verified: false, rejected: false },

          // Themes (5 total)
          { docIndex: 0, type: "THEME", content: "Payment friction", confidence: 0.90, verified: false, rejected: false },
          { docIndex: 1, type: "THEME", content: "Mobile UX complexity", confidence: 0.88, verified: false, rejected: false },
          { docIndex: 2, type: "THEME", content: "Trust and transparency", confidence: 0.85, verified: false, rejected: false },
          { docIndex: 3, type: "THEME", content: "Cost visibility", confidence: 0.82, verified: false, rejected: false },
          { docIndex: 4, type: "THEME", content: "Checkout speed optimization", confidence: 0.79, verified: false, rejected: false },

          // Contradictions (2 total)
          {
            docIndex: 0, type: "CONTRADICTION",
            content: "Conflicting claims about primary cause of cart abandonment between mandatory account creation vs unexpected shipping costs",
            confidence: 0.76,
            verified: false, rejected: false,
            metadata: {
              claim_a: "Mandatory account creation causes 28% of users to abandon purchases",
              source_a_title: "Checkout Usability: An In-Depth Study of 50 E-commerce Sites",
              claim_b: "Unexpected shipping costs at checkout are cited by 55% of abandoning shoppers as the primary reason",
              source_b_title: "Unexpected Shipping Costs: The #1 Reason for Cart Abandonment",
              explanation: "These sources disagree on the primary driver of abandonment — account creation vs. shipping cost transparency",
            },
          },
          {
            docIndex: 1, type: "CONTRADICTION",
            content: "Conflicting data on mobile abandonment impact — percentage varies significantly between sources",
            confidence: 0.71,
            verified: false, rejected: false,
            metadata: {
              claim_a: "Mobile users experience 85% higher cart abandonment compared to desktop",
              source_a_title: "Mobile Checkout Abandonment: Causes and UX Solutions",
              claim_b: "One-click checkout implementations showed average conversion lift of 29%",
              source_b_title: "One-Click Checkout: Conversion Impact Study Across 12 Retail Brands",
              explanation: "These sources present different magnitude estimates for checkout optimization impact on mobile",
            },
          },
        ];

        for (const seed of extractionSeeds) {
          const doc = includedDocs[seed.docIndex % includedDocs.length];
          await prisma.extraction.create({
            data: {
              project_id: checkoutProject.id,
              document_id: doc.id,
              extraction_type: seed.type,
              content: seed.content,
              confidence: seed.confidence,
              verified: seed.verified,
              rejected: seed.rejected,
              metadata: (seed.metadata ?? { position_hint: "main content" }) as Prisma.InputJsonValue,
            },
          });
        }

        // Mark included docs as extraction_processed and update project
        await prisma.document.updateMany({
          where: { project_id: checkoutProject.id, screening_status: "INCLUDED" },
          data: { extraction_processed: true },
        });
        await prisma.researchProject.update({
          where: { id: checkoutProject.id },
          data: {
            extraction_status: "COMPLETED",
            extraction_total: includedDocs.length,
            extraction_done: includedDocs.length,
          },
        });

        console.log(`Seeded ${extractionSeeds.length} extractions for "Checkout abandonment analysis"`);
      }
    }
  }

  // ── Seed Artifacts for "Checkout abandonment analysis" ─────────────────────
  if (checkoutProject) {
    const existingArtifacts = await prisma.artifact.count({
      where: { project_id: checkoutProject.id },
    });

    if (existingArtifacts === 0) {
      // Re-use the first 5 included document IDs for source references in mock content
      const includedDocs = await prisma.document.findMany({
        where: { project_id: checkoutProject.id, screening_status: "INCLUDED" },
        take: 5,
      });
      const docId = (idx: number) => includedDocs[idx % includedDocs.length]?.id ?? "doc-unknown";
      const docTitle = (idx: number) =>
        includedDocs[idx % includedDocs.length]?.title ?? "Unknown source";

      // ── 1. FACT_PACK ───────────────────────────────────────────────────────
      const factPackContent = {
        themes: [
          {
            name: "Mobile UX",
            facts: [
              {
                text: "Mobile users experience 85% higher cart abandonment compared to desktop users",
                source_document_id: docId(1),
                source_title: docTitle(1),
                confidence: 0.88,
                is_metric: true,
                contradicted: false,
              },
              {
                text: "Biometric payment reduces mobile abandonment by 38%",
                source_document_id: docId(1),
                source_title: docTitle(1),
                confidence: 0.72,
                is_metric: true,
                contradicted: false,
              },
              {
                text: "Small touch targets on mobile checkout forms significantly increase abandonment",
                source_document_id: docId(1),
                source_title: docTitle(1),
                confidence: 0.58,
                is_metric: false,
                contradicted: false,
              },
            ],
          },
          {
            name: "Trust Factors",
            facts: [
              {
                text: "Security badges and trust signals at checkout increase purchase completion by 7-15% among first-time buyers",
                source_document_id: docId(2),
                source_title: docTitle(2),
                confidence: 0.85,
                is_metric: true,
                contradicted: false,
              },
              {
                text: "Progress indicators during checkout reduce perceived effort and increase completion rates by 22%",
                source_document_id: docId(2),
                source_title: docTitle(2),
                confidence: 0.85,
                is_metric: true,
                contradicted: false,
              },
              {
                text: "Visual clarity of progress significantly impacts trust and purchase intent",
                source_document_id: docId(2),
                source_title: docTitle(2),
                confidence: 0.70,
                is_metric: false,
                contradicted: false,
              },
            ],
          },
          {
            name: "Price Sensitivity",
            facts: [
              {
                text: "Unexpected shipping costs are cited by 55% of abandoning shoppers as the primary reason",
                source_document_id: docId(3),
                source_title: docTitle(3),
                confidence: 0.82,
                is_metric: true,
                contradicted: true,
              },
              {
                text: "Showing estimated shipping costs early in checkout reduces late-stage abandonment by 33%",
                source_document_id: docId(3),
                source_title: docTitle(3),
                confidence: 0.82,
                is_metric: true,
                contradicted: false,
              },
            ],
          },
        ],
        generated_at: "2026-03-08T10:00:00.000Z",
        extraction_count: 8,
      };

      const factPackArtifact = await prisma.artifact.create({
        data: {
          project_id: checkoutProject.id,
          artifact_type: "FACT_PACK",
          status: "GENERATED",
          current_version: 1,
          content: factPackContent as Prisma.InputJsonValue,
        },
      });
      await prisma.artifactVersion.create({
        data: {
          artifact_id: factPackArtifact.id,
          version: 1,
          content: factPackContent as Prisma.InputJsonValue,
        },
      });

      // ── 2. EVIDENCE_MAP ────────────────────────────────────────────────────
      const evidenceMapContent = {
        frame_components: ["P", "I", "C", "O"],
        themes: ["Mobile UX", "Trust Factors", "Price Sensitivity", "Checkout Speed"],
        matrix: [
          {
            theme: "Mobile UX",
            components: [
              { component: "P", strength: "strong", fact_count: 3 },
              { component: "I", strength: "moderate", fact_count: 2 },
              { component: "C", strength: "weak", fact_count: 1 },
              { component: "O", strength: "strong", fact_count: 3 },
            ],
          },
          {
            theme: "Trust Factors",
            components: [
              { component: "P", strength: "moderate", fact_count: 2 },
              { component: "I", strength: "strong", fact_count: 3 },
              { component: "C", strength: "gap", fact_count: 0 },
              { component: "O", strength: "moderate", fact_count: 2 },
            ],
          },
          {
            theme: "Price Sensitivity",
            components: [
              { component: "P", strength: "strong", fact_count: 4 },
              { component: "I", strength: "weak", fact_count: 1 },
              { component: "C", strength: "moderate", fact_count: 2 },
              { component: "O", strength: "strong", fact_count: 3 },
            ],
          },
          {
            theme: "Checkout Speed",
            components: [
              { component: "P", strength: "moderate", fact_count: 2 },
              { component: "I", strength: "strong", fact_count: 3 },
              { component: "C", strength: "moderate", fact_count: 2 },
              { component: "O", strength: "strong", fact_count: 4 },
            ],
          },
        ],
        generated_at: "2026-03-08T10:05:00.000Z",
      };

      const evidenceMapArtifact = await prisma.artifact.create({
        data: {
          project_id: checkoutProject.id,
          artifact_type: "EVIDENCE_MAP",
          status: "GENERATED",
          current_version: 1,
          content: evidenceMapContent as Prisma.InputJsonValue,
        },
      });
      await prisma.artifactVersion.create({
        data: {
          artifact_id: evidenceMapArtifact.id,
          version: 1,
          content: evidenceMapContent as Prisma.InputJsonValue,
        },
      });

      // ── 3. EMPATHY_MAP ─────────────────────────────────────────────────────
      const empathyMapContent = {
        say: [
          {
            text: '"Guest checkout reduces abandonment by up to 45% in A/B tests"',
            source_document_id: docId(0),
            source_title: docTitle(0),
            is_quote: true,
          },
          {
            text: '"Mobile users experience 85% higher cart abandonment compared to desktop"',
            source_document_id: docId(1),
            source_title: docTitle(1),
            is_quote: true,
          },
          {
            text: '"Unexpected shipping costs at checkout are cited by 55% of abandoning shoppers"',
            source_document_id: docId(3),
            source_title: docTitle(3),
            is_quote: true,
          },
          {
            text: '"Brands using one-click saw 18% increase in repeat purchase frequency"',
            source_document_id: docId(4),
            source_title: docTitle(4),
            is_quote: true,
          },
        ],
        think: [
          {
            text: "Customers believe mandatory account creation is an unnecessary barrier to purchasing",
            source_document_id: docId(0),
            source_title: docTitle(0),
          },
          {
            text: "Shoppers perceive hidden shipping costs as a form of deception by the retailer",
            source_document_id: docId(3),
            source_title: docTitle(3),
          },
          {
            text: "Users expect to see remaining checkout steps clearly to estimate total effort",
            source_document_id: docId(2),
            source_title: docTitle(2),
          },
          {
            text: "Trust in a site is closely linked to recognisable payment logos and SSL indicators",
            source_document_id: docId(2),
            source_title: docTitle(2),
          },
        ],
        do: [
          {
            text: "Abandon checkout when confronted with mandatory account creation at the final step",
            source_document_id: docId(0),
            source_title: docTitle(0),
          },
          {
            text: "Switch to desktop when mobile checkout forms become too cumbersome",
            source_document_id: docId(1),
            source_title: docTitle(1),
          },
          {
            text: "Click away when unexpected shipping costs appear on the order summary",
            source_document_id: docId(3),
            source_title: docTitle(3),
          },
          {
            text: "Complete purchases faster and more often when one-click checkout is available",
            source_document_id: docId(4),
            source_title: docTitle(4),
          },
        ],
        feel: [
          {
            text: "Frustration when required to create an account just to complete a simple purchase",
            source_document_id: docId(0),
            source_title: docTitle(0),
          },
          {
            text: "Anxiety about entering payment details on sites without visible trust signals",
            source_document_id: docId(2),
            source_title: docTitle(2),
          },
          {
            text: "Overwhelmed by multi-step checkout forms on a small mobile screen",
            source_document_id: docId(1),
            source_title: docTitle(1),
          },
          {
            text: "Relief and satisfaction when checkout is completed in under 30 seconds",
            source_document_id: docId(4),
            source_title: docTitle(4),
          },
        ],
        subject: "E-commerce customers",
        generated_at: "2026-03-08T10:10:00.000Z",
      };

      const empathyMapArtifact = await prisma.artifact.create({
        data: {
          project_id: checkoutProject.id,
          artifact_type: "EMPATHY_MAP",
          status: "GENERATED",
          current_version: 1,
          content: empathyMapContent as Prisma.InputJsonValue,
        },
      });
      await prisma.artifactVersion.create({
        data: {
          artifact_id: empathyMapArtifact.id,
          version: 1,
          content: empathyMapContent as Prisma.InputJsonValue,
        },
      });

      console.log("Seeded 3 artifacts (Fact Pack, Evidence Map, Empathy Map) for Checkout abandonment analysis");
    }
  }

  // ── Seed Notes for "Checkout abandonment analysis" ─────────────────────────
  if (checkoutProject) {
    const existingNotes = await prisma.note.count({
      where: { project_id: checkoutProject.id },
    });

    if (existingNotes === 0) {
      // Grab the first included document id for linked_doc_ids on note 1
      const firstDoc = await prisma.document.findFirst({
        where: { project_id: checkoutProject.id, screening_status: "INCLUDED" },
        orderBy: { created_at: "asc" },
      });

      const notesData = [
        {
          content:
            "Users seem more comfortable with saved card options — worth investigating if 1-click checkout matters here",
          tags: ["hypothesis", "payment"],
          linked_doc_ids: firstDoc ? [firstDoc.id] : [],
        },
        {
          content:
            "Trust signals are consistently mentioned across 4 different sources — this is a strong theme",
          tags: ["trust", "strong-signal"],
          linked_doc_ids: [],
        },
        {
          content:
            "Contradiction between Report A (73% abandon at payment) and Blog B (52%) — need to check methodology",
          tags: ["contradiction", "metrics"],
          linked_doc_ids: [],
        },
        {
          content:
            "Mobile checkout friction much higher — might be separate PICO needed",
          tags: ["mobile", "scoping"],
          linked_doc_ids: [],
        },
        {
          content:
            "Key insight: the problem isn't form length, it's unexpected costs at last step",
          tags: ["insight", "priority"],
          linked_doc_ids: [],
        },
      ];

      for (const noteData of notesData) {
        await prisma.note.create({
          data: {
            project_id: checkoutProject.id,
            user_id: user.id,
            content: noteData.content,
            tags: noteData.tags,
            linked_doc_ids: noteData.linked_doc_ids,
          },
        });
      }

      console.log(`Seeded 5 notes for "Checkout abandonment analysis"`);
    }
  }

  console.log(`Seed complete — workspace: ${workspace.id}, user: ${user.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
