import React, { useState } from 'react';
import { Product, ProductCategory } from '../types';
import { SystemRulesView, SYSTEM_RULES } from './SystemRulesView';
import { 
  Plus, 
  Trash2, 
  Database, 
  Save, 
  X, 
  Pencil, 
  ToggleRight, 
  ToggleLeft, 
  Zap, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  BookOpen
} from 'lucide-react';

interface BackofficeViewProps {
  catalog: Product[];
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (id: number) => void;
  onUpdateProduct: (product: Product) => void;
  showReasoning: boolean;
  onToggleReasoning: (v: boolean) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Processor', 
  'Lighting Control', 
  'Shades Control', 
  'HVAC Control', 
  'Power Supply', 
  'Keypad', 
  'Sensor', 
  'Accessory'
];

const getTypesForCategory = (cat: ProductCategory): string[] => {
  switch (cat) {
    case 'Processor': return ['Processador'];
    case 'Lighting Control': return ['Relé', 'On/Off', 'Dimer', 'PWM', 'DALI'];
    case 'Shades Control': return ['Cabeada', 'Sem Fio'];
    case 'HVAC Control': return ['Infravermelho', 'VRV/VRF'];
    case 'Power Supply': return ['Alim. Barramento', 'Auxiliar', 'Fonte de Alimentação'];
    case 'Keypad': return [
      'Quantica Keypad', 
      'Quantica Keypad Lite', 
      'Quantica Pulsador', 
      'Finno Keypad', 
      'Finno Air', 
      'Finno Pulsador', 
      'Bianni Keypad', 
      'ION Keypad'
    ];
    case 'Sensor': return ['Nano', 'Widelux', 'X-Ray', 'Movimento', 'Presença', 'Lux', 'Temp'];
    case 'Accessory': return ['Fonte de Alimentação', 'Alim. Barramento', 'Antena Receptora', 'Gateway', 'Repetidor', 'Cabo', 'Montagem'];
    default: return ['Padrão'];
  }
};

const DEFAULT_NEW_PRODUCT: Product = {
  id: 1000,
  brand: 'ROEHN',
  model: '',
  description: '',
  category: 'Keypad',
  type: 'Quantica Keypad',
  channels: 1,
  suppliesLPower: 0,
  suppliesNPower: 0,
  suppliesAddress: 0,
  suppliesPNETPorts: 0,
  consumesLPower: 0,
  consumesNPower: 1.8,
  consumesAddress: 1,
  consumesPNETPorts: 0,
  requiresDedicatedPS: false,
  active: true
};

