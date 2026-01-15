import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react';

interface Transport {
  id: string;
  vehicleInfo: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate: string;
  status: 'scheduled' | 'in-transit' | 'delivered' | 'cancelled';
  price: number;
  driver: string;
}

export default function MLBTransport() {
  const [searchTerm, setSearchTerm] = useState('');
  const [transports] = useState<Transport[]>([
    {
      id: '1',
      vehicleInfo: '2023 Toyota Camry',
      pickupLocation: 'New York, NY',
      deliveryLocation: 'Los Angeles, CA',
      pickupDate: '2024-01-15',
      deliveryDate: '2024-01-20',
      status: 'in-transit',
      price: 1200,
      driver: 'John Smith'
    },
    {
      id: '2',
      vehicleInfo: '2022 Honda Accord',
      pickupLocation: 'Chicago, IL',
      deliveryLocation: 'Miami, FL',
      pickupDate: '2024-01-18',
      deliveryDate: '2024-01-23',
      status: 'scheduled',
      price: 1100,
      driver: 'Sarah Johnson'
    }
  ]);

  const getStatusColor = (status: Transport['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransports = transports.filter(transport =>
    transport.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transport.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transport.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transport.driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MLB Transport</h1>
          <p className="text-gray-600 mt-1">Manage vehicle transportation and logistics</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          New Transport
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by vehicle, location, or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vehicle</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Route</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Dates</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Driver</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransports.map((transport) => (
                <tr key={transport.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{transport.vehicleInfo}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="text-gray-900">{transport.pickupLocation}</div>
                        <div className="text-gray-500">→ {transport.deliveryLocation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <div className="text-gray-900">{transport.pickupDate}</div>
                        <div className="text-gray-500">→ {transport.deliveryDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">{transport.driver}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <DollarSign className="w-4 h-4" />
                      {transport.price.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transport.status)}`}>
                      {transport.status.charAt(0).toUpperCase() + transport.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No transports found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">8</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600 mt-1">45</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$78,500</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gray-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
