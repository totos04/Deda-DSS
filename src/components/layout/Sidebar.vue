<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

export interface MenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
}

const route = useRoute()

const openMenus = ref<Record<string, boolean>>({})

const toggleMenu = (id: string) => {
  openMenus.value[id] = !openMenus.value[id]
}

// Helper per evitare errori di tipo string | undefined in RouterLink :to
const getPath = (path?: string): string => path ?? '#'

const menuData: MenuItem[] = [
  {
    id: 'dashboard', label: 'DASHBOARD', icon: '📊',
    children: [
      { id: 'dash-exec', label: 'Executive', path: '/dashboard/executive' },
      { id: 'dash-dec', label: 'Decision Center', path: '/dashboard/decision-center' },
      { id: 'dash-read', label: 'Readiness', path: '/dashboard/readiness' },
      { id: 'dash-live', label: 'Live Mode', path: '/dashboard/live' }
    ]
  },
  {
    id: 'previsioni', label: 'PREVISIONI', icon: '🔮',
    children: [
      { id: 'prev-pres', label: 'Presenze', path: '/previsioni/presenze' },
      { id: 'prev-flussi', label: 'Flussi', path: '/previsioni/flussi' },
      { id: 'prev-domanda', label: 'Domanda', path: '/previsioni/domanda' },
      { id: 'prev-scenari', label: 'Scenari', path: '/previsioni/scenari' },
      { id: 'prev-simul', label: 'Simulazioni', path: '/previsioni/simulazioni' },
      { id: 'prev-acc', label: 'Accuratezza', path: '/previsioni/accuratezza' }
    ]
  },
  {
    id: 'economia', label: 'ECONOMIA', icon: '💶',
    children: [
      { id: 'eco-pan', label: 'Panoramica', path: '/economia/panoramica' },
      { id: 'eco-bud', label: 'Budget', path: '/economia/budget' },
      { id: 'eco-ce', label: 'Conto Economico', path: '/economia/conto-economico' },
      { id: 'eco-tes', label: 'Tesoreria', path: '/economia/tesoreria' },
      { id: 'eco-acq', label: 'Acquisti', path: '/economia/acquisti' },
      { id: 'eco-be', label: 'Break-even', path: '/economia/break-even' },
      { id: 'eco-ind', label: 'Indicatori', path: '/economia/indicatori' },
      { id: 'eco-bil', label: 'Bilancio', path: '/economia/bilancio' },
      { id: 'eco-con', label: 'Consuntivo', path: '/economia/consuntivo' }
    ]
  },
  {
    id: 'vendite', label: 'VENDITE', icon: '🛒',
    children: [
      { id: 'ven-bev', label: 'Beverage', path: '/vendite/beverage' },
      { id: 'ven-food', label: 'Food', path: '/vendite/food' },
      { id: 'ven-merch', label: 'Merchandising', path: '/vendite/merchandising' },
      {
        id: 'ven-esp', label: 'Esperienze',
        children: [
          { id: 'ven-esp-work', label: 'Workshop', path: '/vendite/esperienze/workshop' },
          { id: 'ven-esp-lab', label: 'LAB', path: '/vendite/esperienze/lab' },
          { id: 'ven-esp-guide', label: 'Guide', path: '/vendite/esperienze/guide' }
        ]
      },
      { id: 'ven-cassa', label: 'Cassa', path: '/vendite/cassa' },
      {
        id: 'ven-ana', label: 'Analisi',
        children: [
          { id: 'ven-ana-mem', label: 'Menu Engineering Matrix', path: '/vendite/analisi/menu-engineering' },
          { id: 'ven-ana-mba', label: 'Market Basket Analysis', path: '/vendite/analisi/market-basket' },
          { id: 'ven-ana-abc', label: 'ABC Analysis', path: '/vendite/analisi/abc' },
          { id: 'ven-ana-par', label: 'Pareto Analysis', path: '/vendite/analisi/pareto' },
          { id: 'ven-ana-can', label: 'Cannibalization Analysis', path: '/vendite/analisi/cannibalization' },
          { id: 'ven-ana-pe', label: 'Price Elasticity', path: '/vendite/analisi/price-elasticity' }
        ]
      }
    ]
  },
  {
    id: 'scorte', label: 'SCORTE', icon: '📦',
    children: [
      { id: 'sco-inv', label: 'Inventario', path: '/scorte/inventario' },
      { id: 'sco-fab', label: 'Fabbisogno', path: '/scorte/fabbisogno' },
      { id: 'sco-rio', label: 'Riordino', path: '/scorte/riordino' },
      {
        id: 'sco-ris', label: 'Rischio',
        children: [
          { id: 'sco-ris-so', label: 'Stock-out', path: '/scorte/rischio/stock-out' },
          { id: 'sco-ris-os', label: 'Overstock', path: '/scorte/rischio/overstock' },
          { id: 'sco-ris-nm', label: 'Newsvendor Model', path: '/scorte/rischio/newsvendor' }
        ]
      }
    ]
  },
  {
    id: 'persone', label: 'PERSONE', icon: '👥',
    children: [
      {
        id: 'per-org', label: 'Organizzazione',
        children: [
          { id: 'per-org-gov', label: 'Governance', path: '/persone/organizzazione/governance' },
          { id: 'per-org-dir', label: 'Direzione', path: '/persone/organizzazione/direzione' },
          { id: 'per-org-res', label: 'Responsabili', path: '/persone/organizzazione/responsabili' },
          { id: 'per-org-org', label: 'Organigramma', path: '/persone/organizzazione/organigramma' },
          { id: 'per-org-raci', label: 'RACI Matrix', path: '/persone/organizzazione/raci' }
        ]
      },
      {
        id: 'per-vol', label: 'Volontari',
        children: [
          { id: 'per-vol-ana', label: 'Anagrafica', path: '/addVolontari' },
          { id: 'per-vol-dis', label: 'Disponibilità', path: '/persone/volontari/disponibilita' },
          { id: 'per-vol-com', label: 'Competenze', path: '/persone/volontari/competenze' },
          { id: 'per-vol-pre', label: 'Preferenze', path: '/persone/volontari/preferenze' },
          { id: 'per-vol-sto', label: 'Storico', path: '/persone/volontari/storico' }
        ]
      },
      {
        id: 'per-tur', label: 'Turni',
        children: [
          { id: 'per-tur-wp', label: 'Workforce Planning', path: '/persone/turni/planning' },
          { id: 'per-tur-ws', label: 'Workforce Scheduling', path: '/persone/turni/scheduling' },
          { id: 'per-tur-dbs', label: 'Demand-Based Staffing', path: '/persone/turni/demand' },
          { id: 'per-tur-fp', label: 'Floating Pool', path: '/persone/turni/floating' },
          { id: 'per-tur-cop', label: 'Copertura', path: '/persone/turni/copertura' },
          { id: 'per-tur-con', label: 'Conflitti', path: '/persone/turni/conflitti' }
        ]
      },
      {
        id: 'per-osp', label: 'Ospiti',
        children: [
          { id: 'per-osp-ana', label: 'Anagrafica', path: '/addGuest' },
          { id: 'per-osp-ref', label: 'Referenti', path: '/persone/ospiti/referenti' },
          { id: 'per-osp-via', label: 'Viaggi', path: '/persone/ospiti/viaggi' },
          { id: 'per-osp-esi', label: 'Esigenze', path: '/persone/ospiti/esigenze' }
        ]
      },
      {
        id: 'per-hos', label: 'Ospitalità',
        children: [
          { id: 'per-hos-team', label: 'Team', path: '/persone/ospitalita/team' },
          { id: 'per-hos-all', label: 'Alloggi', path: '/persone/ospitalita/alloggi' },
          { id: 'per-hos-ass', label: 'Assegnazioni', path: '/persone/ospitalita/assegnazioni' },
          { id: 'per-hos-map', label: 'Mappa', path: '/ospitalita' }
        ]
      }
    ]
  },
  {
    id: 'programma', label: 'PROGRAMMA', icon: '📅',
    children: [
      { id: 'pro-pal', label: 'Palinsesto', path: '/programma/palinsesto' },
      { id: 'pro-eve', label: 'Eventi', path: '/programma/eventi' },
      { id: 'pro-wlg', label: 'Workshop / LAB / Guide', path: '/programma/workshop' },
      {
        id: 'pro-prd', label: 'Produzione',
        children: [
          { id: 'pro-prd-set', label: 'Setup', path: '/programma/produzione/setup' },
          { id: 'pro-prd-sc', label: 'Soundcheck', path: '/programma/produzione/soundcheck' },
          { id: 'pro-prd-co', label: 'Changeover', path: '/programma/produzione/changeover' },
          { id: 'pro-prd-td', label: 'Teardown', path: '/programma/produzione/teardown' }
        ]
      },
      {
        id: 'pro-imp', label: 'Impatto',
        children: [
          { id: 'pro-imp-pre', label: 'Presenze', path: '/programma/impatto/presenze' },
          { id: 'pro-imp-flu', label: 'Flussi', path: '/programma/impatto/flussi' },
          { id: 'pro-imp-dom', label: 'Domanda', path: '/programma/impatto/domanda' },
          { id: 'pro-imp-per', label: 'Personale', path: '/programma/impatto/personale' },
          { id: 'pro-imp-cap', label: 'Capacità', path: '/programma/impatto/capacita' }
        ]
      }
    ]
  },
  {
    id: 'operations', label: 'OPERATIONS', icon: '⚙️',
    children: [
      { id: 'ope-po', label: 'Piano Operativo', path: '/operations/piano' },
      { id: 'ope-tl', label: 'Timeline', path: '/operations/timeline' },
      { id: 'ope-tsk', label: 'Task', path: '/operations/task' },
      { id: 'ope-dip', label: 'Dipendenze', path: '/operations/dipendenze' },
      { id: 'ope-ric', label: 'Ricorrenti', path: '/operations/ricorrenti' },
      { id: 'ope-chk', label: 'Checklist', path: '/operations/checklist' },
      { id: 'ope-cp', label: 'Critical Path', path: '/operations/critical-path' }
    ]
  },
  {
    id: 'logistica', label: 'LOGISTICA', icon: '🚚',
    children: [
      {
        id: 'log-sed', label: 'Sede',
        children: [
          { id: 'log-sed-spa', label: 'Spazi', path: '/logistica/sede/spazi' },
          { id: 'log-sed-mag', label: 'Magazzino', path: '/logistica/sede/magazzino' },
          { id: 'log-sed-arr', label: 'Arredi', path: '/logistica/sede/arredi' },
          { id: 'log-sed-att', label: 'Attrezzature', path: '/logistica/sede/attrezzature' },
          { id: 'log-sed-man', label: 'Manutenzioni', path: '/logistica/sede/manutenzioni' },
          { id: 'log-sed-ute', label: 'Utenze', path: '/logistica/sede/utenze' }
        ]
      },
      {
        id: 'log-ris', label: 'Risorse',
        children: [
          { id: 'log-ris-ass', label: 'Asset', path: '/logistica/risorse/asset' },
          { id: 'log-ris-pre', label: 'Prestiti', path: '/logistica/risorse/prestiti' },
          { id: 'log-ris-nol', label: 'Noleggi', path: '/logistica/risorse/noleggi' },
          { id: 'log-ris-spo', label: 'Sponsorizzazioni in-kind', path: '/logistica/risorse/sponsorizzazioni' },
          { id: 'log-ris-mov', label: 'Movimentazioni', path: '/logistica/risorse/movimentazioni' }
        ]
      },
      {
        id: 'log-spa', label: 'Spazi',
        children: [
          { id: 'log-spa-loc', label: 'Location', path: '/logistica/spazi/location' },
          { id: 'log-spa-lay', label: 'Layout', path: '/logistica/spazi/layout' },
          { id: 'log-spa-cap', label: 'Capienza', path: '/logistica/spazi/capienza' }
        ]
      },
      {
        id: 'log-tec', label: 'Tecnica',
        children: [
          { id: 'log-tec-aud', label: 'Audio', path: '/logistica/tecnica/audio' },
          { id: 'log-tec-luc', label: 'Luci', path: '/logistica/tecnica/luci' },
          { id: 'log-tec-vid', label: 'Video', path: '/logistica/tecnica/video' },
          { id: 'log-tec-ene', label: 'Energia', path: '/logistica/tecnica/energia' },
          { id: 'log-tec-bac', label: 'Backline', path: '/logistica/tecnica/backline' }
        ]
      },
      {
        id: 'log-all', label: 'Allestimenti',
        children: [
          { id: 'log-all-arr', label: 'Arredamento', path: '/logistica/allestimenti/arredamento' },
          { id: 'log-all-set', label: 'Setup', path: '/logistica/allestimenti/setup' },
          { id: 'log-all-smo', label: 'Smontaggio', path: '/logistica/allestimenti/smontaggio' }
        ]
      },
      {
        id: 'log-mob', label: 'Mobilità',
        children: [
          {
            id: 'log-mob-vei', label: 'Veicoli',
            children: [
              { id: 'log-mob-vei-pri', label: 'Privati', path: '/logistica/mobilita/veicoli/privati' },
              { id: 'log-mob-vei-spo', label: 'Sponsor', path: '/logistica/mobilita/veicoli/sponsor' }
            ]
          },
          { id: 'log-mob-mis', label: 'Missioni', path: '/logistica/mobilita/missioni' },
          { id: 'log-mob-aut', label: 'Autisti', path: '/logistica/mobilita/autisti' },
          { id: 'log-mob-pas', label: 'Passeggeri / Carico', path: '/logistica/mobilita/passeggeri' },
          { id: 'log-mob-rim', label: 'Rimborsi', path: '/logistica/mobilita/rimborsi' }
        ]
      }
    ]
  },
  {
    id: 'sponsor', label: 'SPONSOR', icon: '🤝',
    children: [
      {
        id: 'spo-crm', label: 'CRM',
        children: [
          { id: 'spo-crm-pro', label: 'Prospect', path: '/sponsor/crm/prospect' },
          { id: 'spo-crm-con', label: 'Contatti', path: '/sponsor/crm/contatti' },
          { id: 'spo-crm-pip', label: 'Pipeline', path: '/sponsor/crm/pipeline' },
          { id: 'spo-crm-sto', label: 'Storico', path: '/sponsor/crm/storico' }
        ]
      },
      {
        id: 'spo-off', label: 'Offerta',
        children: [
          { id: 'spo-off-inv', label: 'Sponsorship Inventory', path: '/sponsor/offerta/inventory' },
          { id: 'spo-off-pac', label: 'Package Builder', path: '/sponsor/offerta/package' },
          { id: 'spo-off-lis', label: 'Listino', path: '/sponsor/offerta/listino' },
          { id: 'spo-off-pro', label: 'Proposte', path: '/sponsor/offerta/proposte' }
        ]
      },
      {
        id: 'spo-acc', label: 'Accordi',
        children: [
          { id: 'spo-acc-cas', label: 'Cash', path: '/sponsor/accordi/cash' },
          { id: 'spo-acc-ink', label: 'In-kind', path: '/sponsor/accordi/in-kind' },
          { id: 'spo-acc-mis', label: 'Misti', path: '/sponsor/accordi/misti' },
          { id: 'spo-acc-con', label: 'Contratti', path: '/sponsor/accordi/contratti' }
        ]
      },
      {
        id: 'spo-del', label: 'Delivery',
        children: [
          { id: 'spo-del-ben', label: 'Benefit', path: '/sponsor/delivery/benefit' },
          { id: 'spo-del-cal', label: 'Calendario', path: '/sponsor/delivery/calendario' },
          { id: 'spo-del-mat', label: 'Materiali', path: '/sponsor/delivery/materiali' },
          { id: 'spo-del-ful', label: 'Benefit Fulfilment', path: '/sponsor/delivery/fulfilment' }
        ]
      },
      {
        id: 'spo-per', label: 'Performance',
        children: [
          { id: 'spo-per-rev', label: 'Sponsorship Revenue', path: '/sponsor/performance/revenue' },
          { id: 'spo-per-val', label: 'Pipeline Value', path: '/sponsor/performance/value' },
          { id: 'spo-per-wei', label: 'Weighted Pipeline', path: '/sponsor/performance/weighted' },
          { id: 'spo-per-con', label: 'Conversion Rate', path: '/sponsor/performance/conversion' },
          { id: 'spo-per-ren', label: 'Renewal Rate', path: '/sponsor/performance/renewal' },
          { id: 'spo-per-conc', label: 'Sponsor Concentration', path: '/sponsor/performance/concentration' },
          { id: 'spo-per-avo', label: 'Cost Avoidance', path: '/sponsor/performance/avoidance' },
          { id: 'spo-per-gap', label: 'Sponsorship Gap Analysis', path: '/sponsor/performance/gap' }
        ]
      }
    ]
  },
  {
    id: 'pubblico', label: 'PUBBLICO', icon: '🎟️',
    children: [
      { id: 'pub-pre', label: 'Presenze', path: '/pubblico/presenze' },
      { id: 'pub-pro', label: 'Profilo', path: '/pubblico/profilo' },
      { id: 'pub-com', label: 'Comportamento', path: '/pubblico/comportamento' },
      { id: 'pub-esp', label: 'Esperienza', path: '/pubblico/esperienza' },
      { id: 'pub-fid', label: 'Fidelizzazione', path: '/pubblico/fidelizzazione' }
    ]
  },
  {
    id: 'comunicazione', label: 'COMUNICAZIONE', icon: '📢',
    children: [
      { id: 'com-cam', label: 'Campagne', path: '/comunicazione/campagne' },
      { id: 'com-can', label: 'Canali', path: '/comunicazione/canali' },
      {
        id: 'com-con', label: 'Contenuti',
        children: [
          { id: 'com-con-fot', label: 'Foto', path: '/comunicazione/contenuti/foto' },
          { id: 'com-con-vid', label: 'Video', path: '/comunicazione/contenuti/video' },
          { id: 'com-con-cop', label: 'Copertura eventi', path: '/comunicazione/contenuti/copertura' },
          { id: 'com-con-arc', label: 'Archivio Media', path: '/comunicazione/contenuti/archivio' }
        ]
      },
      { id: 'com-per', label: 'Performance', path: '/comunicazione/performance' }
    ]
  },
  {
    id: 'sicurezza', label: 'SICUREZZA', icon: '🛡️',
    children: [
      { id: 'sic-rr', label: 'Risk Register', path: '/sicurezza/risk-register' },
      {
        id: 'sic-per', label: 'Persone',
        children: [
          { id: 'sic-per-cap', label: 'Capienza', path: '/sicurezza/persone/capienza' },
          { id: 'sic-per-flu', label: 'Flussi', path: '/sicurezza/persone/flussi' },
          { id: 'sic-per-eme', label: 'Emergenze', path: '/sicurezza/persone/emergenze' },
          { id: 'sic-per-ps', label: 'Primo Soccorso', path: '/sicurezza/persone/primo-soccorso' }
        ]
      },
      { id: 'sic-met', label: 'Meteo', path: '/sicurezza/meteo' },
      {
        id: 'sic-con', label: 'Continuità',
        children: [
          { id: 'sic-con-tri', label: 'Trigger', path: '/sicurezza/continuita/trigger' },
          { id: 'sic-con-pb', label: 'Piano B', path: '/sicurezza/continuita/piano-b' },
          { id: 'sic-con-cp', label: 'Contingency Planning', path: '/sicurezza/continuita/contingency' }
        ]
      }
    ]
  },
  {
    id: 'documenti', label: 'DOCUMENTI', icon: '📁',
    children: [
      { id: 'doc-arc', label: 'Archivio', path: '/documenti/archivio' },
      { id: 'doc-con', label: 'Contratti', path: '/documenti/contratti' },
      {
        id: 'doc-comp', label: 'Compliance',
        children: [
          { id: 'doc-comp-aut', label: 'Autorizzazioni', path: '/documenti/compliance/autorizzazioni' },
          { id: 'doc-comp-ass', label: 'Assicurazioni', path: '/documenti/compliance/assicurazioni' },
          { id: 'doc-comp-pri', label: 'Privacy', path: '/documenti/compliance/privacy' },
          { id: 'doc-comp-sic', label: 'Sicurezza', path: '/documenti/compliance/sicurezza' },
          { id: 'doc-comp-som', label: 'Somministrazione', path: '/documenti/compliance/somministrazione' },
          { id: 'doc-comp-sca', label: 'Scadenze', path: '/documenti/compliance/scadenze' }
        ]
      }
    ]
  },
  {
    id: 'report', label: 'REPORT', icon: '📈',
    children: [
      { id: 'rep-fes', label: 'Festival', path: '/report/festival' },
      { id: 'rep-ass', label: 'Associazione', path: '/report/associazione' },
      { id: 'rep-sos', label: 'Sostenibilità', path: '/report/sostenibilita' },
      {
        id: 'rep-sto', label: 'Storico',
        children: [
          { id: 'rep-sto-con', label: 'Confronto Edizioni', path: '/report/storico/confronto' },
          { id: 'rep-sto-for', label: 'Forecast Accuracy', path: '/report/storico/forecast' },
          { id: 'rep-sto-ll', label: 'Lessons Learned', path: '/report/storico/lessons' },
          { id: 'rep-sto-dl', label: 'Decision Log', path: '/report/storico/decision-log' }
        ]
      }
    ]
  },
  {
    id: 'impostazioni', label: 'IMPOSTAZIONI', icon: '⚙️',
    children: [
      { id: 'imp-ass', label: 'Associazione', path: '/impostazioni/associazione' },
      { id: 'imp-pro', label: 'Progetti', path: '/impostazioni/progetti' },
      { id: 'imp-edi', label: 'Edizioni', path: '/impostazioni/edizioni' },
      { id: 'imp-ute', label: 'Utenti', path: '/impostazioni/utenti' },
      { id: 'imp-rue', label: 'Ruoli e Permessi', path: '/impostazioni/ruoli' },
      { id: 'imp-are', label: 'Aree Operative', path: '/impostazioni/aree' },
      { id: 'imp-reg', label: 'Regole DSS', path: '/impostazioni/regole' },
      { id: 'imp-sog', label: 'Soglie e Alert', path: '/impostazioni/soglie' },
      { id: 'imp-mod', label: 'Modelli', path: '/impostazioni/modelli' },
      { id: 'imp-exp', label: 'Import / Export', path: '/impostazioni/export' }
    ]
  }
]

