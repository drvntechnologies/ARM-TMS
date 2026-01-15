import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Vehicle {
  id: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  vehicleType: string;
  vehicleValue: string;
  modified: boolean;
  inoperable: boolean;
}

interface Accessorial {
  id: string;
  item: string;
  company: string;
  customerPrice: string;
  vendorPrice: string;
  margin: string;
}

export default function NewQuote() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      vin: '',
      year: '',
      make: '',
      model: '',
      vehicleType: '',
      vehicleValue: '0.00',
      modified: false,
      inoperable: false,
    },
  ]);
  const [accessorials, setAccessorials] = useState<Accessorial[]>([]);
  const [originSameAsCustomer, setOriginSameAsCustomer] = useState(false);
  const [destinationSameAsOrigin, setDestinationSameAsOrigin] = useState(false);

  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        id: Date.now().toString(),
        vin: '',
        year: '',
        make: '',
        model: '',
        vehicleType: '',
        vehicleValue: '0.00',
        modified: false,
        inoperable: false,
      },
    ]);
  };

  const removeVehicle = (id: string) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
  };

  const addAccessorial = () => {
    setAccessorials([
      ...accessorials,
      {
        id: Date.now().toString(),
        item: '',
        company: '',
        customerPrice: '0.00',
        vendorPrice: '0.00',
        margin: '0.00',
      },
    ]);
  };

  const removeAccessorial = (id: string) => {
    setAccessorials(accessorials.filter((a) => a.id !== id));
  };

  const calculateTotals = () => {
    const customerTotal = accessorials.reduce((sum, a) => sum + parseFloat(a.customerPrice || '0'), 0);
    const vendorTotal = accessorials.reduce((sum, a) => sum + parseFloat(a.vendorPrice || '0'), 0);
    const marginTotal = customerTotal - vendorTotal;
    return { customerTotal, vendorTotal, marginTotal };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/quotes')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Quote List
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-3xl font-bold text-gray-900">Add a New Quote</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/quotes')}>
            Cancel
          </Button>
          <Button>Save Quote</Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select Company</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Rep <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select Company Rep</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input type="tel" placeholder="(XXX) XXX-XXXX" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input type="email" placeholder="Enter Email" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Referral By</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To <span className="text-red-500">*</span>
              </label>
              <Input type="text" defaultValue="Cameron Tarbell" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address 1</label>
              <Input type="text" placeholder="Enter Address 1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address 2</label>
              <Input type="text" placeholder="Enter Address 2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <Input type="text" placeholder="Enter City" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
              <Input type="text" placeholder="Enter Zip Code" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region / Province</label>
              <Input type="text" placeholder="Enter Region / Province" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <Input type="text" defaultValue="United States of America" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
              <Input type="tel" placeholder="(XXX) XXX-XXXX" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Origin and Destination Information</h2>

          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Origin</h3>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={originSameAsCustomer}
                    onChange={(e) => setOriginSameAsCustomer(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Same as Customer
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input type="text" placeholder="Enter First Name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <Input type="text" placeholder="Enter Last Name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input type="tel" placeholder="(XXX) XXX-XXXX" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Email <span className="text-red-500">*</span>
                  </label>
                  <Input type="email" placeholder="Enter Origin Email" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="originType" value="residence" className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">Residence</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="originType" value="business" className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">Business</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <Input type="text" placeholder="Enter Address" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address 2</label>
                  <Input type="text" placeholder="Enter Address 2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input type="text" placeholder="Enter City" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                  <Input type="text" placeholder="Enter Zip Code" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region / Province</label>
                  <Input type="text" placeholder="Enter Region / Province" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Input type="text" defaultValue="United States of America" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Load Spread</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Load Spread</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter Notes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes from customer</label>
                  <textarea
                    rows={3}
                    placeholder="Enter Notes from customer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Destination</h3>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={destinationSameAsOrigin}
                    onChange={(e) => setDestinationSameAsOrigin(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Same as Origin
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input type="text" placeholder="Enter First Name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <Input type="text" placeholder="Enter Last Name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input type="tel" placeholder="(XXX) XXX-XXXX" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Email</label>
                  <Input type="email" placeholder="Enter Primary Email" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="destinationType" value="residence" className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">Residence</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="destinationType" value="business" className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">Business</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <Input type="text" placeholder="Enter Address" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address 2</label>
                  <Input type="text" placeholder="Enter Address 2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input type="text" placeholder="Enter City" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                  <Input type="text" placeholder="Enter Zip Code" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region / Province</label>
                  <Input type="text" placeholder="Enter Region / Province" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Input type="text" defaultValue="United States of America" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Spread</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Delivery Spread</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter Notes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Transport Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trailer Type <span className="text-red-500">*</span>
            </label>
            <select className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="open">Open</option>
              <option value="enclosed">Enclosed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Vehicle Information</h2>
            <button
              onClick={addVehicle}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </button>
          </div>

          <div className="space-y-6">
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle {index + 1}</h3>
                  {vehicles.length > 1 && (
                    <button
                      onClick={() => removeVehicle(vehicle.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">VIN</label>
                    <Input type="text" placeholder="Enter VIN" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <Input type="text" placeholder="XXXX" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Make <span className="text-red-500">*</span>
                    </label>
                    <Input type="text" placeholder="Enter Make" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <Input type="text" placeholder="Enter Model" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Value</label>
                    <Input type="text" placeholder="$0.00" />
                  </div>

                  <div className="md:col-span-2 flex gap-6">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">Modified</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">Inoperable</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quote</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Option <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Payment Method <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Balance Payment Terms <span className="text-red-500">*</span>
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Line Haul <span className="text-red-500">*</span>
              </label>
              <Input type="text" placeholder="$0.00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Customer Price</label>
              <Input type="text" placeholder="$0.00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Est Carrier Rate</label>
              <Input type="text" placeholder="$0.00" />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Accessorials</h3>
              <button
                onClick={addAccessorial}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Accessorial
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accessorial</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Company <span className="text-red-500">*</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {accessorials.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    accessorials.map((accessorial) => (
                      <tr key={accessorial.id}>
                        <td className="px-4 py-3">
                          <Input type="text" placeholder="Item" className="min-w-[150px]" />
                        </td>
                        <td className="px-4 py-3">
                          <select className="w-full min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                            <option value="">Select</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <Input type="text" placeholder="$0.00" className="min-w-[120px]" />
                        </td>
                        <td className="px-4 py-3">
                          <Input type="text" placeholder="$0.00" className="min-w-[120px]" />
                        </td>
                        <td className="px-4 py-3">
                          <Input type="text" placeholder="$0.00" className="min-w-[120px]" readOnly />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeAccessorial(accessorial.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3 text-sm">Total</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm">${totals.customerTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">${totals.vendorTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">${totals.marginTotal.toFixed(2)}</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Price</p>
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Gross Profit</p>
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Net Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">0.00%</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/quotes')}>
            Cancel
          </Button>
          <Button>Save Quote</Button>
        </div>
      </div>
    </div>
  );
}
