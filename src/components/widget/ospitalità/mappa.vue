<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useHospitalityStore } from '@/stores/hospitalityStore'
import type { LocationPoint } from '@/types/hospitality'

const store = useHospitalityStore()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markerGroup: L.LayerGroup | null = null

// ============================================================
// Stato Form Aggiunta Alloggio
// ============================================================

const showLocationForm = ref(false)
const isPickingCoordinates = ref(false)

// Centro di fallback utilizzato solo se non esistono alloggi
const DEFAULT_MAP_CENTER = {
  lat: 39.0500,
  lng: 16.3500
}

// Calcola automaticamente il centro geografico degli alloggi
const mapCenter = computed(() => {
  const locations = store.locations

  if (locations.length === 0) {
    return DEFAULT_MAP_CENTER
  }

  const lat =
    locations.reduce((sum, location) => sum + location.lat, 0) /
    locations.length

  const lng =
    locations.reduce((sum, location) => sum + location.lng, 0) /
    locations.length

  return {
    lat,
    lng
  }
})

const newLocation = ref<Omit<LocationPoint, 'id'>>({
  name: '',
  address: '',
  lat: mapCenter.value.lat,
  lng: mapCenter.value.lng,
  notes: ''
})

// ============================================================
// Filtri Tabella
// ============================================================

const searchQuery = ref('')
const selectedLocationFilter = ref('')
const selectedTypeFilter = ref<'all' | 'guest' | 'volunteer'>('all')

// ============================================================
// Generazione Icona Marker SVG colorata
// ============================================================

const createCustomPin = (colorHex: string) => {
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="
        background-color: ${colorHex};
        width: 26px;
        height: 26px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0 3px 6px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: #ffffff;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24]
  })
}

const getColorHex = (locationId: string): string => {
  const type = store.getMarkerColor(locationId)

  switch (type) {
    case 'purple':
      return '#8b5cf6' // Solo Volontari
    case 'orange':
      return '#f97316' // Solo Ospiti
    case 'blue':
      return '#2563eb' // Entrambi
    default:
      return '#64748b' // Vuoto
  }
}

// ============================================================
// Adatta la mappa automaticamente a tutti gli alloggi
// ============================================================

const fitMapToLocations = () => {
  if (!map || store.locations.length === 0) return

  const bounds = L.latLngBounds(
    store.locations.map(
      location => [location.lat, location.lng] as [number, number]
    )
  )

  map.fitBounds(bounds, {
    padding: [50, 50],
    maxZoom: 13
  })
}

// ============================================================
// Inizializzazione Mappa Leaflet
// ============================================================

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView(
    [mapCenter.value.lat, mapCenter.value.lng],
    10
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  markerGroup = L.layerGroup().addTo(map)

  // Clic sulla mappa per catturare coordinate
  map.on('click', (e: L.LeafletMouseEvent) => {
    if (isPickingCoordinates.value) {
      newLocation.value.lat = Number(e.latlng.lat.toFixed(6))
      newLocation.value.lng = Number(e.latlng.lng.toFixed(6))
      isPickingCoordinates.value = false
    }
  })

  renderMarkers()
  fitMapToLocations()
})

// ============================================================
// Rendering Marker
// ============================================================

const renderMarkers = () => {
  if (!markerGroup || !map) return

  markerGroup.clearLayers()

  store.locations.forEach(loc => {
    const occupants = store.getOccupants(loc.id)
    const colorHex = getColorHex(loc.id)
    const icon = createCustomPin(colorHex)

    let popupHTML = `
      <div style="font-family: system-ui; min-width: 180px;">
        <h4 style="margin: 0 0 4px 0; color: #0f172a;">
          ${loc.name}
        </h4>

        <p style="
          margin: 0 0 8px 0;
          font-size: 0.8rem;
          color: #64748b;
        ">
          ${loc.address || 'Nessun indirizzo'}
        </p>

        <div style="
          font-size: 0.85rem;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
        ">
          <strong>
            Occupanti totali: ${occupants.totalPeopleCount}
          </strong>
    `

    if (occupants.guests.length > 0) {
      popupHTML += `
        <br/>
        <span style="color: #f97316;">
          • Ospiti:
          ${occupants.guests
            .map(g => `${g.firstName} ${g.lastName}`)
            .join(', ')}
        </span>
      `
    }

    if (occupants.volunteers.length > 0) {
      popupHTML += `
        <br/>
        <span style="color: #8b5cf6;">
          • Volontari:
          ${occupants.volunteers
            .map(v => `${v.firstName} ${v.lastName}`)
            .join(', ')}
        </span>
      `
    }

    popupHTML += `
        </div>
      </div>
    `

    const marker = L
      .marker([loc.lat, loc.lng], { icon })
      .bindPopup(popupHTML)

    markerGroup?.addLayer(marker)
  })
}

// ============================================================
// Aggiornamento automatico della mappa
// ============================================================

