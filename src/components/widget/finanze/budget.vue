<script setup lang="ts">
import { ref, computed } from 'vue'

// --- MOCK DATA E STATO ---
const lastUpdate = '24/08/2026 09:00'

// Valori globali di sintesi (es. Totale Costi Festival)
const budgetApprovato = ref(150000)
const budgetAggiornato = ref(158000)
const actual = ref(65000)
const impegnatoDaSostenere = ref(45000) // Impegni futuri (non comprende gli actual)
const etc = ref(52000) // Estimate To Complete

// Storico Revisioni (per il Widget Budget Aggiornato)
const showHistory = ref(false)
const revisionHistory = ref([
  { v: 'V3', date: '10/08/2026', user: 'Mario R.', reason: 'Aumento cachet headliner', old: 155000, new: 158000 },
  { v: 'V2', date: '15/06/2026', user: 'Anna B.', reason: 'Aggiunta service palco B', old: 150000, new: 155000 },
  { v: 'V1', date: '01/01/2026', user: 'Mario R.', reason: 'Approvazione iniziale', old: 0, new: 150000 }
])

// Aree di Budget
const areeBudget = ref([
  { id: 1, nome: 'Produzione Artistica', budget: 70000, actual: 35000, impegnato: 20000, forecast: 75000 },
  { id: 2, nome: 'Logistica & Alloggi', budget: 30000, actual: 12000, impegnato: 18000, forecast: 31000 },
  { id: 3, nome: 'Comunicazione', budget: 25000, actual: 15000, impegnato: 5000, forecast: 22000 },
  { id: 4, nome: 'Sicurezza & Permessi', budget: 33000, actual: 3000, impegnato: 2000, forecast: 33000 }
])

// --- CALCOLI DERIVATI (LOGICA DSS) ---

// Widget: Impegnato (Actual + Impegni futuri)
const committedCost = computed(() => actual.value + impegnatoDaSostenere.value)

// Widget: Forecast EAC (Actual + ETC)
const forecastEAC = computed(() => actual.value + etc.value)

// Widget: Budget Residuo
const residuoContabile = computed(() => budgetAggiornato.value - actual.value)
const residuoDisponibile = computed(() => budgetAggiornato.value - committedCost.value) // Disponibile reale

// Widget: Varianza Globale
const varianzaAssoluta = computed(() => forecastEAC.value - budgetAggiornato.value)
const varianzaPerc = computed(() => ((varianzaAssoluta.value / budgetAggiornato.value) * 100).toFixed(1))

// Helper per formattazione valuta
const formatEur = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)

// Widget: Variance Analysis (Materialità economica)
const varianceAlerts = computed(() => {
  return areeBudget.value.map(area => {
    const varAbs = area.forecast - area.budget
    const varPerc = (varAbs / area.budget) * 100
    // Calcolo Materialità: Consideriamo rilevante uno scostamento > 5% E > 2000€
    let impact = 'Basso'
    if (Math.abs(varAbs) > 3000 && Math.abs(varPerc) > 5) impact = 'Alto'
    else if (Math.abs(varAbs) > 1000) impact = 'Medio'
    
    return { ...area, varAbs, varPerc, impact }
  }).filter(v => v.impact !== 'Basso')
    .sort((a, b) => Math.abs(b.varAbs) - Math.abs(a.varAbs)) // Ordina per impatto economico assoluto
})
</script>

