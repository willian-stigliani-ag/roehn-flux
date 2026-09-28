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
  RotateCcw
} from 'lucide-react';

const INITIAL_CATALOG: Product[] = [
  { 
    id: 1001, 
    category: 'Processor', 
    type: 'Processador', 
    brand: 'ROEHN', 
    model: 'RDP-M6', 
    description: 'Processador de sistema ROEHN',
    channels: 0,
    suppliesLPower: 0,
    suppliesNPower: 55,
    suppliesAddress: 250,
    suppliesPNETPorts: 0,
    consumesLPower: 5,
    consumesNPower: 0,
    consumesAddress: 0,
    consumesPNETPorts: 0,
    requiresDedicatedPS: true
  },
  { 
    id: 2001, 
    category: 'Lighting Control', 
    type: 'Dimer', 
    brand: 'ROEHN', 
    model: 'RDP-DIM8', 
    description: 'Módulo dimmer universal de 8 canais para trilho DIN',
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
    id: 2002, 
    category: 'Lighting Control', 
    type: 'Dimer', 
    brand: 'ROEHN', 
    model: 'RDP-DIM4', 
    description: 'Módulo dimmer universal de 4 canais para trilho DIN',
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
    id: 2003, 
    category: 'Lighting Control', 
    type: 'Relé', 
    brand: 'ROEHN', 
    model: 'RDP-RL12', 
    description: 'Módulo de relé de 12 canais para trilho DIN',
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
    id: 2004, 
    category: 'Lighting Control', 
    type: 'Relé', 
    brand: 'ROEHN', 
    model: 'RDP-RL8', 
    description: 'Módulo de relé de 8 canais para trilho DIN',
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
    id: 2005, 
    category: 'Lighting Control', 
    type: 'Relé', 
    brand: 'ROEHN', 
    model: 'RDP-RL4', 
    description: 'Módulo de relé de 4 canais para trilho DIN',
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
    id: 2006, 
    category: 'Lighting Control', 
    type: 'PWM', 
    brand: 'ROEHN', 
    model: 'RDP-PWM4', 
    description: 'Módulo PWM de 4 canais para trilho DIN',
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
    id: 2007, 
    category: 'Lighting Control', 
    type: 'DALI', 
    brand: 'ROEHN', 
    model: 'RDP-DL2', 
    description: 'Interface DALI de 2 canais para trilho DIN (128 endereços)',
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
    id: 3001, 
    category: 'Shades Control', 
    type: 'Cabeada', 
    brand: 'ROEHN', 
    model: 'RDP-LX4', 
    description: 'Controlador de persiana de 4 motores para trilho DIN',
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
    id: 3002, 
    category: 'Shades Control', 
    type: 'Cabeada', 
    brand: 'ROEHN', 
    model: 'RDP-LX2', 
    description: 'Controlador de persiana de 2 motores para trilho DIN',
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
    id: 3003, 
    category: 'Shades Control', 
    type: 'Sem Fio', 
    brand: 'ROEHN', 
    model: 'RRM-GTW', 
    description: 'Módulo de controle de persianas RF remoto de 32 canais',
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
    id: 4001, 
    category: 'HVAC Control', 
    type: 'Infravermelho', 
    brand: 'ROEHN', 
    model: 'RRM-SA1', 
    description: 'Módulo de controle de ar-condicionado IR de canal único',
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
    id: 4003, 
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
    id: 5001, 
    category: 'Accessory', 
    type: 'Fonte de Alimentação', 
    brand: 'ROEHN', 
    model: 'RDP-PWR60', 
    description: 'Fonte de alimentação de 60W para montagem em trilho DIN',
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
    id: 5002, 
    category: 'Accessory', 
    type: 'Alim. Barramento', 
    brand: 'ROEHN', 
    model: 'RDP-HUB6', 
    description: 'Hub de Alimentação de Rede RNET (Requer fonte dedicada)',
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
    id: 5003, 
    category: 'Accessory', 
    type: 'Antena Receptora', 
    brand: 'ROEHN', 
    model: 'RFN-AIR-RX', 
    description: 'Antena receptora RF para keypads Finno Air (até 16 keypads por antena)',
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
    id: 6001, 
    category: 'Keypad', 
    type: 'Quantica Keypad', 
    brand: 'ROEHN', 
    model: 'RQR-K', 
    description: 'Teclado Série Quantica Keypad',
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
    id: 6002, 
    category: 'Keypad', 
    type: 'Quantica Keypad Lite', 
    brand: 'ROEHN', 
    model: 'RQR-L', 
    description: 'Teclado Série Quantica Keypad Lite',
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
    id: 6003, 
    category: 'Keypad', 
    type: 'Quantica Pulsador', 
    brand: 'ROEHN', 
    model: 'RQR-P', 
    description: 'Pulsador Série Quantica Pulsador',
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
  // Keypads - Família FINNO
  { 
    id: 6010, 
    category: 'Keypad', 
    type: 'Finno Keypad', 
    brand: 'ROEHN', 
    model: 'RFN-K', 
    description: 'Teclado Série Finno Keypad',
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
    id: 6011, 
    category: 'Keypad', 
    type: 'Finno Air', 
    brand: 'ROEHN', 
    model: 'RFN-AIR', 
    description: 'Teclado Série Finno Air',
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
    id: 6012, 
    category: 'Keypad', 
    type: 'Finno Pulsador', 
    brand: 'ROEHN', 
    model: 'RFN-P', 
    description: 'Pulsador Série Finno Pulsador',
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
  // Keypads - Família BIANNI
  { 
    id: 6020, 
    category: 'Keypad', 
    type: 'Bianni Keypad', 
    brand: 'ROEHN', 
    model: 'RBN-K', 
    description: 'Teclado Série Bianni Keypad',
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
    id: 6021, 
    category: 'Keypad', 
    type: 'Bianni Pulsador', 
    brand: 'ROEHN', 
    model: 'RBN-P', 
    description: 'Pulsador Série Bianni Pulsador',
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
    id: 6004, 
    category: 'Keypad', 
    type: 'ION Keypad', 
    brand: 'ROEHN', 
    model: 'RIS-K', 
    description: 'Teclado Série ION Keypad',
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
    id: 7001, 
    category: 'Sensor', 
    type: 'Widelux', 
    brand: 'ROEHN', 
    model: 'WIDELUX', 
    description: 'Widelux sensor avançado de luz e movimento',
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
    id: 7002, 
    category: 'Sensor', 
    type: 'X-Ray', 
    brand: 'ROEHN', 
    model: 'X-RAY', 
    description: 'X-Ray sensor de temperatura e qualidade do ar',
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
    id: 7003, 
    category: 'Sensor', 
    type: 'Nano', 
    brand: 'ROEHN', 
    model: 'NANO', 
    description: 'Sensor de movimento simples PNET',
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
    [DeviceType.KEYPAD_FINNO_K]: 0,
    [DeviceType.KEYPAD_FINNO_AIR]: 0,
    [DeviceType.KEYPAD_FINNO_P]: 0,
    [DeviceType.KEYPAD_BIANNI_K]: 0,
    [DeviceType.KEYPAD_BIANNI_P]: 0,
    [DeviceType.KEYPAD_ION]: 0,
    [DeviceType.SENSOR_WIDELUX]: 0,
    [DeviceType.SENSOR_XRAY]: 0,
    [DeviceType.SENSOR_NANO]: 0,
  }
};

type ViewMode = 'integrator' | 'backoffice';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('integrator');
  const [catalog, setCatalog] = useState<Product[]>(INITIAL_CATALOG);
  const [showReasoning, setShowReasoning] = useState<boolean>(true);
  
  const [inputs, setInputs] = useState<ProjectInputs>(INITIAL_STATE);
  const [result, setResult] = useState<SpecificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    inputs.counts[DeviceType.KEYPAD_QUANTICA_P];

  const finnoCount = 
    inputs.counts[DeviceType.KEYPAD_FINNO_K] +
    inputs.counts[DeviceType.KEYPAD_FINNO_AIR] +
    inputs.counts[DeviceType.KEYPAD_FINNO_P];

  const bianniCount = 
    inputs.counts[DeviceType.KEYPAD_BIANNI_K] +
    inputs.counts[DeviceType.KEYPAD_BIANNI_P];

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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm print:hidden">
        <div className="mx-auto px-2 sm:px-4 h-16 flex items-center justify-between transition-all max-w-[98%] 2xl:max-w-[1920px]">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="font-bold text-xl text-gray-800 tracking-tight">
              ROEHN Flux <span className="text-gray-500 font-light">| Ferramenta de Especificação</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView('integrator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'integrator' 
                  ? 'bg-white text-brand-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList size={16} />
              Especificador
            </button>
            <button
              onClick={() => setView('backoffice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'backoffice' 
                  ? 'bg-white text-brand-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
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
                onReset={() => setResult(null)} 
                onNewProject={handleNewProject}
                showReasoning={showReasoning} 
              />
            ) : (
              <div className="animate-fade-in w-full">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                          className="w-full px-3.5 py-2 rounded-lg bg-gray-50/70 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 outline-none text-sm transition-all shadow-2xs"
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
                          className="w-full px-3.5 py-2 rounded-lg bg-gray-50/70 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 outline-none text-sm transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Categorias Inline (uma abaixo da outra, objetos lado a lado) */}
                  <div className="space-y-6">
                    {/* 1. Luzes (Iluminação) */}
                    <section className="space-y-2.5">
                      <div className="h-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xs text-gray-700 uppercase tracking-wider">
                          <Lightbulb size={16} className="text-gray-800" />
                          <span>Iluminação</span>
                        </div>
                        {lightingCount > 0 && (
                          <span className="h-5 inline-flex items-center px-2.5 text-xs font-semibold leading-none text-neutral-900 bg-neutral-100 rounded-full">
                            {lightingCount} {lightingCount === 1 ? 'circuito' : 'circuitos'}
                          </span>
                        )}
                      </div>
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
                    </section>

                    {/* 2. Cortinas (Persianas & Cortinas) */}
                    <section className="space-y-2.5">
                      <div className="h-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xs text-gray-700 uppercase tracking-wider">
                          <Blinds size={16} className="text-gray-800" />
                          <span>Persianas & Cortinas</span>
                        </div>
                        {shadeCount > 0 && (
                          <span className="h-5 inline-flex items-center px-2.5 text-xs font-semibold leading-none text-neutral-900 bg-neutral-100 rounded-full">
                            {shadeCount} {shadeCount === 1 ? 'persiana' : 'persianas'}
                          </span>
                        )}
                      </div>
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
                    </section>

                    {/* 3. Ar Condicionado (Climatização) */}
                    <section className="space-y-2.5">
                      <div className="h-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xs text-gray-700 uppercase tracking-wider">
                          <Thermometer size={16} className="text-gray-800" />
                          <span>Climatização</span>
                        </div>
                        {climateCount > 0 && (
                          <span className="h-5 inline-flex items-center px-2.5 text-xs font-semibold leading-none text-neutral-900 bg-neutral-100 rounded-full">
                            {climateCount} {climateCount === 1 ? 'zona' : 'zonas'}
                          </span>
                        )}
                      </div>
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
                    </section>

                    {/* 4. Interfaces (Interfaces de Usuário) */}
                    <section className="space-y-4">
                      <div className="h-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xs text-gray-700 uppercase tracking-wider">
                          <Grid3x3 size={16} className="text-gray-800" />
                          <span>Interfaces de Usuário</span>
                        </div>
                        {keypadCount > 0 && (
                          <span className="h-5 inline-flex items-center px-2.5 text-xs font-semibold leading-none text-neutral-900 bg-neutral-100 rounded-full">
                            {keypadCount} {keypadCount === 1 ? 'teclado' : 'teclados'}
                          </span>
                        )}
                      </div>

                      {/* Subcategorias por Família de Produto */}
                      <div className="space-y-4">
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
                              sublabel="Keypad Quântica"
                              value={inputs.counts[DeviceType.KEYPAD_QUANTICA_K]} 
                              onChange={(v) => handleCountChange(DeviceType.KEYPAD_QUANTICA_K, v)}
                            />
                            <CounterInput 
                              label="Keypad Lite"
                              sublabel="Keypad QUântica Lite"
                              value={inputs.counts[DeviceType.KEYPAD_QUANTICA_L]} 
                              onChange={(v) => handleCountChange(DeviceType.KEYPAD_QUANTICA_L, v)}
                            />
                            <CounterInput 
                              label="Pulsador"
                              sublabel="Pulsador Quântica"
                              value={inputs.counts[DeviceType.KEYPAD_QUANTICA_P]} 
                              onChange={(v) => handleCountChange(DeviceType.KEYPAD_QUANTICA_P, v)}
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
                              sublabel="Keypad Finno com fio"
                              value={inputs.counts[DeviceType.KEYPAD_FINNO_K]} 
                              onChange={(v) => handleCountChange(DeviceType.KEYPAD_FINNO_K, v)}
                            />
                            <CounterInput 
                              label="Air"
                              sublabel="Keypad Finno sem fio"
                              value={inputs.counts[DeviceType.KEYPAD_FINNO_AIR]} 
                              onChange={(v) => handleCountChange(DeviceType.KEYPAD_FINNO_AIR, Math.min(32, v))}
                              max={32}
                            />
                            <CounterInput 
                              label="Pulsador"
                              sublabel="Pulsador Finno"
                              value={inputs.counts[DeviceType.KEYPAD_FINNO_P]} 
                              onChange={(v) => handleCountChange(DeviceType.KEYPAD_FINNO_P, v)}
                            />
                          </div>
                          {inputs.counts[DeviceType.KEYPAD_FINNO_AIR] > 0 && (
                            <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-neutral-100/90 rounded-lg text-xs text-neutral-700 border border-neutral-200/60">
                              <span className="font-semibold text-neutral-900">
                                Finno Air: {inputs.counts[DeviceType.KEYPAD_FINNO_AIR]}/32
                              </span>
                              <span className="text-gray-400">•</span>
                              <span>
                                {Math.ceil(inputs.counts[DeviceType.KEYPAD_FINNO_AIR] / 16)}{' '}
                                {Math.ceil(inputs.counts[DeviceType.KEYPAD_FINNO_AIR] / 16) === 1 ? 'antena receptora' : 'antenas receptoras'}{' '}
                                (até 16 keypads por antena)
                              </span>
                            </div>
                          )}
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
                              sublabel="Keypad Bianni"
                              value={inputs.counts[DeviceType.KEYPAD_BIANNI_K]} 
                              onChange={(v) => handleCountChange(DeviceType.KEYPAD_BIANNI_K, v)}
                            />
                            <CounterInput 
                              label="Pulsador"
                              sublabel="Pulsador Bianni"
                              value={inputs.counts[DeviceType.KEYPAD_BIANNI_P]} 
                              onChange={(v) => handleCountChange(DeviceType.KEYPAD_BIANNI_P, v)}
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
                              sublabel="Keypad Ion"
                              value={inputs.counts[DeviceType.KEYPAD_ION]} 
                              onChange={(v) => handleCountChange(DeviceType.KEYPAD_ION, v)}
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* 5. Sensores */}
                    <section className="space-y-2.5">
                      <div className="h-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xs text-gray-700 uppercase tracking-wider">
                          <Radar size={16} className="text-gray-800" />
                          <span>Sensores</span>
                        </div>
                        {sensorCount > 0 && (
                          <span className="h-5 inline-flex items-center px-2.5 text-xs font-semibold leading-none text-neutral-900 bg-neutral-100 rounded-full">
                            {sensorCount} {sensorCount === 1 ? 'sensor' : 'sensores'}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <CounterInput 
                          label="Widelux"
                          sublabel="Sensor de movimento e luminosidade"
                          value={inputs.counts[DeviceType.SENSOR_WIDELUX]} 
                          onChange={(v) => handleCountChange(DeviceType.SENSOR_WIDELUX, v)}
                        />
                        <CounterInput 
                          label="X-Ray"
                          sublabel="Sensor de temperatura e qualidade do ar"
                          value={inputs.counts[DeviceType.SENSOR_XRAY]} 
                          onChange={(v) => handleCountChange(DeviceType.SENSOR_XRAY, v)}
                        />
                        <CounterInput 
                          label="Nano"
                          sublabel="Sensor de movimento simples"
                          value={inputs.counts[DeviceType.SENSOR_NANO]} 
                          onChange={(v) => handleCountChange(DeviceType.SENSOR_NANO, v)}
                        />
                      </div>
                    </section>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Barra inferior fixa / de ação */}
                  <div className="sticky bottom-4 z-10 pt-2">
                    <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-gray-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                          totalDevices > 0 ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {totalDevices}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <span>
                              {totalDevices === 0 ? 'Nenhum dispositivo adicionado' : `${totalDevices} ${totalDevices === 1 ? 'dispositivo configurado' : 'dispositivos configurados'}`}
                            </span>
                            {totalDevices > 0 && (
                              <button
                                type="button"
                                onClick={handleClearAll}
                                className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer font-normal ml-1"
                                title="Limpar todos os campos"
                              >
                                <RotateCcw size={12} /> Limpar
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {totalDevices === 0 ? 'Adicione dispositivos acima para calcular o hardware' : 'Pronto para calcular processadores, fontes e barramentos'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || totalDevices === 0}
                        className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-900 flex items-center justify-center gap-2 cursor-pointer text-sm"
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