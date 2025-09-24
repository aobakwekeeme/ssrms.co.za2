import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, FileText, Calendar, Bell, TrendingUp, CheckCircle, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserShop } from '../hooks/useShops';
import { useShopInspections } from '../hooks/useInspections';
import { useShopDocuments } from '../hooks/useDocuments';
import { useActivities } from '../hooks/useActivities';

const ShopOwnerDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { shop, loading: shopLoading } = useUserShop();
  const { inspections } = useShopInspections(shop?.id || '');
  const { documents } = useShopDocuments(shop?.id || '');
  const { activities } = useActivities(5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shop-gradient text-white px-6 py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
        <div className="relative max-w-7xl mx-auto flex items-center justify-between">
          <div className="animate-fade-in">
            <Link to="/" className="flex items-center space-x-3 mb-3 hover:opacity-90 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <img src="/logo.png" alt="SSRMS Logo" className="w-8 h-8 rounded-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Shop Owner Portal</h1>
                <p className="text-xs text-white/80 font-medium">Business Management Hub</p>
              </div>
            </Link>
            <p className="text-white/90 font-medium">Welcome back, {profile?.full_name || user?.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">Business Active</span>
            </div>
            <button 
              onClick={signOut}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20 font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <div className="stat-card bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl card-elevated border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Compliance Score</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{shop?.compliance_score || 0}%</p>
                <p className="text-xs text-emerald-600 flex items-center mt-2 font-medium">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {shop?.status === 'approved' ? 'Approved' : 'Pending'}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl card-elevated border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Documents</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{documents.length}</p>
                <p className="text-xs text-blue-600 flex items-center mt-2 font-medium">
                  <FileText className="w-3 h-3 mr-1" />
                  {documents.filter(d => d.status === 'pending').length} pending review
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl card-elevated border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Inspections</p>
                <p className="text-3xl font-bold text-orange-700 mt-1">{inspections.length}</p>
                <p className="text-xs text-orange-600 flex items-center mt-2 font-medium">
                  <Calendar className="w-3 h-3 mr-1" />
                  {inspections.filter(i => i.status === 'scheduled').length} scheduled
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl card-elevated border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Activities</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{activities.length}</p>
                <p className="text-xs text-purple-600 flex items-center mt-2 font-medium">
                  <Bell className="w-3 h-3 mr-1" />
                  Recent actions
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!shop && !shopLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Register Your Shop</h3>
              <p className="text-gray-600 mb-6">You haven't registered your spaza shop yet. Get started now!</p>
              <Link
                to="/shop/register"
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Register Shop
              </Link>
            </div>
          </div>
        )}

        {shop && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shop Overview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Your Shop</h3>
                  <Link to="/shop/manage" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                    Manage Shop
                  </Link>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {shop.logo_url ? (
                      <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-600">{shop.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{shop.name}</h4>
                    <p className="text-gray-600">{shop.address}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        shop.status === 'approved' ? 'bg-green-100 text-green-800' :
                        shop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {shop.status.charAt(0).toUpperCase() + shop.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    to="/shop/manage"
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors"
                  >
                    Manage Shop
                  </Link>
                  <Link
                    to="/shops"
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors"
                  >
                    Browse Shops
                  </Link>
                  <Link
                    to="/profile"
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors"
                  >
                    Manage Profile
                  </Link>
                  <Link
                    to="/support"
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;