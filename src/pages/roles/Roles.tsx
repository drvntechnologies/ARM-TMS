export default function Roles() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Roles</h1>
          <p className="text-gray-600 mt-1">Define and manage user roles</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Admin</h3>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">System</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Full system access with all permissions</p>
          <div className="text-sm text-gray-500">0 users</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Manager</h3>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">System</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Management access with most permissions</p>
          <div className="text-sm text-gray-500">0 users</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">User</h3>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">System</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Standard user access with limited permissions</p>
          <div className="text-sm text-gray-500">0 users</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-500">
          <p className="text-lg">Role management features coming soon</p>
          <p className="mt-2">Create custom roles and assign specific permissions.</p>
        </div>
      </div>
    </div>
  );
}
