export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and view business analytics reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-semibold text-gray-900 mb-2">Quote Summary</h3>
          <p className="text-sm text-gray-600">View total quotes by status and time period</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-semibold text-gray-900 mb-2">Customer Report</h3>
          <p className="text-sm text-gray-600">Analyze customer acquisition and retention</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-semibold text-gray-900 mb-2">Revenue Analysis</h3>
          <p className="text-sm text-gray-600">Track revenue trends and projections</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-semibold text-gray-900 mb-2">Carrier Performance</h3>
          <p className="text-sm text-gray-600">Evaluate carrier ratings and reliability</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-semibold text-gray-900 mb-2">Referral Report</h3>
          <p className="text-sm text-gray-600">Monitor referral source effectiveness</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="font-semibold text-gray-900 mb-2">Custom Report</h3>
          <p className="text-sm text-gray-600">Build your own custom reports</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-500">
          <p className="text-lg">Detailed reporting features coming soon</p>
          <p className="mt-2">Advanced analytics, custom report builder, and data exports.</p>
        </div>
      </div>
    </div>
  );
}
