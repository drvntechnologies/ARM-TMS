export default function ACL() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Access Control List</h1>
        <p className="text-gray-600 mt-1">Manage granular permissions and access controls</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Permission Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Module</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">View</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Create</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Update</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Delete</th>
              </tr>
            </thead>
            <tbody>
              {['Quotes', 'Customers', 'Carriers', 'Vendors', 'Referrals', 'Reports', 'Users'].map((module) => (
                <tr key={module} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">{module}</td>
                  <td className="py-3 px-4 text-center">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-500">
          <p className="text-lg">Advanced ACL features coming soon</p>
          <p className="mt-2">Fine-grained permission management with role-based controls.</p>
        </div>
      </div>
    </div>
  );
}
