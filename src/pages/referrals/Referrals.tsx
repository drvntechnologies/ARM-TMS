export default function Referrals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referral Management</h1>
        <p className="text-gray-600 mt-1">Track and manage referral partners and commissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Referrals</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Active Partners</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Commissions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">$0.00</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-500">
          <p className="text-lg">Referral Management module coming soon</p>
          <p className="mt-2">Track referral partners, manage commissions, and monitor referral performance.</p>
        </div>
      </div>
    </div>
  );
}
