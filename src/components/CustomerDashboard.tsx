import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Star, LogOut } from 'lucide-react';

export default function CustomerDashboard() {
  const { user, profile, signOut } = useAuth();

  const stats = [
    { title: 'Favorited Shops', value: '12' },
    { title: 'Recently Viewed', value: '24' },
    { title: 'Reviews Given', value: '8' },
    { title: 'Nearby Shops', value: '35' },
  ];

  const nearbyShops = [
    { name: 'Mokoena Community Store', address: '45 Vilakazi Street, Soweto', rating: 5, status: 'Verified' },
    { name: 'Ubuntu Community Store', address: '12 Mandela Avenue, Alexandra', rating: 4, status: 'Verified' },
    { name: 'Kasi Corner Shop', address: '78 Freedom Road, Diepsloot', rating: 5, status: 'Verified' },
    { name: 'Mzansi Mini Market', address: '34 Biko Street, Lenasia', rating: 4, status: 'Verified' }
  ];

  const favoriteShops = [
    { name: 'Mokoena Community Store', address: '45 Vilakazi Street, Soweto', status: 'Open' },
    { name: 'Ubuntu Community Store', address: '12 Mandela Avenue, Alexandra', status: 'Open' },
    { name: 'Kasi Corner Shop', address: '78 Freedom Road, Diepsloot', status: 'Open' }
  ];

  const recentActivities = [
    { text: 'You visited Mokoena Community Store', time: '1 day ago' },
    { text: 'You left a 5-star review for Ubuntu Community Store', time: '2 days ago' },
    { text: 'You reported a food safety concern at Corner Market', time: '3 days ago' }
  ];

  const recentlyAddedShops = [
    { name: 'Sunshine Spaza', timeAdded: 'Added 1 day ago', distance: '1.2 km away', status: 'New' },
    { name: 'Community Fresh Market', timeAdded: 'Added 2 days ago', distance: '0.8 km away', status: 'New' },
    { name: 'Neighborhood Essentials', timeAdded: 'Added 3 days ago', distance: '1.5 km away', status: 'New' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-2 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="SSRMS Logo" className="w-10 h-10 rounded-lg" />
              <h1 className="text-2xl font-bold text-white">Customer Dashboard</h1>
            </Link>
            <p className="text-pink-100">Welcome back, {profile?.full_name || user?.email}</p>
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
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nearby Verified Shops */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Nearby Verified Shops</h3>
                <button className="text-gray-600 hover:text-gray-900">View All</button>
              </div>
              <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
                <div className="text-gray-400 text-lg">Map View Placeholder</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {nearbyShops.map((shop, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{shop.name}</h4>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {shop.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{shop.address}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {[...Array(shop.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <button className="text-sm text-teal-600 hover:text-teal-700">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Recent Activities</h3>
                <button className="text-gray-600 hover:text-gray-900">View All</button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.text}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Favorite Shops */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Favorite Shops</h3>
              <div className="space-y-4">
                {favoriteShops.map((shop, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{shop.name}</h4>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {shop.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{shop.address}</p>
                    <Link
                      to="/shop-profile"
                      className="text-sm text-teal-600 hover:text-teal-700 w-full text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
              <button className="w-full text-center text-gray-600 hover:text-gray-900 mt-4 py-2">
                See More
              </button>
            </div>

            {/* Recently Added Shops */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Recently Added Shops</h3>
              <div className="space-y-4">
                {recentlyAddedShops.map((shop, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{shop.name}</h4>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {shop.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{shop.timeAdded}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-sm text-gray-500">{shop.distance}</p>
                      <button className="text-sm text-teal-600 hover:text-teal-700">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors">
                  Search Shops
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors">
                  My Reviews
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors">
                  Report Issue
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}