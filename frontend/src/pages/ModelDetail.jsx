import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Cpu,
  MessageSquare,
  Star,
  Heart,
  CheckCircle2,
  Target,
  Send,
  Pencil,
} from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import { useAuth } from "../context/AuthContext";
import { getModelById, getSimilarModels } from "../data/llmModels";

const FAVOURITES_KEY = "llm-favourites";
const REVIEWS_KEY = (id) => `llm-reviews-${id}`;

function loadReviews(modelId) {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY(modelId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReviews(modelId, reviews) {
  try {
    localStorage.setItem(REVIEWS_KEY(modelId), JSON.stringify(reviews));
  } catch (_) {}
}

export default function ModelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const model = getModelById(id);

  const [reviews, setReviews] = useState(() => loadReviews(id));
  const [reviewForm, setReviewForm] = useState({ author: "", rating: 5, text: "" });
  const [editingReviewIndex, setEditingReviewIndex] = useState(null);
  const [favourites, setFavourites] = useState(() => {
    try {
      const raw = localStorage.getItem(FAVOURITES_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const similarModels = useMemo(() => (model ? getSimilarModels(model) : []), [model]);

  const toggleFavourite = (modelId) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId);
      else next.add(modelId);
      try {
        localStorage.setItem(FAVOURITES_KEY, JSON.stringify([...next]));
      } catch (_) {}
      return next;
    });
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const { author, rating, text } = reviewForm;
    if (!text.trim()) return;
    const entry = {
      author: author.trim() || user?.name || "Anonymous",
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      text: text.trim(),
      date: editingReviewIndex !== null ? reviews[editingReviewIndex].date : new Date().toISOString(),
      userId: user?.id ?? null,
    };
    let next;
    if (editingReviewIndex !== null) {
      next = [...reviews];
      next[editingReviewIndex] = { ...reviews[editingReviewIndex], ...entry };
      setEditingReviewIndex(null);
    } else {
      next = [entry, ...reviews];
    }
    setReviews(next);
    saveReviews(id, next);
    setReviewForm({ author: "", rating: 5, text: "" });
  };

  const startEditReview = (index) => {
    const r = reviews[index];
    setReviewForm({ author: r.author || "", rating: r.rating ?? 5, text: r.text || "" });
    setEditingReviewIndex(index);
  };

  const cancelEditReview = () => {
    setEditingReviewIndex(null);
    setReviewForm({ author: "", rating: 5, text: "" });
  };

  if (!model) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-zinc-400">Model not found.</p>
          <button
            type="button"
            onClick={() => navigate("/llms")}
            className="mt-4 text-primary-400 hover:text-primary-300"
          >
            Back to Language Models
          </button>
        </div>
      </div>
    );
  }

  const displayRating = model.rating ?? 0;
  const displayReviewCount = (model.reviewCount ?? 0) + reviews.length;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Back + Favourite */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/llms")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to models
            </button>
            <button
              type="button"
              onClick={() => toggleFavourite(model.id)}
              className={`p-2 rounded-lg transition-colors ${favourites.has(model.id) ? "text-red-400" : "text-zinc-500 hover:text-red-400"} hover:bg-white/5`}
              aria-label={favourites.has(model.id) ? "Remove from favourites" : "Add to favourites"}
            >
              <Heart
                className="h-5 w-5"
                fill={favourites.has(model.id) ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* Header: name, provider, tier, rating */}
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-500/20">
              <Cpu className="h-7 w-7 text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{model.name}</h1>
                <span className="rounded-full bg-primary-500/20 px-2.5 py-0.5 text-xs font-medium text-primary-300">
                  {model.tier}
                </span>
              </div>
              <p className="mt-1 text-zinc-400">{model.provider}</p>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium text-zinc-300">{displayRating.toFixed(1)}</span>
                </div>
                <span className="text-zinc-500">{displayReviewCount.toLocaleString()} reviews</span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <MessageSquare className="h-3.5 w-3.5" /> {model.capability}
                </span>
              </div>
            </div>
            <Link
              to="/playground"
              className="shrink-0 rounded-lg border border-primary-500/50 bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-300 hover:bg-primary-500/20 transition-colors"
            >
              Use in Playground
            </Link>
          </div>

          {/* Full description */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white mb-3">ABOUT THIS MODEL</h2>
            <p className="text-zinc-300 leading-relaxed">
              {model.fullDescription || model.description}
            </p>
          </section>

          {/* Features */}
          {model.features && model.features.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary-400" />
                FEATURES
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {model.features
                  .filter((f) => !/context/i.test(f))
                  .map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-zinc-300 uppercase text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Best use cases */}
          {model.bestUseCases && model.bestUseCases.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-400" />
                BEST USE CASES
              </h2>
              <ul className="flex flex-wrap gap-2">
                {model.bestUseCases.map((u, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300 border border-white/10 uppercase"
                  >
                    {u}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Write a review */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white mb-3">WRITE A REVIEW</h2>
            {!isAuthenticated ? (
              <>
                <p className="text-zinc-400 text-sm mb-3">
                  You must be logged in to submit a review.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-500/20 border border-primary-500/50 px-4 py-2 text-sm font-medium text-primary-300 hover:bg-primary-500/30 transition-colors"
                >
                  Log in to review
                </Link>
              </>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Name (optional)</label>
                  <input
                    type="text"
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm((f) => ({ ...f, author: e.target.value }))}
                    placeholder={user?.name || "Your name"}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Your rating (1–5 stars)</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                        className="p-1 rounded transition-colors hover:scale-110"
                        aria-label={`${star} stars`}
                      >
                        <Star
                          className={`h-8 w-8 ${reviewForm.rating >= star ? "fill-amber-400 text-amber-400" : "text-zinc-500 hover:text-amber-500/80"}`}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{reviewForm.rating} star{reviewForm.rating !== 1 ? "s" : ""} selected</p>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Review</label>
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
                    placeholder="Share your experience with this model..."
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none resize-none"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-primary-500/20 border border-primary-500/50 px-4 py-2 text-sm font-medium text-primary-300 hover:bg-primary-500/30 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    {editingReviewIndex !== null ? "Update review" : "Submit review"}
                  </button>
                  {editingReviewIndex !== null && (
                    <button
                      type="button"
                      onClick={cancelEditReview}
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* Reviews list */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">REVIEWS</h2>
            {reviews.length === 0 ? (
              <p className="text-zinc-500 text-sm">No reviews yet. Be the first to write one.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r, i) => (
                  <li key={i} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-zinc-200">{r.author}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-current" : "text-zinc-600"}`}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(r.date).toLocaleDateString()}
                      </span>
                      {isAuthenticated && user && r.userId === user.id && (
                        <button
                          type="button"
                          onClick={() => startEditReview(i)}
                          className="ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-zinc-400 hover:text-primary-400 hover:bg-white/5 transition-colors"
                          aria-label="Edit review"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{r.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Similar models */}
          {similarModels.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">SIMILAR MODELS</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {similarModels.map((m) => (
                  <Link
                    key={m.id}
                    to={`/llms/${m.id}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-primary-500/30 hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/20">
                      <Cpu className="h-5 w-5 text-primary-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{m.name}</p>
                      <p className="text-xs text-zinc-500">{m.provider} · {m.category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {m.rating?.toFixed(1) ?? "—"}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </motion.div>
      </div>
    </div>
  );
}