watchEffect(() => {
  const currentPath = route.path
  
  const checkActive = (items: MenuItem[], parentIds: string[]): boolean => {
    for (const item of items) {
      if (item.path === currentPath) {
        parentIds.forEach(id => openMenus.value[id] = true)
        return true
      }
      if (item.children && checkActive(item.children, [...parentIds, item.id])) {
        return true
      }
    }
    return false
  }
  
  checkActive(menuData, [])
})
</script>

<template>
  <aside class="sidebar">
    <!-- Header Logo -->
    <div class="logo-container">
      <h2 class="logo-title">deda</h2>
      <span class="logo-subtitle">DSS SYSTEM</span>
      
      <div class="edition-selector">
        <select class="select-edition">
          <option>Edizione 2026</option>
          <option>Edizione 2025</option>
        </select>
      </div>
    </div>

    <!-- Navigazione Multi-Livello -->
    <nav class="nav-menu">
      <RouterLink to="/" class="nav-item root-item" :class="{ active: route.path === '/' }">
        <span class="icon">🏠</span>
        <span class="fw-bold" >Home</span>
      </RouterLink>

      <!-- LIVELLO 1: Categorie Principali -->
      <div v-for="l1 in menuData" :key="l1.id" class="menu-group">
        
        <!-- Toggle L1 -->
        <div class="nav-item root-item" @click="toggleMenu(l1.id)">
          <div class="item-content">
            <span class="icon">{{ l1.icon }}</span>
            <span class="fw-bold">{{ l1.label }}</span>
          </div>
          <span class="arrow">{{ openMenus[l1.id] ? '▾' : '▸' }}</span>
        </div>

        <!-- LIVELLO 2 -->
        <div v-if="openMenus[l1.id]" class="submenu-l2">
          <div v-for="l2 in l1.children" :key="l2.id">
            
            <!-- Se ha figli (Livello 3) -->
            <template v-if="l2.children && l2.children.length > 0">
              <div class="nav-item l2-item" @click="toggleMenu(l2.id)">
                <span>{{ l2.label }}</span>
                <span class="arrow">{{ openMenus[l2.id] ? '▾' : '▸' }}</span>
              </div>
              
              <!-- LIVELLO 3 -->
              <div v-if="openMenus[l2.id]" class="submenu-l3">
                <template v-for="l3 in l2.children" :key="l3.id">
                  
                  <!-- Se ha figli (Livello 4) -->
                  <template v-if="l3.children && l3.children.length > 0">
                    <div class="nav-item l3-item" @click="toggleMenu(l3.id)">
                      <span>{{ l3.label }}</span>
                      <span class="arrow">{{ openMenus[l3.id] ? '▾' : '▸' }}</span>
                    </div>

                    <!-- LIVELLO 4 -->
                    <div v-if="openMenus[l3.id]" class="submenu-l4">
                      <RouterLink 
                        v-for="l4 in l3.children" 
                        :key="l4.id" 
                        :to="getPath(l4.path)" 
                        class="nav-item l4-item" 
                        :class="{ active: route.path === l4.path }"
                      >
                        {{ l4.label }}
                      </RouterLink>
                    </div>
                  </template>

                  <!-- Link Diretto L3 -->
                  <template v-else>
                    <RouterLink 
                      :to="getPath(l3.path)" 
                      class="nav-item l3-item" 
                      :class="{ active: route.path === l3.path }"
                    >
                      {{ l3.label }}
                    </RouterLink>
                  </template>
                </template>
              </div>
            </template>
            
            <!-- Altrimenti Link Diretto L2 -->
            <template v-else>
              <RouterLink 
                :to="getPath(l2.path)" 
                class="nav-item l2-item" 
                :class="{ active: route.path === l2.path }"
              >
                {{ l2.label }}
              </RouterLink>
            </template>
            
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
/* BASE STYLES */
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: var(--sidebar-bg, #1e293b);
  color: var(--sidebar-text, #f8fafc);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, sans-serif;
}

/* HEADER */
.logo-container { padding: 24px 20px 16px 20px; }
.logo-title { font-size: 1.8rem; font-weight: 800; margin: 0; letter-spacing: -1px; }
.logo-subtitle { font-size: 0.7rem; color: var(--sidebar-text-muted, #94a3b8); letter-spacing: 1px; display: block; margin-top: 2px;}
.edition-selector { margin-top: 16px; }
.select-edition { width: 100%; padding: 8px 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background-color: rgba(0,0,0,0.2); color: white; font-size: 0.85rem; outline: none; cursor: pointer; }

/* NAV CONTAINER */
.nav-menu { 
  flex: 1; 
  padding: 0 12px 20px 12px; 
  display: flex; 
  flex-direction: column; 
  gap: 2px; 
  overflow-y: auto; 
}

/* SCROLLBAR CUSTOM */
.nav-menu::-webkit-scrollbar { width: 6px; }
.nav-menu::-webkit-scrollbar-track { background: transparent; }
.nav-menu::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }

/* VOCI DI MENU GENERICHE */
.nav-item { 
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  color: var(--sidebar-text-muted, #94a3b8); 
  text-decoration: none; 
  border-radius: 6px; 
  font-size: 0.85rem; 
  transition: background-color 0.2s, color 0.2s; 
  cursor: pointer; 
}
.nav-item:hover { background-color: rgba(255, 255, 255, 0.05); color: white; }
.nav-item.active { background-color: var(--color-primary, #2563eb); color: white; font-weight: 600; }
.item-content { display: flex; align-items: center; gap: 10px; }
.icon { font-size: 1rem; width: 20px; text-align: center; }
.arrow { font-size: 0.75rem; opacity: 0.6; }
.fw-bold { font-weight: 700; font-size: 0.8rem; letter-spacing: 0.5px; }

/* GERARCHIA */
.menu-group { margin-bottom: 2px; }

/* L1 */
.root-item { padding: 10px 12px; }

/* L2 */
.submenu-l2 { display: flex; flex-direction: column; gap: 1px; padding-left: 28px; margin-top: 2px; border-left: 1px solid rgba(255,255,255,0.05); margin-left: 20px; }
.l2-item { padding: 8px 12px; font-size: 0.82rem; }
.l2-item.active { border-left: 3px solid #60a5fa; border-radius: 0 6px 6px 0; }

/* L3 */
.submenu-l3 { display: flex; flex-direction: column; gap: 1px; padding-left: 16px; margin-top: 1px; border-left: 1px solid rgba(255,255,255,0.05); margin-left: 10px;}
.l3-item { padding: 7px 12px; font-size: 0.78rem; opacity: 0.9; }
.l3-item.active { background-color: rgba(37, 99, 235, 0.3); color: white; }

/* L4 */
.submenu-l4 { display: flex; flex-direction: column; gap: 1px; padding-left: 14px; margin-top: 1px; border-left: 1px solid rgba(255,255,255,0.05); margin-left: 10px;}
.l4-item { padding: 6px 12px; font-size: 0.75rem; opacity: 0.8; }
.l4-item.active { font-weight: bold; color: #93c5fd; }
</style>