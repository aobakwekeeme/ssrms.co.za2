import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function ShopOwnerDashboard() {
  const { user, signOut } = useAuth();

  const stats = [
    { title: 'Compliance Score', value: '75%', change: '+5%', isPositive: true },
    { title: 'Documents', value: '75%', change: '+5%', isPositive: true },
    { title: 'Inspections', value: '75%', change: '+5%', isPositive: true },
    { title: 'Notifications', value: '75%', change: '+5%', isPositive: true },
  ];

  const upcomingInspections = [
    {
      type: 'Health Inspection',
      date: '15 June 2025, 10:00 AM',
      status: 'Scheduled'
    },
    {
      type: 'Health Inspection',
      date: '15 June 2025, 10:00 AM',
      status: 'Scheduled'
    }
  ];

  const requiredDocuments = [
    { name: 'Business Registration', status: 'Required' },
    { name: 'Tax Clearance', status: 'Required' },
    { name: 'Health Certificate', status: 'Required' }
  ];

  const recentActivities = [
    { text: 'Health certificate uploaded and verified by government official', time: '2 hours ago' },
    { text: 'Compliance score improved from 70% to 75% after safety updates', time: '4 hours ago' },
    { text: 'Business registration documents approved by local authority', time: '1 day ago' },
    { text: 'New customer review received - 5 stars for product quality', time: '2 days ago' }
  ];

  const complianceItems = [
    { name: 'Documentation', percentage: 80 },
    { name: 'Safety', percentage: 80 },
    { name: 'License', percentage: 80 }
  ];

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
            <p className="text-emerald-100">Welcome back, {user?.name}</p>
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
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className={`text-sm px-2 py-1 rounded ${
                  stat.isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Compliance Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Shop Compliance Status</h3>
                <button className="text-gray-600 hover:text-gray-900">View Details</button>
              </div>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="text-gray-400 text-lg">Compliance Chart Placeholder</div>
              </div>
            </div>

            {/* Compliance Items */}
            <div className="grid grid-cols-3 gap-4">
              {complianceItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm text-center">
                  <div className="text-sm font-medium text-gray-900 mb-2">{item.name}</div>
                  <div className="text-2xl font-bold text-gray-900">{item.percentage}%</div>
                </div>
              ))}
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
            {/* Upcoming Inspections */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Upcoming Inspections</h3>
              <div className="space-y-4">
                {upcomingInspections.map((inspection, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{inspection.type}</h4>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        {inspection.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{inspection.date}</p>
                    <div className="flex space-x-2">
                      <button className="text-sm text-gray-600 hover:text-gray-900">Reschedule</button>
                      <button className="bg-teal-600 text-white text-sm px-3 py-1 rounded hover:bg-teal-700">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Required Documents</h3>
              <div className="space-y-4">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium">{doc.name}</span>
                    <div className="text-right">
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded mb-2 block">
                        {doc.status}
                      </span>
                      <button className="text-sm text-teal-600 hover:text-teal-700">
                        Upload Document
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
                <Link
                  to="/shop-profile"
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors"
                >
                  Update Profile
                </Link>
                <Link
                  to="/shop-profile"
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors"
                >
                  View Shop
                </Link>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg font-medium transition-colors">
                  Contact Support
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg font-medium transition-colors">
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