import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Share, MoreHorizontal, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ShopProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Documents', 'Compliance', 'History', 'Reviews'];

  const productCategories = [
    { name: 'Fresh Produce', items: 25 },
    { name: 'Dairy & Eggs', items: 18 },
    { name: 'Bread & Bakery', items: 12 },
    { name: 'Household Items', items: 35 },
    { name: 'Beverages', items: 22 },
    { name: 'Snacks & Sweets', items: 28 }
  ];

  const complianceItems = [
    { name: 'Business Registration', percentage: 90, color: 'bg-green-500' },
    { name: 'Health & Safety', percentage: 75, color: 'bg-yellow-500' },
    { name: 'Tax Compliance', percentage: 85, color: 'bg-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Banner */}
      <div className="relative">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-r from-blue-200 to-blue-300"></div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Profile Section */}
        <div className="relative px-6 pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Shop Logo */}
            <div className="absolute -top-20 left-0 w-24 h-24 bg-white rounded-lg border-4 border-white shadow-sm"></div>
            
            {/* Shop Info */}
            <div className="pt-8 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Mokoena's Community Store</h1>
                  <p className="text-gray-600 mb-3">Spaza Shop • Established 2023</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Verified</span>
                    </div>
                    <span className="text-blue-600 font-medium">85% Compliance</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {user?.role === 'shop-owner' && (
                    <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Edit Profile
                    </button>
                  )}
                  <button className="bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded-lg font-medium transition-colors">
                    Contact
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                    <Share className="w-5 h-5" />
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">About</h3>
              <p className="text-gray-600 mb-6">
                Mokoena's Community Store is a registered spaza shop serving the local community 
                with essential groceries, household items, and fresh produce. We are committed 
                to maintaining high food safety standards and providing quality products at 
                affordable prices to support our neighborhood.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Business Type</h4>
                  <p className="text-gray-600">Convenience Store</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Registration No.</h4>
                  <p className="text-gray-600">SSRMS-2023-001234</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Established</h4>
                  <p className="text-gray-600">January 2023</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Owner</h4>
                  <p className="text-gray-600">Billy Mokoena</p>
                </div>
              </div>
            </div>

            {/* Products & Services */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-6">Available Products</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productCategories.map((category, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3"></div>
                    <h4 className="font-medium text-gray-900 mb-1">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.items} Items</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">45 Nelson Mandela Dr, Mthatha, 1804</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">+27 11 936 7890</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">mokoena@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Trading Hours</p>
                    <p className="text-gray-600">Mon-Fri: 7AM - 7PM</p>
                    <p className="text-gray-600">Sat-Sun: 8AM - 5PM</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors">
                Get Directions
              </button>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="text-gray-400 text-lg">Map Placeholder</div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Compliance Status</h3>
              
              {/* Overall Score */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${85 * 2.51} ${100 * 2.51}`}
                      className="text-green-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">85%</span>
                  </div>
                </div>
              </div>
              
              {/* Individual Compliance Items */}
              <div className="space-y-4">
                {complianceItems.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors">
                View Full Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}