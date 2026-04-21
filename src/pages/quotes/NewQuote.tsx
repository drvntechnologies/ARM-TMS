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

  const selectClass = 'w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-xs font-medium text-gray-700 mb-0.5';
  const requiredMark = <span className="text-red-500">*</span>;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/quotes')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-5 w-px bg-gray-300" />
          <h1 className="text-xl font-bold text-gray-900">Add a New Quote</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/quotes')}>
            Cancel
          </Button>
          <Button>Save Quote</Button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Customer Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2">
            <div>
              <label className={labelClass}>Company {requiredMark}</label>
              <select className={selectClass}>
                <option value="">Select Company</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Company Rep {requiredMark}</label>
              <select className={selectClass}>
                <option value="">Select Company Rep</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Phone {requiredMark}</label>
              <Input type="tel" placeholder="(XXX) XXX-XXXX" />
            </div>
            <div>
              <label className={labelClass}>Email {requiredMark}</label>
              <Input type="email" placeholder="Enter Email" />
            </div>
            <div>
              <label className={labelClass}>Referral By</label>
              <select className={selectClass}>
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Assigned To {requiredMark}</label>
              <Input type="text" value="Cameron Tarbell" />
            </div>
            <div>
              <label className={labelClass}>Address 1</label>
              <Input type="text" placeholder="Enter Address 1" />
            </div>
            <div>
              <label className={labelClass}>Address 2</label>
              <Input type="text" placeholder="Enter Address 2" />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <Input type="text" placeholder="Enter City" />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <select className={selectClass}>
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Zip Code</label>
              <Input type="text" placeholder="Enter Zip Code" />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <Input type="text" value="United States of America" />
            </div>
            <div>
              <label className={labelClass}>Mobile</label>
              <Input type="tel" placeholder="(XXX) XXX-XXXX" />
            </div>
          </div>
        </div>

        {/* Origin and Destination — side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Origin */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-900">Origin</h2>
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={originSameAsCustomer}
                  onChange={(e) => setOriginSameAsCustomer(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                Same as Customer
              </label>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <label className={labelClass}>First Name {requiredMark}</label>
                <Input type="text" placeholder="First Name" />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <Input type="text" placeholder="Last Name" />
              </div>
              <div>
                <label className={labelClass}>Phone {requiredMark}</label>
                <Input type="tel" placeholder="(XXX) XXX-XXXX" />
              </div>
              <div>
                <label className={labelClass}>Email {requiredMark}</label>
                <Input type="email" placeholder="Origin Email" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5">
                    <input type="radio" name="originType" value="residence" className="text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs text-gray-700">Residence</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="radio" name="originType" value="business" className="text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs text-gray-700">Business</span>
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <Input type="text" placeholder="Address" />
              </div>
              <div>
                <label className={labelClass}>Address 2</label>
                <Input type="text" placeholder="Address 2" />
              </div>
              <div>
                <label className={labelClass}>City {requiredMark}</label>
                <Input type="text" placeholder="City" />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <select className={selectClass}>
                  <option value="">Select</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Zip Code</label>
                <Input type="text" placeholder="Zip" />
              </div>
              <div>
                <label className={labelClass}>Country {requiredMark}</label>
                <Input type="text" value="United States of America" />
              </div>
              <div>
                <label className={labelClass}>Load Spread</label>
                <select className={selectClass}>
                  <option value="">Select</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Region / Province</label>
                <Input type="text" placeholder="Region" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter Notes"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Notes from customer</label>
                <textarea
                  rows={2}
                  placeholder="Notes from customer"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-900">Destination</h2>
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={destinationSameAsOrigin}
                  onChange={(e) => setDestinationSameAsOrigin(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                Same as Origin
              </label>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <label className={labelClass}>First Name {requiredMark}</label>
                <Input type="text" placeholder="First Name" />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <Input type="text" placeholder="Last Name" />
              </div>
              <div>
                <label className={labelClass}>Phone {requiredMark}</label>
                <Input type="tel" placeholder="(XXX) XXX-XXXX" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <Input type="email" placeholder="Primary Email" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5">
                    <input type="radio" name="destinationType" value="residence" className="text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs text-gray-700">Residence</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="radio" name="destinationType" value="business" className="text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs text-gray-700">Business</span>
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <Input type="text" placeholder="Address" />
              </div>
              <div>
                <label className={labelClass}>Address 2</label>
                <Input type="text" placeholder="Address 2" />
              </div>
              <div>
                <label className={labelClass}>City {requiredMark}</label>
                <Input type="text" placeholder="City" />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <select className={selectClass}>
                  <option value="">Select</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Zip Code</label>
                <Input type="text" placeholder="Zip" />
              </div>
              <div>
                <label className={labelClass}>Country {requiredMark}</label>
                <Input type="text" value="United States of America" />
              </div>
              <div>
                <label className={labelClass}>Delivery Spread</label>
                <select className={selectClass}>
                  <option value="">Select</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Region / Province</label>
                <Input type="text" placeholder="Region" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter Notes"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transport + Vehicle side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Transport</h2>
            <div>
              <label className={labelClass}>Trailer Type {requiredMark}</label>
              <select className={selectClass}>
                <option value="open">Open</option>
                <option value="enclosed">Enclosed</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-900">Vehicle Information</h2>
              <button
                onClick={addVehicle}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Vehicle
              </button>
            </div>

            <div className="space-y-2">
              {vehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="border border-gray-200 rounded px-3 py-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-semibold text-gray-700">Vehicle {index + 1}</h3>
                    {vehicles.length > 1 && (
                      <button onClick={() => removeVehicle(vehicle.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-1.5">
                    <div>
                      <label className={labelClass}>VIN</label>
                      <Input type="text" placeholder="VIN" />
                    </div>
                    <div>
                      <label className={labelClass}>Year {requiredMark}</label>
                      <Input type="text" placeholder="XXXX" />
                    </div>
                    <div>
                      <label className={labelClass}>Make {requiredMark}</label>
                      <Input type="text" placeholder="Make" />
                    </div>
                    <div>
                      <label className={labelClass}>Model {requiredMark}</label>
                      <Input type="text" placeholder="Model" />
                    </div>
                    <div>
                      <label className={labelClass}>Type {requiredMark}</label>
                      <select className={selectClass}>
                        <option value="">Select</option>
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="truck">Truck</option>
                        <option value="van">Van</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Value</label>
                      <Input type="text" placeholder="$0.00" />
                    </div>
                    <div className="col-span-3 md:col-span-6 flex gap-4">
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5" />
                        <span className="text-xs text-gray-700">Modified</span>
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5" />
                        <span className="text-xs text-gray-700">Inoperable</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Quote</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-3 gap-y-2 mb-3">
            <div>
              <label className={labelClass}>Payment Option {requiredMark}</label>
              <select className={selectClass}>
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Deposit Method {requiredMark}</label>
              <select className={selectClass}>
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Balance Terms {requiredMark}</label>
              <select className={selectClass}>
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Line Haul {requiredMark}</label>
              <Input type="text" placeholder="$0.00" />
            </div>
            <div>
              <label className={labelClass}>Est Customer Price</label>
              <Input type="text" placeholder="$0.00" />
            </div>
            <div>
              <label className={labelClass}>Est Carrier Rate</label>
              <Input type="text" placeholder="$0.00" />
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-semibold text-gray-700">Accessorials</h3>
              <button
                onClick={addAccessorial}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Accessorial
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Accessorial</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Company {requiredMark}</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Customer Price</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Vendor Price</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                    <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-500 uppercase w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {accessorials.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-4 text-center text-xs text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    accessorials.map((accessorial) => (
                      <tr key={accessorial.id}>
                        <td className="px-2 py-1">
                          <Input type="text" placeholder="Item" />
                        </td>
                        <td className="px-2 py-1">
                          <select className={selectClass}>
                            <option value="">Select</option>
                          </select>
                        </td>
                        <td className="px-2 py-1">
                          <Input type="text" placeholder="$0.00" />
                        </td>
                        <td className="px-2 py-1">
                          <Input type="text" placeholder="$0.00" />
                        </td>
                        <td className="px-2 py-1">
                          <Input type="text" placeholder="$0.00" />
                        </td>
                        <td className="px-2 py-1 text-right">
                          <button onClick={() => removeAccessorial(accessorial.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  <tr className="bg-gray-50 font-semibold text-xs">
                    <td className="px-2 py-1.5">Total</td>
                    <td className="px-2 py-1.5"></td>
                    <td className="px-2 py-1.5">${totals.customerTotal.toFixed(2)}</td>
                    <td className="px-2 py-1.5">${totals.vendorTotal.toFixed(2)}</td>
                    <td className="px-2 py-1.5">${totals.marginTotal.toFixed(2)}</td>
                    <td className="px-2 py-1.5"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-gray-200">
            <div className="bg-gray-50 rounded px-3 py-2">
              <p className="text-xs text-gray-600">Total Price</p>
              <p className="text-lg font-bold text-gray-900">$0.00</p>
            </div>
            <div className="bg-gray-50 rounded px-3 py-2">
              <p className="text-xs text-gray-600">Gross Profit</p>
              <p className="text-lg font-bold text-gray-900">$0.00</p>
            </div>
            <div className="bg-gray-50 rounded px-3 py-2">
              <p className="text-xs text-gray-600">Net Profit</p>
              <p className="text-lg font-bold text-gray-900">$0.00</p>
            </div>
            <div className="bg-gray-50 rounded px-3 py-2">
              <p className="text-xs text-gray-600">Net Profit Margin</p>
              <p className="text-lg font-bold text-gray-900">0.00%</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pb-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/quotes')}>
            Cancel
          </Button>
          <Button>Save Quote</Button>
        </div>
      </div>
    </div>
  );
}
