import { useState } from 'react';
import { Star, Pencil, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredUser } from '../../utils/auth';
import {
  useGameReviews,
  useMyReview,
  useSubmitReview,
  useUpdateReview,
  useDeleteReview,
} from '../../hooks/useReviews';
import { useOwnsGame } from '../../hooks/useLibrary';

/* ── Star rating widget ─────────────────────────────────────── */
const StarWidget = ({ value, onChange, size = 20 }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover ?? value ?? 0);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            onMouseEnter={() => onChange && setHover(star)}
            onMouseLeave={() => onChange && setHover(null)}
            className={`transition-colors ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${
              filled ? 'text-yellow-400' : 'text-white/20'
            }`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
};

/* ── Individual review card ──────────────────────────────────── */
const ReviewCard = ({ review, isOwn, onEdit, onDelete, isDeleting }) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    className="glass rounded-2xl p-5 border border-white/8"
  >
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary-light uppercase">
            {review.username?.[0] ?? '?'}
          </div>
          <span className="font-semibold text-sm text-foreground">{review.username}</span>
          {isOwn && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary-light border border-primary/20">
              Your review
            </span>
          )}
        </div>
        <StarWidget value={review.rating} size={14} />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isOwn && (
          <>
            <button
              type="button"
              onClick={() => onEdit(review)}
              className="p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-surface transition-all"
              aria-label="Edit review"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(review.id)}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-subtle hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-50"
              aria-label="Delete review"
            >
              {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            </button>
          </>
        )}
        <time className="text-xs text-subtle ml-1">
          {new Date(review.created_at).toLocaleDateString()}
        </time>
      </div>
    </div>
    {review.review_text && (
      <p className="text-sm text-muted leading-relaxed">{review.review_text}</p>
    )}
  </motion.article>
);

/* ── Review form ─────────────────────────────────────────────── */
const ReviewForm = ({ gameId, existingReview, onCancel }) => {
  const [rating, setRating]     = useState(existingReview?.rating ?? 5);
  const [text, setText]         = useState(existingReview?.review_text ?? '');

  const { mutate: submit, isPending: submitting } = useSubmitReview(gameId);
  const { mutate: update,  isPending: updating  } = useUpdateReview(gameId);

  const isEdit = Boolean(existingReview);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return;
    const payload = { rating, review_text: text.trim() || null };

    if (isEdit) {
      update({ reviewId: existingReview.id, ...payload }, { onSuccess: onCancel });
    } else {
      submit(payload, { onSuccess: onCancel });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 border border-primary/20 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        {isEdit ? 'Edit your review' : 'Write a review'}
      </h3>

      <div className="mb-4">
        <label className="text-xs text-subtle mb-1.5 block">Your rating</label>
        <StarWidget value={rating} onChange={setRating} size={22} />
      </div>

      <div className="mb-4">
        <label className="text-xs text-subtle mb-1.5 block">Your thoughts (optional)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Share what you liked or disliked…"
          maxLength={1000}
          className="w-full bg-surface border border-white/8 rounded-xl px-4 py-3 text-sm text-foreground placeholder-subtle resize-none focus:outline-none focus:border-primary/40"
        />
        <p className="text-xs text-subtle/50 text-right mt-1">{text.length}/1000</p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!rating || submitting || updating}
          className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {(submitting || updating) && <Loader2 size={13} className="animate-spin" />}
          {isEdit ? 'Save changes' : 'Post review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-xl bg-surface text-subtle text-sm font-semibold hover:text-foreground transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

/* ── Main ReviewSection ──────────────────────────────────────── */
const ReviewSection = ({ gameId }) => {
  const user = getStoredUser();
  const [editingReview, setEditingReview] = useState(null);
  const [showForm, setShowForm]           = useState(false);

  const { data, isLoading }         = useGameReviews(gameId);
  const { data: myReview }          = useMyReview(gameId);
  const { data: owned }             = useOwnsGame(gameId);
  const { mutate: deleteReview, isPending: isDeleting, variables: deletingId } = useDeleteReview(gameId);

  const reviews    = data?.reviews ?? [];
  const stats      = data?.stats   ?? {};
  const total      = data?.total   ?? 0;
  const canReview  = Boolean(user) && owned && !myReview;

  const handleEdit = (review) => {
    setShowForm(false);
    setEditingReview(review);
  };

  return (
    <section className="mt-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-xs text-primary-light uppercase tracking-widest font-semibold mb-1 flex items-center gap-1.5">
            <MessageSquare size={12} />
            Ratings &amp; Reviews
          </p>
          <h2 className="text-2xl font-bold text-foreground">Player feedback</h2>
        </div>

        {stats.review_count > 0 && (
          <div className="glass rounded-2xl px-5 py-3 text-center border border-white/8">
            <div className="text-3xl font-extrabold text-foreground">
              {stats.average_rating?.toFixed(1) ?? '—'}
            </div>
            <StarWidget value={Math.round(stats.average_rating ?? 0)} size={14} />
            <p className="text-xs text-subtle mt-1">{stats.review_count} review{stats.review_count !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* Write review CTA */}
      {canReview && !showForm && !editingReview && (
        <div className="glass rounded-2xl p-4 mb-6 border border-white/8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-foreground">You own this game!</p>
            <p className="text-xs text-subtle mt-0.5">Share your experience with the community.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-primary/15 text-primary-light text-sm font-semibold border border-primary/30 hover:bg-primary/25 transition-all"
          >
            Write a review
          </button>
        </div>
      )}

      {/* Review form */}
      {(showForm || editingReview) && (
        <ReviewForm
          gameId={gameId}
          existingReview={editingReview ?? null}
          onCancel={() => { setShowForm(false); setEditingReview(null); }}
        />
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-subtle">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-white/8">
          <MessageSquare size={36} className="text-white/10 mx-auto mb-3" />
          <p className="text-subtle text-sm">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwn={user && String(review.user_id) === String(user.uid)}
                onEdit={handleEdit}
                onDelete={(id) => deleteReview(id)}
                isDeleting={isDeleting && deletingId === review.id}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </section>
  );
};

export default ReviewSection;
