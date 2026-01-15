import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  Users,
  Truck,
  Package,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface Stats {
  totalQuotes: number;
  totalCustomers: number;
  totalCarriers: number;
  totalVendors: number;
  pendingQuotes: number;
  activeCustomers: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({
    totalQuotes: 0,
    totalCustomers: 0,
    totalCarriers: 0,
    totalVendors: 0,
    pendingQuotes: 0,
    activeCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [quotes, customers, carriers, vendors] = await Promise.all([
        supabase.from('quotes').select('id, status', { count: 'exact' }),
        supabase.from('customers').select('id, status', { count: 'exact' }),
        supabase.from('carriers').select('id', { count: 'exact' }),
        supabase.from('vendors').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalQuotes: quotes.count || 0,
        totalCustomers: customers.count || 0,
        totalCarriers: carriers.count || 0,
        totalVendors: vendors.count || 0,
        pendingQuotes:
          quotes.data?.filter((q) => q.status === 'pending').length || 0,
        activeCustomers:
          customers.data?.filter((c) => c.status === 'active').length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Quotes',
      value: stats.totalQuotes,
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      link: '/dashboard/quotes',
      bgColor: 'bg-blue-50',
      subtitle: `${stats.pendingQuotes} pending`,
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: <Users className="w-8 h-8 text-green-600" />,
      link: '/dashboard/customers',
      bgColor: 'bg-green-50',
      subtitle: `${stats.activeCustomers} active`,
    },
    {
      title: 'Carriers',
      value: stats.totalCarriers,
      icon: <Truck className="w-8 h-8 text-orange-600" />,
      link: '/dashboard/carriers',
      bgColor: 'bg-orange-50',
      subtitle: 'View all carriers',
    },
    {
      title: 'Vendors',
      value: stats.totalVendors,
      icon: <Package className="w-8 h-8 text-purple-600" />,
      link: '/dashboard/vendors',
      bgColor: 'bg-purple-50',
      subtitle: 'View all vendors',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to Auto Relocation Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>{card.icon}</div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
              View details
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link
              to="/dashboard/quotes"
              className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-gray-900">Create New Quote</p>
              <p className="text-sm text-gray-600">Generate a quote for a customer</p>
            </Link>
            <Link
              to="/dashboard/customers"
              className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-gray-900">Add New Customer</p>
              <p className="text-sm text-gray-600">Register a new customer</p>
            </Link>
            <Link
              to="/dashboard/reports"
              className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">Access business analytics</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
