import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2 } from "lucide-react";
import { useCourseReviews, useUserReview, useAddReview, useDeleteReview } from "@/hooks/useReviews";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ReviewsSectionProps {
  courseId: string;
  user: User | null;
}

const ReviewsSection = ({ courseId, user }: ReviewsSectionProps) => {
  const { data: reviews, isLoading } = useCourseReviews(courseId);
  const { data: userReview } = useUserReview(courseId, user?.id);
  const addReview = useAddReview();
  const deleteReview = useDeleteReview();

  const [rating, setRating] = useState(userReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(userReview?.comment || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || rating === 0) return;

    await addReview.mutateAsync({
      courseId,
      userId: user.id,
      rating,
      comment: comment.trim() || undefined,
    });

    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!userReview) return;
    
    await deleteReview.mutateAsync({
      reviewId: userReview.id,
      courseId,
    });

    setRating(0);
    setComment("");
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`transition-colors ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (interactive ? (hoverRating || rating) : currentRating)
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            Değerlendirmeler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User's Review Form */}
          {user && (!userReview || isEditing) && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Puanınız
                </label>
                {renderStars(rating, true)}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Yorumunuz (Opsiyonel)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Kurs hakkındaki düşüncelerinizi paylaşın..."
                  className="resize-none"
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/1000 karakter
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={rating === 0 || addReview.isPending}
                >
                  {addReview.isPending ? "Kaydediliyor..." : userReview ? "Güncelle" : "Değerlendir"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setRating(userReview?.rating || 0);
                      setComment(userReview?.comment || "");
                    }}
                  >
                    İptal
                  </Button>
                )}
              </div>
            </form>
          )}

          {/* User's Existing Review */}
          {user && userReview && !isEditing && (
            <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-sm text-muted-foreground mb-1">
                    Sizin Değerlendirmeniz
                  </p>
                  {renderStars(userReview.rating)}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(true);
                      setRating(userReview.rating);
                      setComment(userReview.comment || "");
                    }}
                  >
                    Düzenle
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteReview.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {userReview.comment && (
                <p className="text-sm text-muted-foreground">
                  {userReview.comment}
                </p>
              )}
            </div>
          )}

          {/* All Reviews */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Tüm Değerlendirmeler ({reviews?.length || 0})
            </h3>
            
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.profiles?.full_name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {review.profiles?.full_name || "Anonim Kullanıcı"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Henüz değerlendirme yapılmamış. İlk değerlendirmeyi siz yapın!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsSection;
