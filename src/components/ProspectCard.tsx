import type { Prospect } from "@/types/prospect";

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
          className={`confidence-badge confidence-${prospect.confidenceLevel.toLowerCase()}`}
        >
          {prospect.confidenceLevel}
        </span>
      </div>

      <div className="prospect-meta">
        <span className="meta-item location">
          📍 {prospect.streetAddress ? `${prospect.streetAddress}, ` : ""}{prospect.city}, {prospect.state} {prospect.zip}{prospect.zipExt ? `-${prospect.zipExt}` : ""}
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
            {prospect.email && (
              <div className="contact-item">
                <span className="contact-label">Email:</span>{" "}
                <a href={`mailto:${prospect.email}`} className="contact-link">
                  {prospect.email}
                </a>
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
            {prospect.sourceUrl && (
              <div className="contact-item">
                <span className="contact-label">Source URL:</span>{" "}
                <a
                  href={prospect.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  {prospect.sourceUrl.replace("https://", "").split("/")[0]}
                </a>
              </div>
            )}
            {prospect.attorneys && prospect.attorneys.length > 0 && (
              <div className="contact-item">
                <span className="contact-label">Attorneys:</span>{" "}
                <span className="contact-value">{prospect.attorneys.join(", ")}</span>
              </div>
            )}
          </div>

          {prospect.globalNotes && (
            <div className="prospect-notes">
              <span className="notes-label">Notes:</span> {prospect.globalNotes}
            </div>
          )}

          <div className="prospect-source">
            Verification: {prospect.verificationStatus} | Source: {prospect.sourceType}
            {prospect.lastCheckedDate && ` | Checked: ${prospect.lastCheckedDate}`}
          </div>
        </>
      )}

      <div className="prospect-actions">
        <button
          type="button"
          className="prospect-toggle-btn"
          onClick={() => onToggleExpand(prospect.id)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Hide details for ${prospect.firmName}` : `Show details for ${prospect.firmName}`}
        >
          {isExpanded ? "Hide details ▲" : "Show details ▼"}
        </button>
        <button
          type="button"
          className={`prospect-save-btn ${isSaved ? "saved" : ""}`}
          onClick={() => onToggleSave(prospect.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Unsave ${prospect.firmName}` : `Save ${prospect.firmName}`}
        >
          {isSaved ? "★ Saved" : "☆ Save"}
        </button>
      </div>
    </div>
  );
}
