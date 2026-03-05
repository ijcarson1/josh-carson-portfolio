import { getSiteInfo, getProjects, getWorkImages } from "@/lib/contentful";

// Revalidate from Contentful every 60 seconds (ISR)
export const revalidate = 60;
import OrbAvatar from "@/components/OrbAvatar";
import WorkSection from "@/components/WorkSection";
import ImageLightbox from "@/components/ImageLightbox";
import ClickableImageCard from "@/components/ClickableImageCard";
import AnimationProvider from "@/components/AnimationProvider";

export async function generateMetadata() {
  const siteInfo = await getSiteInfo();
  return {
    title: `${siteInfo.name} \u2013 ${siteInfo.title}`,
    description: `UX consultation and interface design. Josh provides UX consultation and interface design across digital projects at GearedApp.`,
    openGraph: {
      title: `${siteInfo.name} \u2013 ${siteInfo.title}`,
      description: `UX consultation and interface design across digital projects at GearedApp.`,
      type: "website",
    },
  };
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function BioParagraph({ paragraph }) {
  if (!paragraph.links || paragraph.links.length === 0) {
    return <p className="home-body mb-3">{paragraph.text}</p>;
  }

  const parts = [];
  let remaining = paragraph.text;
  let linkIndex = 0;

  while (remaining.length > 0 && linkIndex < paragraph.links.length) {
    const link = paragraph.links[linkIndex];
    const placeholder = `{${link.text}}`;
    const idx = remaining.indexOf(placeholder);

    if (idx === -1) break;

    if (idx > 0) {
      parts.push(remaining.substring(0, idx));
    }

    parts.push(
      <a
        key={link.text}
        target="_blank"
        rel="noopener noreferrer"
        className="link-inline"
        href={link.url}
      >
        {link.text}
      </a>
    );

    remaining = remaining.substring(idx + placeholder.length);
    linkIndex++;
  }

  if (remaining.length > 0) {
    parts.push(remaining);
  }

  return <p className="home-body mb-3">{parts}</p>;
}

export default async function HomePage() {
  const [siteInfo, projects, workImages] = await Promise.all([
    getSiteInfo(),
    getProjects("projects"),
    getWorkImages(),
  ]);

  const screenImages = workImages.filter((img) => img.type === "screen");
  const componentImages = workImages.filter((img) => img.type === "component");

  const firstScreen = screenImages.length > 0 ? screenImages[0] : null;
  const remainingScreens = screenImages.slice(1);

  // Build display-order items matching the visual layout:
  // 1. firstScreen, 2. componentImages, 3. remainingScreens
  // Each image already has its linked project from Contentful
  const displayOrderItems = [];
  if (firstScreen) displayOrderItems.push(firstScreen);
  componentImages.forEach((img) => displayOrderItems.push(img));
  remainingScreens.forEach((img) => displayOrderItems.push(img));

  return (
    <>
      <AnimationProvider />
      <div className="home-split">
        {/* LEFT PANEL */}
        <aside className="home-left">
          <div className="home-left-inner">
            <OrbAvatar />

            <h1 className="home-heading animate-in" style={{ "--delay": "0.05s" }}>
              {siteInfo.name}
              <br />
              <span className="text-muted">{siteInfo.title}</span>
            </h1>

            {siteInfo.bioParagraphs?.map((para, i) => (
              <div key={i} className="animate-in" style={{ "--delay": `${0.1 + i * 0.05}s` }}>
                <BioParagraph paragraph={para} />
              </div>
            ))}

            <button className="home-btn-view-work animate-in" style={{ "--delay": "0.2s" }}>
              View work
            </button>

            <div className="home-meta animate-in" style={{ "--delay": "0.25s" }}>
              <span className={`availability-dot${siteInfo.availabilityColor === 'amber' ? ' amber' : ''}`} />
              {siteInfo.availabilityStatus} &middot;&nbsp;
              <span className="home-meta-location">{siteInfo.location}</span>
            </div>

            <nav className="home-actions animate-in" style={{ "--delay": "0.3s" }} aria-label="Social links">
              <a target="_blank" rel="noopener noreferrer" className="home-btn-icon" aria-label="X (Twitter)" href={siteInfo.twitterUrl}>
                <XIcon />
              </a>
              <a target="_blank" rel="noopener noreferrer" className="home-btn-icon" aria-label="LinkedIn" href={siteInfo.linkedinUrl}>
                <LinkedInIcon />
              </a>
              <a className="home-btn-icon home-btn-icon-stroke" aria-label="Email" href={`mailto:${siteInfo.email}`}>
                <EmailIcon />
              </a>
            </nav>

            <div className="home-divider animate-in" style={{ "--delay": "0.35s" }} />

            <div className="animate-in" style={{ "--delay": "0.4s" }}>
              <WorkSection heading="Case Studies" items={projects} />
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <ImageLightbox items={displayOrderItems}>
          <section className="home-right">
            {firstScreen && <ClickableImageCard index={0} {...firstScreen} />}

            {componentImages.length > 0 && (
              <div className="home-component-grid">
                {componentImages.map((img, i) => (
                  <ClickableImageCard key={`comp-${i}`} index={1 + i} {...img} />
                ))}
              </div>
            )}

            {remainingScreens.map((img, i) => (
              <ClickableImageCard key={`screen-${i}`} index={1 + componentImages.length + i} {...img} />
            ))}

            <div className="home-meta" style={{ justifyContent: "center", marginTop: "40px", marginBottom: 0 }}>
              more work images coming soon
            </div>

            <div className="h-24" />
          </section>
        </ImageLightbox>
      </div>
    </>
  );
}
