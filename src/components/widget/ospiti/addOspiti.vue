<script setup lang="ts">
import { ref } from 'vue'
import { useHospitalityStore } from '@/stores/hospitalityStore'
import type { Guest } from '@/types/hospitality'

const hospitalityStore = useHospitalityStore()

const formData = ref<Omit<Guest, 'id'>>({
  firstName: '',
  lastName: '',
  phone: '',
  mail: '',
  provenance: '',
  arrivalDate: '',
  departureDate: '',
  locationId: '',
  cachet: 0,
  vatNumber: '',
  iban: '',
  subPeople: []
})

// Aggiungi una nuova sotto-persona
const addSubPerson = () => {
  if (!formData.value.subPeople) {
    formData.value.subPeople = []
  }
  formData.value.subPeople.push({
    id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    firstName: '',
    lastName: '',
    role: '',
    locationId: formData.value.locationId || '' // Imposta di default l'alloggio dell'ospite se inserito
  })
}

// Rimuovi sotto-persona
const removeSubPerson = (index: number) => {
  formData.value.subPeople?.splice(index, 1)
}

const handleSubmit = () => {
  const newGuest: Guest = {
    ...formData.value,
    id: 'guest-' + Date.now()
  }
  hospitalityStore.addGuest(newGuest)
  alert('Ospite e accompagnatori salvati con successo!')

  // Reset form
  formData.value = {
    firstName: '',
    lastName: '',
    phone: '',
    mail: '',
    provenance: '',
    arrivalDate: '',
    departureDate: '',
    locationId: '',
    cachet: 0,
    vatNumber: '',
    iban: '',
    subPeople: []
  }
}
</script>

<template>
  <div class="form-container">
    <div class="form-header">
      <h2>Aggiungi Ospite e Staff</h2>
      <p>Inserisci i dati dell'ospite principale e specifica l'alloggio dedicato per ciascun membro dello staff/accompagnatore.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="guest-form">
      <!-- Dati Ospite Principale -->
      <div class="section-title">Ospite Principale</div>
      
      <div class="form-row">
        <input v-model="formData.firstName" placeholder="Nome *" required />
        <input v-model="formData.lastName" placeholder="Cognome *" required />
      </div>

      <div class="form-row">
        <input v-model="formData.phone" type="tel" placeholder="Telefono *" required />
        <input v-model="formData.mail" type="email" placeholder="Email *" required />
      </div>

      <div class="form-row">
        <input v-model="formData.provenance" placeholder="Città di provenienza" />
        <select v-model="formData.locationId" required>
          <option value="" disabled selected>Alloggio Ospite Principale *</option>
          <option v-for="loc in hospitalityStore.locations" :key="loc.id" :value="loc.id">
            {{ loc.name }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <label class="field-group">
          <span>Data Arrivo *</span>
          <input v-model="formData.arrivalDate" type="date" required />
        </label>
        <label class="field-group">
          <span>Data Partenza *</span>
          <input v-model="formData.departureDate" type="date" required />
        </label>
      </div>

      <!-- Dati Amministrativi -->
      <div class="section-title">Dati Amministrativi</div>
      <div class="form-row">
        <input v-model.number="formData.cachet" type="number" step="0.01" placeholder="Cachet (€)" />
        <input v-model="formData.vatNumber" placeholder="Partita IVA" />
      </div>
      <div class="form-row">
        <input v-model="formData.iban" placeholder="IBAN" />
      </div>

      <!-- Sotto-Persone / Staff -->
      <div class="section-header-row">
        <div class="section-title">Membri dello Staff / Accompagnatori</div>
        <button type="button" @click="addSubPerson" class="btn-add-sub">+ Aggiungi Persona</button>
      </div>

      <div v-if="formData.subPeople && formData.subPeople.length > 0" class="subpeople-list">
        <div v-for="(sp, idx) in formData.subPeople" :key="sp.id" class="subperson-card">
          <div class="subperson-header">
            <span>Accompagnatore #{{ idx + 1 }}</span>
            <button type="button" @click="removeSubPerson(idx)" class="btn-remove-sub">Elimina</button>
          </div>

          <div class="form-row">
            <input v-model="sp.firstName" placeholder="Nome *" required />
            <input v-model="sp.lastName" placeholder="Cognome *" required />
          </div>

          <div class="form-row">
            <input v-model="sp.role" placeholder="Ruolo (es. Fonico, Manager)" />
            <select v-model="sp.locationId" required>
              <option value="" disabled selected>Alloggio Accompagnatore *</option>
              <option v-for="loc in hospitalityStore.locations" :key="loc.id" :value="loc.id">
                {{ loc.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <p v-else class="empty-sub-info">Nessun accompagnatore/membro dello staff inserito.</p>

      <button type="submit" class="btn-submit">Salva Ospite e Staff</button>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 650px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.form-header h2 {
  margin: 0;
  color: #0f172a;
}

.form-header p {
  margin: 4px 0 20px 0;
  font-size: 0.85rem;
  color: #64748b;
}

.guest-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 4px;
  margin-top: 10px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row input, .form-row select {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
}

.field-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  color: #64748b;
}

.subpeople-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subperson-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subperson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.btn-add-sub {
  background: #e2e8f0;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
}

.btn-add-sub:hover {
  background: #cbd5e1;
}

.btn-remove-sub {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 0.75rem;
  cursor: pointer;
}

.empty-sub-info {
  font-size: 0.8rem;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
}

.btn-submit {
  margin-top: 10px;
  background: #2563eb;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.btn-submit:hover {
  background: #1d4ed8;
}
</style>