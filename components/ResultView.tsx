import React, { useState } from 'react';
import { SpecificationResult, BomItem } from '../types';
import { FileText, CheckCircle2, Package, Cpu, Lightbulb, Blinds, Thermometer, Zap, Network, Hash, Grid3x3, Radar, EthernetPort, Pencil, AlertTriangle, RefreshCcw, Radio, Copy, Check, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ResultViewProps {
  data: SpecificationResult;
  projectName: string;
  integratorName?: string;
  onReset: () => void; // Used for "Edit Scope"
  onNewProject: () => void; // Used for "New Specification"
  showReasoning: boolean;
}

const CategoryIcon: React.FC<{ category: string; sku?: string }> = ({ category, sku }) => {
  if (sku?.startsWith('RRM')) return <Radio className="text-indigo-600" size={16} />;
  switch (category) {
    case 'Controller': return <Cpu className="text-purple-600" size={16} />;
    case 'Lighting': return <Lightbulb className="text-yellow-600" size={16} />;
    case 'Shading': return <Blinds className="text-blue-600" size={16} />;
    case 'Climate': return <Thermometer className="text-red-600" size={16} />;
    case 'User Interface': return <Grid3x3 className="text-cyan-600" size={16} />;
    case 'Sensors': return <Radar className="text-orange-600" size={16} />;
    default: return <Package className="text-gray-600" size={16} />;
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

const isPowerOrHub = (item: BomItem): boolean => {
  const sku = item.sku.toUpperCase();
  return sku.includes('PWR') || sku.includes('HUB') || sku.includes('FONTE');
};

const getCategoryLabel = (item: BomItem): string => {
  if (isPowerOrHub(item)) return 'Acessório / Alimentação';
  if (item.sku.startsWith('RRM')) return 'Módulo Remoto (RRM)';
  if (item.sku.startsWith('RDP')) return 'Trilho DIN (RDP)';
  return CATEGORY_NAMES[item.category] || item.category;
};

interface LogicalGroupConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const getLogicalGroup = (item: BomItem): string => {
  // Fontes e hubs se enquadram na categoria de acessórios, mesmo que tenham o prefixo RDP
  if (isPowerOrHub(item)) return 'accessories';
  if (item.category === 'User Interface') return 'keypads';
  if (item.category === 'Sensors') return 'sensors';
  if (item.sku.startsWith('RRM')) return 'remote_modules';
  if (
    item.sku.startsWith('RDP') ||
    item.category === 'Controller' ||
    item.category === 'Lighting' ||
    item.category === 'Shading' ||
    item.category === 'Climate'
  ) {
    return 'central_modules';
  }
  return 'accessories';
};

const LOGICAL_GROUPS: Record<string, LogicalGroupConfig> = {
  central_modules: {
    id: 'central_modules',
    title: 'Módulos centrais',
    subtitle: 'Processadores, dimmers, relés e gateways para trilho DIN',
    icon: <Cpu size={16} className="text-[#746554]" />
  },
  remote_modules: {
    id: 'remote_modules',
    title: 'Módulos remotos',
    subtitle: 'Módulos PWM, emissores infravermelho e gateways remotos',
    icon: <Radio size={16} className="text-[#746554]" />
  },
  keypads: {
    id: 'keypads',
    title: 'Keypads',
    subtitle: 'Teclados de parede, keypads e pulsadores de comando',
    icon: <Grid3x3 size={16} className="text-[#746554]" />
  },
  sensors: {
    id: 'sensors',
    title: 'Sensores',
    subtitle: 'Sensores de presença, luminosidade, qualidade do ar e movimento',
    icon: <Radar size={16} className="text-[#746554]" />
  },
  accessories: {
    id: 'accessories',
    title: 'Acessórios',
    subtitle: 'Fontes de alimentação, hubs de rede, antenas receptoras e periféricos',
    icon: <Package size={16} className="text-[#746554]" />
  }
};

const GROUP_ORDER = ['central_modules', 'remote_modules', 'keypads', 'sensors', 'accessories'];

export const ResultView: React.FC<ResultViewProps> = ({ data, projectName, integratorName, onReset, onNewProject, showReasoning }) => {
  const [copied, setCopied] = useState(false);
  
  const sortedItems = [...data.items].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.category);
    const indexB = CATEGORY_ORDER.indexOf(b.category);
    const safeIndexA = indexA === -1 ? 999 : indexA;
    const safeIndexB = indexB === -1 ? 999 : indexB;
    return safeIndexA - safeIndexB;
  });

  const groupedItems = GROUP_ORDER.map(groupId => {
    const groupConfig = LOGICAL_GROUPS[groupId];
    const items = sortedItems.filter(item => getLogicalGroup(item) === groupId);
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
    return {
      ...groupConfig,
      items,
      totalQty
    };
  }).filter(g => g.items.length > 0);

  const handleExportExcel = () => {
    const rows: (string | number)[][] = [];

    // Cabeçalho e Identificação do Projeto
    rows.push(['ROEHN FLUX - LISTA DE MATERIAIS']);
    rows.push(['Projeto:', projectName || '-']);
    rows.push(['Integrador:', integratorName || '-']);
    rows.push(['Data da Emissão:', new Date().toLocaleDateString('pt-BR')]);
    rows.push([]);

    // Tabela da Lista de Materiais
    rows.push(['LISTA DE MATERIAIS']);
    rows.push(['Código', 'Modelo', 'Quantidade', 'Descrição', 'Observações Técnicas']);

    groupedItems.forEach(group => {
      group.items.forEach(item => {
        rows.push([
          item.code || '-',
          item.sku,
          item.quantity,
          item.description,
          item.reasoning || '-'
        ]);
      });
    });

    rows.push([]);
    rows.push(['AVISO DE RESPONSABILIDADE TÉCNICA:']);
    rows.push([
      'Esta especificação é gerada automaticamente com base em padrões de engenharia. Revise esta lista de materiais para garantir atendimento a todos os requisitos técnicos do projeto antes da aquisição ou instalação.'
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Definir larguras de colunas
    worksheet['!cols'] = [
      { wch: 14 }, // Código
      { wch: 18 }, // Modelo
      { wch: 14 }, // Quantidade
      { wch: 60 }, // Descrição
      { wch: 60 }, // Observações Técnicas
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Materiais');

    const dateStr = new Date().toISOString().split('T')[0];
    const safeProjectName = (projectName || 'Projeto').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeProjectName}_especificacao_roehn_flux_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  const handleCopyText = async () => {
    const lines: string[] = [];

    // Cabeçalho com identificação do projeto e integrador (sem emojis)
    lines.push('ROEHN FLUX - LISTA DE MATERIAIS');
    lines.push(`Projeto: ${projectName || '-'}`);
    lines.push(`Integrador: ${integratorName || '-'}`);
    lines.push(`Data: ${new Date().toLocaleDateString('pt-BR')}`);
    lines.push('');

    // Cálculo dinâmico para garantir espaçamento e alinhamento regular entre colunas
    const codWidth = Math.max(3, ...data.items.map(i => String(i.code || '-').length));
    const modelWidth = Math.max(6, ...data.items.map(i => String(i.sku || '').length));
    const qtdWidth = Math.max(3, ...data.items.map(i => String(i.quantity).length));

    const headerCod = 'COD'.padEnd(codWidth);
    const headerModel = 'MODELO'.padEnd(modelWidth);
    const headerQtd = 'QTD'.padEnd(qtdWidth);
    const headerLine = `${headerCod} | ${headerModel} | ${headerQtd} | Descrição`;

    groupedItems.forEach(group => {
      lines.push(`[${group.title.toUpperCase()}]`);
      lines.push(headerLine);
      group.items.forEach(item => {
        const colCod = String(item.code || '-').padEnd(codWidth);
        const colModel = String(item.sku || '').padEnd(modelWidth);
        const colQtd = String(item.quantity).padEnd(qtdWidth);
        lines.push(`${colCod} | ${colModel} | ${colQtd} | ${item.description}`);
        if (showReasoning && item.reasoning) {
          lines.push(`   Obs: ${item.reasoning}`);
        }
      });
      lines.push('');
    });

    // Aviso de responsabilidade técnica ao final (sem emojis)
    lines.push('AVISO DE RESPONSABILIDADE TÉCNICA:');
    lines.push(
      'Esta especificação é gerada automaticamente com base em padrões de engenharia. Revise esta lista de materiais para garantir atendimento a todos os requisitos técnicos do projeto antes da aquisição ou instalação.'
    );

    const fullText = lines.join('\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        throw new Error('Clipboard API indisponível');
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-24 sm:pb-20 animate-fade-in relative">
      {/* Screen Content (Visible) */}
      <div id="screen-content" className="space-y-3.5">
        {/* Aviso de Responsabilidade Técnica (Topo da Página - Compacto) */}
        <div id="disclaimer-content" className="bg-amber-50/90 border border-amber-200/90 rounded-lg px-3.5 py-2 text-xs text-amber-900 flex items-center gap-2.5 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="leading-snug">
            <span className="font-semibold text-amber-950 mr-1">Aviso de Responsabilidade Técnica:</span>
            <span className="text-amber-900/85">
              Especificação gerada automaticamente com base em padrões de engenharia. Revise esta lista de materiais para garantir atendimento a todos os requisitos técnicos do projeto antes da aquisição ou instalação.
            </span>
          </div>
        </div>

        {/* Card Resumo de Especificação Gerada (Compacto) */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white rounded-xl p-3.5 sm:p-4 shadow-sm print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <CheckCircle2 className="w-5 h-5 text-brand-200 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                Resumo Técnico do Projeto
              </h2>
              {projectName && (
                <span className="text-xs text-brand-200/90 font-normal">
                  • Projeto: <strong className="font-semibold text-white">{projectName}</strong>
                </span>
              )}
              {integratorName && (
                <span className="text-xs text-brand-200/90 font-normal">
                  • Integrador: <strong className="font-semibold text-white">{integratorName}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-9 gap-2.5">
            {/* Escopo do Projeto */}
            <div className="lg:col-span-5 bg-white/10 p-2 sm:p-2.5 rounded-lg border border-white/10 backdrop-blur-sm flex flex-col justify-between">
              <div className="text-[10px] text-brand-200 uppercase tracking-wider font-semibold mb-1.5">
                Escopo do Projeto
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
                <div className="flex items-center gap-2 bg-white/5 py-1 px-2 rounded border border-white/5 min-w-0">
                  <Lightbulb size={15} className="text-yellow-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-brand-100 uppercase tracking-wide truncate">Iluminação</div>
                    <div className="font-bold text-xs sm:text-sm text-white truncate">{data.categoryCounts.lighting}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 py-1 px-2 rounded border border-white/5 min-w-0">
                  <Blinds size={15} className="text-blue-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-brand-100 uppercase tracking-wide truncate">Persianas</div>
                    <div className="font-bold text-xs sm:text-sm text-white truncate">{data.categoryCounts.shading}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 py-1 px-2 rounded border border-white/5 min-w-0">
                  <Thermometer size={15} className="text-red-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-brand-100 uppercase tracking-wide truncate">Climatização</div>
                    <div className="font-bold text-xs sm:text-sm text-white truncate">{data.categoryCounts.climate}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 py-1 px-2 rounded border border-white/5 min-w-0">
                  <Grid3x3 size={15} className="text-cyan-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-brand-100 uppercase tracking-wide truncate">Keypads</div>
                    <div className="font-bold text-xs sm:text-sm text-white truncate">{data.categoryCounts.keypads}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 py-1 px-2 rounded border border-white/5 min-w-0">
                  <Radar size={15} className="text-orange-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-brand-100 uppercase tracking-wide truncate">Sensores</div>
                    <div className="font-bold text-xs sm:text-sm text-white truncate">{data.categoryCounts.sensors}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recursos do Sistema */}
            <div className="lg:col-span-4 bg-white/10 p-2 sm:p-2.5 rounded-lg border border-white/10 backdrop-blur-sm flex flex-col justify-between">
              <div className="text-[10px] text-brand-200 uppercase tracking-wider font-semibold mb-1.5">
                Recursos do Sistema
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <div className="flex items-center gap-2 bg-white/5 py-1 px-2 rounded border border-white/5 min-w-0">
                  <Zap size={15} className="text-amber-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-brand-100 uppercase tracking-wide truncate">Energia L</div>
                    <div className={`font-bold text-xs sm:text-sm truncate ${data.powerStats.busLPower.consumed > data.powerStats.busLPower.supplied ? 'text-red-400' : 'text-white'}`}>
                      {data.powerStats.busLPower.consumed.toFixed(1)} <span className="text-[10px] font-normal text-brand-200">/ {data.powerStats.busLPower.supplied.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 py-1 px-2 rounded border border-white/5 min-w-0">
                  <Network size={15} className="text-emerald-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-brand-100 uppercase tracking-wide truncate">Energia RNET</div>
                    <div className={`font-bold text-xs sm:text-sm truncate ${data.powerStats.nPower.consumed > data.powerStats.nPower.supplied ? 'text-red-400' : 'text-white'}`}>
                      {data.powerStats.nPower.consumed.toFixed(1)} <span className="text-[10px] font-normal text-brand-200">/ {data.powerStats.nPower.supplied.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 py-1 px-2 rounded border border-white/5 min-w-0">
                  <Hash size={15} className="text-purple-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-brand-100 uppercase tracking-wide truncate">Endereços</div>
                    <div className={`font-bold text-xs sm:text-sm truncate ${data.addressStats.consumed > data.addressStats.supplied ? 'text-red-400' : 'text-white'}`}>
                      {data.addressStats.consumed} <span className="text-[10px] font-normal text-brand-200">/ {data.addressStats.supplied}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 py-1 px-2 rounded border border-white/5 min-w-0">
                  <EthernetPort size={15} className="text-blue-200 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-brand-100 uppercase tracking-wide truncate">Portas PNET</div>
                    <div className={`font-bold text-xs sm:text-sm truncate ${data.pnetStats.consumed > data.pnetStats.supplied ? 'text-red-400' : 'text-white'}`}>
                      {data.pnetStats.consumed} <span className="text-[10px] font-normal text-brand-200">/ {data.pnetStats.supplied}</span>
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
              <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/80">
                <h3 className="font-bold text-gray-900 text-base">
                  Lista de Materiais
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Organizada por módulos de central, interfaces de campo e periféricos
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {groupedItems.map(group => (
                  <div key={group.id} className="p-4 sm:p-5">
                    <div className="mb-2.5 pb-2 border-b border-gray-100">
                      <h4 className="font-bold text-sm text-gray-900 leading-tight">
                        {group.title}
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/70 text-gray-500 uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2.5 w-20 sm:w-24 whitespace-nowrap">Código</th>
                            <th className="px-4 py-2.5 w-28 sm:w-36 whitespace-nowrap">Modelo</th>
                            <th className="px-3 py-2.5 text-center w-14 sm:w-16 whitespace-nowrap">Qtd</th>
                            <th className="px-4 py-2.5">Descrição</th>
                            {showReasoning && <th className="px-4 py-2.5 w-1/3 min-w-[220px]">Observações</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {group.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap align-top font-medium text-gray-600 text-sm">
                                {item.code || '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap align-top font-bold text-gray-900 text-sm">
                                {item.sku}
                              </td>
                              <td className="px-3 py-3 text-center align-top font-bold text-gray-900 text-sm">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-gray-700 text-sm align-top leading-relaxed">
                                {item.description}
                              </td>
                              {showReasoning && (
                                <td className="px-4 py-3 text-gray-700 text-sm leading-relaxed align-top">
                                  {item.reasoning && (
                                    <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700 text-sm">
                                      {item.reasoning.split('|').map((r, i) => (
                                        <li key={i}>{r.trim()}</li>
                                      ))}
                                    </ul>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Barra inferior fixa com ações */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] print:hidden">
        <div className="mx-auto px-2 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-[98%] 2xl:max-w-[1920px]">
          {/* Lado esquerdo: opções de editar escopo ou criar novo */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={onReset}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <Pencil size={15} />
              <span>Editar escopo</span>
            </button>
            <button
              onClick={onNewProject}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:text-red-600 text-gray-700 text-sm font-semibold transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <RefreshCcw size={15} />
              <span>Criar novo</span>
            </button>
          </div>

          {/* Lado direito: opções de copiar e exportar */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopyText}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-lg border text-sm font-semibold transition-all shadow-2xs cursor-pointer active:scale-98 ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
              }`}
              title="Copiar lista de materiais e aviso técnico"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#746554] hover:bg-[#635647] active:scale-98 text-white font-semibold rounded-lg shadow-sm transition-all text-sm cursor-pointer"
              title="Exportar lista de materiais para planilha Excel (.xlsx)"
            >
              <FileSpreadsheet size={16} />
              <span>Exportar para Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};