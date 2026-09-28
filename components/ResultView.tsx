import React from 'react';
import { SpecificationResult, BomItem } from '../types';
import { FileText, CheckCircle2, Package, Cpu, Lightbulb, Blinds, Thermometer, Download, Zap, Network, Hash, Grid3x3, Radar, EthernetPort, Pencil, AlertTriangle, RefreshCcw } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface ResultViewProps {
  data: SpecificationResult;
  projectName: string;
  onReset: () => void; // Used for "Edit Scope"
  onNewProject: () => void; // Used for "New Specification"
  showReasoning: boolean;
}

const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  switch (category) {
    case 'Controller': return <Cpu className="text-purple-600" />;
    case 'Lighting': return <Lightbulb className="text-yellow-600" />;
    case 'Shading': return <Blinds className="text-blue-600" />;
    case 'Climate': return <Thermometer className="text-red-600" />;
    case 'User Interface': return <Grid3x3 className="text-cyan-600" />;
    case 'Sensors': return <Radar className="text-orange-600" />;
    default: return <Package className="text-gray-600" />;
  }
};

const CATEGORY_ORDER = [
  'Controller',
  'Lighting',
  'Shading',
  'Climate',
  'User Interface',
  'Sensors',
  'Accessory'
];

const CATEGORY_NAMES: Record<string, string> = {
    'Controller': 'Processador',
    'Lighting': 'Iluminação',
    'Shading': 'Persianas',
    'Climate': 'Climatização',
    'User Interface': 'Keypads',
    'Sensors': 'Sensores',
    'Accessory': 'Acessórios'
};

