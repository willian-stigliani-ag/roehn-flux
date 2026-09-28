import { ProjectInputs, SpecificationResult, Product, DeviceType, BomItem } from "../types";

export const generateSpecification = async (inputs: ProjectInputs, catalog: Product[]): Promise<SpecificationResult> => {
  // Use let so we can filter/reassign later
  let items: BomItem[] = [];
  const activeCounts = inputs.counts;

  // --- Helper: Generic Optimization Algorithm ---
  const getOptimizedBom = (targetAmount: number, candidates: Product[], getCapacity: (p: Product) => number): Map<Product, number> => {
    const productsByCap = new Map<number, Product>();
    candidates.forEach(p => {
        const cap = getCapacity(p);
        if (cap > 0 && !productsByCap.has(cap)) productsByCap.set(cap, p);
    });
    
    const capacities = Array.from(productsByCap.keys()).sort((a, b) => b - a);
    if (capacities.length === 0) return new Map();

    const result = new Map<Product, number>();
    if (targetAmount <= 0) return result;

    const maxCap = capacities[0];
    const maxProduct = productsByCap.get(maxCap)!;

    let bulkQty = Math.floor(targetAmount / maxCap);
    // Use slightly fuzzy math for float safety
    let remainder = targetAmount - (bulkQty * maxCap);
    if (remainder < 0.001) remainder = 0;

    if (bulkQty > 0) {
        result.set(maxProduct, bulkQty);
    }

    if (remainder > 0) {
        // Find smallest capacity >= remainder
        const bestFitCap = capacities.filter(cap => cap >= remainder - 0.001).sort((a,b) => a - b)[0];
        
        if (bestFitCap !== undefined) {
             const p = productsByCap.get(bestFitCap)!;
             result.set(p, (result.get(p) || 0) + 1);
        } else {
             // Fallback: Add another max unit
             const p = maxProduct;
             result.set(p, (result.get(p) || 0) + 1);
        }
    }
    return result;
  };

  // --- Stats Helper ---
  const calculateStats = (currentItems: BomItem[]) => {
    let totals = { 
        consumedL: 0, suppliedL: 0, 
        consumedN: 0, suppliedN: 0,
        consumedAddr: 0, suppliedAddr: 0,
        consumedPNET: 0, suppliedPNET: 0
    };
    currentItems.forEach(item => {
        const p = catalog.find(cp => cp.model === item.sku);
        if (p) {
            totals.consumedL += p.consumesLPower * item.quantity;
            totals.consumedN += p.consumesNPower * item.quantity;
            totals.consumedAddr += p.consumesAddress * item.quantity;
            totals.consumedPNET += p.consumesPNETPorts * item.quantity;

            totals.suppliedL += p.suppliesLPower * item.quantity;
            totals.suppliedN += p.suppliesNPower * item.quantity;
            totals.suppliedAddr += p.suppliesAddress * item.quantity;
            totals.suppliedPNET += p.suppliesPNETPorts * item.quantity;
        }
    });
    return totals;
  };

  // ==========================================
  // STAGE 1: FUNCTIONAL BOM GENERATION
  // ==========================================

  // --- Rule 1: Mandatory Processor ---
  const processors = catalog.filter(p => p.type === 'Processor' || p.type === 'Processador');
  if (processors.length > 0) {
    const processor = processors[0];
    items.push({
        sku: processor.model,
        name: `${processor.brand} ${processor.type}`,
        description: processor.description || 'Processador Central do Sistema',
        quantity: 1,
        category: 'Controller',
        // reasoning removed as requested
    });
  }

  // --- Configuration: Device Groups & Matching Rules ---
  const INF_GROUPS = [
    // Lighting
    {
      id: 'DIMMER_GROUP',
      types: [DeviceType.LIGHT_DIMMER],
      targetCategory: 'Lighting Control',
      typeKeywords: ['Dimmer', 'Dimer'],
      bomCategory: 'Lighting' as const
    },
    {
      id: 'RELAY_GROUP',
      types: [DeviceType.LIGHT_ONOFF],
      targetCategory: 'Lighting Control',
      typeKeywords: ['Relay', 'RL', 'On/Off', 'Relé', 'Rele'],
      bomCategory: 'Lighting' as const
    },
    {
      id: 'PWM_GROUP',
      types: [DeviceType.LIGHT_PWM],
      targetCategory: 'Lighting Control',
      typeKeywords: ['PWM', 'LED', 'RGB'],
      bomCategory: 'Lighting' as const
    },
    {
      id: 'DALI_GROUP',
      types: [DeviceType.LIGHT_DALI],
      targetCategory: 'Lighting Control',
      typeKeywords: ['DALI', 'DL'],
      bomCategory: 'Lighting' as const
    },
    // Shading
    {
      id: 'SHADE_WIRED_GROUP',
      types: [DeviceType.SHADE_WIRED],
      targetCategory: 'Shades Control',
      typeKeywords: ['Wired', 'LX', 'Cabeada', 'Motor'],
      bomCategory: 'Shading' as const
    },
    {
      id: 'SHADE_WIRELESS_GROUP',
      types: [DeviceType.SHADE_WIRELESS],
      targetCategory: 'Shades Control',
      typeKeywords: ['Wireless', 'GTW', 'Sem Fio'],
      bomCategory: 'Shading' as const
    },
    // Climate
    {
      id: 'HVAC_IR_GROUP',
      types: [DeviceType.CLIMATE_IR],
      targetCategory: 'HVAC Control',
      typeKeywords: ['IR', 'Infrared', 'Emitter', 'SA1', 'Infravermelho'],
      bomCategory: 'Climate' as const
    },
    {
      id: 'HVAC_CENTRAL_GROUP',
      types: [DeviceType.CLIMATE_VRV],
      targetCategory: 'HVAC Control',
      typeKeywords: ['VRV', 'VRF', 'Gateway', 'Thermostat', 'DK'],
      bomCategory: 'Climate' as const
    },
    // Keypads
    {
      id: 'KEYPAD_QK_GROUP',
      types: [DeviceType.KEYPAD_QUANTICA_K],
      targetCategory: 'Keypad',
      typeKeywords: ['Quantica K', 'Quantica Keypad', 'RQR-K'],
      bomCategory: 'User Interface' as const
    },
    {
      id: 'KEYPAD_QL_GROUP',
      types: [DeviceType.KEYPAD_QUANTICA_L],
      targetCategory: 'Keypad',
      typeKeywords: ['Quantica L', 'Quantica Keypad Lite', 'RQR-L'],
      bomCategory: 'User Interface' as const
    },
    {
      id: 'KEYPAD_QP_GROUP',
      types: [DeviceType.KEYPAD_QUANTICA_P],
      targetCategory: 'Keypad',
      typeKeywords: ['Quantica P', 'Quantica Pulsador', 'RQR-P'],
      bomCategory: 'User Interface' as const
    },
    {
      id: 'KEYPAD_FINNO_K_GROUP',
      types: [DeviceType.KEYPAD_FINNO_K],
      targetCategory: 'Keypad',
      typeKeywords: ['Finno Keypad', 'RFN-K'],
      bomCategory: 'User Interface' as const
    },
    {
      id: 'KEYPAD_FINNO_AIR_GROUP',
      types: [DeviceType.KEYPAD_FINNO_AIR],
      targetCategory: 'Keypad',
      typeKeywords: ['Finno Air', 'RFN-AIR', 'RFN-A'],
      bomCategory: 'User Interface' as const
    },
    {
      id: 'KEYPAD_FINNO_P_GROUP',
      types: [DeviceType.KEYPAD_FINNO_P],
      targetCategory: 'Keypad',
      typeKeywords: ['Finno Pulsador', 'RFN-P'],
      bomCategory: 'User Interface' as const
    },
    {
      id: 'KEYPAD_BIANNI_K_GROUP',
      types: [DeviceType.KEYPAD_BIANNI_K],
      targetCategory: 'Keypad',
      typeKeywords: ['Bianni Keypad', 'RBN-K'],
      bomCategory: 'User Interface' as const
    },
    {
      id: 'KEYPAD_BIANNI_P_GROUP',
      types: [DeviceType.KEYPAD_BIANNI_P],
      targetCategory: 'Keypad',
      typeKeywords: ['Bianni Pulsador', 'RBN-P'],
      bomCategory: 'User Interface' as const
    },
    {
      id: 'KEYPAD_ION_GROUP',
      types: [DeviceType.KEYPAD_ION],
      targetCategory: 'Keypad',
      typeKeywords: ['ION Keypad', 'ION', 'RIS-K'],
      bomCategory: 'User Interface' as const
    },
    // Sensors
    {
      id: 'SENSOR_WIDELUX_GROUP',
      types: [DeviceType.SENSOR_WIDELUX],
      targetCategory: 'Sensor',
      typeKeywords: ['Widelux'],
      bomCategory: 'Sensors' as const
    },
    {
      id: 'SENSOR_XRAY_GROUP',
      types: [DeviceType.SENSOR_XRAY],
      targetCategory: 'Sensor',
      typeKeywords: ['X-Ray'],
      bomCategory: 'Sensors' as const
    },
    {
      id: 'SENSOR_NANO_GROUP',
      types: [DeviceType.SENSOR_NANO],
      targetCategory: 'Sensor',
      typeKeywords: ['Nano'],
      bomCategory: 'Sensors' as const
    }
  ];

  // --- Functional Module Calculation ---
  INF_GROUPS.forEach(group => {
    const totalLoad = group.types.reduce((sum, type) => sum + (activeCounts[type] || 0), 0);
    if (totalLoad <= 0) return;

    const candidates = catalog.filter(p => 
      p.category === group.targetCategory && 
      group.typeKeywords.some(k => 
        p.type.toLowerCase().includes(k.toLowerCase()) || 
        p.model.toLowerCase().includes(k.toLowerCase())
      )
    );

    if (candidates.length === 0) {
      items.push({
        sku: 'MISSING-PRODUCT',
        name: `Incompatível: ${group.id}`,
        description: `Nenhum produto do catálogo encontrado para controlar ${totalLoad} dispositivos.`,
        quantity: 0,
        category: 'Accessory',
        reasoning: `Erro: Faltam produtos de ${group.targetCategory}.`
      });
      return;
    }

    const optimization = getOptimizedBom(totalLoad, candidates, (p) => p.channels);
    
    optimization.forEach((qty, product) => {
        items.push({
          sku: product.model,
          name: `${product.brand} ${product.type}`,
          description: product.description || `${product.category} (${product.channels} Canais)`,
          quantity: qty,
          category: group.bomCategory,
          // Removed standard reasoning
        });
    });
  });

  // --- Rule: Finno Air Keypads & Antenna Receivers ---
  // - Cada antena pode conectar até 16 keypads Finno Air
  // - Um sistema pode ter no máximo 32 keypads Finno Air
  const finnoAirCount = activeCounts[DeviceType.KEYPAD_FINNO_AIR] || 0;
  if (finnoAirCount > 0) {
    if (finnoAirCount > 32) {
      items.push({
        sku: 'ERROR-FINNO-AIR-LIMIT',
        name: 'ERRO CRÍTICO: Limite de Finno Air Excedido',
        description: `O projeto possui ${finnoAirCount} keypads Finno Air, mas o sistema suporta no máximo 32 keypads Finno Air.`,
        quantity: finnoAirCount,
        category: 'Accessory',
        reasoning: 'Regra de sistema: Máximo de 32 keypads Finno Air por projeto (até 2 antenas receptoras com 16 keypads cada).'
      });
    }

    const antennasNeeded = Math.ceil(finnoAirCount / 16);

    const antennaProduct = catalog.find(p => 
      p.model === 'RFN-AIR-RX' || 
      p.type.toLowerCase().includes('antena') ||
      p.model.toLowerCase().includes('air-rx') ||
      (p.category === 'Accessory' && p.description?.toLowerCase().includes('finno air'))
    );

    if (antennaProduct) {
      items.push({
        sku: antennaProduct.model,
        name: `${antennaProduct.brand} ${antennaProduct.type}`,
        description: antennaProduct.description || 'Antena receptora RF para keypads Finno Air',
        quantity: antennasNeeded,
        category: 'Accessory',
        reasoning: `${antennasNeeded} ${antennasNeeded === 1 ? 'antena receptora' : 'antenas receptoras'} para atender ${finnoAirCount} ${finnoAirCount === 1 ? 'keypad' : 'keypads'} Finno Air (capacidade de até 16 keypads por antena).`
      });
    } else {
      items.push({
        sku: 'RFN-AIR-RX',
        name: 'ROEHN Antena Receptora',
        description: 'Antena receptora RF para keypads Finno Air (até 16 keypads por antena)',
        quantity: antennasNeeded,
        category: 'Accessory',
        reasoning: `${antennasNeeded} ${antennasNeeded === 1 ? 'antena receptora' : 'antenas receptoras'} para atender ${finnoAirCount} ${finnoAirCount === 1 ? 'keypad' : 'keypads'} Finno Air (capacidade de até 16 keypads por antena).`
      });
    }
  }

  // --- Rule: Address Capacity Scaling ---
  // Calculates total addresses consumed by functional modules and scales the processor count.
  const addressStats = calculateStats(items);
  const totalAddresses = addressStats.consumedAddr;
  
  // Find the processor item (assuming it was added in the Mandatory Processor step)
  const processorItem = items.find(item => {
      const p = catalog.find(cp => cp.model === item.sku);
      return p?.type === 'Processor' || p?.type === 'Processador';
  });

  if (processorItem) {
      // Rule: 1 Processor for every 100 addresses (Best Practice for performance/load)
      // This does NOT expand the 250 address system limit.
      const requiredProcessors = Math.max(1, Math.ceil(totalAddresses / 100));
      
      processorItem.quantity = requiredProcessors;
      
      if (requiredProcessors > 1) {
          processorItem.reasoning = 'Processadoras adicionais recomendadas por boas práticas (1 a cada 100 endereços).';
      }
  }

  // CRITICAL RULE: System cannot exceed 250 RNET addresses
  if (totalAddresses > 250) {
      items.push({
          sku: 'ERROR-ADDRESS-LIMIT',
          name: 'ERRO CRÍTICO: Limite de Endereços Excedido',
          description: `O sistema consome ${totalAddresses} endereços, mas o limite técnico é de 250 endereços RNET por sistema.`,
          quantity: 1,
          category: 'Accessory',
          reasoning: 'O protocolo RNET suporta no máximo 250 dispositivos endereçáveis. Adicionar processadoras NÃO expande este limite.'
      });
  }

  // ==========================================
  // STAGE 2: PNET CHECK & UPGRADE
  // ==========================================
  
  // 1. Calculate Deficit
  let pnetStats = calculateStats(items);
  let deficitPNET = pnetStats.consumedPNET - pnetStats.suppliedPNET;

  // 2a. Upgrade Phase
  // Check if we can swap existing items (that supply 0 ports) for variants that supply ports (e.g., Relay 4ch -> Relay 8ch)
  // This avoids adding "unnecessary" extra modules (Minimize Module Count).
  if (deficitPNET > 0) {
      let changeMade = true;
      while (deficitPNET > 0 && changeMade) {
          changeMade = false;
          
          let bestCandidate: { index: number, product: Product, score: number } | null = null;

          // Scan ALL items to find the BEST single upgrade candidate
          for (let i = 0; i < items.length; i++) {
              if (deficitPNET <= 0) break;
              const item = items[i];
              if (item.quantity <= 0) continue;

              const p = catalog.find(cp => cp.model === item.sku);
              // Only attempt upgrade if current product supplies 0 ports
              if (!p || p.suppliesPNETPorts > 0) continue; 

              // Find candidates in the same category/type that supply ports and have adequate channels
              const candidates = catalog.filter(up => 
                  up.category.toLowerCase() === p.category.toLowerCase() && 
                  up.type.toLowerCase() === p.type.toLowerCase() && 
                  up.suppliesPNETPorts > 0 && 
                  up.channels >= p.channels
              );

              if (candidates.length === 0) continue;

              // Pick best product for this specific item (prefer highest ports, then lowest channels to minimize waste)
              candidates.sort((a,b) => {
                 if (b.suppliesPNETPorts !== a.suppliesPNETPorts) return b.suppliesPNETPorts - a.suppliesPNETPorts;
                 return a.channels - b.channels;
              });
              const upgradeProduct = candidates[0];

              // Calculate Priority Score
              // Goal: Maximize 'useful' ports gained, break ties with Type preference.
              let score = 0;
              
              // 1. Utility Score: How much does this upgrade actually help?
              const portsSupplied = upgradeProduct.suppliesPNETPorts;
              const portsUseful = Math.min(portsSupplied, deficitPNET);
              score += portsUseful * 10; 

              // 2. Type Preference (Tie-breakers)
              const typeName = upgradeProduct.type.toLowerCase();
              if (typeName.includes('relay') || typeName.includes('on/off') || typeName.includes('relé') || typeName.includes('rele')) score += 5;
              else if (typeName.includes('dimmer') || typeName.includes('dimer')) score += 4;
              else if (typeName.includes('wired') || typeName.includes('shade') || typeName.includes('cabeada') || typeName.includes('persiana')) score += 4; // Equal priority to dimmers
              else score += 1;

              if (!bestCandidate || score > bestCandidate.score) {
                  bestCandidate = { index: i, product: upgradeProduct, score };
              }
          }

          // Apply the best upgrade found in this pass
          if (bestCandidate) {
              const item = items[bestCandidate.index];
              const p = catalog.find(cp => cp.model === item.sku)!;
              
              item.quantity -= 1;
              items.push({
                  sku: bestCandidate.product.model,
                  name: `${bestCandidate.product.brand} ${bestCandidate.product.type}`,
                  description: bestCandidate.product.description || `${bestCandidate.product.category} (${bestCandidate.product.channels} Ch)`,
                  quantity: 1,
                  category: item.category,
                  reasoning: 'Módulos atualizados para provisão de portas PNET.'
              });

              deficitPNET -= bestCandidate.product.suppliesPNETPorts;
              changeMade = true;
          }
      }
  }

  // Filter out items that were reduced to 0 quantity during upgrade
  items = items.filter(i => i.quantity > 0);

  // 2b. Additive Phase (Fallthrough)
  // If upgrading existing items wasn't enough (or no upgradable items existed), add new modules
  if (deficitPNET > 0) {
    // Sort to prioritize Relays (like RL8) over Dimmers (like DIM8)
    const pnetCandidates = catalog
        .filter(p => p.suppliesPNETPorts > 0)
        .sort((a, b) => {
            const aType = a.type.toLowerCase();
            const bType = b.type.toLowerCase();
            
            // 1. Prefer Relays
            const aIsRelay = aType.includes('relay') || aType.includes('on/off') || aType.includes('relé') || aType.includes('rele');
            const bIsRelay = bType.includes('relay') || bType.includes('on/off') || bType.includes('relé') || bType.includes('rele');
            if (aIsRelay && !bIsRelay) return -1;
            if (!aIsRelay && bIsRelay) return 1;

            // 2. Deprioritize Dimmers
            const aIsDimmer = aType.includes('dimmer') || aType.includes('dimer');
            const bIsDimmer = bType.includes('dimmer') || bType.includes('dimer');
            if (aIsDimmer && !bIsDimmer) return 1;
            if (!aIsDimmer && bIsDimmer) return -1;

            // 3. Prefer lower channel count (cheaper filler, e.g. RL8 over RL12)
            // Since getOptimizedBom picks the first match for a capacity, sorting ascending channels helps.
            return a.channels - b.channels;
        });
    
    if (pnetCandidates.length === 0) {
        items.push({
          sku: 'MISSING-PNET-MODULE',
          name: 'Déficit de Portas PNET',
          description: `O sistema precisa de ${deficitPNET} portas PNET.`,
          quantity: 1,
          category: 'Accessory',
          reasoning: 'Erro: Nenhum dispositivo para portas PNET.'
        });
    } else {
        const pnetBom = getOptimizedBom(deficitPNET, pnetCandidates, (p) => p.suppliesPNETPorts);
        
        pnetBom.forEach((qty, product) => {
            items.push({
                sku: product.model,
                name: `${product.brand} ${product.type}`,
                description: product.description || `Expansão de Portas PNET (Módulo)`,
                quantity: qty,
                category: 'Accessory',
                reasoning: 'Módulos adicionados para provisão de portas PNET.'
            });
        });
    }
  }

  // ==========================================
  // STAGE 3: POWER CHECK
  // ==========================================

  // Resolve NPower (Network Power)
  // Re-calculate stats because upgrades/additions might have changed things
  let stats = calculateStats(items);
  let deficitN = stats.consumedN - stats.suppliedN;

  if (deficitN > 0) {
      // Exclude Processors from candidates for expansion power to prefer Hubs (like RDP-HUB6)
      const nCandidates = catalog.filter(p => p.suppliesNPower > 0 && !p.type.toLowerCase().includes('process'));
      
      if (nCandidates.length === 0) {
          items.push({
            sku: 'MISSING-N-PWR',
            name: 'Déficit de Alimentação de Rede (NPower)',
            description: `O sistema precisa de ${deficitN.toFixed(2)} unidades de NPower.`,
            quantity: 1,
            category: 'Accessory',
            reasoning: 'Erro: Nenhum dispositivo para prover potência RNET.'
          });
      } else {
          const nBom = getOptimizedBom(deficitN, nCandidates, (p) => p.suppliesNPower);
          
          nBom.forEach((qty, product) => {
              items.push({
                  sku: product.model,
                  name: `${product.brand} ${product.type}`,
                  description: product.description || `Fonte de Alimentação de Rede`,
                  quantity: qty,
                  category: 'Accessory',
                  // reasoning removed as requested
              });
          });
      }
  }

  // Rule: Devices requiring dedicated Power Supply
  const devicesNeedingPS = items.filter(item => {
      const p = catalog.find(cp => cp.model === item.sku);
      return p?.requiresDedicatedPS;
  });

  // Calculate total dedicated PS modules needed (1 per unit of device)
  const totalDedPSNeeded = devicesNeedingPS.reduce((sum, item) => sum + item.quantity, 0);

  if (totalDedPSNeeded > 0) {
      const psCandidates = catalog
          .filter(p => (p.type === 'Power Supply' || p.type === 'Fonte de Alimentação') && p.suppliesLPower > 0)
          .sort((a, b) => b.suppliesLPower - a.suppliesLPower);

      if (psCandidates.length > 0) {
          const primaryPS = psCandidates[0];
          items.push({
              sku: primaryPS.model,
              name: `${primaryPS.brand} ${primaryPS.type}`,
              description: primaryPS.description || `Fonte de Alimentação Dedicada`,
              quantity: totalDedPSNeeded,
              category: 'Accessory',
              reasoning: 'Fontes adicionais incluídas para processadoras ou hubs.'
          });
      } else {
           items.push({
            sku: 'MISSING-PWR-SUPPLY',
            name: 'Fonte de Alimentação Ausente',
            description: `Nenhuma fonte de alimentação encontrada no catálogo para dispositivos dedicados.`,
            quantity: totalDedPSNeeded,
            category: 'Accessory',
            reasoning: 'Erro: Falta de fonte dedicada.'
          });
      }
  }

  // Resolve LPower (Logic/Line Power)
  let moduleLoadL = 0;
  let availableGeneralL = 0;

  items.forEach(item => {
    const p = catalog.find(cp => cp.model === item.sku);
    if (!p) return;

    const requiresDedicated = p.requiresDedicatedPS;
    // Check various strings for the reasoning flag
    const isDedicatedPS = item.reasoning?.includes('Dedicated Power Supply') || 
                          item.reasoning?.includes('Fonte de alimentação dedicada') ||
                          item.reasoning?.includes('Fontes adicionais incluídas para processadoras ou hubs.');

    if (requiresDedicated) {
        // Device has its own dedicated PSU (added above), so its consumption is covered.
        // We do not add its consumption to the general bus load.
    } else if (isDedicatedPS) {
        // This is the dedicated PSU itself.
        // We do not add its supply to the general bus availability.
    } else {
        moduleLoadL += p.consumesLPower * item.quantity;
        availableGeneralL += p.suppliesLPower * item.quantity;
    }
  });

  let deficitL = moduleLoadL - availableGeneralL;

  if (deficitL > 0) {
      const lCandidates = catalog.filter(p => p.suppliesLPower > 0);
      
      if (lCandidates.length === 0) {
           items.push({
            sku: 'MISSING-L-PWR',
            name: 'Déficit de Alimentação de Linha (LPower)',
            description: `Módulos precisam de ${deficitL.toFixed(2)} unidades de LPower.`,
            quantity: 1,
            category: 'Accessory',
            reasoning: 'Erro: Nenhum dispositivo para prover potência para os módulos.'
          });
      } else {
          const lBom = getOptimizedBom(deficitL, lCandidates, (p) => p.suppliesLPower);
          
          lBom.forEach((qty, product) => {
              items.push({
                  sku: product.model,
                  name: `${product.brand} ${product.type}`,
                  description: product.description || `Fonte de Alimentação de Linha`,
                  quantity: qty,
                  category: 'Accessory',
                  // reasoning removed as requested
              });
              availableGeneralL += product.suppliesLPower * qty;
          });
      }
  }

  // --- Aggregation Step ---
  const aggregatedItemsMap = new Map<string, BomItem>();

  items.forEach(item => {
    if (aggregatedItemsMap.has(item.sku)) {
        const existing = aggregatedItemsMap.get(item.sku)!;
        existing.quantity += item.quantity;
        
        // Merge reasoning, handling undefined/null to prevent "undefined" string
        const r1 = existing.reasoning;
        const r2 = item.reasoning;
        if (r2) {
             if (r1) {
                 if (r1 !== r2) {
                     existing.reasoning = `${r1} | ${r2}`;
                 }
             } else {
                 existing.reasoning = r2;
             }
        }
    } else {
        aggregatedItemsMap.set(item.sku, { ...item });
    }
  });

  const finalItems = Array.from(aggregatedItemsMap.values());
  const totalDevices = Object.values(activeCounts).reduce((a, b) => a + b, 0);
  
  // Calculate Category Counts
  const categoryCounts = {
      lighting: (activeCounts[DeviceType.LIGHT_ONOFF] || 0) + 
                (activeCounts[DeviceType.LIGHT_DIMMER] || 0) + 
                (activeCounts[DeviceType.LIGHT_PWM] || 0) + 
                (activeCounts[DeviceType.LIGHT_DALI] || 0),
      shading: (activeCounts[DeviceType.SHADE_WIRED] || 0) + 
               (activeCounts[DeviceType.SHADE_WIRELESS] || 0),
      climate: (activeCounts[DeviceType.CLIMATE_IR] || 0) + 
               (activeCounts[DeviceType.CLIMATE_VRV] || 0),
      keypads: (activeCounts[DeviceType.KEYPAD_QUANTICA_K] || 0) +
               (activeCounts[DeviceType.KEYPAD_QUANTICA_L] || 0) +
               (activeCounts[DeviceType.KEYPAD_QUANTICA_P] || 0) +
               (activeCounts[DeviceType.KEYPAD_FINNO_K] || 0) +
               (activeCounts[DeviceType.KEYPAD_FINNO_AIR] || 0) +
               (activeCounts[DeviceType.KEYPAD_FINNO_P] || 0) +
               (activeCounts[DeviceType.KEYPAD_BIANNI_K] || 0) +
               (activeCounts[DeviceType.KEYPAD_BIANNI_P] || 0) +
               (activeCounts[DeviceType.KEYPAD_ION] || 0),
      sensors: (activeCounts[DeviceType.SENSOR_WIDELUX] || 0) +
               (activeCounts[DeviceType.SENSOR_XRAY] || 0) +
               (activeCounts[DeviceType.SENSOR_NANO] || 0),
  };

  // Final Stats
  const finalStats = calculateStats(finalItems);

  return {
    items: finalItems,
    totalDevices,
    summary: `Especificação gerada.`,
    powerStats: {
        busLPower: {
            consumed: moduleLoadL,
            supplied: availableGeneralL
        },
        nPower: {
            consumed: finalStats.consumedN,
            supplied: finalStats.suppliedN
        }
    },
    addressStats: {
        consumed: finalStats.consumedAddr,
        supplied: Math.min(finalStats.suppliedAddr, 250)
    },
    pnetStats: {
        consumed: finalStats.consumedPNET,
        supplied: finalStats.suppliedPNET
    },
    categoryCounts
  };
};