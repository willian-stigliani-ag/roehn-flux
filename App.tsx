import React, { useState } from 'react';
import { ProjectInputs, DeviceType, DEVICE_LABELS, SpecificationResult, Product } from './types';
import { CounterInput } from './components/CounterInput';
import { generateSpecification } from './services/calculator';
import { ResultView } from './components/ResultView';
import { BackofficeView } from './components/BackofficeView';
import { 
  Lightbulb, 
  Blinds, 
  Thermometer, 
  Zap, 
  ArrowRight, 
  Loader2, 
  LayoutTemplate,
  Settings,
  ClipboardList,
  Grid3x3,
  Radar,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

const INITIAL_CATALOG: Product[] = [
  { 
    id: 7988, 
    category: 'Processor', 
    type: 'Processador', 
    brand: 'ROEHN', 
    model: 'RDP-M6', 
    description: 'Processador de sistema ROEHN',
    channels: 0,
    suppliesLPower: 0,
    suppliesNPower: 55,
    suppliesAddress: 100,
    suppliesPNETPorts: 0,
    consumesLPower: 5,
    consumesNPower: 0,
    consumesAddress: 0,
    consumesPNETPorts: 0,
    requiresDedicatedPS: true
  },
  { 
    id: 7995, 
    category: 'Lighting Control', 
    type: 'Dimer', 
    brand: 'ROEHN', 
    model: 'RDP-DIM8', 
    description: 'Módulo dimmer de 8 canais',
    channels: 8,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 5,
    consumesLPower: 2,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 7994, 
    category: 'Lighting Control', 
    type: 'Dimer', 
    brand: 'ROEHN', 
    model: 'RDP-DIM4', 
    description: 'Módulo dimmer de 4 canais',
    channels: 4,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 2,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 8000, 
    category: 'Lighting Control', 
    type: 'Relé', 
    brand: 'ROEHN', 
    model: 'RDP-RL12', 
    description: 'Módulo de relé de 12 canais',
    channels: 12,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 5,
    consumesLPower: 6,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 7999, 
    category: 'Lighting Control', 
    type: 'Relé', 
    brand: 'ROEHN', 
    model: 'RDP-RL8', 
    description: 'Módulo relé de 8 canais',
    channels: 8,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 5,
    consumesLPower: 6,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 7998, 
    category: 'Lighting Control', 
    type: 'Relé', 
    brand: 'ROEHN', 
    model: 'RDP-RL4', 
    description: 'Módulo relé de 4 canais',
    channels: 4,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 6,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 8002, 
    category: 'Lighting Control', 
    type: 'PWM', 
    brand: 'ROEHN', 
    model: 'RDP-PWM6', 
    description: 'Módulo PWM de 6 canais',
    channels: 6,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 8028, 
    category: 'Lighting Control', 
    type: 'PWM', 
    brand: 'ROEHN', 
    model: 'RRM-PWM4', 
    description: 'Módulo PWM de 4 canais',
    channels: 4,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 8001, 
    category: 'Lighting Control', 
    type: 'DALI', 
    brand: 'ROEHN', 
    model: 'RDP-DL2', 
    description: 'Interface DALI de 2 canais (128 endereços)',
    channels: 128,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 5,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 7997, 
    category: 'Shades Control', 
    type: 'Cabeada', 
    brand: 'ROEHN', 
    model: 'RDP-LX4', 
    description: 'Módulo de cortinas motorizadas de 4 canais',
    channels: 4,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 5,
    consumesLPower: 4.2,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 7996, 
    category: 'Shades Control', 
    type: 'Cabeada', 
    brand: 'ROEHN', 
    model: 'RDP-LX2', 
    description: 'Módulo de cortinas motorizadas de 4 canais',
    channels: 2,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 4.2,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
    { 
    id: 8006, 
    category: 'Shades Control', 
    type: 'Sem Fio', 
    brand: 'ROEHN', 
    model: 'RRM-GTW', 
    description: 'Módulo de cortinas RF de 32 canais',
    channels: 32,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 8008, 
    category: 'HVAC Control', 
    type: 'Infravermelho', 
    brand: 'ROEHN', 
    model: 'RRM-SA1', 
    description: 'Módulo de controle de ar-condicionado IR',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 8004, 
    category: 'HVAC Control', 
    type: 'VRV/VRF', 
    brand: 'ROEHN', 
    model: 'RDP-DK32', 
    description: 'Módulo de controle de ar-condicionado VRV/VRF de 32 canais',
    channels: 32,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 7992, 
    category: 'Accessory', 
    type: 'Fonte de Alimentação', 
    brand: 'ROEHN', 
    model: 'RDP-PWR60', 
    description: 'Fonte de alimentação',
    channels: 0,
    suppliesLPower: 60,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0,
    consumesAddress: 0,
    consumesPNETPorts: 0
  },
    { 
    id: 7990, 
    category: 'Accessory', 
    type: 'Alim. Barramento', 
    brand: 'ROEHN', 
    model: 'RDP-HUB6', 
    description: 'Hub de alimentação',
    channels: 0,
    suppliesLPower: 0,
    suppliesNPower: 55,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0,
    consumesAddress: 0,
    consumesPNETPorts: 0,
    requiresDedicatedPS: true
  },
  { 
    id: 8007, 
    category: 'Accessory', 
    type: 'Antena Receptora', 
    brand: 'ROEHN', 
    model: 'RRM-AIR', 
    description: 'Antena receptora RLink',
    channels: 16,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  // Keypads - Família QUANTICA
  { 
    id: 0, 
    category: 'Keypad', 
    type: 'Quantica Keypad', 
    brand: 'ROEHN', 
    model: 'RQR-K', 
    description: 'Keypad série Quantica K',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 1.8,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 0, 
    category: 'Keypad', 
    type: 'Quantica Keypad Lite', 
    brand: 'ROEHN', 
    model: 'RQR-L', 
    description: 'Keypad série Quantica L',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0.6,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 0, 
    category: 'Keypad', 
    type: 'Quantica Pulsador', 
    brand: 'ROEHN', 
    model: 'RQR-P', 
    description: 'Pulsador série Quantica P',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0,
    consumesAddress: 0,
    consumesPNETPorts: 1
  },
  { 
    id: 0, 
    category: 'Keypad', 
    type: 'Quantica Thermopad', 
    brand: 'ROEHN', 
    model: 'RQR-T2', 
    description: 'Thermopad Quantica',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 1.8,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  // Keypads - Família FINNO
  { 
    id: 0, 
    category: 'Keypad', 
    type: 'Finno Keypad', 
    brand: 'ROEHN', 
    model: 'RFK', 
    description: 'Keypad série Finno K',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 1.8,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 0, 
    category: 'Keypad', 
    type: 'Finno Air', 
    brand: 'ROEHN', 
    model: 'RFA', 
    description: 'Keypad série Finno Air',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 1.8,
    consumesAddress: 0,
    consumesPNETPorts: 0
  },
  { 
    id: 0, 
    category: 'Keypad', 
    type: 'Finno Pulsador', 
    brand: 'ROEHN', 
    model: 'RFP', 
    description: 'Pulsador série Finno P',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 1.8,
    consumesAddress: 0,
    consumesPNETPorts: 1
  },
  // Keypads - Família BIANNI
  { 
    id: 0, 
    category: 'Keypad', 
    type: 'Bianni Keypad', 
    brand: 'ROEHN', 
    model: 'RBX', 
    description: 'Keypad série Bianni',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 1.8,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  // Keypads - Família ION
  { 
    id: 0, 
    category: 'Keypad', 
    type: 'ION Keypad', 
    brand: 'ROEHN', 
    model: 'RIS', 
    description: 'Keypad série ION',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 1.2,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  // Sensors
  { 
    id: 0, 
    category: 'Sensor', 
    type: 'Widelux', 
    brand: 'ROEHN', 
    model: 'WIDELUX', 
    description: 'Sensor avançado de luz e movimento',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0.4,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 0, 
    category: 'Sensor', 
    type: 'X-Ray', 
    brand: 'ROEHN', 
    model: 'X-RAY', 
    description: 'Sensor de temperatura e qualidade do ar',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0.4,
    consumesAddress: 1,
    consumesPNETPorts: 0
  },
  { 
    id: 0, 
    category: 'Sensor', 
    type: 'Nano', 
    brand: 'ROEHN', 
    model: 'NANO', 
    description: 'Sensor de movimento simples',
    channels: 1,
    suppliesLPower: 0,
    suppliesNPower: 0,
    suppliesAddress: 0,
    suppliesPNETPorts: 0,
    consumesLPower: 0,
    consumesNPower: 0,
    consumesAddress: 0,
    consumesPNETPorts: 1
  },
];

const INITIAL_STATE: ProjectInputs = {
  projectName: '',
  integratorName: '',
  counts: {
    [DeviceType.LIGHT_ONOFF]: 0,
    [DeviceType.LIGHT_DIMMER]: 0,
    [DeviceType.LIGHT_PWM]: 0,
    [DeviceType.LIGHT_DALI]: 0,
    [DeviceType.SHADE_WIRED]: 0,
    [DeviceType.SHADE_WIRELESS]: 0,
    [DeviceType.CLIMATE_IR]: 0,
    [DeviceType.CLIMATE_VRV]: 0,
    [DeviceType.KEYPAD_QUANTICA_K]: 0,
    [DeviceType.KEYPAD_QUANTICA_L]: 0,
    [DeviceType.KEYPAD_QUANTICA_P]: 0,
    [DeviceType.KEYPAD_QUANTICA_THERMOPAD]: 0,
    [DeviceType.KEYPAD_FINNO_K]: 0,
    [DeviceType.KEYPAD_FINNO_AIR]: 0,
    [DeviceType.KEYPAD_FINNO_P]: 0,
    [DeviceType.KEYPAD_BIANNI_K]: 0,
    [DeviceType.KEYPAD_ION]: 0,
    [DeviceType.SENSOR_WIDELUX]: 0,
    [DeviceType.SENSOR_XRAY]: 0,
    [DeviceType.SENSOR_NANO]: 0,
  }
};

type ViewMode = 'integrator' | 'backoffice';

const DEVICE_TO_MODEL: Partial<Record<DeviceType, string>> = {
  [DeviceType.KEYPAD_QUANTICA_K]: 'RQR-K',
  [DeviceType.KEYPAD_QUANTICA_L]: 'RQR-L',
  [DeviceType.KEYPAD_QUANTICA_P]: 'RQR-P',
  [DeviceType.KEYPAD_QUANTICA_THERMOPAD]: 'RQR-T2',
  [DeviceType.KEYPAD_FINNO_K]: 'RFK',
  [DeviceType.KEYPAD_FINNO_AIR]: 'RFA',
  [DeviceType.KEYPAD_FINNO_P]: 'RFP',
  [DeviceType.KEYPAD_BIANNI_K]: 'RBX',
  [DeviceType.KEYPAD_ION]: 'RIS',
  [DeviceType.SENSOR_WIDELUX]: 'WIDELUX',
  [DeviceType.SENSOR_XRAY]: 'X-RAY',
  [DeviceType.SENSOR_NANO]: 'NANO',
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('integrator');
  const [catalog, setCatalog] = useState<Product[]>(() => 
    INITIAL_CATALOG.map(p => ({ ...p, active: p.active !== false }))
  );
  const [showReasoning, setShowReasoning] = useState<boolean>(true);

  const getCatalogDescription = (deviceType: DeviceType, fallback: string): string => {
    const model = DEVICE_TO_MODEL[deviceType];
    if (model) {
      const item = catalog.find(p => p.model === model);
      if (item?.description) return item.description;
    }
    return fallback;
  };
  
  const [inputs, setInputs] = useState<ProjectInputs>(INITIAL_STATE);
  const [result, setResult] = useState<SpecificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type CategoryAccordionId = 'lighting' | 'shades' | 'climate' | 'interfaces' | 'sensors';
  const ALL_CATEGORIES: CategoryAccordionId[] = ['lighting', 'shades', 'climate', 'interfaces', 'sensors'];
  const [autoCollapse, setAutoCollapse] = useState<boolean>(true);
  const [expandedCategories, setExpandedCategories] = useState<CategoryAccordionId[]>(['lighting']);

  const handleToggleAutoCollapse = () => {
    setAutoCollapse(prev => {
      const next = !prev;
      if (next) {
        // Transição desativado -> ativado: todos os containers são recolhidos, mantendo apenas o primeiro expandido
        setExpandedCategories(['lighting']);
      }
      // Ao desativar o recolhimento automático: mantém o estado atual das seções
      return next;
    });
  };

  const toggleCategory = (id: CategoryAccordionId) => {
    setExpandedCategories(prev => {
      if (autoCollapse) {
        // Ao ser ativado: mantendo apenas 1 aberto por vez (ao expandir 1, os outros são recolhidos)
        if (prev.includes(id)) {
          return [];
        }
        return [id];
      } else {
        // Quando desativado: gestão manual, múltiplos podem ser expandidos simultaneamente
        if (prev.includes(id)) {
          return prev.filter(c => c !== id);
        }
        return [...prev, id];
      }
    });
  };

  const handleAddProduct = (newProduct: Product) => {
    setCatalog(prev => [...prev, newProduct]);
  };

  const handleRemoveProduct = (id: number) => {
    setCatalog(catalog.filter(p => p.id !== id));
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setCatalog(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleCountChange = (type: DeviceType, val: number) => {
    setInputs(prev => ({
      ...prev,
      counts: { ...prev.counts, [type]: val }
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if ((inputs.counts[DeviceType.KEYPAD_FINNO_AIR] || 0) > 32) {
      setError("Um sistema pode ter no máximo 32 keypads Finno Air.");
      setLoading(false);
      return;
    }
    try {
      const spec = await generateSpecification(inputs, catalog);
      setResult(spec);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = () => {
    setInputs(INITIAL_STATE);
    setResult(null);
  };

  const totalDevices = Object.values(inputs.counts).reduce((a: number, b: number) => a + b, 0);

  const lightingCount = 
    inputs.counts[DeviceType.LIGHT_ONOFF] +
    inputs.counts[DeviceType.LIGHT_DIMMER] +
    inputs.counts[DeviceType.LIGHT_PWM] +
    inputs.counts[DeviceType.LIGHT_DALI];

  const shadeCount = 
    inputs.counts[DeviceType.SHADE_WIRED] +
    inputs.counts[DeviceType.SHADE_WIRELESS];

  const climateCount = 
    inputs.counts[DeviceType.CLIMATE_IR] +
    inputs.counts[DeviceType.CLIMATE_VRV];

  const quanticaCount = 
    inputs.counts[DeviceType.KEYPAD_QUANTICA_K] +
    inputs.counts[DeviceType.KEYPAD_QUANTICA_L] +
    inputs.counts[DeviceType.KEYPAD_QUANTICA_P] +
    inputs.counts[DeviceType.KEYPAD_QUANTICA_THERMOPAD];

  const finnoCount = 
    inputs.counts[DeviceType.KEYPAD_FINNO_K] +
    inputs.counts[DeviceType.KEYPAD_FINNO_AIR] +
    inputs.counts[DeviceType.KEYPAD_FINNO_P];

  const bianniCount = 
    inputs.counts[DeviceType.KEYPAD_BIANNI_K] || 0;

  const ionCount = 
    inputs.counts[DeviceType.KEYPAD_ION];

  const keypadCount = quanticaCount + finnoCount + bianniCount + ionCount;

  const sensorCount = 
    inputs.counts[DeviceType.SENSOR_WIDELUX] +
    inputs.counts[DeviceType.SENSOR_XRAY] +
    inputs.counts[DeviceType.SENSOR_NANO];

  const handleClearAll = () => {
    setInputs(prev => ({
      ...prev,
      counts: Object.keys(prev.counts).reduce((acc, key) => {
        acc[key as DeviceType] = 0;
        return acc;
      }, {} as Record<DeviceType, number>)
    }));
  };

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="mx-auto px-2 sm:px-4 h-16 flex items-center justify-between transition-all max-w-[98%] 2xl:max-w-[1920px]">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#746554] p-2 rounded-lg text-white shadow-2xs">
              <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="font-bold text-xl text-gray-800 tracking-tight">
              ROEHN Flux
            </h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg border border-gray-200/60">
            <button
              onClick={() => setView('integrator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                view === 'integrator' 
                  ? 'bg-white text-[#746554] font-semibold shadow-2xs' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <ClipboardList size={16} />
              Especificador
            </button>
            <button
              onClick={() => setView('backoffice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                view === 'backoffice' 
                  ? 'bg-white text-[#746554] font-semibold shadow-2xs' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Settings size={16} />
              Administração
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto px-2 sm:px-4 py-4 transition-all max-w-[98%] 2xl:max-w-[1920px]">
        
        {view === 'backoffice' ? (
          <BackofficeView 
            catalog={catalog} 
            onAddProduct={handleAddProduct} 
            onRemoveProduct={handleRemoveProduct}
            onUpdateProduct={handleUpdateProduct}
            showReasoning={showReasoning}
            onToggleReasoning={setShowReasoning}
          />
        ) : (
          <>
            {result ? (
              <ResultView 
                data={result} 
                projectName={inputs.projectName}
                integratorName={inputs.integratorName}
                onReset={() => setResult(null)} 
                onNewProject={handleNewProject}
                showReasoning={showReasoning} 
              />
            ) : (
              <div className="animate-fade-in w-full">
                <form onSubmit={handleSubmit} className="space-y-4 pb-24 sm:pb-20">
                  {/* Informações do Projeto */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Nome do Projeto
                        </label>
                        <input
                          type="text"
                          name="projectName"
                          placeholder="ex: Residência Silva"
                          value={inputs.projectName}
                          onChange={handleTextChange}
                          className="w-full px-3.5 py-2 rounded-lg bg-gray-50/70 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#746554]/20 focus:border-[#746554] outline-none text-sm transition-all shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Integrador Responsável
                        </label>
                        <input
                          type="text"
                          name="integratorName"
                          placeholder="ex: Tech Soluções Ltda."
                          value={inputs.integratorName}
                          onChange={handleTextChange}
                          className="w-full px-3.5 py-2 rounded-lg bg-gray-50/70 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#746554]/20 focus:border-[#746554] outline-none text-sm transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cabeçalho da Seção de Categorias com Toggle Switch 'Recolher automaticamente' */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Categorias de Dispositivos
                    </span>
                    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                      <span className="text-xs font-medium text-gray-600">
                        Recolher automaticamente
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={autoCollapse}
                        onClick={handleToggleAutoCollapse}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          autoCollapse ? 'bg-[#746554]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            autoCollapse ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  {/* Categorias com Containers Expansíveis (Accordion) */}
                  <div className="space-y-3">
                    {/* 1. Iluminação */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleCategory('lighting')}
                        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm text-gray-800 uppercase tracking-wider">
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            expandedCategories.includes('lighting') ? 'bg-[#746554]/10 text-[#746554]' : 'bg-gray-100 text-gray-700'
                          }`}>
                            <Lightbulb size={18} />
                          </div>
                          <span>Iluminação</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {lightingCount > 0 && (
                            <span className="h-5 inline-flex items-center px-2.5 text-xs font-semibold leading-none text-neutral-900 bg-gray-100 rounded-full border border-gray-200/80">
                              {lightingCount} {lightingCount === 1 ? 'circuito' : 'circuitos'}
                            </span>
                          )}
                          <ChevronDown 
                            size={18} 
                            className={`text-gray-400 transition-transform duration-200 ${
                              expandedCategories.includes('lighting') ? 'rotate-180 text-gray-700' : ''
                            }`} 
                          />
                        </div>
                      </button>

                      {expandedCategories.includes('lighting') && (
                        <div className="p-4 sm:p-5 pt-1 sm:pt-2 border-t border-gray-100 animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <CounterInput 
                              label="Circuito Liga/Desliga"
                              sublabel="Circuitos de acionamento simples"
                              value={inputs.counts[DeviceType.LIGHT_ONOFF]} 
                              onChange={(v) => handleCountChange(DeviceType.LIGHT_ONOFF, v)}
                            />
                            <CounterInput 
                              label="Circuito Dimmer"
                              sublabel="Circuitos de acionamento dimerizável"
                              value={inputs.counts[DeviceType.LIGHT_DIMMER]} 
                              onChange={(v) => handleCountChange(DeviceType.LIGHT_DIMMER, v)}
                            />
                            <CounterInput 
                              label="Circuito PWM"
                              sublabel="Circuitos de Fitas LED luminárias de controle PWM"
                              value={inputs.counts[DeviceType.LIGHT_PWM]} 
                              onChange={(v) => handleCountChange(DeviceType.LIGHT_PWM, v)}
                            />
                            <CounterInput 
                              label="Circuito DALI"
                              sublabel="Circuitos com drivers endereçáveis DALI"
                              value={inputs.counts[DeviceType.LIGHT_DALI]} 
                              onChange={(v) => handleCountChange(DeviceType.LIGHT_DALI, v)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. Persianas & Cortinas */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleCategory('shades')}
                        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm text-gray-800 uppercase tracking-wider">
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            expandedCategories.includes('shades') ? 'bg-[#746554]/10 text-[#746554]' : 'bg-gray-100 text-gray-700'
                          }`}>
                            <Blinds size={18} />
                          </div>
                          <span>Persianas & Cortinas</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {shadeCount > 0 && (
                            <span className="h-5 inline-flex items-center px-2.5 text-xs font-semibold leading-none text-neutral-900 bg-gray-100 rounded-full border border-gray-200/80">
                              {shadeCount} {shadeCount === 1 ? 'persiana' : 'persianas'}
                            </span>
                          )}
                          <ChevronDown 
                            size={18} 
                            className={`text-gray-400 transition-transform duration-200 ${
                              expandedCategories.includes('shades') ? 'rotate-180 text-gray-700' : ''
                            }`} 
                          />
                        </div>
                      </button>

                      {expandedCategories.includes('shades') && (
                        <div className="p-4 sm:p-5 pt-1 sm:pt-2 border-t border-gray-100 animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <CounterInput 
                              label="Cortina com Fio"
                              sublabel="Cortinas ou persianas motorizadas"
                              value={inputs.counts[DeviceType.SHADE_WIRED]} 
                              onChange={(v) => handleCountChange(DeviceType.SHADE_WIRED, v)}
                            />
                            <CounterInput 
                              label="Cortina sem Fio"
                              sublabel="Cortinas motorizadas com controle via RF"
                              value={inputs.counts[DeviceType.SHADE_WIRELESS]} 
                              onChange={(v) => handleCountChange(DeviceType.SHADE_WIRELESS, v)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Climatização */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleCategory('climate')}
                        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm text-gray-800 uppercase tracking-wider">
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            expandedCategories.includes('climate') ? 'bg-[#746554]/10 text-[#746554]' : 'bg-gray-100 text-gray-700'
                          }`}>
                            <Thermometer size={18} />
                          </div>
                          <span>Climatização</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {climateCount > 0 && (
                            <span className="h-5 inline-flex items-center px-2.5 text-xs font-semibold leading-none text-neutral-900 bg-gray-100 rounded-full border border-gray-200/80">
                              {climateCount} {climateCount === 1 ? 'zona' : 'zonas'}
                            </span>
                          )}
                          <ChevronDown 
                            size={18} 
                            className={`text-gray-400 transition-transform duration-200 ${
                              expandedCategories.includes('climate') ? 'rotate-180 text-gray-700' : ''
                            }`} 
                          />
                        </div>
                      </button>

                      {expandedCategories.includes('climate') && (
                        <div className="p-4 sm:p-5 pt-1 sm:pt-2 border-t border-gray-100 animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <CounterInput 
                              label="Ar-condicionado IR"
                              sublabel="Splits de ar-condicionado com controle IR"
                              value={inputs.counts[DeviceType.CLIMATE_IR]} 
                              onChange={(v) => handleCountChange(DeviceType.CLIMATE_IR, v)}
                            />
                            <CounterInput 
                              label="Ar-condicionado VRV/VRF"
                              sublabel="Evaporadoras de ar-condicionado centralizado"
                              value={inputs.counts[DeviceType.CLIMATE_VRV]} 
                              onChange={(v) => handleCountChange(DeviceType.CLIMATE_VRV, v)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 4. Interfaces de Usuário */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleCategory('interfaces')}
                        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm text-gray-800 uppercase tracking-wider">
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            expandedCategories.includes('interfaces') ? 'bg-[#746554]/10 text-[#746554]' : 'bg-gray-100 text-gray-700'
                          }`}>
                            <Grid3x3 size={18} />
                          </div>
                          <span>Interfaces de Usuário</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {keypadCount > 0 && (
                            <span className="h-5 inline-flex items-center px-2.5 text-xs font-semibold leading-none text-neutral-900 bg-gray-100 rounded-full border border-gray-200/80">
                              {keypadCount} {keypadCount === 1 ? 'teclado' : 'teclados'}
                            </span>
                          )}
                          <ChevronDown 
                            size={18} 
                            className={`text-gray-400 transition-transform duration-200 ${
                              expandedCategories.includes('interfaces') ? 'rotate-180 text-gray-700' : ''
                            }`} 
                          />
                        </div>
                      </button>

                      {expandedCategories.includes('interfaces') && (
                        <div className="p-4 sm:p-5 pt-3 border-t border-gray-100 animate-fade-in space-y-4">
                          {/* Família QUANTICA */}
                          <div className="space-y-2">
                            <div className="h-5 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Família QUANTICA
                              </span>
                              {quanticaCount > 0 && (
                                <span className="text-[11px] font-medium leading-none text-gray-500">
                                  {quanticaCount} {quanticaCount === 1 ? 'item' : 'itens'}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              <CounterInput 
                                label="Keypad"
                                sublabel={getCatalogDescription(DeviceType.KEYPAD_QUANTICA_K, 'Keypad série Quantica K')}
                                value={inputs.counts[DeviceType.KEYPAD_QUANTICA_K]} 
                                onChange={(v) => handleCountChange(DeviceType.KEYPAD_QUANTICA_K, v)}
                              />
                              <CounterInput 
                                label="Keypad Lite"
                                sublabel={getCatalogDescription(DeviceType.KEYPAD_QUANTICA_L, 'Keypad série Quantica L')}
                                value={inputs.counts[DeviceType.KEYPAD_QUANTICA_L]} 
                                onChange={(v) => handleCountChange(DeviceType.KEYPAD_QUANTICA_L, v)}
                              />
                              <CounterInput 
                                label="Pulsador"
                                sublabel={getCatalogDescription(DeviceType.KEYPAD_QUANTICA_P, 'Pulsador série Quantica P')}
                                value={inputs.counts[DeviceType.KEYPAD_QUANTICA_P]} 
                                onChange={(v) => handleCountChange(DeviceType.KEYPAD_QUANTICA_P, v)}
                              />
                              <CounterInput 
                                label="Thermopad"
                                sublabel={getCatalogDescription(DeviceType.KEYPAD_QUANTICA_THERMOPAD, 'Thermopad Quantica')}
                                value={inputs.counts[DeviceType.KEYPAD_QUANTICA_THERMOPAD]} 
                                onChange={(v) => handleCountChange(DeviceType.KEYPAD_QUANTICA_THERMOPAD, v)}
                              />
                            </div>
                          </div>

                          {/* Família FINNO */}
                          <div className="space-y-2">
                            <div className="h-5 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Família FINNO
                              </span>
                              {finnoCount > 0 && (
                                <span className="text-[11px] font-medium leading-none text-gray-500">
                                  {finnoCount} {finnoCount === 1 ? 'item' : 'itens'}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              <CounterInput 
                                label="Keypad"
                                sublabel={getCatalogDescription(DeviceType.KEYPAD_FINNO_K, 'Keypad série Finno K')}
                                value={inputs.counts[DeviceType.KEYPAD_FINNO_K]} 
                                onChange={(v) => handleCountChange(DeviceType.KEYPAD_FINNO_K, v)}
                              />
                              <CounterInput 
                                label="Air"
                                sublabel={getCatalogDescription(DeviceType.KEYPAD_FINNO_AIR, 'Keypad série Finno Air')}
                                value={inputs.counts[DeviceType.KEYPAD_FINNO_AIR]} 
                                onChange={(v) => handleCountChange(DeviceType.KEYPAD_FINNO_AIR, Math.min(32, Math.max(0, v)))}
                                max={32}
                              />
                              <CounterInput 
                                label="Pulsador"
                                sublabel={getCatalogDescription(DeviceType.KEYPAD_FINNO_P, 'Pulsador série Finno P')}
                                value={inputs.counts[DeviceType.KEYPAD_FINNO_P]} 
                                onChange={(v) => handleCountChange(DeviceType.KEYPAD_FINNO_P, v)}
                              />
                            </div>
                          </div>

                          {/* Família BIANNI */}
                          <div className="space-y-2">
                            <div className="h-5 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Família BIANNI
                              </span>
                              {bianniCount > 0 && (
                                <span className="text-[11px] font-medium leading-none text-gray-500">
                                  {bianniCount} {bianniCount === 1 ? 'item' : 'itens'}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              <CounterInput 
                                label="Keypad"
                                sublabel={getCatalogDescription(DeviceType.KEYPAD_BIANNI_K, 'Keypad série Bianni')}
                                value={inputs.counts[DeviceType.KEYPAD_BIANNI_K]} 
                                onChange={(v) => handleCountChange(DeviceType.KEYPAD_BIANNI_K, v)}
                              />
                            </div>
                          </div>

                          {/* Família ION */}
                          <div className="space-y-2">
                            <div className="h-5 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Família ION
                              </span>
                              {ionCount > 0 && (
                                <span className="text-[11px] font-medium leading-none text-gray-500">
                                  {ionCount} {ionCount === 1 ? 'item' : 'itens'}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              <CounterInput 
                                label="Keypad"
                                sublabel={getCatalogDescription(DeviceType.KEYPAD_ION, 'Keypad série ION')}
                                value={inputs.counts[DeviceType.KEYPAD_ION]} 
                                onChange={(v) => handleCountChange(DeviceType.KEYPAD_ION, v)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 5. Sensores */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => toggleCategory('sensors')}
                        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm text-gray-800 uppercase tracking-wider">
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            expandedCategories.includes('sensors') ? 'bg-[#746554]/10 text-[#746554]' : 'bg-gray-100 text-gray-700'
                          }`}>
                            <Radar size={18} />
                          </div>
                          <span>Sensores</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {sensorCount > 0 && (
                            <span className="h-5 inline-flex items-center px-2.5 text-xs font-semibold leading-none text-neutral-900 bg-gray-100 rounded-full border border-gray-200/80">
                              {sensorCount} {sensorCount === 1 ? 'sensor' : 'sensores'}
                            </span>
                          )}
                          <ChevronDown 
                            size={18} 
                            className={`text-gray-400 transition-transform duration-200 ${
                              expandedCategories.includes('sensors') ? 'rotate-180 text-gray-700' : ''
                            }`} 
                          />
                        </div>
                      </button>

                      {expandedCategories.includes('sensors') && (
                        <div className="p-4 sm:p-5 pt-1 sm:pt-2 border-t border-gray-100 animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <CounterInput 
                              label="Widelux"
                              sublabel={getCatalogDescription(DeviceType.SENSOR_WIDELUX, 'Sensor avançado de luz e movimento')}
                              value={inputs.counts[DeviceType.SENSOR_WIDELUX]} 
                              onChange={(v) => handleCountChange(DeviceType.SENSOR_WIDELUX, v)}
                            />
                            <CounterInput 
                              label="X-Ray"
                              sublabel={getCatalogDescription(DeviceType.SENSOR_XRAY, 'Sensor de temperatura e qualidade do ar')}
                              value={inputs.counts[DeviceType.SENSOR_XRAY]} 
                              onChange={(v) => handleCountChange(DeviceType.SENSOR_XRAY, v)}
                            />
                            <CounterInput 
                              label="Nano"
                              sublabel={getCatalogDescription(DeviceType.SENSOR_NANO, 'Sensor de movimento simples')}
                              value={inputs.counts[DeviceType.SENSOR_NANO]} 
                              onChange={(v) => handleCountChange(DeviceType.SENSOR_NANO, v)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Barra inferior fixa (como o header) com Mini-Resumo */}
                  <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] print:hidden">
                    <div className="mx-auto px-2 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3 max-w-[98%] 2xl:max-w-[1920px]">
                      <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
                        <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                          totalDevices > 0 ? 'bg-[#746554] text-white shadow-2xs' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {totalDevices}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 leading-none">
                              {totalDevices === 0 
                                ? 'Nenhum dispositivo adicionado' 
                                : `${totalDevices} ${totalDevices === 1 ? 'dispositivo configurado' : 'dispositivos configurados'}`}
                            </span>
                            {totalDevices > 0 && (
                              <button
                                type="button"
                                onClick={handleClearAll}
                                className="text-xs text-gray-400 hover:text-red-600 transition-colors inline-flex items-center gap-1 cursor-pointer font-normal"
                                title="Limpar todos os campos"
                              >
                                <RotateCcw size={12} /> Limpar
                              </button>
                            )}
                          </div>

                          {/* Mini-resumo de categorias ativas */}
                          {totalDevices > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              {lightingCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/80">
                                  <Lightbulb size={12} className="text-amber-600 shrink-0" />
                                  <span>{lightingCount} iluminação</span>
                                </span>
                              )}
                              {shadeCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-900 border border-blue-200/80">
                                  <Blinds size={12} className="text-blue-600 shrink-0" />
                                  <span>{shadeCount} {shadeCount === 1 ? 'persiana' : 'persianas'}</span>
                                </span>
                              )}
                              {climateCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-50 text-red-900 border border-red-200/80">
                                  <Thermometer size={12} className="text-red-600 shrink-0" />
                                  <span>{climateCount} {climateCount === 1 ? 'zona clim.' : 'zonas clim.'}</span>
                                </span>
                              )}
                              {keypadCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#746554]/10 text-[#746554] border border-[#746554]/25">
                                  <Grid3x3 size={12} className="text-[#746554] shrink-0" />
                                  <span>{keypadCount} {keypadCount === 1 ? 'teclado' : 'teclados'}</span>
                                </span>
                              )}
                              {sensorCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-900 border border-purple-200/80">
                                  <Radar size={12} className="text-purple-600 shrink-0" />
                                  <span>{sensorCount} {sensorCount === 1 ? 'sensor' : 'sensores'}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Adicione circuitos e dispositivos acima para calcular o hardware
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || totalDevices === 0}
                        className="w-full md:w-auto px-6 py-2.5 sm:py-3 bg-[#746554] hover:bg-[#635647] active:scale-98 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#746554] flex items-center justify-center gap-2 cursor-pointer text-sm shrink-0"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" size={16} /> Calculando...
                          </>
                        ) : (
                          <>
                            Gerar Especificação <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;