export const ResultView: React.FC<ResultViewProps> = ({ data, projectName, onReset, onNewProject, showReasoning }) => {
  
  const sortedItems = [...data.items].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.category);
    const indexB = CATEGORY_ORDER.indexOf(b.category);
    const safeIndexA = indexA === -1 ? 999 : indexA;
    const safeIndexB = indexB === -1 ? 999 : indexB;
    return safeIndexA - safeIndexB;
  });

  const handleDownloadPdf = () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;

    const dateStr = new Date().toISOString().split('T')[0];
    const safeProjectName = (projectName || 'Projeto').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeProjectName}_especificacao_roehn_flux_${dateStr}.pdf`;

    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* PDF Content (Hidden on Screen but rendered for PDF generation) */}
      <div id="pdf-content" className="absolute left-[-9999px] top-0 w-[210mm] bg-white text-black p-8 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-gray-900 tracking-tight leading-none">ROEHN Flux</h1>
              <span className="text-gray-500 text-sm font-light">Ferramenta de Especificação</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Data</div>
            <div className="font-medium text-gray-900">{new Date().toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        {/* Project Info */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{projectName || 'Projeto Sem Nome'}</h2>
          <p className="text-gray-600 text-sm">Especificação técnica gerada automaticamente.</p>
        </div>

        {/* Scope Summary */}
        <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-xs text-gray-500 uppercase tracking-wider">
            Escopo do Projeto
          </div>
          <div className="grid grid-cols-5 divide-x divide-gray-200 bg-white">
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Iluminação</div>
              <div className="font-bold text-lg">{data.categoryCounts.lighting}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Persianas</div>
              <div className="font-bold text-lg">{data.categoryCounts.shading}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Climatização</div>
              <div className="font-bold text-lg">{data.categoryCounts.climate}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Keypads</div>
              <div className="font-bold text-lg">{data.categoryCounts.keypads}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Sensores</div>
              <div className="font-bold text-lg">{data.categoryCounts.sensors}</div>
            </div>
          </div>
        </div>

        {/* Resources Summary */}
        <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-xs text-gray-500 uppercase tracking-wider">
            Recursos do Sistema
          </div>
          <div className="grid grid-cols-4 divide-x divide-gray-200 bg-white">
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1 uppercase">Energia Módulos</div>
              <div className={`font-bold text-lg ${data.powerStats.busLPower.consumed > data.powerStats.busLPower.supplied ? 'text-red-600' : 'text-gray-900'}`}>
                {data.powerStats.busLPower.consumed.toFixed(1)} <span className="text-sm font-normal text-gray-400">/ {data.powerStats.busLPower.supplied.toFixed(1)}</span>
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1 uppercase">Energia RNET</div>
              <div className={`font-bold text-lg ${data.powerStats.nPower.consumed > data.powerStats.nPower.supplied ? 'text-red-600' : 'text-gray-900'}`}>
                {data.powerStats.nPower.consumed.toFixed(1)} <span className="text-sm font-normal text-gray-400">/ {data.powerStats.nPower.supplied.toFixed(1)}</span>
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1 uppercase">Endereços RNET</div>
              <div className={`font-bold text-lg ${data.addressStats.consumed > data.addressStats.supplied ? 'text-red-600' : 'text-gray-900'}`}>
                {data.addressStats.consumed} <span className="text-sm font-normal text-gray-400">/ {data.addressStats.supplied}</span>
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1 uppercase">Portas PNET</div>
              <div className={`font-bold text-lg ${data.pnetStats.consumed > data.pnetStats.supplied ? 'text-red-600' : 'text-gray-900'}`}>
                {data.pnetStats.consumed} <span className="text-sm font-normal text-gray-400">/ {data.pnetStats.supplied}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOM Table */}
        <div className="mb-8">
          <h3 className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
            <FileText size={20} className="text-gray-400" />
            Lista de Materiais
          </h3>
          
          {data.addressStats.consumed > 250 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
               <div className="flex justify-center mb-4">
                  <AlertTriangle className="w-10 h-10 text-yellow-600" />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">Limite de Capacidade Excedido</h3>
               <p className="text-gray-600 text-sm">
                  O escopo informado é maior do que as capacidades atuais desta ferramenta. Entre em contato com o Suporte Técnico ROEHN para uma cotação especializada.
               </p>
            </div>
          ) : data.items.some(i => i.sku === 'ERROR-FINNO-AIR-LIMIT') ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
               <div className="flex justify-center mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">Limite de Keypads Finno Air Excedido</h3>
               <p className="text-gray-600 text-sm">
                  {data.items.find(i => i.sku === 'ERROR-FINNO-AIR-LIMIT')?.description}
               </p>
            </div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-800 text-gray-600">
                  <th className="text-left py-2 font-bold uppercase tracking-wider w-1/4">Modelo</th>
                  <th className="text-center py-2 font-bold uppercase tracking-wider w-16">Qtd</th>
                  <th className="text-left py-2 font-bold uppercase tracking-wider">Descrição</th>
                  {showReasoning && <th className="text-left py-2 font-bold uppercase tracking-wider w-1/3">Observações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedItems.map((item, idx) => (
                  <tr key={idx} className="break-inside-avoid">
                    <td className="py-3 pr-4 align-top font-bold text-gray-900">
                      {item.sku}
                      <div className="text-[10px] font-normal text-gray-500 mt-1">{CATEGORY_NAMES[item.category]}</div>
                    </td>
                    <td className="py-3 px-2 align-top text-center font-bold text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 align-top text-gray-700">
                      {item.description}
                    </td>
                    {showReasoning && (
                      <td className="py-3 pl-4 align-top text-gray-500 italic">
                        {item.reasoning}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-[10px] text-gray-500 border-t border-gray-200 pt-4 mt-auto">
          <div className="flex items-start gap-2">
            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold mb-1">Aviso de Responsabilidade Técnica</p>
              <p className="leading-relaxed">
                Esta especificação é gerada automaticamente com base em padrões e boas práticas de engenharia conhecidas. 
                Recomendamos enfaticamente que revise detalhadamente esta lista de materiais para garantir que ela atenda a todos os requisitos técnicos, físicos e normativos do projeto específico antes da aquisição ou instalação.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Content (Visible) */}
      <div id="screen-content" className="space-y-8">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white rounded-2xl p-6 shadow-xl print:hidden">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0 text-brand-200 print:text-black" />
            <div className="flex-1 w-full">
              <h2 className="text-2xl font-bold mb-2">Especificação Gerada</h2>
              <p className="text-brand-100 leading-relaxed max-w-2xl mb-6 print:text-gray-600">
                Especificação gerada de acordo com o escopo abaixo:
              </p>
              
              <div className="space-y-4">
                {/* Project Scope Section */}
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 print:bg-gray-50 print:border-gray-200">
                  <h4 className="text-xs text-brand-200 uppercase tracking-widest font-semibold mb-3 print:text-gray-500">Escopo do Projeto</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex flex-col items-start gap-1 p-2 bg-white/5 rounded-lg border border-white/5 print:border-gray-200 print:bg-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Lightbulb size={16} className="text-yellow-200 print:text-yellow-600" />
                            <span className="text-xs text-brand-100 uppercase tracking-wide font-medium print:text-gray-600">Iluminação</span>
                        </div>
                        <div className="font-bold text-lg">{data.categoryCounts.lighting}</div>
                    </div>
                    <div className="flex flex-col items-start gap-1 p-2 bg-white/5 rounded-lg border border-white/5 print:border-gray-200 print:bg-white">
                        <div className="flex items-center gap-2 mb-1">
                             <Blinds size={16} className="text-blue-200 print:text-blue-600" />
                            <span className="text-xs text-brand-100 uppercase tracking-wide font-medium print:text-gray-600">Persianas</span>
                        </div>
                        <div className="font-bold text-lg">{data.categoryCounts.shading}</div>
                    </div>
                    <div className="flex flex-col items-start gap-1 p-2 bg-white/5 rounded-lg border border-white/5 print:border-gray-200 print:bg-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Thermometer size={16} className="text-red-200 print:text-red-600" />
                            <span className="text-xs text-brand-100 uppercase tracking-wide font-medium print:text-gray-600">Climatização</span>
                        </div>
                        <div className="font-bold text-lg">{data.categoryCounts.climate}</div>
                    </div>
                     <div className="flex flex-col items-start gap-1 p-2 bg-white/5 rounded-lg border border-white/5 print:border-gray-200 print:bg-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Grid3x3 size={16} className="text-cyan-200 print:text-cyan-600" />
                            <span className="text-xs text-brand-100 uppercase tracking-wide font-medium print:text-gray-600">Keypads</span>
                        </div>
                        <div className="font-bold text-lg">{data.categoryCounts.keypads}</div>
                    </div>
                     <div className="flex flex-col items-start gap-1 p-2 bg-white/5 rounded-lg border border-white/5 print:border-gray-200 print:bg-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Radar size={16} className="text-orange-200 print:text-orange-600" />
                            <span className="text-xs text-brand-100 uppercase tracking-wide font-medium print:text-gray-600">Sensores</span>
                        </div>
                        <div className="font-bold text-lg">{data.categoryCounts.sensors}</div>
                    </div>
                  </div>
                </div>
  
                {/* System Resources Section */}
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 print:bg-gray-50 print:border-gray-200">
                  <h4 className="text-xs text-brand-200 uppercase tracking-widest font-semibold mb-3 print:text-gray-500">Recursos do Sistema</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg print:bg-amber-100">
                            <Zap size={20} className="text-amber-200 print:text-amber-600" />
                        </div>
                        <div>
                            <div className="text-xs text-brand-100 uppercase tracking-wide font-medium print:text-gray-600">ENERGIA MÓDULOS</div>
                            <div className={`font-bold text-xl ${data.powerStats.busLPower.consumed > data.powerStats.busLPower.supplied ? 'text-red-400' : ''}`}>
                                {data.powerStats.busLPower.consumed.toFixed(1)} <span className={`text-sm font-normal ${data.powerStats.busLPower.consumed > data.powerStats.busLPower.supplied ? 'text-red-300' : 'text-brand-200'} print:text-gray-500`}>/ {data.powerStats.busLPower.supplied.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg print:bg-emerald-100">
                            <Network size={20} className="text-emerald-200 print:text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-xs text-brand-100 uppercase tracking-wide font-medium print:text-gray-600">ENERGIA RNET</div>
                            <div className={`font-bold text-xl ${data.powerStats.nPower.consumed > data.powerStats.nPower.supplied ? 'text-red-400' : ''}`}>
                                {data.powerStats.nPower.consumed.toFixed(1)} <span className={`text-sm font-normal ${data.powerStats.nPower.consumed > data.powerStats.nPower.supplied ? 'text-red-300' : 'text-brand-200'} print:text-gray-500`}>/ {data.powerStats.nPower.supplied.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg print:bg-purple-100">
                            <Hash size={20} className="text-purple-200 print:text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xs text-brand-100 uppercase tracking-wide font-medium print:text-gray-600">ENDEREÇOS RNET</div>
                            <div className={`font-bold text-xl ${data.addressStats.consumed > data.addressStats.supplied ? 'text-red-400' : ''}`}>
                                {data.addressStats.consumed} <span className={`text-sm font-normal ${data.addressStats.consumed > data.addressStats.supplied ? 'text-red-300' : 'text-brand-200'} print:text-gray-500`}>/ {data.addressStats.supplied}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg print:bg-blue-100">
                            <EthernetPort size={20} className="text-blue-200 print:text-blue-600" />
                        </div>
                        <div>
                            <div className="text-xs text-brand-100 uppercase tracking-wide font-medium print:text-gray-600">PORTAS PNET</div>
                            <div className={`font-bold text-xl ${data.pnetStats.consumed > data.pnetStats.supplied ? 'text-red-400' : ''}`}>
                                {data.pnetStats.consumed} <span className={`text-sm font-normal ${data.pnetStats.consumed > data.pnetStats.supplied ? 'text-red-300' : 'text-brand-200'} print:text-gray-500`}>/ {data.pnetStats.supplied}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {data.addressStats.consumed > 250 ? (
          <div id="alert-content" className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center space-y-6">
              <div className="flex justify-center">
                  <div className="p-4 bg-yellow-100 rounded-full">
                      <AlertTriangle className="w-12 h-12 text-yellow-600" />
                  </div>
              </div>
              <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Limite de Capacidade Excedido</h3>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                      O escopo informado é maior do que as capacidades atuais desta ferramenta. Entre em contato com o Suporte Técnico ROEHN para uma cotação especializada.
                  </p>
              </div>
              <button
                  onClick={onReset}
                  data-html2canvas-ignore="true"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                  <Pencil size={18} />
                  Editar escopo
              </button>
          </div>
        ) : data.items.some(i => i.sku === 'ERROR-FINNO-AIR-LIMIT') ? (
          <div id="alert-content" className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center space-y-6">
              <div className="flex justify-center">
                  <div className="p-4 bg-red-100 rounded-full">
                      <AlertTriangle className="w-12 h-12 text-red-600" />
                  </div>
              </div>
              <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Limite de Keypads Finno Air Excedido</h3>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                      {data.items.find(i => i.sku === 'ERROR-FINNO-AIR-LIMIT')?.description}
                  </p>
              </div>
              <button
                  onClick={onReset}
                  data-html2canvas-ignore="true"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                  <Pencil size={18} />
                  Editar escopo
              </button>
          </div>
        ) : (
          <>
            <div id="bom-content" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={18} />
                  Lista de Materiais
                </h3>
                <button 
                  onClick={onReset}
                  data-html2canvas-ignore="true"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 px-3 py-1 rounded-md hover:bg-white border border-transparent hover:border-gray-200 transition-all print:hidden"
                >
                  <Pencil size={16} />
                  Editar escopo
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3">Modelo</th>
                      <th className="px-6 py-3 text-center">Qtd</th>
                      <th className="px-6 py-3">Descrição</th>
                      {showReasoning && <th className="px-6 py-3">Observações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0" title={CATEGORY_NAMES[item.category] || item.category}>
                              <CategoryIcon category={item.category} />
                            </div>
                            <div className="font-bold text-gray-900">{item.sku}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                          <span className="inline-block bg-brand-100 text-brand-800 font-bold px-3 py-1 rounded-full">
                            {item.quantity}
                          </span>
                        </td>
                         <td className="px-6 py-4 text-gray-600 align-top">
                          {item.description}
                        </td>
                        {showReasoning && (
                          <td className="px-6 py-4 text-gray-500 text-xs leading-relaxed max-w-sm align-top">
                               {item.reasoning && (
                                  <div className="flex flex-col gap-1">
                                      <ul className="list-disc list-outside ml-4 space-y-1">
                                          {item.reasoning.split('|').map((r, i) => (
                                              <li key={i}>{r.trim()}</li>
                                          ))}
                                      </ul>
                                  </div>
                              )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
  
            <div id="disclaimer-content" className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold">Aviso de Responsabilidade Técnica</p>
                <p className="text-yellow-700/90 leading-relaxed">
                  Esta especificação é gerada automaticamente com base em padrões e boas práticas de engenharia conhecidas. 
                  No entanto, devido à complexidade e variabilidade das instalações, podem ocorrer inconsistências.
                </p>
                <p className="text-yellow-700/90 leading-relaxed">
                  Recomendamos enfaticamente que revise detalhadamente esta lista de materiais para garantir que ela atenda a todos os requisitos técnicos, físicos e normativos do projeto específico antes da aquisição ou instalação.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 pt-8 print:hidden">
        <button
          onClick={handleDownloadPdf}
          className="w-full max-w-md bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <Download size={20} />
          Imprimir / Salvar PDF
        </button>

        <button
          onClick={onNewProject}
          className="text-gray-500 hover:text-red-600 font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          Nova especificação
        </button>
      </div>
    </div>
  );
};