<template>
  <div class="budget-dashboard">
    <div class="header-section">
      <h2 class="page-title">Budget Overview</h2>
      <p class="subtitle">Analisi scostamenti e previsioni a finire (EAC)</p>
    </div>

    <!-- ROW 1: KPI WIDGETS -->
    <div class="kpi-grid">
      
      <!-- 1. BUDGET APPROVATO -->
      <div class="kpi-card" title="Baseline economica utilizzata per misurare gli scostamenti successivi.">
        <span class="kpi-label">Budget Approvato (Baseline) ℹ️</span>
        <span class="kpi-value text-muted">{{ formatEur(budgetApprovato) }}</span>
      </div>

      <!-- 2. BUDGET AGGIORNATO -->
      <div class="kpi-card relative">
        <div class="flex-between">
          <span class="kpi-label">Budget Aggiornato</span>
          <button @click="showHistory = !showHistory" class="btn-icon-small">⏱️ Storico</button>
        </div>
        <span class="kpi-value">{{ formatEur(budgetAggiornato) }}</span>
        
        <!-- Popover Storico -->
        <div v-if="showHistory" class="history-popover">
          <div v-for="rev in revisionHistory" :key="rev.v" class="history-item">
            <div class="hist-header"><strong>{{ rev.v }}</strong> - {{ rev.date }} ({{ rev.user }})</div>
            <div class="hist-reason">{{ rev.reason }}</div>
            <div class="hist-values">{{ formatEur(rev.old) }} ➔ <strong>{{ formatEur(rev.new) }}</strong></div>
          </div>
        </div>
      </div>

      <!-- 3. ACTUAL -->
      <div class="kpi-card">
        <span class="kpi-label">Actual (Contabilizzato)</span>
        <span class="kpi-value text-primary">{{ formatEur(actual) }}</span>
        <span class="kpi-subtext">Aggiornato al: {{ lastUpdate }}</span>
      </div>

      <!-- 4. IMPEGNATO -->
      <div class="kpi-card">
        <span class="kpi-label">Impegnato (Committed)</span>
        <span class="kpi-value">{{ formatEur(committedCost) }}</span>
        <span class="kpi-subtext">Actual + Ordini/Contratti in essere</span>
      </div>

      <!-- 5. FORECAST EAC -->
      <div class="kpi-card">
        <span class="kpi-label">Forecast (EAC)</span>
        <span class="kpi-value text-bold">{{ formatEur(forecastEAC) }}</span>
        <span class="kpi-subtext">ETC calcolato: {{ formatEur(etc) }}</span>
      </div>

      <!-- 6. VARIANZA GLOBALE -->
      <div class="kpi-card" :class="varianzaAssoluta > 0 ? 'border-danger' : 'border-success'">
        <span class="kpi-label">Varianza (Forecast vs Budget)</span>
        <span class="kpi-value" :class="varianzaAssoluta > 0 ? 'text-danger' : 'text-success'">
          {{ varianzaAssoluta > 0 ? '+' : '' }}{{ formatEur(varianzaAssoluta) }} ({{ varianzaPerc }}%)
        </span>
        <span class="kpi-subtext">
          {{ varianzaAssoluta > 0 ? 'Sfavorevole (Over-budget)' : 'Favorevole (Under-budget)' }}
        </span>
      </div>

      <!-- 7. BUDGET RESIDUO (Doppia metrica) -->
      <div class="kpi-card span-2">
        <span class="kpi-label">Budget Residuo</span>
        <div class="dual-metric">
          <div class="metric-box">
            <span class="metric-val">{{ formatEur(residuoContabile) }}</span>
            <span class="metric-lbl">Residuo Contabile (Bdgt - Actual)</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-box highlight">
            <span class="metric-val">{{ formatEur(residuoDisponibile) }}</span>
            <span class="metric-lbl">Residuo Disponibile per nuove spese</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ROW 2: DETTAGLI E ANALISI -->
    <div class="analysis-grid">
      
      <!-- 8. BUDGET PER AREA -->
      <div class="widget-panel col-span-2">
        <h3>Budget per Area (Drill-down)</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Area</th>
              <th class="text-right">Budget Agg.</th>
              <th class="text-right">Actual</th>
              <th class="text-right">Impegnato</th>
              <th class="text-right">Forecast EAC</th>
              <th class="text-right">Varianza</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="area in areeBudget" :key="area.id" class="clickable-row">
              <td class="font-bold">{{ area.nome }}</td>
              <td class="text-right">{{ formatEur(area.budget) }}</td>
              <td class="text-right">{{ formatEur(area.actual) }}</td>
              <td class="text-right">{{ formatEur(area.impegnato) }}</td>
              <td class="text-right">{{ formatEur(area.forecast) }}</td>
              <td class="text-right font-bold" :class="(area.forecast - area.budget) > 0 ? 'text-danger' : 'text-success'">
                {{ formatEur(area.forecast - area.budget) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 9. VARIANCE ANALYSIS (Smart DSS) -->
      <div class="widget-panel">
        <h3>Variance Analysis (Materialità)</h3>
        <p class="widget-desc">Scostamenti ordinati per reale impatto economico.</p>
        
        <div class="alert-list">
          <div v-for="alert in varianceAlerts" :key="alert.id" class="alert-item" :class="alert.impact === 'Alto' ? 'alert-high' : 'alert-med'">
            <div class="alert-header">
              <strong>{{ alert.nome }}</strong>
              <span class="badge" :class="alert.impact === 'Alto' ? 'bg-danger' : 'bg-warning'">Impatto {{ alert.impact }}</span>
            </div>
            <div class="alert-body">
              Varianza di <strong>{{ formatEur(alert.varAbs) }}</strong> ({{ alert.varPerc > 0 ? '+' : '' }}{{ alert.varPerc.toFixed(1) }}%).<br/>
              <span class="text-xs text-muted">Budget: {{ formatEur(alert.budget) }} | Forecast: {{ formatEur(alert.forecast) }}</span>
            </div>
          </div>
          <div v-if="varianceAlerts.length === 0" class="text-muted text-sm mt-2">
            Nessuno scostamento materiale rilevato.
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.budget-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.header-section .page-title { margin: 0; font-size: 1.5rem; color: var(--text-heading); }
.header-section .subtitle { margin: 4px 0 0 0; color: var(--text-muted); font-size: 0.9rem; }

/* Grid KPI */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
.kpi-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.kpi-card.span-2 { grid-column: span 2; }
.relative { position: relative; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }

.kpi-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; cursor: help; }
.kpi-value { font-size: 1.6rem; font-weight: 700; color: var(--text-heading); }
.kpi-subtext { font-size: 0.75rem; color: var(--text-subtle); }

.text-primary { color: var(--color-primary); }
.text-danger { color: var(--color-danger); }
.text-success { color: var(--color-success); }
.text-warning { color: #d97706; }
.text-muted { color: var(--text-muted); }
.text-bold { font-weight: 800; }
.border-danger { border-left: 4px solid var(--color-danger); }
.border-success { border-left: 4px solid var(--color-success); }

/* Storico Popover */
.btn-icon-small { background: #f1f5f9; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; cursor: pointer; }
.btn-icon-small:hover { background: #e2e8f0; }
.history-popover {
  position: absolute; top: 40px; right: 0; background: white; border: 1px solid var(--border-color); border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 12px; width: 280px; z-index: 10; display: flex; flex-direction: column; gap: 12px;
}
.history-item { font-size: 0.8rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
.history-item:last-child { border-bottom: none; padding-bottom: 0; }
.hist-reason { color: var(--text-muted); margin: 2px 0; }

/* Budget Residuo Dual Metric */
.dual-metric { display: flex; align-items: center; gap: 16px; margin-top: 8px; }
.metric-box { display: flex; flex-direction: column; gap: 4px; }
.metric-divider { width: 1px; height: 30px; background: var(--border-light); }
.metric-val { font-size: 1.3rem; font-weight: 700; color: var(--text-heading); }
.metric-lbl { font-size: 0.75rem; color: var(--text-muted); }
.metric-box.highlight .metric-val { color: var(--color-primary); font-size: 1.5rem; }
.metric-box.highlight .metric-lbl { color: var(--color-primary); font-weight: 600; }

/* Griglia Analisi */
.analysis-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
.widget-panel { background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.widget-panel h3 { margin: 0 0 16px 0; font-size: 1.1rem; color: var(--text-heading); }
.widget-desc { margin: -10px 0 16px 0; font-size: 0.8rem; color: var(--text-muted); }

/* Tabella Drill-down */
.data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.data-table th, .data-table td { padding: 12px; border-bottom: 1px solid var(--border-light); }
.data-table th { background: var(--bg-subtle); color: var(--text-muted); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
.text-right { text-align: right; }
.clickable-row { cursor: pointer; transition: background 0.2s; }
.clickable-row:hover { background: #f8fafc; }

/* Variance Alerts */
.alert-list { display: flex; flex-direction: column; gap: 12px; }
.alert-item { padding: 12px; border-radius: 6px; border-left: 4px solid; background: #f8fafc; }
.alert-high { border-left-color: var(--color-danger); background: #fef2f2; }
.alert-med { border-left-color: #f59e0b; background: #fffbeb; }
.alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 0.9rem; }
.alert-body { font-size: 0.85rem; color: var(--text-body); }
.badge { padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: white; }
.bg-danger { background: var(--color-danger); }
.bg-warning { background: #f59e0b; }
.text-xs { font-size: 0.75rem; }
</style>