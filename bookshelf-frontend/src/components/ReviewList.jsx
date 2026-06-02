//list of reviews

function StarDisplay({ rating }) {
    return (
      <span className="text-xs">
        <span className="text-amber-400">{'★'.repeat(rating)}</span>
        <span className="text-coffee-200">{'★'.repeat(5 - rating)}</span>
      </span>
    );
  }
  
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }
  
  export default function ReviewList({ reviews }) {
    if (reviews.length === 0) {
      return (
        <p className="font-sans text-xs text-coffee-400 text-center py-4">
          No reviews yet — be the first!
        </p>
      );
    }
  
    return (
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-coffee-50 border border-coffee-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans text-xs font-semibold text-coffee-600">
                {review.username}
              </span>
              <span className="font-sans text-xs text-coffee-400">
                {timeAgo(review.created_at)}
              </span>
            </div>
  
            <StarDisplay rating={review.rating} />
  
            <p className="font-serif text-xs text-coffee-700 mt-2 leading-relaxed">
              {review.body}
            </p>
          </div>
        ))}
      </div>
    );
  }