watch(
  () => [store.locations, store.guests, store.volunteers],
  () => {
    renderMarkers()
    fitMapToLocations()
  },
  { deep: true }
)

// ============================================================
// Salvataggio nuovo alloggio
// ============================================================

const handleSaveLocation = () => {
  if (
    !newLocation.value.name ||
    newLocation.value.lat === null ||
    newLocation.value.lng === null
  ) {
    return
  }

  store.addLocation(newLocation.value)

  // Dopo aver aggiunto l'alloggio,
  // il centro verrà automaticamente ricalcolato
  // attraverso store.locations.

  newLocation.value = {
    name: '',
    address: '',
    lat: mapCenter.value.lat,
    lng: mapCenter.value.lng,
    notes: ''
  }

  isPickingCoordinates.value = false
  showLocationForm.value = false

  // Aggiorna immediatamente la visualizzazione
  setTimeout(() => {
    fitMapToLocations()
  }, 0)
}

// ============================================================
// Lista filtrata di tutti gli occupanti per la tabella
// ============================================================

const filteredOccupants = computed(() => {
  const result: Array<{
    id: string
    type: 'Ospite' | 'Volontario'
    name: string
    phone: string
    provenance: string
    locationName: string
    locationId: string
    dates: string
    details: string
  }> = []

  // ============================================================
  // Includi Ospiti
  // ============================================================

  if (
    selectedTypeFilter.value === 'all' ||
    selectedTypeFilter.value === 'guest'
  ) {
    store.guests.forEach(g => {
      const loc = store.locations.find(
        l => l.id === g.locationId
      )

      const subCount = g.subPeople?.length || 0

      result.push({
        id: g.id,
        type: 'Ospite',
        name: `${g.firstName} ${g.lastName}`,
        phone: g.phone,
        provenance: g.provenance || '-',
        locationName: loc?.name || 'Non assegnato',
        locationId: g.locationId,
        dates: `${g.arrivalDate} ➔ ${g.departureDate}`,
        details:
          subCount > 0
            ? `+${subCount} staff (${g.subPeople
                ?.map(s => s.firstName)
                .join(', ')})`
            : 'Singolo'
      })
    })
  }

  // ============================================================
  // Includi Volontari
  // ============================================================

  if (
    selectedTypeFilter.value === 'all' ||
    selectedTypeFilter.value === 'volunteer'
  ) {
    store.volunteers.forEach(v => {
      const loc = store.locations.find(
        l => l.id === v.locationId
      )

      result.push({
        id: v.id,
        type: 'Volontario',
        name: `${v.firstName} ${v.lastName}`,
        phone: v.phone,
        provenance: v.provenance,
        locationName: loc?.name || 'Non assegnato',
        locationId: v.locationId,
        dates: `${v.arrivalDate} ➔ ${v.departureDate}`,
        details: v.hasExperience
          ? 'Con esperienza'
          : 'Prima volta'
      })
    })
  }

  // ============================================================
  // Applicazione filtri
  // ============================================================

  return result.filter(item => {
    const query = searchQuery.value.toLowerCase()

    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.provenance.toLowerCase().includes(query) ||
      item.phone.includes(searchQuery.value)

    const matchesLocation =
      !selectedLocationFilter.value ||
      item.locationId === selectedLocationFilter.value

    return matchesSearch && matchesLocation
  })
})
</script>

