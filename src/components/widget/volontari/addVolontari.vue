<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHospitalityStore } from '@/stores/hospitalityStore'
import type { Volunteer } from '@/types/hospitality'

const hospitalityStore = useHospitalityStore()

const formData = ref<Omit<Volunteer, 'id'>>({
  firstName: '',
  lastName: '',
  phone: '',
  provenance: '',
  arrivalDate: '',
  departureDate: '',
  locationId: '',
  availableDays: [],
  hasExperience: false
})

// Gestione Calendario per Disponibilità (Di default impostato a Settembre 2025 per il Festival)
const currentDate = ref(new Date(2025, 8, 1)) // 1 Settembre 2025

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7 // Lunedì = 0
  const totalDays = new Date(year, month + 1, 0).getDate()

  const days: Array<{ dayNumber: number | null; dateStr: string }> = []

  // Pad giorni vuoti all'inizio mese
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ dayNumber: null, dateStr: '' })
  }

  // Giorni effettivi del mese
  for (let d = 1; d <= totalDays; d++) {
    const monthFormatted = String(month + 1).padStart(2, '0')
    const dayFormatted = String(d).padStart(2, '0')
    const dateStr = `${year}-${monthFormatted}-${dayFormatted}`
    days.push({ dayNumber: d, dateStr })
  }

  return days
})

// Tasto avanti e indietro mese
const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

// Toggle selezione data nel giorno cliccato
const toggleDay = (dateStr: string) => {
  if (!dateStr) return
  const index = formData.value.availableDays.indexOf(dateStr)
  if (index === -1) {
    formData.value.availableDays.push(dateStr)
  } else {
    formData.value.availableDays.splice(index, 1)
  }
}

const isDaySelected = (dateStr: string) => {
  return formData.value.availableDays.includes(dateStr)
}

// Format della data da YYYY-MM-DD a GG/MM/AAAA
const formatDateToIT = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

const sortedAvailableDays = computed(() => {
  return [...formData.value.availableDays].sort()
})

const handleSubmit = () => {
  const newVolunteer: Volunteer = {
    ...formData.value,
    id: 'vol-' + Date.now()
  }
  hospitalityStore.addVolunteer(newVolunteer)
  alert('Volontario registrato con successo!')

  // Reset form
  formData.value = {
    firstName: '',
    lastName: '',
    phone: '',
    provenance: '',
    arrivalDate: '',
    departureDate: '',
    locationId: '',
    availableDays: [],
    hasExperience: false
  }
}
</script>

<template>
  <div class="form-container">
    <div class="form-header">
      <h2>Aggiungi Volontario</h2>
      <p>Compila i dati anagrafici e seleziona i giorni di disponibilità sul calendario.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="volunteer-form">
      <!-- Anagrafica -->
      <div class="form-row">
        <input v-model="formData.firstName" placeholder="Nome *" required />
        <input v-model="formData.lastName" placeholder="Cognome *" required />
      </div>

      <div class="form-row">
        <input v-model="formData.phone" type="tel" placeholder="Telefono *" required />
        <input v-model="formData.provenance" placeholder="Città di provenienza *" required />
      </div>

      <!-- Alloggio -->
      <div class="form-row">
        <select v-model="formData.locationId" required>
          <option value="" disabled selected>Seleziona Alloggio / Punto di Riferimento *</option>
          <option v-for="loc in hospitalityStore.locations" :key="loc.id" :value="loc.id">
            {{ loc.name }}
          </option>
        </select>
      </div>

      <!-- Date di viaggio opzionali per chi viaggia -->
      <div class="optional-dates-box">
        <p class="box-title">Date di Arrivo e Partenza <span class="badge-optional">(Opzionale per persone del posto)</span></p>
        <div class="form-row">
          <label>
            Arrivo:
            <input v-model="formData.arrivalDate" type="date" />
          </label>
          <label>
            Partenza:
            <input v-model="formData.departureDate" type="date" />
          </label>
        </div>
      </div>

      <!-- Calendario Disponibilità -->
      <div class="calendar-section">
        <p class="section-label">Giorni di disponibilità selezionati (clicca sulle date per spuntarle):</p>

        <div class="calendar-card">
          <!-- Navigation Bar Mese -->
          <div class="calendar-header">
            <button type="button" @click="prevMonth" class="btn-nav">◀</button>
            <span class="month-title">{{ currentMonthName }}</span>
            <button type="button" @click="nextMonth" class="btn-nav">▶</button>
          </div>

          <!-- Giorni della settimana -->
          <div class="weekdays-grid">
            <span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span>
          </div>

          <!-- Griglia Giorni Mese -->
          <div class="days-grid">
            <div
              v-for="(day, idx) in daysInMonth"
              :key="idx"
              class="day-cell"
              :class="{
                'empty': !day.dayNumber,
                'selected': isDaySelected(day.dateStr)
              }"
              @click="toggleDay(day.dateStr)"
            >
              {{ day.dayNumber }}
            </div>
          </div>
        </div>

        <!-- Riepilogo Date Selezionate -->
        <div class="selected-summary" v-if="sortedAvailableDays.length > 0">
          <strong>Date spuntate ({{ sortedAvailableDays.length }}):</strong>
          <div class="chips-container">
            <span v-for="date in sortedAvailableDays" :key="date" class="date-chip">
              {{ formatDateToIT(date) }}
              <button type="button" @click="toggleDay(date)" class="btn-chip-remove">✕</button>
            </span>
          </div>
        </div>
        <p v-else class="no-days-alert">Nessun giorno di disponibilità ancora selezionato.</p>
      </div>

      <!-- Esperienza pregressa -->
      <div class="checkbox-single">
        <label>
          <input type="checkbox" v-model="formData.hasExperience" />
          Ha già esperienza in altre edizioni / festival
        </label>
      </div>

      <button type="submit" class="btn-submit">Salva Volontario</button>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  background: var(--bg-surface);
  padding: 24px;
  border-radius: 8px;
  max-width: 650px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-header h2 {
  margin: 0;
  color: var(--text-heading);
}

.form-header p {
  margin: 4px 0 20px 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.volunteer-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row input, .form-row select {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
}

.optional-dates-box {
  background: var(--bg-subtle);
  padding: 12px;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
}

.box-title {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-body);
}

.badge-optional {
  font-size: 0.75rem;
  font-weight: normal;
  color: var(--text-muted);
}

/* Calendario */
.calendar-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  background: var(--bg-surface);
}

.month-title {
  font-weight: 700;
  text-transform: capitalize;
  color: var(--text-subheading);
}

.btn-nav {
  background: var(--bg-page);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  transition: all 0.15s ease;
}

.day-cell:hover:not(.empty) {
  background: var(--bg-hover);
}

.day-cell.selected {
  background: var(--color-success);
  color: #ffffff;
  font-weight: bold;
  border-color: var(--color-success-hover);
}

.date-chip {
  background: var(--color-success-bg);
  color: var(--color-success-hover);
  border: 1px solid var(--color-success-border);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-submit {
  background: var(--color-success);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.btn-submit:hover {
  background: var(--color-success-hover);
}
</style>