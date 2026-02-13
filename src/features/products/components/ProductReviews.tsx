import { Star, User } from 'lucide-react';
import { formatRating, formatDate } from '@/core/utils/formatters';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  users?: { full_name: string | null } | null;
}

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export function ProductReviews({ reviews, averageRating, reviewCount }: ProductReviewsProps) {
  if (reviewCount === 0) {
    return (
      <div className="py-8 text-center text-sm text-primary-500">
        No reviews yet. Be the first to review this product.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-900">{formatRating(averageRating)}</div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-accent-600 text-accent-600'
                    : 'fill-neutral-200 text-neutral-200'
                }`}
              />
            ))}
          </div>
          <div className="mt-1 text-xs text-primary-500">{reviewCount} reviews</div>
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-neutral-200 bg-neutral-100 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-900/10">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-primary-900">
                    {review.users?.full_name || 'Anonymous'}
                  </div>
                  <div className="text-xs text-primary-500">
                    {formatDate(review.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= review.rating
                        ? 'fill-accent-600 text-accent-600'
                        : 'fill-neutral-200 text-neutral-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.title && (
              <h4 className="mt-2 font-medium text-primary-900">{review.title}</h4>
            )}
            {review.comment && (
              <p className="mt-1 text-sm text-primary-600">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
