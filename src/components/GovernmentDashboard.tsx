import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';

export default function GovernmentDashboard() {
  const { user, signOut } = useAuth();

  const stats = [
    { title: 'Total Registered Shops', value: '1,245', change: '+12%', isPositive: true },
    { title: 'Pending Approvals', value: '42', change: '-5%', isPositive: false },
    { title: 'Scheduled Inspections', value: '18', change: '+3%', isPositive: true },
    { title: 'Compliance Rate', value: '78%', change: '+2%', isPositive: true },
  ];

  const complianceCategories = [
    { name: 'Food Safety', percentage: 82, color: 'bg-teal-600' },
    { name: 'Fire Safety', percentage: 76, color: 'bg-blue-600' },
    { name: 'Business License', percentage: 93, color: 'bg-green-600' }
  ];

  const recentApplications = [
    { name: 'Mandela Spaza Shop', owner: 'Peter Mandela', location: 'Soweto', status: 'Pending' },
    { name: 'Ubuntu Community Store', owner: 'Grace Mbeki', location: 'Alexandra', status: 'Under Review' },
    { name: 'Kasi Corner Shop', owner: 'Joseph Sithole', location: 'Diepsloot', status: 'Approved' },
    { name: 'Mzansi Mini Market', owner: 'Fatima Patel', location: 'Lenasia', status: 'Rejected' }
  ];

  const upcomingInspections = [
    { name: 'Mokoena Community Store', time: 'Tomorrow, 10:00 AM', location: '45 Vilakazi St, Soweto' },
    { name: 'Ubuntu Community Store', time: 'Tomorrow, 2:00 PM', location: '12 Mandela Ave, Alexandra' },
    { name: 'Kasi Corner Shop', time: 'Friday, 9:00 AM', location: '78 Freedom Rd, Diepsloot' }
  ];

  const nonCompliantShops = [
    { name: 'Sunset Spaza', issue: 'Missing health certificate and fire safety compliance' },
    { name: 'Quick Stop Market', issue: 'Expired business license and tax clearance required' },
    { name: 'Corner Convenience', issue: 'Food safety violations reported by customers' }
  ];

  const quickActions = [
    ['New Inspection', 'Approve Shop'],
    ['Generate Report', 'Policy Updates'],
    ['Issue Warning', 'Team Meeting']
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-2 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="SSRMS Logo" className="w-10 h-10 rounded-lg" />
              <h1 className="text-2xl font-bold text-white">Government Official Dashboard</h1>
            </Link>
            <p className="text-purple-100">Welcome back, {user?.name}</p>
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
            {/* Compliance Overview */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Compliance Overview</h3>
                <div className="flex space-x-2">
                  <button className="text-gray-600 hover:text-gray-900">Filter</button>
                  <button className="text-gray-600 hover:text-gray-900">Export</button>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
                <div className="text-gray-400 text-lg">Compliance Statistics Chart</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {complianceCategories.map((category, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm font-medium text-gray-900 mb-2">{category.name}</div>
                    <div className="text-xl font-bold text-gray-900 mb-2">{category.percentage}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${category.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Recent Applications</h3>
                <button className="text-gray-600 hover:text-gray-900">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-medium text-gray-600">SHOP NAME</th>
                      <th className="text-left py-3 font-medium text-gray-600">OWNER</th>
                      <th className="text-left py-3 font-medium text-gray-600">LOCATION</th>
                      <th className="text-left py-3 font-medium text-gray-600">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentApplications.map((app, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-4 font-medium">{app.name}</td>
                        <td className="py-4 text-gray-600">{app.owner}</td>
                        <td className="py-4 text-gray-600">{app.location}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            app.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      <h4 className="font-medium">{inspection.name}</h4>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Scheduled
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{inspection.time}</p>
                    <p className="text-sm text-gray-500 mb-3">{inspection.location}</p>
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

            {/* Non-Compliant Shops */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Non-Compliant Shops</h3>
              <div className="space-y-4">
                {nonCompliantShops.map((shop, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{shop.name}</h4>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Action Required
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{shop.issue}</p>
                    <button className="text-sm bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700">
                      Send Notification
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-2 gap-3">
                    {row.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg text-center font-medium transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}