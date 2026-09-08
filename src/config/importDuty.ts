/**
 * Kenya vehicle import duty ASSUMPTIONS.
 *
 * IMPORTANT: these are editable planning assumptions, not verified official
 * rates. Every rate below can be changed by the user inside the tool, and the
 * whole block should be reviewed against KRA publications before relying on it.
 */

export const IMPORT_DUTY_CONFIG = {
  lastUpdated: "2025-01",
  currency: "KES",
  verified: false,

  /** Applied to the customs value. */
  importDutyRate: 0.35,

  /**
   * Excise duty depends on engine capacity (petrol/diesel) — commonly quoted
   * bands. Treat as an assumption and confirm before use.
   */
  exciseBands: [
    { maxCc: 1500, rate: 0.2, label: "Up to 1500cc" },
    { maxCc: 3000, rate: 0.25, label: "1501cc – 3000cc" },
    { maxCc: Infinity, rate: 0.35, label: "Above 3000cc" },
  ],

  /** Electric vehicles are commonly charged a lower excise rate. */
  electricExciseRate: 0.1,

  vatRate: 0.16,

  /** Levies charged on the customs value. */
  levies: [
    { id: "idf", label: "Import Declaration Fee (IDF)", rate: 0.035 },
    { id: "rdl", label: "Railway Development Levy (RDL)", rate: 0.02 },
  ],

  /**
   * Straight-line depreciation applied to the vehicle value to approximate the
   * customs value. Vehicles older than 8 years cannot normally be imported.
   */
  depreciationPerYear: 0.1,
  maxDepreciation: 0.65,
  maxVehicleAgeYears: 8,

  vehicleTypes: [
    { id: "saloon", label: "Saloon / Hatchback" },
    { id: "suv", label: "SUV / 4x4" },
    { id: "pickup", label: "Pickup / Van" },
    { id: "bus", label: "Bus / Minibus" },
  ],

  fuelTypes: [
    { id: "petrol", label: "Petrol" },
    { id: "diesel", label: "Diesel" },
    { id: "hybrid", label: "Hybrid" },
    { id: "electric", label: "Electric" },
  ],

  sources: [
    { label: "Kenya Revenue Authority — Motor vehicle import duty", url: "https://www.kra.go.ke/importing-exporting/importation/motor-vehicle-importation" },
    { label: "KEBS — Vehicle import standards", url: "https://www.kebs.org" },
  ],
};