export const BackofficeView: React.FC<BackofficeViewProps> = ({ 
  catalog, 
  onAddProduct, 
  onRemoveProduct, 
  onUpdateProduct, 
  showReasoning, 
  onToggleReasoning 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'rules'>('catalog');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalForm, setModalForm] = useState<Product>(DEFAULT_NEW_PRODUCT);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    const nextId = catalog.length > 0 ? Math.max(...catalog.map(p => p.id)) + 1 : 1001;
    setModalForm({
      ...DEFAULT_NEW_PRODUCT,
      id: nextId
    });
    setModalMode('create');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setModalForm({ ...product });
    setModalMode('edit');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if ((e.target as HTMLInputElement).type === 'checkbox') {
      setModalForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      return;
    }

    const isFloat = name.includes('Power');
    const isInt = name === 'id' || name === 'channels' || name.includes('Address') || name.includes('Ports');
    
    let parsedValue: any = value;
    if (isFloat) parsedValue = parseFloat(value) || 0;
    if (isInt) parsedValue = parseInt(value, 10) || 0;

    if (name === 'category') {
      const newCategory = value as ProductCategory;
      const availableTypes = getTypesForCategory(newCategory);
      setModalForm(prev => ({
        ...prev,
        category: newCategory,
        type: availableTypes[0] || ''
      }));
    } else {
      setModalForm(prev => ({ ...prev, [name]: parsedValue }));
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.model.trim()) {
      setModalError('O modelo é obrigatório.');
      return;
    }

    if (modalMode === 'create') {
      if (catalog.some(p => p.id === modalForm.id)) {
        setModalError(`O ID ${modalForm.id} já está em uso por outro produto.`);
        return;
      }
      onAddProduct(modalForm);
    } else {
      onUpdateProduct(modalForm);
    }

    setIsModalOpen(false);
    setModalError(null);
  };

  // Filter products by search and category
  const filteredCatalog = catalog.filter(product => {
    const matchesSearch = 
      product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toString().includes(searchTerm);
    
    const matchesCategory = 
      selectedCategoryFilter === 'all' || product.category === selectedCategoryFilter;

    const matchesStatus = 
      selectedStatusFilter === 'all' || 
      (selectedStatusFilter === 'active' && product.active !== false) ||
      (selectedStatusFilter === 'inactive' && product.active === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Sub-Navigation Tabs within Backoffice */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-neutral-900 text-white shadow-2xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-2xs'
          }`}
        >
          <Database size={16} />
          <span>Produtos do Catálogo</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'catalog' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {catalog.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-neutral-900 text-white shadow-2xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-2xs'
          }`}
        >
          <BookOpen size={16} />
          <span>Regras da Proposta</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'rules' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {SYSTEM_RULES.length}
          </span>
        </button>
      </div>

      {activeTab === 'rules' ? (
        <SystemRulesView />
      ) : (
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-xs border border-gray-200 space-y-4">
          {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-white rounded-lg shadow-2xs">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Gerenciamento de Produtos (Catálogo)</h2>
              <p className="text-xs text-gray-500">Configure as propriedades técnicas, modelos e capacidades de hardware.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onToggleReasoning(!showReasoning)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                showReasoning 
                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-2xs' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {showReasoning ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              <span>Raciocínio Técnico na BOM</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="bg-[#746554] hover:bg-[#635647] active:scale-98 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={16} /> Novo Produto
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar por modelo, tipo, descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Filtrar:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none focus:bg-white focus:border-neutral-400 font-medium"
            >
              <option value="all">Status: Todos ({catalog.length})</option>
              <option value="active">Apenas Ativos ({catalog.filter(p => p.active !== false).length})</option>
              <option value="inactive">Apenas Inativos ({catalog.filter(p => p.active === false).length})</option>
            </select>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none focus:bg-white focus:border-neutral-400"
            >
              <option value="all">Todas as Categorias ({catalog.length})</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({catalog.filter(p => p.category === cat).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Section with Sticky First 3 Columns and Page Scroll */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-2xs relative">
          <table className="w-full text-left text-xs border-separate border-spacing-0">
            <thead className="text-gray-700 uppercase font-bold text-[11px] tracking-wider select-none bg-neutral-50">
              <tr>
                {/* Fixed Column 1: ID (sticky horizontally) */}
                <th className="sticky left-0 z-20 bg-neutral-100 px-3 py-2.5 border-b-2 border-r border-gray-300 w-16 min-w-[64px] max-w-[64px]">
                  ID
                </th>
                {/* Fixed Column 2: Marca (sticky horizontally) */}
                <th className="sticky left-16 z-20 bg-neutral-100 px-3 py-2.5 border-b-2 border-r border-gray-300 w-20 min-w-[80px] max-w-[80px]">
                  Marca
                </th>
                {/* Fixed Column 3: Modelo (sticky horizontally with separator shadow) */}
                <th className="sticky left-36 z-20 bg-neutral-100 px-3 py-2.5 border-b-2 border-r-2 border-gray-300 w-40 min-w-[160px] max-w-[160px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.1)]">
                  Modelo
                </th>

                {/* Status Column */}
                <th className="bg-neutral-50 px-2.5 py-2.5 border-b-2 border-r border-gray-200 text-center w-24 min-w-[96px]">
                  Status
                </th>

                {/* Remaining Columns (Scrollable horizontally, scrolls naturally with page) */}
                <th className="bg-neutral-50 px-3 py-2.5 border-b-2 border-r border-gray-200 min-w-[200px]">
                  Descrição
                </th>
                <th className="bg-neutral-50 px-3 py-2.5 border-b-2 border-r border-gray-200 min-w-[120px]">
                  Categoria
                </th>
                <th className="bg-neutral-50 px-3 py-2.5 border-b-2 border-r border-gray-200 min-w-[140px]">
                  Tipo
                </th>
                <th className="bg-neutral-50 px-2 py-2.5 border-b-2 border-r border-gray-200 text-center w-12 min-w-[48px]" title="Requer Fonte Dedicada">
                  <Zap size={14} className="mx-auto text-amber-500" />
                </th>
                <th className="bg-neutral-50 px-2 py-2.5 border-b-2 border-r border-gray-200 text-center w-16 min-w-[64px]">
                  Canais
                </th>

                {/* Supplies (Fornecimento) */}
                <th className="bg-emerald-50 text-emerald-900 px-2 py-2.5 border-b-2 border-r border-emerald-200 text-center font-bold min-w-[84px]" title="Capacidade Fornecida: LPower">
                  + LPower
                </th>
                <th className="bg-emerald-50 text-emerald-900 px-2 py-2.5 border-b-2 border-r border-emerald-200 text-center font-bold min-w-[84px]" title="Capacidade Fornecida: NPower">
                  + NPower
                </th>
                <th className="bg-emerald-50 text-emerald-900 px-2 py-2.5 border-b-2 border-r border-emerald-200 text-center font-bold min-w-[76px]" title="Endereços RNET Fornecidos">
                  + Endr
                </th>
                <th className="bg-emerald-50 text-emerald-900 px-2 py-2.5 border-b-2 border-r border-emerald-200 text-center font-bold min-w-[76px]" title="Portas PNET Fornecidas">
                  + PNET
                </th>

                {/* Consumes (Demanda) */}
                <th className="bg-amber-50 text-amber-900 px-2 py-2.5 border-b-2 border-r border-amber-200 text-center font-bold min-w-[84px]" title="Demanda de Consumo: LPower">
                  - LPower
                </th>
                <th className="bg-amber-50 text-amber-900 px-2 py-2.5 border-b-2 border-r border-amber-200 text-center font-bold min-w-[84px]" title="Demanda de Consumo: NPower">
                  - NPower
                </th>
                <th className="bg-amber-50 text-amber-900 px-2 py-2.5 border-b-2 border-r border-amber-200 text-center font-bold min-w-[76px]" title="Endereços RNET Consumidos">
                  - Endr
                </th>
                <th className="bg-amber-50 text-amber-900 px-2 py-2.5 border-b-2 border-r border-amber-200 text-center font-bold min-w-[76px]" title="Portas PNET Consumidas">
                  - PNET
                </th>

                {/* Actions */}
                <th className="bg-neutral-50 px-3 py-2.5 border-b-2 border-gray-200 w-24 min-w-[96px] text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCatalog.map((product) => (
                <tr key={product.id} className={`group hover:bg-neutral-50/80 transition-colors ${product.active === false ? 'opacity-65 bg-gray-50/50' : ''}`}>
                  {/* Fixed Column 1: ID */}
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-neutral-50 px-3 py-2.5 border-b border-r border-gray-200 font-mono text-gray-500 font-medium w-16 min-w-[64px] max-w-[64px] transition-colors">
                    {product.id}
                  </td>

                  {/* Fixed Column 2: Marca */}
                  <td className="sticky left-16 z-10 bg-white group-hover:bg-neutral-50 px-3 py-2.5 border-b border-r border-gray-200 text-gray-700 font-medium w-20 min-w-[80px] max-w-[80px] transition-colors">
                    {product.brand}
                  </td>

                  {/* Fixed Column 3: Modelo (Clickable to edit popup) */}
                  <td 
                    onClick={() => handleOpenEdit(product)}
                    className="sticky left-36 z-10 bg-white group-hover:bg-neutral-50 px-3 py-2.5 border-b border-r-2 border-gray-300 font-bold text-gray-900 w-40 min-w-[160px] max-w-[160px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.08)] cursor-pointer transition-colors"
                    title="Clique para editar as propriedades no popup"
                  >
                    <span className="hover:text-neutral-600 underline decoration-dotted decoration-gray-300 underline-offset-2 hover:decoration-gray-700 transition-colors">
                      {product.model}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="px-2.5 py-2.5 border-b border-r border-gray-100 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateProduct({ ...product, active: product.active === false ? true : false });
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer select-none shadow-2xs ${
                        product.active !== false
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300/50'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                      }`}
                      title={product.active !== false ? 'Clique para desativar este item do cálculo' : 'Clique para ativar este item no cálculo'}
                    >
                      <span className={`w-2 h-2 rounded-full ${product.active !== false ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      <span>{product.active !== false ? 'Ativo' : 'Inativo'}</span>
                    </button>
                  </td>

                  {/* Scrollable Columns */}
                  <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 max-w-[280px]">
                    <span className="truncate block" title={product.description}>
                      {product.description || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-700 font-medium">
                    <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px]">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-700">
                    <span className="font-semibold text-gray-900">{product.type}</span>
                  </td>
                  <td className="px-2 py-2.5 border-b border-r border-gray-100 text-center">
                    {product.requiresDedicatedPS ? (
                      <span title="Requer Fonte Dedicada">
                        <Zap size={14} className="mx-auto text-amber-500 fill-amber-500" />
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 border-b border-r border-gray-100 text-center font-bold text-gray-800">
                    {product.channels}
                  </td>
                  
                  {/* Supplies */}
                  <td className="px-2 py-2.5 border-b border-r border-gray-100 text-center text-gray-600 bg-emerald-50/20">
                    {product.suppliesLPower > 0 ? <span className="text-emerald-700 font-bold">{product.suppliesLPower}W</span> : '-'}
                  </td>
                  <td className="px-2 py-2.5 border-b border-r border-gray-100 text-center text-gray-600 bg-emerald-50/20">
                    {product.suppliesNPower > 0 ? <span className="text-emerald-700 font-bold">{product.suppliesNPower}W</span> : '-'}
                  </td>
                  <td className="px-2 py-2.5 border-b border-r border-gray-100 text-center text-gray-600 bg-emerald-50/20">
                    {product.suppliesAddress > 0 ? <span className="text-emerald-700 font-bold">{product.suppliesAddress}</span> : '-'}
                  </td>
                  <td className="px-2 py-2.5 border-b border-r border-gray-100 text-center text-gray-600 bg-emerald-50/20">
                    {product.suppliesPNETPorts > 0 ? <span className="text-emerald-700 font-bold">{product.suppliesPNETPorts}</span> : '-'}
                  </td>

                  {/* Consumes */}
                  <td className="px-2 py-2.5 border-b border-r border-gray-100 text-center text-gray-600 bg-amber-50/20">
                    {product.consumesLPower > 0 ? <span className="text-amber-700 font-bold">{product.consumesLPower}W</span> : '-'}
                  </td>
                  <td className="px-2 py-2.5 border-b border-r border-gray-100 text-center text-gray-600 bg-amber-50/20">
                    {product.consumesNPower > 0 ? <span className="text-amber-700 font-bold">{product.consumesNPower}W</span> : '-'}
                  </td>
                  <td className="px-2 py-2.5 border-b border-r border-gray-100 text-center text-gray-600 bg-amber-50/20">
                    {product.consumesAddress > 0 ? <span className="text-amber-700 font-bold">{product.consumesAddress}</span> : '-'}
                  </td>
                  <td className="px-2 py-2.5 border-b border-r border-gray-100 text-center text-gray-600 bg-amber-50/20">
                    {product.consumesPNETPorts > 0 ? <span className="text-amber-700 font-bold">{product.consumesPNETPorts}</span> : '-'}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5 border-b border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(product)} 
                        className="p-1.5 text-gray-500 hover:text-neutral-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer" 
                        title="Editar Propriedades no Popup"
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        onClick={() => onRemoveProduct(product.id)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer" 
                        title="Remover Produto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCatalog.length === 0 && (
                <tr>
                  <td colSpan={17} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Database size={32} className="opacity-25" />
                      <p className="text-sm">Nenhum produto encontrado com os filtros atuais.</p>
                      {searchTerm && (
                        <button 
                          onClick={() => { setSearchTerm(''); setSelectedCategoryFilter('all'); }}
                          className="text-xs text-neutral-900 underline font-medium cursor-pointer"
                        >
                          Limpar busca e filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-400 pt-1 gap-2">
          <div>
            Exibindo <span className="font-semibold text-gray-700">{filteredCatalog.length}</span> de <span className="font-semibold text-gray-700">{catalog.length}</span> produtos
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Colunas ID, Marca e Modelo fixas na rolagem horizontal. Rolagem vertical fluida pela página inteira.</span>
          </div>
        </div>
      </div>
      )}

      {/* POPUP MODAL (Adicionar / Editar Produto) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-neutral-900 text-white rounded-lg shadow-2xs">
                  {modalMode === 'create' ? <Plus size={18} /> : <Pencil size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 leading-tight">
                    {modalMode === 'create' ? 'Novo Produto no Catálogo' : `Editar Produto: ${modalForm.model || modalForm.id}`}
                  </h3>
                  <p className="text-xs text-gray-500 leading-tight mt-0.5">
                    {modalMode === 'create' 
                      ? 'Preencha as propriedades técnicas e de consumo do novo dispositivo.' 
                      : 'Altere as especificações técnicas e de barramento deste dispositivo.'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveModal} className="overflow-y-auto p-5 space-y-5 flex-1">
              {modalError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Seção 1: Identificação Básica */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Identificação do Produto
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ID Único</label>
                    <input 
                      type="number"
                      name="id"
                      value={modalForm.id}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900 focus:bg-white focus:ring-1 focus:ring-neutral-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Marca</label>
                    <input 
                      type="text"
                      name="brand"
                      value={modalForm.brand}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:bg-white focus:ring-1 focus:ring-neutral-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Modelo</label>
                    <input 
                      type="text"
                      name="model"
                      placeholder="ex: RFN-K, RDP-DIM8"
                      value={modalForm.model}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:ring-1 focus:ring-neutral-400 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
                  <input 
                    type="text"
                    name="description"
                    placeholder="Descrição detalhada do produto e aplicação"
                    value={modalForm.description || ''}
                    onChange={handleModalInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:ring-1 focus:ring-neutral-400 outline-none"
                  />
                </div>
              </div>

              {/* Seção 2: Classificação e Tipo */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Classificação e Características
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
                    <select
                      name="category"
                      value={modalForm.category}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-neutral-400 outline-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo</label>
                    <select
                      name="type"
                      value={modalForm.type}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-neutral-400 outline-none"
                    >
                      {getTypesForCategory(modalForm.category).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Canais (Capacidade)</label>
                    <input 
                      type="number"
                      min="0"
                      name="channels"
                      value={modalForm.channels}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:ring-1 focus:ring-neutral-400 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      name="requiresDedicatedPS"
                      checked={!!modalForm.requiresDedicatedPS}
                      onChange={handleModalInputChange}
                      className="w-4 h-4 rounded border-gray-300 text-neutral-900 focus:ring-neutral-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500 fill-amber-500" />
                      Requer Fonte de Alimentação Dedicada (Exclusiva)
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                    <input 
                      type="checkbox"
                      name="active"
                      checked={modalForm.active !== false}
                      onChange={handleModalInputChange}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-neutral-900 focus:ring-neutral-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                        Produto Ativo no Catálogo
                        {modalForm.active !== false ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Ativo</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-600">Inativo</span>
                        )}
                      </span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        Quando desmarcado (Inativo), o algoritmo de cálculo desconsidera este modelo e não o seleciona para a BOM.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Seção 3: Capacidades Fornecidas e Consumidas */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Parâmetros de Barramento / Rede
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fornecimento (Supplies) */}
                  <div className="bg-emerald-50/40 rounded-xl p-3.5 border border-emerald-200/60 space-y-3">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Fornece (Capacidade)
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-emerald-900 mb-1">LPower (W)</label>
                        <input 
                          type="number"
                          step="0.1"
                          name="suppliesLPower"
                          value={modalForm.suppliesLPower}
                          onChange={handleModalInputChange}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-md text-xs font-bold text-emerald-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-emerald-900 mb-1">NPower (W)</label>
                        <input 
                          type="number"
                          step="0.1"
                          name="suppliesNPower"
                          value={modalForm.suppliesNPower}
                          onChange={handleModalInputChange}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-md text-xs font-bold text-emerald-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-emerald-900 mb-1">Endereços RNET</label>
                        <input 
                          type="number"
                          name="suppliesAddress"
                          value={modalForm.suppliesAddress}
                          onChange={handleModalInputChange}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-md text-xs font-bold text-emerald-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-emerald-900 mb-1">Portas PNET</label>
                        <input 
                          type="number"
                          name="suppliesPNETPorts"
                          value={modalForm.suppliesPNETPorts}
                          onChange={handleModalInputChange}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-md text-xs font-bold text-emerald-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consumo (Consumes) */}
                  <div className="bg-amber-50/40 rounded-xl p-3.5 border border-amber-200/60 space-y-3">
                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Consome (Demanda)
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-amber-900 mb-1">LPower (W)</label>
                        <input 
                          type="number"
                          step="0.1"
                          name="consumesLPower"
                          value={modalForm.consumesLPower}
                          onChange={handleModalInputChange}
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-md text-xs font-bold text-amber-900 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-amber-900 mb-1">NPower (W)</label>
                        <input 
                          type="number"
                          step="0.1"
                          name="consumesNPower"
                          value={modalForm.consumesNPower}
                          onChange={handleModalInputChange}
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-md text-xs font-bold text-amber-900 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-amber-900 mb-1">Endereços RNET</label>
                        <input 
                          type="number"
                          name="consumesAddress"
                          value={modalForm.consumesAddress}
                          onChange={handleModalInputChange}
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-md text-xs font-bold text-amber-900 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-amber-900 mb-1">Portas PNET</label>
                        <input 
                          type="number"
                          name="consumesPNETPorts"
                          value={modalForm.consumesPNETPorts}
                          onChange={handleModalInputChange}
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-md text-xs font-bold text-amber-900 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#746554] hover:bg-[#635647] active:scale-98 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  {modalMode === 'create' ? 'Adicionar Produto' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
