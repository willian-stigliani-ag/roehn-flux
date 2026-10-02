import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Lightbulb, 
  Blinds, 
  Grid3x3, 
  Radar, 
  EthernetPort, 
  Zap, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sliders, 
  Sparkles,
  ArrowRight,
  BookOpen,
  Filter,
  Layers,
  HelpCircle,
  Hash,
  Scale
} from 'lucide-react';

export type RuleCategory = 
  | 'Gerais' 
  | 'Processadora' 
  | 'Iluminação' 
  | 'Persianas & Climatização' 
  | 'Keypads & Interfaces' 
  | 'Sensores' 
  | 'Portas PNET' 
  | 'Energia & Fontes';

export type RuleType = 
  | 'Limite Crítico' 
  | 'Dimensionamento' 
  | 'Otimização' 
  | 'Arquitetura' 
  | 'Boas Práticas';

export interface SystemRule {
  id: string;
  category: RuleCategory;
  type: RuleType;
  title: string;
  summary: string;
  description: string;
  formula?: string;
  involvedHardware?: string[];
  severity: 'critical' | 'warning' | 'info' | 'success';
  example?: string;
}

export const SYSTEM_RULES: SystemRule[] = [
  // 1. Gerais
  {
    id: 'GEN-01',
    category: 'Gerais',
    type: 'Limite Crítico',
    severity: 'critical',
    title: 'Limite Absoluto de 250 Endereços RNET',
    summary: 'O protocolo de barramento ROEHN RNET suporta no máximo 250 endereços ativos por sistema.',
    description: 'Nenhum projeto pode ultrapassar 250 endereços no barramento RNET. Caso a soma dos endereços consumidos por todos os módulos, interfaces de teclado e sensores exceda 250, a ferramenta gera um bloqueio crítico de capacidade. Importante: a adição de processadoras adicionais NÃO expande este limite físico do protocolo.',
    formula: 'Total Endereços RNET = Σ(consumesAddress × Qtd) ≤ 250',
    involvedHardware: ['RDP-M6', 'Todos os dispositivos RNET'],
    example: 'Se um projeto demandar 251 dispositivos endereçáveis, a proposta exibe alerta de bloqueio e orienta cotação com a engenharia técnica.'
  },
  {
    id: 'GEN-02',
    category: 'Gerais',
    type: 'Arquitetura',
    severity: 'info',
    title: 'Processador Central Obrigatório',
    summary: 'Todo projeto de automação requer compulsoriamente no mínimo 1 processador central.',
    description: 'O processador central RDP-M6 atua como o cérebro do sistema, coordenando a comunicação RNET, execução de cenas, rotinas temporizadas e integração IP com aplicativos.',
    formula: 'Qtd Mínima Processadores = 1',
    involvedHardware: ['RDP-M6'],
    example: 'Mesmo um projeto com apenas 1 circuito de iluminação incluirá automaticamente 1x RDP-M6 na lista de materiais.'
  },
  {
    id: 'GEN-03',
    category: 'Gerais',
    type: 'Otimização',
    severity: 'success',
    title: 'Algoritmo de Menor Desperdício de Canais (Best-Fit)',
    summary: 'Calcula a combinação ótima de módulos para cobrir as cargas sem desperdício de canais.',
    description: 'O motor de dimensionamento divide a carga total solicitada pela capacidade máxima do módulo disponível para compras em lote (bulk) e encaixa o saldo restante no menor módulo suficiente (best-fit), minimizando canais ociosos e custos desnecessários.',
    formula: 'bulkQty = Math.floor(carga / maxCap); remainder = carga % maxCap; bestFit = min(Cap >= remainder)',
    involvedHardware: ['RDP-DIM8', 'RDP-DIM4', 'RDP-RL12', 'RDP-RL8', 'RDP-RL4', 'RDP-LX4', 'RDP-LX2'],
    example: 'Para 10 circuitos de dimmer: 1x RDP-DIM8 (8 ch) + 1x RDP-DIM4 (4 ch) = 12 canais totais (apenas 2 canais sobressalentes).'
  },

  // 2. Processadora
  {
    id: 'PROC-01',
    category: 'Processadora',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Dimensionamento por Capacidade de Endereços da RDP-M6',
    summary: 'Calcula a quantidade de processadoras com base na capacidade de endereços inserida por cada RDP-M6 (100 endereços).',
    description: 'A quantidade de processadoras centrais é dimensionada diretamente a partir do atributo de endereços fornecidos pela RDP-M6 (suppliesAddress = 100). Havendo mais endereços demandados do que o suprido por 1 unidade, processadoras adicionais são alocadas até o limite absoluto de 250 endereços por sistema.',
    formula: 'Qtd Processadoras = Math.max(1, Math.ceil(TotalEndereços / RDP-M6.suppliesAddress)) [Máx. 250 no sistema]',
    involvedHardware: ['RDP-M6'],
    example: '80 endereços = 1x RDP-M6 (suporta até 100); 140 endereços = 2x RDP-M6 (suporta até 200); 220 endereços = 3x RDP-M6 (suporta até 250).'
  },
  {
    id: 'PROC-02',
    category: 'Processadora',
    type: 'Arquitetura',
    severity: 'info',
    title: 'Fonte de Alimentação Exclusiva (Dedicada)',
    summary: 'Cada processadora exige 1 fonte de alimentação dedicada de 60W isolada do barramento geral.',
    description: 'O processador central RDP-M6 possui o parâmetro requiresDedicatedPS ativo. Para garantir estabilidade contra ruídos de carga nos trilhos DIN, 1 fonte RDP-PWR60 de 60W é adicionada exclusivamente para ele, não sendo somada ao barramento geral de módulos.',
    formula: 'Fontes Dedicadas CPU = 1 × Qtd Processadores',
    involvedHardware: ['RDP-M6', 'RDP-PWR60']
  },

  // 3. Iluminação
  {
    id: 'LGT-01',
    category: 'Iluminação',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Módulos de Relé para Iluminação On/Off',
    summary: 'Dimensionamento de circuitos liga/desliga convencionais entre módulos de 12, 8 e 4 canais.',
    description: 'Cada módulo de relé DIN consome 1 endereço RNET, 6 unidades de energia lógica LPower e 0.6 unidades de NPower. Módulos de 12 e 8 canais (RDP-RL12 e RDP-RL8) fornecem 5 portas PNET para conexão de periféricos.',
    formula: 'Alocação Best-Fit entre RDP-RL12 (12 ch), RDP-RL8 (8 ch) e RDP-RL4 (4 ch)',
    involvedHardware: ['RDP-RL12', 'RDP-RL8', 'RDP-RL4']
  },
  {
    id: 'LGT-02',
    category: 'Iluminação',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Módulos Dimmer Universal (Dimerizáveis)',
    summary: 'Dimensionamento de circuitos dimerizáveis entre módulos de 8 e 4 canais.',
    description: 'Cada módulo dimmer DIN consome 1 endereço RNET, 2 unidades de energia lógica LPower e 0.6 unidades de NPower. O modelo RDP-DIM8 fornece 5 portas PNET.',
    formula: 'Alocação Best-Fit entre RDP-DIM8 (8 ch) e RDP-DIM4 (4 ch)',
    involvedHardware: ['RDP-DIM8', 'RDP-DIM4']
  },
  {
    id: 'LGT-03',
    category: 'Iluminação',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Módulos PWM para Fitas LED 12V/24V',
    summary: 'Controle de fitas LED monocromáticas, branco dinâmico ou RGB/RGBW em módulos centrais e remotos.',
    description: 'Dimensionamento otimizado entre o módulo de trilho DIN RDP-PWM6 (6 canais) e o módulo remoto RRM-PWM4 (4 canais). Cada módulo consome 1 endereço RNET e 0.6 NPower.',
    formula: 'Alocação Best-Fit entre RDP-PWM6 (6 canais) e RRM-PWM4 (4 canais)',
    involvedHardware: ['RDP-PWM6', 'RRM-PWM4']
  },
  {
    id: 'LGT-04',
    category: 'Iluminação',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Interface DALI de 2 Universos (128 Endereços)',
    summary: 'Gateway de integração para reatores e drivers DALI em até 2 universos independentes.',
    description: 'Cada interface RDP-DL2 suporta até 128 endereços DALI (64 por canal/universo). Consome 1 endereço RNET no barramento ROEHN, 5 LPower e 0.6 NPower.',
    formula: 'Qtd Interfaces DALI = Math.ceil(Circuitos DALI / 128)',
    involvedHardware: ['RDP-DL2']
  },

  // 4. Persianas & Climatização
  {
    id: 'SHD-01',
    category: 'Persianas & Climatização',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Motores de Persianas Cabeadas (Trilho DIN)',
    summary: 'Controle de motores AC de 4 fios com intertravamento elétrico em módulos de 4 e 2 motores.',
    description: 'Cada módulo controlador comanda persianas rolô, cortinas ou venezianas motorizadas. Consome 1 endereço RNET, 4.2 LPower e 0.6 NPower. O modelo RDP-LX4 provê 5 portas PNET.',
    formula: 'Alocação Best-Fit entre RDP-LX4 (4 motores) e RDP-LX2 (2 motores)',
    involvedHardware: ['RDP-LX4', 'RDP-LX2']
  },
  {
    id: 'SHD-02',
    category: 'Persianas & Climatização',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Gateway RF para Persianas sem Fio',
    summary: 'Comunicação sem fio com motores com receptor RF integrado (até 32 canais por gateway).',
    description: 'O módulo RRM-GTW emite comandos de rádio para até 32 persianas sem fio. Consome 1 endereço RNET e 0.6 NPower.',
    formula: 'Qtd Gateways RF = Math.ceil(Persianas sem Fio / 32)',
    involvedHardware: ['RRM-GTW']
  },
  {
    id: 'CLIM-01',
    category: 'Persianas & Climatização',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Emissor IR Dedicado por Split (Linha de Visada)',
    summary: '1 emissor infravermelho RRM-SA1 por evaporadora Split de ar-condicionado.',
    description: 'Devido à natureza óptica do sinal infravermelho (necessidade de visada direta sem obstáculos), cada equipamento split requer seu próprio emissor RRM-SA1. Cada um consome 1 endereço RNET e 0.6 NPower.',
    formula: 'Qtd Emissores IR = 1 × Qtd Splits IR',
    involvedHardware: ['RRM-SA1']
  },
  {
    id: 'CLIM-02',
    category: 'Persianas & Climatização',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Gateway Central VRV/VRF (32 Zonas)',
    summary: 'Integração bidirecional direta com barramentos de fabricantes VRF/VRV para até 32 evaporadoras.',
    description: 'O gateway RDP-DK32 conecta-se ao barramento de controle dos sistemas VRV/VRF para leitura de status e envio de comandos de temperatura, modo e ventilação. Consome 1 endereço RNET e 0.6 NPower.',
    formula: 'Qtd Gateways VRF = Math.ceil(Zonas VRF / 32)',
    involvedHardware: ['RDP-DK32']
  },

  // 5. Keypads & Interfaces
  {
    id: 'KEY-01',
    category: 'Keypads & Interfaces',
    type: 'Dimensionamento',
    severity: 'warning',
    title: 'Antenas Receptoras para Keypads Finno Air',
    summary: 'Cada antena receptora RFN-AIR-RX conecta até 16 keypads sem fio Finno Air.',
    description: 'Os keypads Finno Air operam sem fio e comunicam-se com o barramento do sistema através de antenas receptoras RFN-AIR-RX. O sistema calcula automaticamente a quantidade necessária de antenas receptoras. Cada antena consome 1 endereço RNET e 0.6 unidades de NPower.',
    formula: 'Antenas Receptoras = Math.ceil(finnoAirCount / 16)',
    involvedHardware: ['RFN-AIR', 'RFN-AIR-RX'],
    example: '1 a 16 keypads Finno Air = 1x RFN-AIR-RX; 17 a 32 keypads Finno Air = 2x RFN-AIR-RX.'
  },
  {
    id: 'KEY-02',
    category: 'Keypads & Interfaces',
    type: 'Limite Crítico',
    severity: 'critical',
    title: 'Limite Máximo de 32 Keypads Finno Air por Sistema',
    summary: 'Um projeto pode ter no máximo 32 keypads Finno Air (até 2 antenas receptoras).',
    description: 'Para assegurar estabilidade de radiofrequência, baixa latência e integridade das transmissões sem fio, o sistema impõe um teto de 32 keypads Finno Air por projeto. O formulário impede a inserção de valores acima de 32 e o motor de cálculo rejeita propostas que excedam o limite.',
    formula: 'finnoAirCount ≤ 32 (Máx. 2 antenas)',
    involvedHardware: ['RFN-AIR'],
    example: 'Tentativas de adicionar mais de 32 unidades são bloqueadas na interface e sinalizadas como erro crítico.'
  },
  {
    id: 'KEY-03',
    category: 'Keypads & Interfaces',
    type: 'Arquitetura',
    severity: 'info',
    title: 'Pulsadores de Contato Seco (Uso de Portas PNET)',
    summary: 'Pulsadores Quantica RQR-P não consomem endereços RNET; conectam-se em portas PNET.',
    description: 'O pulsador Quantica RQR-P conecta teclas de contato seco do ambiente diretamente a uma porta PNET disponível em módulos de iluminação ou persianas. Cada pulsador consome 1 porta PNET e 0 endereços RNET.',
    formula: 'Demanda PNET = 1 porta por pulsador RQR-P',
    involvedHardware: ['RQR-P']
  },
  {
    id: 'KEY-04',
    category: 'Keypads & Interfaces',
    type: 'Arquitetura',
    severity: 'info',
    title: 'Consumo de Potência de Barramento dos Keypads (NPower)',
    summary: 'Teclados RNET consomem energia do barramento proporcionalmente aos seus recursos visuais.',
    description: 'Teclados multifunção com retroiluminação RGB consomem 1.8 NPower (RQR-K, RFN-K, RBN-K); teclados compactos consomem 1.2 NPower (RIS-K); teclados simplificados Lite consomem 0.6 NPower (RQR-L).',
    involvedHardware: ['RQR-K', 'RQR-L', 'RFN-K', 'RBN-K', 'RIS-K']
  },

  // 6. Sensores
  {
    id: 'SNS-01',
    category: 'Sensores',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Sensores Inteligentes em Barramento RNET (WIDELUX & X-RAY)',
    summary: 'Sensores de presença/luz e temperatura/qualidade do ar operam diretamente no barramento RNET.',
    description: 'Cada sensor inteligente consome 1 endereço RNET no sistema e 0.4 unidades de potência de rede NPower.',
    formula: 'Consumo: 1 endereço RNET + 0.4 NPower por sensor',
    involvedHardware: ['WIDELUX', 'X-RAY']
  },
  {
    id: 'SNS-02',
    category: 'Sensores',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Sensor de Movimento NANO via Porta PNET',
    summary: 'Sensor de movimento simples que consome 1 porta PNET e zero endereços RNET.',
    description: 'O sensor NANO foi projetado para ligação simples em portas PNET de módulos do sistema (como relés ou dimmers), economizando endereços RNET para outros componentes do projeto.',
    formula: 'Consumo: 1 porta PNET + 0 endereços RNET por sensor NANO',
    involvedHardware: ['NANO']
  },

  // 7. Portas PNET
  {
    id: 'PNET-01',
    category: 'Portas PNET',
    type: 'Otimização',
    severity: 'success',
    title: 'Upgrade Preventivo de Módulos (Minimiza Módulos Extras)',
    summary: 'Substitui módulos de 0 portas por variantes com 5 portas PNET antes de adicionar novos itens.',
    description: 'Havendo déficit de portas PNET (solicitadas por pulsadores RQR-P ou sensores NANO), o algoritmo analisa os módulos já especificados (como RDP-RL4, RDP-DIM4 ou RDP-LX2) e os atualiza para versões com 5 portas PNET (RDP-RL8, RDP-DIM8 ou RDP-LX4). Isso evita a inserção de módulos sobressalentes e poupa espaço de trilho DIN.',
    formula: 'Déficit PNET = ΣConsumo - ΣSuprido; Se Déficit > 0: Swap Módulo (0 PNET → 5 PNET)',
    involvedHardware: ['RDP-RL8', 'RDP-DIM8', 'RDP-LX4'],
    example: 'Se o projeto tem 1x RDP-RL4 e 2 sensores NANO, o algoritmo substitui o RDP-RL4 por 1x RDP-RL8, fornecendo 5 portas PNET sem adicionar módulos a mais.'
  },
  {
    id: 'PNET-02',
    category: 'Portas PNET',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Adição Residual de Módulos Provedores de PNET',
    summary: 'Adiciona módulos extras se os upgrades não forem suficientes para cobrir a demanda PNET.',
    description: 'Se após todos os upgrades possíveis ainda houver déficit de portas PNET, módulos adicionais são incluídos na proposta, priorizando relés de 8 canais (RDP-RL8) por economia de custo.',
    formula: 'Módulos PNET Extras = Math.ceil(Déficit Residual PNET / 5)',
    involvedHardware: ['RDP-RL8', 'RDP-DIM8']
  },

  // 8. Energia & Fontes
  {
    id: 'PWR-01',
    category: 'Energia & Fontes',
    type: 'Dimensionamento',
    severity: 'warning',
    title: 'Balanço de Potência de Rede RNET (NPower)',
    summary: 'A CPU fornece 55 NPower; déficits adicionam Hubs RDP-HUB6.',
    description: 'Se o consumo total de energia de rede NPower (teclados, sensores, antenas e gateways) superar as 55 unidades fornecidas pela processadora central, o sistema adiciona automaticamente Hubs de barramento RDP-HUB6 (55 NPower cada) para suprir o déficit.',
    formula: 'Déficit NPower = Consumo NPower - 55; Hubs = Math.ceil(Déficit / 55)',
    involvedHardware: ['RDP-M6', 'RDP-HUB6']
  },
  {
    id: 'PWR-02',
    category: 'Energia & Fontes',
    type: 'Arquitetura',
    severity: 'info',
    title: 'Fontes de Alimentação Dedicadas Exclusivas',
    summary: '1 fonte RDP-PWR60 de 60W para cada Processadora RDP-M6 e cada Hub RDP-HUB6.',
    description: 'Equipamentos críticos de distribuição de rede e controle contam com fontes de alimentação isoladas (requiresDedicatedPS: true). A energia dessas fontes é exclusiva para a operação desses nós vitais e não é disponibilizada no barramento geral de módulos.',
    formula: 'Qtd Fontes Dedicadas = Qtd Processadoras + Qtd Hubs RDP-HUB6',
    involvedHardware: ['RDP-PWR60', 'RDP-M6', 'RDP-HUB6']
  },
  {
    id: 'PWR-03',
    category: 'Energia & Fontes',
    type: 'Dimensionamento',
    severity: 'info',
    title: 'Balanço de Energia Lógica dos Módulos (LPower)',
    summary: 'Suprimento de energia lógica para os circuitos internos dos módulos de trilho DIN.',
    description: 'Totaliza o consumo LPower interno dos módulos DIN (Relés consomem 6, Dimmers 2, DALI 5, Persianas 4.2). Se a demanda LPower geral superar o fornecimento disponível no barramento, fontes de alimentação de linha RDP-PWR60 (60W cada) são adicionadas até balancear o sistema.',
    formula: 'Déficit LPower = Consumo LPower - Fornecimento LPower Geral; Fontes LPower = Math.ceil(Déficit / 60)',
    involvedHardware: ['RDP-PWR60']
  }
];