<template>
  <div class="hospitality-container">

    <!-- Header e Legenda Mappa -->
    <div class="top-bar">
      <div>
        <h2 class="widget-title">
          Mappa & Alloggi Staff
        </h2>

        <p class="widget-desc">
          Gestione Punti Alloggio, mappa interattiva ed elenco occupanti.
        </p>
      </div>

      <button
        @click="showLocationForm = !showLocationForm"
        class="btn-primary"
      >
        {{ showLocationForm ? '✕ Chiudi Form' : '➕ Nuovo Alloggio' }}
      </button>
    </div>

    <!-- Form Inserimento Nuovo Alloggio -->
    <div
      v-if="showLocationForm"
      class="location-form-card"
    >
      <h3>Aggiungi Nuovo Punto Alloggio</h3>

      <form
        @submit.prevent="handleSaveLocation"
        class="form-grid"
      >
        <input
          v-model="newLocation.name"
          placeholder="Nome Alloggio (es. Hotel Roma) *"
          required
        />

        <input
          v-model="newLocation.address"
          placeholder="Indirizzo completo"
        />

        <div class="coords-group">

          <input
            v-model.number="newLocation.lat"
            type="number"
            step="any"
            placeholder="Latitudine *"
            required
          />

          <input
            v-model.number="newLocation.lng"
            type="number"
            step="any"
            placeholder="Longitudine *"
            required
          />

          <button
            type="button"
            @click="isPickingCoordinates = true"
            class="btn-pick"
            :class="{ active: isPickingCoordinates }"
          >
            {{
              isPickingCoordinates
                ? '📍 Clicca sulla Mappa...'
                : '🗺️ Seleziona da Mappa'
            }}
          </button>

        </div>

        <input
          v-model="newLocation.notes"
          placeholder="Note (es. Camerate 4 posti, referente)"
        />

        <button
          type="submit"
          class="btn-save"
        >
          Salva Alloggio
        </button>
      </form>
    </div>

    <!-- Sezione Mappa Interattiva -->
    <div class="map-section">

      <div class="legend-bar">

        <div class="legend-item">
          <span class="badge purple"></span>
          Solo Volontari
        </div>

        <div class="legend-item">
          <span class="badge orange"></span>
          Solo Ospiti
        </div>

        <div class="legend-item">
          <span class="badge blue"></span>
          Entrambi
        </div>

        <div class="legend-item">
          <span class="badge gray"></span>
          Vuoto
        </div>

      </div>

      <div
        ref="mapContainer"
        class="leaflet-map-wrapper"
      ></div>

    </div>

    <!-- Sezione Tabelle e Filtri Occupanti -->
    <div class="table-section">

      <div class="table-header">

        <h3>
          Elenco Occupanti e Assegnazioni Alloggi
        </h3>

        <!-- Barra Filtri -->
        <div class="filters-bar">

          <input
            v-model="searchQuery"
            placeholder="🔍 Cerca nome, città, tel..."
            class="input-search"
          />

          <select
            v-model="selectedLocationFilter"
            class="select-filter"
          >
            <option value="">
              Tutti gli Alloggi
            </option>

            <option
              v-for="loc in store.locations"
              :key="loc.id"
              :value="loc.id"
            >
              {{ loc.name }}
            </option>
          </select>

          <select
            v-model="selectedTypeFilter"
            class="select-filter"
          >
            <option value="all">
              Tutte le tipologie
            </option>

            <option value="guest">
              Solo Ospiti
            </option>

            <option value="volunteer">
              Solo Volontari
            </option>
          </select>

        </div>
      </div>

      <!-- Tabella Dati -->
      <table class="data-table">

        <thead>
          <tr>
            <th>Tipologia</th>
            <th>Nome & Cognome</th>
            <th>Telefono</th>
            <th>Provenienza</th>
            <th>Alloggio Assegnato</th>
            <th>Date Soggiorno</th>
            <th>Dettagli / Staff</th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="row in filteredOccupants"
            :key="row.id"
          >
            <td>
              <span
                :class="[
                  'type-pill',
                  row.type === 'Ospite'
                    ? 'pill-orange'
                    : 'pill-purple'
                ]"
              >
                {{ row.type }}
              </span>
            </td>

            <td class="font-bold">
              {{ row.name }}
            </td>

            <td>
              {{ row.phone }}
            </td>

            <td>
              {{ row.provenance }}
            </td>

            <td class="font-bold text-blue">
              {{ row.locationName }}
            </td>

            <td class="text-sm">
              {{ row.dates }}
            </td>

            <td class="text-sm text-gray">
              {{ row.details }}
            </td>
          </tr>

          <tr v-if="filteredOccupants.length === 0">
            <td
              colspan="7"
              class="empty-state"
            >
              Nessun occupante trovato con i filtri selezionati.
            </td>
          </tr>

        </tbody>
      </table>

    </div>

  </div>
</template>

<style scoped>
.hospitality-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.widget-title {
  margin: 0;
  font-size: 1.4rem;
  color: #0f172a;
}

.widget-desc {
  margin: 4px 0 0 0;
  font-size: 0.85rem;
  color: #64748b;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

/* Form Alloggio */

.location-form-card {
  background: white;
  padding: 18px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.coords-group {
  display: flex;
  gap: 8px;
}

.form-grid input {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  flex: 1;
}

.btn-pick {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-pick.active {
  background: #fef08a;
  border-color: #eab308;
}

.btn-save {
  background: #16a34a;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

/* Mappa */

.map-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.legend-bar {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.85rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.badge.purple {
  background: #8b5cf6;
}

.badge.orange {
  background: #f97316;
}

.badge.blue {
  background: #2563eb;
}

.badge.gray {
  background: #64748b;
}

.leaflet-map-wrapper {
  height: 400px;
  width: 100%;
}

/* Tabella e Filtri */

.table-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.filters-bar {
  display: flex;
  gap: 10px;
}

.input-search,
.select-filter {
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.data-table th {
  background: #f8fafc;
  color: #475569;
}

.type-pill {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.pill-orange {
  background: #ffedd5;
  color: #c2410c;
}

.pill-purple {
  background: #f3e8ff;
  color: #6b21a8;
}

.font-bold {
  font-weight: 600;
}

.text-blue {
  color: #2563eb;
}

.text-sm {
  font-size: 0.8rem;
}

.text-gray {
  color: #64748b;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 24px 0;
}
</style>