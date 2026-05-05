import PlacesAutocomplete, { AddressComponents } from '../../components/ui/PlacesAutocomplete';

export interface LocationState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  locationType: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notes: string;
  customerNotes: string;
}

export const EMPTY_LOCATION: LocationState = {
  firstName: '', lastName: '', phone: '', email: '', locationType: '',
  address: '', address2: '', city: '', state: '', zip: '',
  country: 'United States of America', notes: '', customerNotes: '',
};

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

interface Props {
  title: string;
  loc: LocationState;
  onField: (field: keyof LocationState, value: string) => void;
  onAddressSelect: (c: AddressComponents) => void;
  headerRight?: React.ReactNode;
  showCustomerNotes?: boolean;
  spreadLabel?: string;
}

const sel = 'w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent';
const lbl = 'block text-[11px] font-medium text-gray-700 mb-0';
const inp = 'w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent';
const req = <span className="text-red-500">*</span>;

export default function LocationBlock({ title, loc, onField, onAddressSelect, headerRight, showCustomerNotes, spreadLabel }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-semibold text-gray-900">{title}</h2>
        {headerRight}
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <div>
          <label className={lbl}>First Name {req}</label>
          <input className={inp} type="text" placeholder="First Name"
            value={loc.firstName} onChange={e => onField('firstName', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Last Name</label>
          <input className={inp} type="text" placeholder="Last Name"
            value={loc.lastName} onChange={e => onField('lastName', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Phone {req}</label>
          <input className={inp} type="tel" placeholder="(XXX) XXX-XXXX"
            value={loc.phone} onChange={e => onField('phone', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Email {req}</label>
          <input className={inp} type="email" placeholder="Email"
            value={loc.email} onChange={e => onField('email', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={lbl}>Type</label>
          <div className="flex gap-3 mt-0.5">
            {(['residence', 'business'] as const).map(t => (
              <label key={t} className="flex items-center gap-1">
                <input type="radio" name={`${title}-type`} value={t}
                  checked={loc.locationType === t}
                  onChange={() => onField('locationType', t)}
                  className="text-blue-600 h-3 w-3" />
                <span className="text-[11px] text-gray-700 capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={lbl}>Address</label>
          <PlacesAutocomplete
            value={loc.address}
            onChange={v => onField('address', v)}
            onAddressSelect={onAddressSelect}
            placeholder="Start typing address..."
            className={inp}
          />
        </div>
        <div>
          <label className={lbl}>Address 2</label>
          <input className={inp} type="text" placeholder="Suite, Unit, etc."
            value={loc.address2} onChange={e => onField('address2', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>City {req}</label>
          <input className={inp} type="text" placeholder="City"
            value={loc.city} onChange={e => onField('city', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>State</label>
          <select className={sel} value={loc.state} onChange={e => onField('state', e.target.value)}>
            <option value="">Select</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Zip Code</label>
          <input className={inp} type="text" placeholder="Zip"
            value={loc.zip} onChange={e => onField('zip', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Country {req}</label>
          <input className={inp} type="text" value={loc.country}
            onChange={e => onField('country', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>{spreadLabel || 'Load Spread'}</label>
          <select className={sel}><option value="">Select</option></select>
        </div>
        <div>
          <label className={lbl}>Region / Province</label>
          <input className={inp} type="text" placeholder="Region" />
        </div>
        <div className="col-span-2">
          <label className={lbl}>Notes</label>
          <textarea rows={1} placeholder="Enter Notes" value={loc.notes}
            onChange={e => onField('notes', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
        </div>
        {showCustomerNotes && (
          <div className="col-span-2">
            <label className={lbl}>Notes from customer</label>
            <textarea rows={1} placeholder="Notes from customer" value={loc.customerNotes}
              onChange={e => onField('customerNotes', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