const CATEGORIES: RuleCategory[] = [
  'Gerais',
  'Processadora',
  'Iluminação',
  'Persianas & Climatização',
  'Keypads & Interfaces',
  'Sensores',
  'Portas PNET',
  'Energia & Fontes'
];

const getCategoryIcon = (category: RuleCategory) => {
  switch (category) {
    case 'Gerais': return <Scale size={16} className="text-neutral-700" />;
    case 'Processadora': return <Cpu size={16} className="text-purple-600" />;
    case 'Iluminação': return <Lightbulb size={16} className="text-yellow-600" />;
    case 'Persianas & Climatização': return <Blinds size={16} className="text-blue-600" />;
    case 'Keypads & Interfaces': return <Grid3x3 size={16} className="text-cyan-600" />;
    case 'Sensores': return <Radar size={16} className="text-orange-600" />;
    case 'Portas PNET': return <EthernetPort size={16} className="text-emerald-600" />;
    case 'Energia & Fontes': return <Zap size={16} className="text-amber-500" />;
  }
};

const getTypeBadgeStyle = (type: RuleType, severity: string) => {
  if (severity === 'critical') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (severity === 'warning') {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  if (severity === 'success') {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }
  switch (type) {
    case 'Limite Crítico':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Boas Práticas':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Otimização':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Arquitetura':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

export const SystemRulesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredRules = useMemo(() => {
    return SYSTEM_RULES.filter(rule => {
      const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
      const matchesType = selectedType === 'all' || rule.type === selectedType;
      
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        rule.title.toLowerCase().includes(term) ||
        rule.summary.toLowerCase().includes(term) ||
        rule.description.toLowerCase().includes(term) ||
        rule.category.toLowerCase().includes(term) ||
        rule.type.toLowerCase().includes(term) ||
        (rule.formula && rule.formula.toLowerCase().includes(term)) ||
        (rule.involvedHardware && rule.involvedHardware.some(h => h.toLowerCase().includes(term)));

      return matchesCategory && matchesType && matchesSearch;
    });
  }, [searchTerm, selectedCategory, selectedType]);

  const stats = useMemo(() => {
    const criticalCount = SYSTEM_RULES.filter(r => r.type === 'Limite Crítico').length;
    const optimizationCount = SYSTEM_RULES.filter(r => r.type === 'Otimização').length;
    const sizingCount = SYSTEM_RULES.filter(r => r.type === 'Dimensionamento').length;
    return {
      total: SYSTEM_RULES.length,
      criticalCount,
      optimizationCount,
      sizingCount
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Pillars Summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#746554] mb-1">
              <BookOpen size={16} />
              <span>Regras de Engenharia & Dimensionamento</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Lógica de Composição da Proposta
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-3xl">
              Consulte todas as diretrizes técnicas, regras de dimensionamento, limites invioláveis de protocolo e otimizações automáticas aplicadas pelo motor de cálculo na geração da Lista de Materiais (BOM).
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-neutral-100 rounded-lg text-neutral-800 self-stretch sm:self-auto justify-center">
            <Layers size={15} />
            <span>{stats.total} Regras Mapeadas</span>
          </div>
        </div>

        {/* 4 Critical Highlights Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 bg-red-50/70 border border-red-200/80 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-red-700">Teto RNET</span>
              <ShieldAlert size={16} className="text-red-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-950">250 Endereços</div>
            <div className="text-[11px] text-red-700/90 mt-0.5 leading-tight">
              Limite físico inviolável por barramento
            </div>
          </div>

          <div className="p-3.5 bg-cyan-50/70 border border-cyan-200/80 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-cyan-800">Finno Air</span>
              <Grid3x3 size={16} className="text-cyan-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-950">Máx. 32 / Sist.</div>
            <div className="text-[11px] text-cyan-700/90 mt-0.5 leading-tight">
              1 antena a cada 16 keypads Finno Air
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-purple-800">CPU / Carga</span>
              <Cpu size={16} className="text-purple-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-950">1 a cada 100 Endr.</div>
            <div className="text-[11px] text-purple-700/90 mt-0.5 leading-tight">
              Boas práticas para alta performance
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">PNET Upgrade</span>
              <EthernetPort size={16} className="text-emerald-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950">Zero Desperdício</div>
            <div className="text-[11px] text-emerald-700/90 mt-0.5 leading-tight">
              Atualiza módulos antes de adicionar extras
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar por regra, hardware (ex: RFN-AIR, NANO, RDP-M6) ou conceito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Tipo:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none focus:bg-white focus:border-neutral-400"
            >
              <option value="all">Todos os Tipos ({SYSTEM_RULES.length})</option>
              <option value="Limite Crítico">Limite Crítico ({SYSTEM_RULES.filter(r => r.type === 'Limite Crítico').length})</option>
              <option value="Dimensionamento">Dimensionamento ({SYSTEM_RULES.filter(r => r.type === 'Dimensionamento').length})</option>
              <option value="Otimização">Otimização ({SYSTEM_RULES.filter(r => r.type === 'Otimização').length})</option>
              <option value="Arquitetura">Arquitetura ({SYSTEM_RULES.filter(r => r.type === 'Arquitetura').length})</option>
              <option value="Boas Práticas">Boas Práticas ({SYSTEM_RULES.filter(r => r.type === 'Boas Práticas').length})</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#746554] text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas as Categorias ({SYSTEM_RULES.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = SYSTEM_RULES.filter(r => r.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#746554] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules List / Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
          <span>Exibindo {filteredRules.length} de {SYSTEM_RULES.length} regras</span>
          {(selectedCategory !== 'all' || selectedType !== 'all' || searchTerm) && (
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedType('all');
                setSearchTerm('');
              }}
              className="text-[#746554] hover:underline cursor-pointer font-medium"
            >
              Resetar filtros
            </button>
          )}
        </div>

        {filteredRules.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-3">
            <HelpCircle size={36} className="mx-auto text-gray-300" />
            <h4 className="text-base font-bold text-gray-800">Nenhuma regra encontrada</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Não encontramos nenhuma regra correspondente aos critérios de busca ou filtros selecionados. Tente buscar por outros termos ou limpar os filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map(rule => (
              <div 
                key={rule.id}
                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between hover:border-gray-300 transition-all group"
              >
                <div>
                  {/* Card Header: Category + Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-md bg-gray-100">
                        {getCategoryIcon(rule.category)}
                      </div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        {rule.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getTypeBadgeStyle(rule.type, rule.severity)}`}>
                        {rule.type}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        {rule.id}
                      </span>
                    </div>
                  </div>

                  {/* Title and Summary */}
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-brand-700 transition-colors leading-snug mb-1.5">
                    {rule.title}
                  </h3>
                  
                  <p className="text-xs font-medium text-gray-700 leading-relaxed mb-3">
                    {rule.summary}
                  </p>

                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    {rule.description}
                  </p>
                </div>

                {/* Details Footer: Formula, Example, Hardware */}
                <div className="space-y-2.5 pt-3 border-t border-gray-100 mt-2">
                  {rule.formula && (
                    <div className="bg-neutral-50 border border-neutral-200/80 rounded-lg p-2.5 font-mono text-[11px] text-neutral-800 break-all leading-normal">
                      <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mb-0.5 font-sans">
                        Lógica / Expressão Aplicada
                      </div>
                      <code>{rule.formula}</code>
                    </div>
                  )}

                  {rule.example && (
                    <div className="text-[11px] text-gray-600 bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 leading-relaxed">
                      <span className="font-bold text-blue-900">Exemplo prático: </span>
                      {rule.example}
                    </div>
                  )}

                  {rule.involvedHardware && rule.involvedHardware.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">
                        Modelos:
                      </span>
                      {rule.involvedHardware.map(hw => (
                        <span 
                          key={hw}
                          className="text-[10px] font-medium font-mono bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded transition-colors"
                        >
                          {hw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
