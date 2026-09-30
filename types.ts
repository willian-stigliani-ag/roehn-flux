
export enum DeviceType {
  // Lighting
  LIGHT_ONOFF = 'LIGHT_ONOFF',
  LIGHT_DIMMER = 'LIGHT_DIMMER',
  LIGHT_PWM = 'LIGHT_PWM',
  LIGHT_DALI = 'LIGHT_DALI',
  // Shades
  SHADE_WIRED = 'SHADE_WIRED',
  SHADE_WIRELESS = 'SHADE_WIRELESS',
  // Climate
  CLIMATE_IR = 'CLIMATE_IR',
  CLIMATE_VRV = 'CLIMATE_VRV',
  // Keypads / User Interfaces
  KEYPAD_QUANTICA_K = 'KEYPAD_QUANTICA_K',
  KEYPAD_QUANTICA_L = 'KEYPAD_QUANTICA_L',
  KEYPAD_QUANTICA_P = 'KEYPAD_QUANTICA_P',
  KEYPAD_QUANTICA_THERMOPAD = 'KEYPAD_QUANTICA_THERMOPAD',
  KEYPAD_FINNO_K = 'KEYPAD_FINNO_K',
  KEYPAD_FINNO_AIR = 'KEYPAD_FINNO_AIR',
  KEYPAD_FINNO_P = 'KEYPAD_FINNO_P',
  KEYPAD_BIANNI_K = 'KEYPAD_BIANNI_K',
  KEYPAD_ION = 'KEYPAD_ION',
  // Sensors
  SENSOR_WIDELUX = 'SENSOR_WIDELUX',
  SENSOR_XRAY = 'SENSOR_XRAY',
  SENSOR_NANO = 'SENSOR_NANO',
}

export type ProductCategory = 'Processor' | 'Lighting Control' | 'Shades Control' | 'HVAC Control' | 'Power Supply' | 'Keypad' | 'Sensor' | 'Accessory';

export interface Product {
  id: number;
  category: ProductCategory;
  type: string;
  brand: string;
  model: string;
  channels: number; // Capacity
  suppliesLPower: number; // Renamed from suppliesPower
  suppliesNPower: number; // New: Network Power
  suppliesAddress: number;
  suppliesPNETPorts: number; // New: PNET Ports
  consumesLPower: number; // Renamed from consumesPower
  consumesNPower: number; // New: Network Power
  consumesAddress: number;
  consumesPNETPorts: number; // New: PNET Ports
  description?: string; // Optional description for AI context
  requiresDedicatedPS?: boolean; // New: Requires exclusive power supply
}

export interface ProjectInputs {
  projectName: string;
  integratorName: string;
  counts: Record<DeviceType, number>;
}

export interface BomItem {
  code?: string | number;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  category: 'Controller' | 'Lighting' | 'Shading' | 'Climate' | 'Accessory' | 'User Interface' | 'Sensors';
  reasoning?: string;
}

export interface PowerStats {
  busLPower: {
    consumed: number;
    supplied: number;
  };
  nPower: {
    consumed: number;
    supplied: number;
  };
}

export interface CategoryCounts {
  lighting: number;
  shading: number;
  climate: number;
  keypads: number;
  sensors: number;
}

export interface SpecificationResult {
  items: BomItem[];
  totalDevices: number;
  summary: string;
  powerStats: PowerStats;
  addressStats: {
    consumed: number;
    supplied: number;
  };
  pnetStats: {
    consumed: number;
    supplied: number;
  };
  categoryCounts: CategoryCounts;
}

export const DEVICE_LABELS: Record<DeviceType, string> = {
  [DeviceType.LIGHT_ONOFF]: 'Circuito Liga/Desliga',
  [DeviceType.LIGHT_DIMMER]: 'Circuito Dimmer',
  [DeviceType.LIGHT_PWM]: 'Circuito PWM',
  [DeviceType.LIGHT_DALI]: 'Circuito DALI',
  [DeviceType.SHADE_WIRED]: 'Persiana com Fio',
  [DeviceType.SHADE_WIRELESS]: 'Persiana sem Fio',
  [DeviceType.CLIMATE_IR]: 'Ar-condicionado IR',
  [DeviceType.CLIMATE_VRV]: 'Ar-condicionado VRV/VRF',
  [DeviceType.KEYPAD_QUANTICA_K]: 'Quantica Keypad',
  [DeviceType.KEYPAD_QUANTICA_L]: 'Quantica Keypad Lite',
  [DeviceType.KEYPAD_QUANTICA_P]: 'Quantica Pulsador',
  [DeviceType.KEYPAD_QUANTICA_THERMOPAD]: 'Quantica Thermopad',
  [DeviceType.KEYPAD_FINNO_K]: 'Finno Keypad',
  [DeviceType.KEYPAD_FINNO_AIR]: 'Finno Air',
  [DeviceType.KEYPAD_FINNO_P]: 'Finno Pulsador',
  [DeviceType.KEYPAD_BIANNI_K]: 'Bianni Keypad',
  [DeviceType.KEYPAD_BIANNI_P]: 'Bianni Pulsador',
  [DeviceType.KEYPAD_ION]: 'ION Keypad',
  [DeviceType.SENSOR_WIDELUX]: 'Sensor de Presença / Luminosidade WIDELUX',
  [DeviceType.SENSOR_XRAY]: 'Sensor de Temperatura / Qualidade do Ar X-RAY',
  [DeviceType.SENSOR_NANO]: 'Sensor de Movimento NANO',
};
