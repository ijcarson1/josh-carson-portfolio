import { createClient } from 'contentful';

// Fallback data used when Contentful is not configured
const FALLBACK_SITE_INFO = {
  name: 'Josh Carson',
  title: 'UX Designer',
  bioParagraphs: [
    {
      text: 'One of the first stages of every project is the design phase, so Josh is likely to be one of the first (and more memorable) faces you\'ll see at {GearedApp}.',
      links: [
        { text: 'GearedApp', url: 'https://www.gearedapp.co.uk' },
      ],
    },
    {
      text: 'Josh provides UX consultation and interface design across our digital projects, and helps us make the leap from concept to creation. Outwith the office Josh enjoys photography especially in documenting his travels.',
      links: [],
    },
  ],
  availabilityStatus: 'Available for work',
  location: 'Edinburgh, UK',
  email: 'ijcarson1@gmail.com',
  twitterUrl: 'https://x.com/ijcarson',
  linkedinUrl: 'https://www.linkedin.com/in/josh-carson-9932bb47/',
};

const FALLBACK_PROJECTS = [
  { title: 'Admissions Support', description: 'Public sector', url: 'https://www.gearedapp.co.uk/case-studies/admissions-support/', isExternal: true, isWip: false, section: 'projects', order: 1 },
  { title: 'Raven Controls', description: 'Event management', url: 'https://www.gearedapp.co.uk/case-studies/raven-controls/', isExternal: true, isWip: false, section: 'projects', order: 2 },
  { title: 'Stamp Free', description: 'Logistics startup', url: 'https://www.gearedapp.co.uk/case-studies/stamp-free/', isExternal: true, isWip: false, section: 'projects', order: 3 },
  { title: 'i-immersive', description: 'EdTech SaaS', url: 'https://www.gearedapp.co.uk/case-studies/i-immersive/', isExternal: true, isWip: false, section: 'projects', order: 4 },
  { title: 'Sanomed', description: 'Healthcare', url: 'https://www.gearedapp.co.uk/case-studies/sanomed/', isExternal: true, isWip: false, section: 'projects', order: 5 },
  { title: 'Prepmate', description: 'Food platform', url: 'https://www.gearedapp.co.uk/case-studies/prepmate/', isExternal: true, isWip: false, section: 'projects', order: 6 },
  { title: 'Buzzjar', description: 'Customer advocacy', url: 'https://www.gearedapp.co.uk/case-studies/buzzjar/', isExternal: true, isWip: false, section: 'projects', order: 7 },
  { title: 'My Executor Box', description: 'Estate planning', url: 'https://www.gearedapp.co.uk/case-studies/my-executor-box/', isExternal: true, isWip: false, section: 'projects', order: 8 },
  { title: 'Blackford Analysis', description: 'AI healthcare', url: 'https://www.gearedapp.co.uk/case-studies/blackford-analysis/', isExternal: true, isWip: false, section: 'projects', order: 9 },
  { title: 'Dufrain', description: 'Data workflows', url: 'https://www.gearedapp.co.uk/case-studies/dufrain/', isExternal: true, isWip: false, section: 'projects', order: 10 },
  { title: 'Good Food Talks', description: 'Accessible dining', url: 'https://www.gearedapp.co.uk/case-studies/good-food-talks/', isExternal: true, isWip: false, section: 'projects', order: 11 },
];

const FALLBACK_WORK_IMAGES = [
  { src: '/images/case-studies/admissions-support.png', alt: 'Admissions Support – Public Sector Platform', type: 'screen', noPaddingBottom: true, crop: false, order: 1 },
  { src: '/images/case-studies/raven-controls.jpg', alt: 'Raven Controls – Event Safety App', type: 'screen', noPaddingBottom: true, crop: false, order: 2 },
  { src: '/images/case-studies/stamp-free.jpg', alt: 'Stamp Free – Digital Postage Solution', type: 'component', noPaddingBottom: false, crop: false, order: 3 },
  { src: '/images/case-studies/i-immersive.jpg', alt: 'i-immersive – EdTech SaaS Platform', type: 'component', noPaddingBottom: false, crop: false, order: 4 },
  { src: '/images/case-studies/sanomed.jpg', alt: 'Sanomed – Medication Safety Platform', type: 'screen', noPaddingBottom: true, crop: false, order: 5 },
  { src: '/images/case-studies/prepmate.jpg', alt: 'Prepmate – Meal Kit Access Platform', type: 'component', noPaddingBottom: false, crop: false, order: 6 },
  { src: '/images/case-studies/buzzjar.jpg', alt: 'Buzzjar – Customer Advocacy Rewards', type: 'component', noPaddingBottom: false, crop: false, order: 7 },
  { src: '/images/case-studies/blackford-analysis.jpg', alt: 'Blackford Analysis – AI Healthcare', type: 'screen', noPaddingBottom: true, crop: false, order: 8 },
  { src: '/images/case-studies/dufrain.jpg', alt: 'Dufrain – Data Workflow UX', type: 'screen', noPaddingBottom: true, crop: false, order: 9 },
  { src: '/images/case-studies/good-food-talks.jpg', alt: 'Good Food Talks – Accessible Dining', type: 'screen', noPaddingBottom: true, crop: false, order: 10 },
  { src: '/images/case-studies/my-executor-box.jpg', alt: 'My Executor Box – Digital Estate Planning', type: 'screen', noPaddingBottom: true, crop: false, order: 11 },
];

