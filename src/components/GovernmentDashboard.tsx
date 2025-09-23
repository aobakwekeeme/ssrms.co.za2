import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useShops } from '../hooks/useShops';
import { useInspections } from '../hooks/useInspections';
import { useDocuments } from '../hooks/useDocuments';
import { LogOut } from 'lucide-react';

export default function GovernmentDashboard() {
  const { user, profile, signOut } = useAuth();
  const { shops } = useShops();
  const { inspections } = useInspections();
  const { documents } = useDocuments();

  const pendingShops = shops.filter(shop => shop.status === 'pending');
  const approvedShops = shops.filter(shop => shop.status === 'approved');
  const upcomingInspections = inspections.filter(inspection => 
    inspection.status === 'scheduled' && new Date(inspection.scheduled_date) > new Date()
  );
  const pendingDocuments = documents.filter(doc => doc.status === 'pending');
  const nonCompliantShops = shops.filter(shop => 
    shop.compliance_score !== null && shop.compliance_score < 70
  );

  const complianceCategories = [
    { name: 'Food Safety', percentage: shops.length > 0 ? Math.round((approvedShops.length / shops.length) * 100) : 0 },
    { name: 'Documentation', percentage: documents.length > 0 ? Math.round(((documents.length - pendingDocuments.length) / documents.length) * 100) : 0 },
    { name: 'Inspections', percentage: inspections.length > 0 ? Math.round((inspections.filter(i => i.status === 'completed').length / inspections.length) * 100) : 0 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-2 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="SSRMS Logo" className="w-10 h-10 rounded-lg" />
              <h1 className="text-2xl font-bold text-white">Government Official Dashboard</h1>
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
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="text-sm text-muted-foreground mb-2">Total Registered Shops</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">{shops.length}</div>
              <div className="text-sm px-2 py-1 rounded bg-green-100 text-green-600">
                {approvedShops.length} approved
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="text-sm text-muted-foreground mb-2">Pending Approvals</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">{pendingShops.length}</div>
              <div className="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-600">
                Action needed
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="text-sm text-muted-foreground mb-2">Scheduled Inspections</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">{upcomingInspections.length}</div>
              <div className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-600">
                This week
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="text-sm text-muted-foreground mb-2">Compliance Rate</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">
                {shops.length > 0 ? Math.round(((shops.length - nonCompliantShops.length) / shops.length) * 100) : 0}%
              </div>
              <div className="text-sm px-2 py-1 rounded bg-green-100 text-green-600">
                +2%
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Compliance Overview */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Compliance Overview</h3>
                <div className="flex space-x-2">
                  <button className="text-muted-foreground hover:text-foreground">Filter</button>
                  <button className="text-muted-foreground hover:text-foreground">Export</button>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-8 text-center mb-6">
                <div className="text-muted-foreground text-lg">Compliance Statistics Chart</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {complianceCategories.map((category, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm font-medium text-foreground mb-2">{category.name}</div>
                    <div className="text-xl font-bold text-foreground mb-2">{category.percentage}%</div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Recent Applications</h3>
                <Link to="/shop-management" className="text-primary hover:text-primary/80">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 font-medium text-muted-foreground">SHOP NAME</th>
                      <th className="text-left py-3 font-medium text-muted-foreground">ADDRESS</th>
                      <th className="text-left py-3 font-medium text-muted-foreground">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingShops.slice(0, 5).map((shop) => (
                      <tr key={shop.id} className="hover:bg-muted/30">
                        <td className="py-4 font-medium text-foreground">{shop.name}</td>
                        <td className="py-4 text-muted-foreground">{shop.address}</td>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            {shop.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {pendingShops.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-muted-foreground text-center">
                          No pending applications
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Inspections */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 text-foreground">Upcoming Inspections</h3>
              <div className="space-y-4">
                {upcomingInspections.slice(0, 3).map((inspection) => (
                  <div key={inspection.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">
                        {shops.find(s => s.id === inspection.shop_id)?.name || 'Unknown Shop'}
                      </h4>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Scheduled
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {new Date(inspection.scheduled_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">{inspection.type}</p>
                    <div className="flex space-x-2">
                      <button className="text-sm text-muted-foreground hover:text-foreground">Reschedule</button>
                      <button className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded hover:bg-primary/90">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                {upcomingInspections.length === 0 && (
                  <p className="text-muted-foreground">No upcoming inspections</p>
                )}
              </div>
            </div>

            {/* Non-Compliant Shops */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 text-foreground">Non-Compliant Shops</h3>
              <div className="space-y-4">
                {nonCompliantShops.slice(0, 3).map((shop) => (
                  <div key={shop.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{shop.name}</h4>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Action Required
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Compliance Score: {shop.compliance_score}/100
                    </p>
                    <button className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90">
                      Send Notification
                    </button>
                  </div>
                ))}
                {nonCompliantShops.length === 0 && (
                  <p className="text-muted-foreground">All shops are compliant</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 text-foreground">Quick Actions</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/shop-management" className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg text-center font-medium transition-colors text-foreground">
                    Review Apps
                  </Link>
                  <button className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg text-center font-medium transition-colors text-foreground">
                    Schedule Inspection
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg text-center font-medium transition-colors text-foreground">
                    Generate Report
                  </button>
                  <button className="bg-muted hover:bg-muted/80 px-4 py-3 rounded-lg text-center font-medium transition-colors text-foreground">
                    System Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}