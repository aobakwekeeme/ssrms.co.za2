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
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-2 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="SSRMS Logo" className="w-10 h-10 rounded-lg" />
              <h1 className="text-2xl font-bold text-white">Shop Owner Dashboard</h1>
            </Link>
            <p className="text-emerald-100">Welcome back, {profile?.full_name || user?.email}</p>
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
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">{shop?.compliance_score || 0}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {shop?.status === 'approved' ? 'Approved' : 'Pending'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <FileText className="w-3 h-3 mr-1" />
                  {documents.filter(d => d.status === 'pending').length} pending
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inspections</p>
                <p className="text-2xl font-bold text-orange-600">{inspections.length}</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {inspections.filter(i => i.status === 'scheduled').length} scheduled
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activities</p>
                <p className="text-2xl font-bold text-red-600">{activities.length}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <Bell className="w-3 h-3 mr-1" />
                  Recent actions
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Bell className="w-6 h-6 text-red-600" />
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