import { Prospect } from "@/types/prospect";

interface ProspectCardProps {
  prospect: Prospect;
  isExpanded: boolean;
  isSaved: boolean;
  onToggleExpand: (id: string) => void;
  onToggleSave: (id: string) => void;
}

export function ProspectCard({
  prospect,
  isExpanded,
  isSaved,
  onToggleExpand,
  onToggleSave,
}: ProspectCardProps) {
  return (
    <div className={`prospect-card ${isSaved ? "saved" : ""}`}>
      <div className="prospect-header">
        <h3 className="prospect-name">{prospect.firmName}</h3>
        <span
          className={`confidence-badge confidence-${prospect.confidence
            .split(" ")[0]
            .toLowerCase()}`}
        >
          {prospect.confidence}
        </span>
      </div>

      <div className="prospect-meta">
        <span className="meta-item location">
          📍 {prospect.city}, {prospect.state} {prospect.zip}
        </span>
        <span className="meta-item size">
          👥 {prospect.attorneyCountRange} attorneys
        </span>
      </div>

      <div className="prospect-practice-areas">
        {prospect.practiceAreas.map((area, i) => (
          <span key={i} className="practice-tag">
            {area}
          </span>
        ))}
      </div>

      {isExpanded && (
        <>
          <div className="prospect-contact">
            {prospect.phone && (
              <div className="contact-item">
                <span className="contact-label">Phone:</span>{" "}
                <span className="contact-value">{prospect.phone}</span>
              </div>
            )}
            {prospect.website && (
              <div className="contact-item">
                <span className="contact-label">Website:</span>{" "}
                <a
                  href={prospect.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  {prospect.website.replace("https://", "")}
                </a>
              </div>
            )}
          </div>

          {prospect.notes && (
            <div className="prospect-notes">
              <span className="notes-label">Notes:</span> {prospect.notes}
            </div>
          )}

          <div className="prospect-source">
            Source: {prospect.sourceType}
          </div>
        </>
      )}

      <div className="prospect-actions">
        <button
          type="button"
          className="prospect-toggle-btn"
          onClick={() => onToggleExpand(prospect.id)}
        >
          {isExpanded ? "Hide details ▲" : "Show details ▼"}
        </button>
        <button
          type="button"
          className={`prospect-save-btn ${isSaved ? "saved" : ""}`}
          onClick={() => onToggleSave(prospect.id)}
        >
          {isSaved ? "★ Saved" : "☆ Save"}
        </button>
      </div>
    </div>
  );
}
