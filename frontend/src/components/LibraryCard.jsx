import './LibraryCard.css';

const LibraryCard = ({
  image,
  title,
  subTitle,
  installed = false,
  statusLabel,
  actionLabel,
  onAction,
}) => {
  const initials = title
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="library-card">
      <div className="library-card-cover">
        {image ? (
          <img src={image} alt={title} className="library-card-image" />
        ) : (
          <div className="cover-fallback">{initials}</div>
        )}
        {statusLabel && <span className="library-badge">{statusLabel}</span>}
      </div>

      <div className="library-card-footer">
        <div className="library-card-meta">
          <span className="library-card-subtitle">{subTitle}</span>
          <h3 className="library-card-title">{title}</h3>
          <button
            type="button"
            className={`library-action-btn ${installed ? 'installed' : ''}`}
            onClick={onAction}
          >
            <i
              className={`bx ${installed ? 'bx-rotate-left' : 'bx-download'} action-icon`}
            />
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
};

export default LibraryCard;
