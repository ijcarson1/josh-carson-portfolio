const ExternalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="home-work-external-icon"
    aria-hidden="true"
  >
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

export default function WorkItem({ title, description, url, isExternal, isWip }) {
  if (isWip) {
    return (
      <div className="home-work-item" style={{ opacity: 0.5, cursor: "not-allowed" }}>
        <div className="home-work-title">
          {title} <span style={{ fontSize: "0.75em", opacity: 0.6 }}>WIP</span>
        </div>
        <div className="home-work-description">{description}</div>
      </div>
    );
  }

  const linkProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a className="home-work-item" href={url} {...linkProps}>
      <div className="home-work-title">{title}</div>
      {isExternal ? (
        <div className="home-work-item-right">
          <div className="home-work-description">{description}</div>
          <ExternalIcon />
        </div>
      ) : (
        <div className="home-work-description">{description}</div>
      )}
    </a>
  );
}
