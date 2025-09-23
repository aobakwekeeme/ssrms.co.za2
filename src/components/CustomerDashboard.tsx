import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useShops, useNearbyShops } from '../hooks/useShops';
import { useFavorites } from '../hooks/useFavorites';
import { useActivities } from '../hooks/useActivities';
import { LogOut, Heart, MapPin, Clock, ShoppingBag } from 'lucide-react';

export default function CustomerDashboard() {
  const { user, profile, signOut } = useAuth();
  const { shops: allShops } = useShops();
  const { shops: nearbyShops } = useNearbyShops();
  const { favorites } = useFavorites();
  const favoriteShops = favorites.map(fav => fav.shops).filter(Boolean);
  const { activities } = useActivities(5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-2 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="SSRMS Logo" className="w-10 h-10 rounded-lg" />
              <h1 className="text-2xl font-bold text-white">Customer Dashboard</h1>
            </Link>
            <p className="text-primary-foreground/80">Welcome back, {profile?.full_name || user?.email}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={signOut}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Favorited Shops</p>
                <p className="text-3xl font-bold text-foreground">{favorites.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Your saved shops</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nearby Shops</p>
                <p className="text-3xl font-bold text-foreground">{nearbyShops.length}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">In your area</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activities</p>
                <p className="text-3xl font-bold text-foreground">{activities.length}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Last 7 days</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Shops</p>
                <p className="text-3xl font-bold text-foreground">{allShops.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Available in system</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nearby Verified Shops */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Nearby Verified Shops</h3>
                <Link to="/shops" className="text-primary hover:text-primary/80">View All</Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearbyShops.slice(0, 4).map((shop) => (
                  <div key={shop.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{shop.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        shop.status === 'approved' ? 'bg-green-100 text-green-800' :
                        shop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {shop.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{shop.address}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">{shop.compliance_score || 0}/100</span>
                      </div>
                      <Link to={`/shops/${shop.id}`} className="text-sm text-primary hover:text-primary/80">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Recent Activities</h3>
              </div>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{new Date(activity.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-muted-foreground">No recent activities</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Favorite Shops */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 text-foreground">Favorite Shops</h3>
              <div className="space-y-4">
                {favoriteShops.map((shop: any) => (
                  <div key={shop.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{shop.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        shop.status === 'approved' ? 'bg-green-100 text-green-800' :
                        shop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {shop.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{shop.address}</p>
                    <Link
                      to={`/shops/${shop.id}`}
                      className="text-sm text-primary hover:text-primary/80 w-full text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
                {favoriteShops.length === 0 && (
                  <p className="text-muted-foreground">No favorite shops yet</p>
                )}
              </div>
            </div>

            {/* Recently Added Shops */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 text-foreground">Recently Added Shops</h3>
              <div className="space-y-4">
                {allShops.slice(0, 3).map((shop) => (
                  <div key={shop.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{shop.name}</h4>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        New
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(shop.created_at).toLocaleDateString()}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-sm text-muted-foreground">{shop.categories?.[0] || 'General'}</p>
                      <Link to={`/shops/${shop.id}`} className="text-sm text-primary hover:text-primary/80">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 text-foreground">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/shops" className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg text-center font-medium transition-colors text-foreground">
                  Search Shops
                </Link>
                <button className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg text-center font-medium transition-colors text-foreground">
                  My Reviews
                </button>
                <Link to="/feedback" className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg text-center font-medium transition-colors text-foreground">
                  Report Issue
                </Link>
                <Link to="/support" className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg text-center font-medium transition-colors text-foreground">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}