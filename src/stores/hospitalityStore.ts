import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LocationPoint, Guest, Volunteer, SubPerson } from '@/types/hospitality'

export const useHospitalityStore = defineStore('hospitality', () => {
  const locations = ref<LocationPoint[]>([
  {
    id: 'loc-1',
    name: 'Albergo delle Serre',
    address: 'Via Roma 18',
    lat: 39.0795,
    lng: 16.3725,
    notes: 'Camere riservate agli ospiti principali'
  },
  {
    id: 'loc-2',
    name: 'Ostello del Borgo',
    address: 'Via Nazionale 42',
    lat: 39.0508,
    lng: 16.3565,
    notes: 'Camerate volontari e staff'
  },
  {
    id: 'loc-3',
    name: 'B&B Lamezia Centro',
    address: 'Via XX Settembre 15',
    lat: 38.9700,
    lng: 16.3100,
    notes: 'Alloggio staff tecnico'
  }
])

  const guests = ref<Guest[]>([])
  const volunteers = ref<Volunteer[]>([])

  // CRUD Alloggi
  function addLocation(location: Omit<LocationPoint, 'id'>) {
    const newLoc: LocationPoint = {
      ...location,
      id: 'loc-' + Date.now()
    }
    locations.value.push(newLoc)
  }

  function removeLocation(id: string) {
    locations.value = locations.value.filter(l => l.id !== id)
  }

  // CRUD Ospiti
  function addGuest(guest: Guest) {
    guests.value.push(guest)
  }

  function removeGuest(id: string) {
    guests.value = guests.value.filter(g => g.id !== id)
  }

  // CRUD Volontari
  function addVolunteer(volunteer: Volunteer) {
    volunteers.value.push(volunteer)
  }

  function removeVolunteer(id: string) {
    volunteers.value = volunteers.value.filter(v => v.id !== id)
  }

  // Helper per calcolare gli occupanti di un singolo alloggio
  function getOccupants(locationId: string) {
    const locGuests = guests.value.filter(g => g.locationId === locationId)
    const locVolunteers = volunteers.value.filter(v => v.locationId === locationId)
    
    // Trova tutte le sotto-persone assegnate a questo alloggio specifico
    const locSubPeople: { subPerson: SubPerson; mainGuestName: string }[] = []
    guests.value.forEach(g => {
      g.subPeople?.forEach(sp => {
        if (sp.locationId === locationId) {
          locSubPeople.push({
            subPerson: sp,
            mainGuestName: `${g.firstName} ${g.lastName}`
          })
        }
      })
    })

    const totalPeopleCount = locGuests.length + locSubPeople.length + locVolunteers.length

    return {
      guests: locGuests,
      subPeople: locSubPeople,
      volunteers: locVolunteers,
      totalPeopleCount
    }
  }

  // Determina il colore del marker
  function getMarkerColor(locationId: string): 'purple' | 'orange' | 'blue' | 'gray' {
    const hasVolunteers = volunteers.value.some(v => v.locationId === locationId)
    const hasGuests = guests.value.some(
      g => g.locationId === locationId || g.subPeople?.some(sp => sp.locationId === locationId)
    )

    if (hasVolunteers && hasGuests) return 'blue'
    if (hasVolunteers) return 'purple'
    if (hasGuests) return 'orange'
    return 'gray'
  }

  return {
    locations,
    guests,
    volunteers,
    addLocation,
    removeLocation,
    addGuest,
    removeGuest,
    addVolunteer,
    removeVolunteer,
    getOccupants,
    getMarkerColor
  }
})