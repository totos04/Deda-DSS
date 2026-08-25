// Punto alloggio creato nella Mappa
export interface LocationPoint {
  id: string
  name: string // Es. "Hotel Centrale", "Liceo Palestra"
  address?: string
  lat: number
  lng: number
  notes?: string
}

// Persona dello staff/squadra sotto un Ospite principale
export interface SubPerson {
  id: string
  firstName: string
  lastName: string
  role?: string      // Es. "Fonico", "Manager"
  locationId: string // ID rif. a LocationPoint per l'alloggio assegnato
}

// Struttura Ospite principale
export interface Guest {
  id: string
  firstName: string
  lastName: string
  phone: string
  mail: string
  provenance?: string
  arrivalDate: string
  departureDate: string
  locationId: string // ID rif. a LocationPoint per l'ospite principale
  cachet: number
  vatNumber?: string
  iban?: string
  subPeople?: SubPerson[]
}

// Struttura Volontario
export interface Volunteer {
  id: string
  firstName: string
  lastName: string
  arrivalDate?: string
  departureDate?: string
  locationId: string
  phone: string
  provenance: string
  availableDays: string[]
  hasExperience: boolean
}