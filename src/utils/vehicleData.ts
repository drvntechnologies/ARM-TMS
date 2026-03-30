import vehiclesData from '../data/vehicles.json';

export interface VehicleData {
  make: string;
  model: string;
  type: string;
}

const vehicles: VehicleData[] = vehiclesData;

export const getYears = (): string[] => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear + 1; year >= 1990; year--) {
    years.push(year.toString());
  }
  return years;
};

export const getMakes = (): string[] => {
  const makes = new Set<string>();
  vehicles.forEach((vehicle) => makes.add(vehicle.make));
  return Array.from(makes).sort();
};

export const getModelsByMake = (make: string): string[] => {
  return vehicles
    .filter((vehicle) => vehicle.make === make)
    .map((vehicle) => vehicle.model)
    .sort();
};

export const getVehicleTypeAndCategory = (make: string, model: string): { type: string; category: string } => {
  const vehicle = vehicles.find(
    (v) => v.make === make && v.model === model
  );

  if (!vehicle) return { type: '', category: '' };

  const typeMap: { [key: string]: string } = {
    'sedan': 'Sedan',
    'suv': 'SUV',
    'pickup_2_doors': 'Pickup Truck',
    'pickup_4_doors': 'Pickup Truck',
    'van': 'Van',
    'minivan': 'Mini-Van',
    'coupe_2_doors': 'Sedan',
  };

  return {
    type: vehicle.type,
    category: typeMap[vehicle.type] || 'Sedan'
  };
};

export const getCategoryByMakeModel = (make: string, model: string): string => {
  const { category } = getVehicleTypeAndCategory(make, model);
  return category;
};
