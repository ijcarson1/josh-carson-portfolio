/**
 * Migration: Add linkedProject reference field to workImage
 *
 * 1. Adds a "Linked Project" reference field to the workImage content type
 * 2. Auto-populates it by matching existing order fields (workImage.order → project.order)
 *
 * Usage:
 *   node scripts/migrate-linked-project.js
 */

const contentful = require("contentful-management");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN in .env.local");
  process.exit(1);
}

async function run() {
  const client = contentful.createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment("master");

  console.log("Connected to Contentful space:", SPACE_ID);

  // --- Step 1: Add linkedProject field to workImage content type ---
  console.log("\n--- Step 1: Adding linkedProject field to workImage ---");

  let contentType = await env.getContentType("workImage");

  const existingField = contentType.fields.find((f) => f.id === "linkedProject");
  if (existingField) {
    console.log("Field linkedProject already exists, skipping creation");
  } else {
    contentType.fields.push({
      id: "linkedProject",
      name: "Linked Project",
      type: "Link",
      linkType: "Entry",
      required: false,
      validations: [{ linkContentType: ["project"] }],
    });

    contentType = await contentType.update();
    await contentType.publish();
    console.log("Added linkedProject field to workImage content type");
  }

  // --- Step 2: Fetch all projects and build order → entry ID lookup ---
  console.log("\n--- Step 2: Building project lookup by order ---");

  const projectEntries = await env.getEntries({
    content_type: "project",
    limit: 100,
  });

  const projectsByOrder = {};
  for (const entry of projectEntries.items) {
    const order = entry.fields.order?.["en-US"];
    if (order !== undefined) {
      projectsByOrder[order] = entry.sys.id;
      console.log(`  Project order ${order} → ${entry.fields.title?.["en-US"]} (${entry.sys.id})`);
    }
  }

  // --- Step 3: Fetch all workImages and populate linkedProject ---
  console.log("\n--- Step 3: Populating linkedProject on workImage entries ---");

  const imageEntries = await env.getEntries({
    content_type: "workImage",
    limit: 100,
  });

  let updated = 0;
  let skipped = 0;

  for (const entry of imageEntries.items) {
    const order = entry.fields.order?.["en-US"];
    const alt = entry.fields.alt?.["en-US"] || "unknown";
    const existingLink = entry.fields.linkedProject?.["en-US"];

    if (existingLink) {
      console.log(`  [skip] "${alt}" (order ${order}) — already has a linked project`);
      skipped++;
      continue;
    }

    const projectId = projectsByOrder[order];
    if (!projectId) {
      console.log(`  [skip] "${alt}" (order ${order}) — no project found with matching order`);
      skipped++;
      continue;
    }

    // Set the linkedProject reference
    entry.fields.linkedProject = {
      "en-US": {
        sys: { type: "Link", linkType: "Entry", id: projectId },
      },
    };

    const updatedEntry = await entry.update();
    await updatedEntry.publish();
    console.log(`  [done] "${alt}" (order ${order}) → linked to project ${projectId}`);
    updated++;
  }

  console.log(`\nMigration complete! Updated: ${updated}, Skipped: ${skipped}`);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
