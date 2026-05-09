import type { Location } from "@/types/location";

export const LOCATIONS: Location[] = [
  {
    id: 1,
    name: "Hôpital Militaire Abandonné",
    category: "Hospital",
    latitude: 48.8400,
    longitude: 2.3200,
    description:
      "A decommissioned military hospital frozen in 1987. Peeling paint, scattered medical files, and rows of empty iron beds still perfectly arranged.",
    risk: "HIGH",
    lastVisited: "2024-11",
  },
  {
    id: 2,
    name: "Usine Citroën Oubliée",
    category: "Industrial",
    latitude: 48.8380,
    longitude: 2.2770,
    description:
      "A vast automobile factory silenced in the '90s. Rust-eaten assembly lines and ghost cars still mid-production on conveyor belts.",
    risk: "MEDIUM",
    lastVisited: "2024-09",
  },
  {
    id: 3,
    name: "Théâtre Grand Siècle",
    category: "Theater",
    latitude: 48.8710,
    longitude: 2.3440,
    description:
      "Baroque theater shuttered after a structural failure. The velvet seats remain, facing a stage where no curtain has risen in 30 years.",
    risk: "LOW",
    lastVisited: "2025-01",
  },
  {
    id: 4,
    name: "Centrale Électrique Est",
    category: "Industrial",
    latitude: 48.8490,
    longitude: 2.4020,
    description:
      "A massive coal power station with turbines the size of houses. The control room looks like a retro-futurist film set.",
    risk: "HIGH",
    lastVisited: "2024-07",
  },
  {
    id: 5,
    name: "Villa des Artistes",
    category: "Residential",
    latitude: 48.8640,
    longitude: 2.3010,
    description:
      "An art deco mansion abandoned mid-renovation. Canvases still on easels, a grand piano in the salon, and a half-finished mural on the staircase wall.",
    risk: "LOW",
    lastVisited: "2025-02",
  },
  {
    id: 6,
    name: "Gare Fantôme du Nord",
    category: "Transport",
    latitude: 48.8800,
    longitude: 2.3600,
    description:
      "A forgotten underground station sealed in 1939. Wartime graffiti, original wooden benches, and timetables for trains that never came back.",
    risk: "MEDIUM",
    lastVisited: "2024-12",
  },
  {
    id: 7,
    name: "Caserne Militaire Désaffectée",
    category: "Military",
    latitude: 48.8320,
    longitude: 2.3880,
    description:
      "A sprawling garrison abandoned after the Cold War. Empty barracks, a rusted armory, and a parade ground slowly being consumed by weeds.",
    risk: "HIGH",
    lastVisited: "2024-06",
  },
  {
    id: 8,
    name: "Lycée de la République",
    category: "Education",
    latitude: 48.8550,
    longitude: 2.3350,
    description:
      "A grand school building closed in the 1970s. Chalkboards still bear half-erased equations. Student desks remain in perfect rows, gathering dust.",
    risk: "LOW",
    lastVisited: "2025-03",
  },
  {
    id: 9,
    name: "Abbaye Saint-Gilles",
    category: "Religious",
    latitude: 48.8760,
    longitude: 2.3100,
    description:
      "A medieval abbey crumbling since the Revolution. Stained glass shards litter the nave floor. The crypt below remains untouched and sealed.",
    risk: "MEDIUM",
    lastVisited: "2024-10",
  },
  {
    id: 10,
    name: "Hôtel Particulier Fantôme",
    category: "Residential",
    latitude: 48.8600,
    longitude: 2.3680,
    description:
      "A 19th-century private mansion frozen in time. Rotting drapes, a dining table still set for guests, and a library of moldering first editions.",
    risk: "LOW",
    lastVisited: "2025-01",
  },
];
