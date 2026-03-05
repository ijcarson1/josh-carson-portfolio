/**
 * Contentful Setup Script
 *
 * Creates the content model (siteInfo, project, workImage) and seeds initial data.
 *
 * Prerequisites:
 *   1. Create a Contentful account at https://www.contentful.com
 *   2. Create a new space
 *   3. Fill in CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN in .env.local
 *
 * Usage:
 *   node scripts/setup-contentful.js
 */

const contentful = require("contentful-management");
const path = require("path");

// Load .env.local
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

  // --- Create Content Types ---

  // 1. siteInfo
  try {
    await env.createContentTypeWithId("siteInfo", {
      name: "Site Info",
      description: "Global site information (single entry)",
      displayField: "name",
      fields: [
        { id: "name", name: "Name", type: "Symbol", required: true },
        { id: "title", name: "Title", type: "Symbol", required: true },
        { id: "bio", name: "Bio", type: "RichText", required: false },
        { id: "availabilityStatus", name: "Availability Status", type: "Symbol", required: false },
        { id: "availabilityColor", name: "Availability Color", type: "Symbol", required: false, validations: [{ in: ["green", "amber"] }] },
        { id: "location", name: "Location", type: "Symbol", required: false },
        { id: "email", name: "Email", type: "Symbol", required: false },
        { id: "twitterUrl", name: "Twitter URL", type: "Symbol", required: false },
        { id: "linkedinUrl", name: "LinkedIn URL", type: "Symbol", required: false },
      ],
    });
    const ct = await env.getContentType("siteInfo");
    await ct.publish();
    console.log("Created content type: siteInfo");
  } catch (e) {
    if (e.message?.includes("exist")) {
      console.log("Content type siteInfo already exists, skipping");
    } else {
      throw e;
    }
  }

  // 2. project
  try {
    await env.createContentTypeWithId("project", {
      name: "Project",
      description: "A project, component, or side hustle entry",
      displayField: "title",
      fields: [
        { id: "title", name: "Title", type: "Symbol", required: true },
        { id: "description", name: "Description", type: "Symbol", required: true },
        { id: "url", name: "URL", type: "Symbol", required: false },
        { id: "isExternal", name: "Is External Link", type: "Boolean", required: false },
        { id: "isWip", name: "Is Work in Progress", type: "Boolean", required: false },
        { id: "order", name: "Sort Order", type: "Integer", required: true },
        {
          id: "section",
          name: "Section",
          type: "Symbol",
          required: true,
          validations: [{ in: ["projects", "components", "side-hustles"] }],
        },
      ],
    });
    const ct = await env.getContentType("project");
    await ct.publish();
    console.log("Created content type: project");
  } catch (e) {
    if (e.message?.includes("exist")) {
      console.log("Content type project already exists, skipping");
    } else {
      throw e;
    }
  }

  // 3. workImage
  try {
    await env.createContentTypeWithId("workImage", {
      name: "Work Image",
      description: "A portfolio work image/screenshot",
      displayField: "alt",
      fields: [
        { id: "alt", name: "Alt Text", type: "Symbol", required: true },
        { id: "image", name: "Image", type: "Link", linkType: "Asset", required: true },
        {
          id: "type",
          name: "Type",
          type: "Symbol",
          required: true,
          validations: [{ in: ["screen", "component"] }],
        },
        { id: "noPaddingBottom", name: "No Padding Bottom", type: "Boolean", required: false },
        { id: "crop", name: "Crop", type: "Boolean", required: false },
        { id: "order", name: "Sort Order", type: "Integer", required: true },
        { id: "linkedProject", name: "Linked Project", type: "Link", linkType: "Entry", required: false, validations: [{ linkContentType: ["project"] }] },
      ],
    });
    const ct = await env.getContentType("workImage");
    await ct.publish();
    console.log("Created content type: workImage");
  } catch (e) {
    if (e.message?.includes("exist")) {
      console.log("Content type workImage already exists, skipping");
    } else {
      throw e;
    }
  }

  // --- Seed initial siteInfo entry ---
  try {
    const entry = await env.createEntry("siteInfo", {
      fields: {
        name: { "en-US": "Josh Carson" },
        title: { "en-US": "UX Designer" },
        availabilityStatus: { "en-US": "Available for work" },
        location: { "en-US": "Edinburgh, UK" },
        email: { "en-US": "ijcarson1@gmail.com" },
        twitterUrl: { "en-US": "https://x.com/ijcarson" },
        linkedinUrl: { "en-US": "https://www.linkedin.com/in/josh-carson-9932bb47/" },
      },
    });
    await entry.publish();
    console.log("Seeded siteInfo entry");
  } catch (e) {
    console.log("Could not seed siteInfo:", e.message);
  }

  // --- Seed projects ---
  const projectSeeds = [
    { title: "Admissions Support", description: "Public sector", url: "https://www.gearedapp.co.uk/case-studies/admissions-support/", isExternal: true, isWip: false, section: "projects", order: 1 },
    { title: "Raven Controls", description: "Event management", url: "https://www.gearedapp.co.uk/case-studies/raven-controls/", isExternal: true, isWip: false, section: "projects", order: 2 },
    { title: "Stamp Free", description: "Logistics startup", url: "https://www.gearedapp.co.uk/case-studies/stamp-free/", isExternal: true, isWip: false, section: "projects", order: 3 },
    { title: "i-immersive", description: "EdTech SaaS", url: "https://www.gearedapp.co.uk/case-studies/i-immersive/", isExternal: true, isWip: false, section: "projects", order: 4 },
    { title: "Sanomed", description: "Healthcare", url: "https://www.gearedapp.co.uk/case-studies/sanomed/", isExternal: true, isWip: false, section: "projects", order: 5 },
    { title: "Prepmate", description: "Food platform", url: "https://www.gearedapp.co.uk/case-studies/prepmate/", isExternal: true, isWip: false, section: "projects", order: 6 },
    { title: "Buzzjar", description: "Customer advocacy", url: "https://www.gearedapp.co.uk/case-studies/buzzjar/", isExternal: true, isWip: false, section: "projects", order: 7 },
    { title: "My Executor Box", description: "Estate planning", url: "https://www.gearedapp.co.uk/case-studies/my-executor-box/", isExternal: true, isWip: false, section: "projects", order: 8 },
    { title: "Blackford Analysis", description: "AI healthcare", url: "https://www.gearedapp.co.uk/case-studies/blackford-analysis/", isExternal: true, isWip: false, section: "projects", order: 9 },
    { title: "Dufrain", description: "Data workflows", url: "https://www.gearedapp.co.uk/case-studies/dufrain/", isExternal: true, isWip: false, section: "projects", order: 10 },
    { title: "Good Food Talks", description: "Accessible dining", url: "https://www.gearedapp.co.uk/case-studies/good-food-talks/", isExternal: true, isWip: false, section: "projects", order: 11 },
  ];

  for (const seed of projectSeeds) {
    try {
      const entry = await env.createEntry("project", {
        fields: {
          title: { "en-US": seed.title },
          description: { "en-US": seed.description },
          url: { "en-US": seed.url },
          isExternal: { "en-US": seed.isExternal },
          isWip: { "en-US": seed.isWip },
          section: { "en-US": seed.section },
          order: { "en-US": seed.order },
        },
      });
      await entry.publish();
      console.log(`Seeded project: ${seed.title}`);
    } catch (e) {
      console.log(`Could not seed project ${seed.title}:`, e.message);
    }
  }

  console.log("\nSetup complete! Your Contentful space is ready.");
  console.log("Note: Work images need to be uploaded manually via the Contentful dashboard.");
}

run().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
