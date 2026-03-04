import WorkItem from "./WorkItem";

export default function WorkSection({ heading, items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="home-work-section">
      <h2 className="home-work-heading">{heading}</h2>
      <div className="home-work-list">
        {items.map((item, i) => (
          <WorkItem key={`${item.title}-${i}`} {...item} />
        ))}
      </div>
    </div>
  );
}