/**
 * Parse a Contentful RichText document into the bioParagraphs format.
 * Extracts paragraphs with inline hyperlinks as {LinkText} placeholders.
 */
function parseRichTextBio(richTextDoc) {
  if (!richTextDoc || !richTextDoc.content) return null;

  const paragraphs = [];

  for (const node of richTextDoc.content) {
    if (node.nodeType !== 'paragraph') continue;

    let text = '';
    const links = [];

    for (const child of node.content) {
      if (child.nodeType === 'text') {
        text += child.value;
      } else if (child.nodeType === 'hyperlink') {
        const linkText = child.content
          .filter((c) => c.nodeType === 'text')
          .map((c) => c.value)
          .join('');
        text += `{${linkText}}`;
        links.push({ text: linkText, url: child.data.uri });
      }
    }

    if (text.trim()) {
      paragraphs.push({ text, links });
    }
  }

  return paragraphs.length > 0 ? paragraphs : null;
}

function getClient() {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  if (!spaceId || !accessToken) return null;
  return createClient({ space: spaceId, accessToken });
}

export async function getSiteInfo() {
  const client = getClient();
  if (!client) return FALLBACK_SITE_INFO;

  try {
    const entries = await client.getEntries({ content_type: 'siteInfo', limit: 1 });
    if (entries.items.length === 0) return FALLBACK_SITE_INFO;

    const fields = entries.items[0].fields;
    return {
      name: fields.name || FALLBACK_SITE_INFO.name,
      title: fields.title || FALLBACK_SITE_INFO.title,
      bioParagraphs: parseRichTextBio(fields.bio) || FALLBACK_SITE_INFO.bioParagraphs,
      availabilityStatus: fields.availabilityStatus || FALLBACK_SITE_INFO.availabilityStatus,
      location: fields.location || FALLBACK_SITE_INFO.location,
      email: fields.email || FALLBACK_SITE_INFO.email,
      twitterUrl: fields.twitterUrl || FALLBACK_SITE_INFO.twitterUrl,
      linkedinUrl: fields.linkedinUrl || FALLBACK_SITE_INFO.linkedinUrl,
    };
  } catch (err) {
    console.error('Failed to fetch siteInfo from Contentful:', err.message);
    return FALLBACK_SITE_INFO;
  }
}

export async function getProjects(section) {
  const client = getClient();
  if (!client) {
    return FALLBACK_PROJECTS
      .filter((p) => p.section === section)
      .sort((a, b) => a.order - b.order);
  }

  try {
    const entries = await client.getEntries({
      content_type: 'project',
      'fields.section': section,
      order: 'fields.order',
    });

    return entries.items.map((item) => ({
      title: item.fields.title,
      description: item.fields.description,
      url: item.fields.url || '',
      isExternal: item.fields.isExternal || false,
      isWip: item.fields.isWip || false,
      section: item.fields.section,
      order: item.fields.order,
    }));
  } catch (err) {
    console.error(`Failed to fetch projects (${section}) from Contentful:`, err.message);
    return FALLBACK_PROJECTS
      .filter((p) => p.section === section)
      .sort((a, b) => a.order - b.order);
  }
}

export async function getWorkImages() {
  const client = getClient();
  if (!client) return FALLBACK_WORK_IMAGES;

  try {
    const entries = await client.getEntries({
      content_type: 'workImage',
      order: 'fields.order',
      include: 2,
    });

    return entries.items.map((item) => {
      const imageAsset = item.fields.image;
      const imageUrl = imageAsset?.fields?.file?.url
        ? `https:${imageAsset.fields.file.url}`
        : '';

      return {
        src: imageUrl,
        alt: item.fields.alt || '',
        type: item.fields.type || 'screen',
        noPaddingBottom: item.fields.noPaddingBottom || false,
        crop: item.fields.crop || false,
        order: item.fields.order,
      };
    });
  } catch (err) {
    console.error('Failed to fetch workImages from Contentful:', err.message);
    return FALLBACK_WORK_IMAGES;
  }
}
