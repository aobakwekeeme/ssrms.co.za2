import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Star, Heart, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useFavorites } from '../hooks/useFavorites';
import { useActivities } from '../hooks/useActivities';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface Shop {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  phone?: string | null;
  email?: string | null;
  status: string;
  compliance_score: number | null;
  business_type?: string | null;
  categories?: string[] | null;
  trading_hours?: Record<string, { open: string | null; close?: string | null }>;
  logo_url?: string | null;
  banner_url?: string | null;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
}

export default function ShopDetailPage() {
  const { shopId } = useParams();
  const { user } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { addActivity } = useActivities();
  const [shop, setShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopDetails();
    fetchReviews();
    
    if (user && shopId) {
      addActivity({
        type: 'shop_view',
        description: `Viewed shop details`,
        shop_id: shopId
      });
    }
  }, [shopId]);

  const fetchShopDetails = async () => {
    if (!shopId) return;
    
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (error) throw error;
      // Ensure trading_hours is undefined if null, to match Shop interface
      let trading_hours: Record<string, { open: string | null; close?: string | null }> | undefined = undefined;
      if (data.trading_hours !== null && data.trading_hours !== undefined) {
        if (typeof data.trading_hours === 'string') {
          try {
            trading_hours = JSON.parse(data.trading_hours);
          } catch {
            trading_hours = undefined;
          }
        } else {
          if (
            typeof data.trading_hours === 'object' &&
            !Array.isArray(data.trading_hours) &&
            data.trading_hours !== null
          ) {
            trading_hours = data.trading_hours as Record<string, { open: string | null; close?: string | null }>;
          } else {
            trading_hours = undefined;
          }
        }
      }
      setShop({
        ...data,
        trading_hours,
      });
    } catch {
      toast.error('Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!shopId) return;
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!shopId || !user) {
      toast.error('Please sign in to add favorites');
      return;
    }

    const wasFavorite = isFavorite(shopId);
    
    if (wasFavorite) {
      const success = await removeFromFavorites(shopId);
      if (success) {
        toast.success('Removed from favorites');
        addActivity({
          type: 'favorite_removed',
          description: `Removed ${shop?.name} from favorites`,
          shop_id: shopId
        });
      }
    } else {
      const success = await addToFavorites(shopId);
      if (success) {
        toast.success('Added to favorites');
        addActivity({
          type: 'favorite_added',
          description: `Added ${shop?.name} to favorites`,
          shop_id: shopId
        });
      }
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Shop not found</h2>
          <Link to="/shops" className="text-primary hover:text-primary/80">
            Browse all shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="relative h-64 bg-gradient-to-r from-primary to-primary/80">
        {shop.banner_url && (
          <img src={shop.banner_url} alt={shop.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
        <Link to="/shops" className="inline-flex items-center text-white hover:text-white/80 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shops
        </Link>

        {/* Shop Info Card */}
        <div className="bg-card rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {shop.logo_url && (
                <img src={shop.logo_url} alt={shop.name} className="w-20 h-20 rounded-lg object-cover" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{shop.name}</h1>
                <div className="flex items-center space-x-4 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    shop.status === 'approved' ? 'bg-green-100 text-green-800' :
                    shop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {shop.status}
                  </span>
                  {shop.business_type && (
                    <span className="text-muted-foreground">{shop.business_type}</span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold text-foreground">{getAverageRating()}</span>
                    <span className="text-muted-foreground ml-1">({reviews.length} reviews)</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Compliance: {shop.compliance_score}%</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleFavorite}
              className={`p-3 rounded-full transition-colors ${
                isFavorite(shop.id)
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite(shop.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
              <p className="text-foreground">{shop.description || 'No description available.'}</p>
            </div>

            {/* Categories */}
            {shop.categories && shop.categories.length > 0 && (
              <div className="bg-card rounded-lg p-6 border">
                <h2 className="text-xl font-semibold text-foreground mb-4">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {shop.categories.map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Customer Reviews</h2>
                {user && (
                  <Link
                    to={`/shop/${shop.id}/reviews`}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Write a Review
                  </Link>
                )}
              </div>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">Anonymous User</p>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-foreground">{shop.address}</p>
                  </div>
                </div>
                {shop.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a href={`tel:${shop.phone}`} className="text-primary hover:text-primary/80">
                        {shop.phone}
                      </a>
                    </div>
                  </div>
                )}
                {shop.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${shop.email}`} className="text-primary hover:text-primary/80">
                        {shop.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trading Hours */}
            {shop.trading_hours && (
              <div className="bg-card rounded-lg p-6 border">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Trading Hours
                </h2>
                <div className="space-y-2">
                  {Object.entries(shop.trading_hours).map(([day, hours]: [string, { open: string | null; close?: string | null }]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{day}</span>
                      <span className="text-foreground font-medium">
                        {hours.open || 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Actions</h2>
              <div className="space-y-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                {user && (
                  <Link
                    to={`/shop/${shop.id}/reviews`}
                    className="flex items-center justify-center space-x-2 w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    <span>Write Review</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}