export interface Location {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
  lastVisited: string;
}

export const LOCATIONS: Location[] = [
  {
    id: 1,
    name: "Hôpital Militaire Abandonné",
    category: "Hospital",
    lat: 48.8400,
    lng: 2.3200,
    description: "A decommissioned military hospital frozen in 1987. Peeling paint, scattered medical files, and rows of empty iron beds still perfectly arranged.",
    risk: "HIGH",
    lastVisited: "2024-11"
  },
  {
    id: 2,
    name: "Usine Citroën Oubliée",
    category: "Industrial",
    lat: 48.8380,
    lng: 2.2770,
    description: "A vast automobile factory silenced in the '90s. Rust-eaten assembly lines and ghost cars still mid-production on conveyor belts.",
    risk: "MEDIUM",
    lastVisited: "2024-09"
  },
  {
    id: 3,
    name: "Théâtre Grand Siècle",
    category: "Theater",
    lat: 48.8710,
    lng: 2.3440,
    description: "Baroque theater shuttered after a structural failure. The velvet seats remain, facing a stage where no curtain has risen in 30 years.",
    risk: "LOW",
    lastVisited: "2025-01"
  },
  {
    id: 4,
    name: "Centrale Électrique Est",
    category: "Industrial",
    lat: 48.8490,
    lng: 2.4020,
    description: "A massive coal power station with turbines the size of houses. The control room looks like a retro-futurist film set.",
    risk: "HIGH",
    lastVisited: "2024-07"
  },
  {
    id: 5,
    name: "Villa des Artistes",
    category: "Residential",
    lat: 48.8640,
    lng: 2.3010,
    description: "An art deco mansion abandoned mid-renovation. Canvases still on easels, a grand piano in the salon, and a half-finished mural on the staircase wall.",
    risk: "LOW",
    lastVisited: "2025-02"
  },
  {
    id: 6,
    name: "Gare Fantôme du Nord",
    category: "Transport",
    lat: 48.8800,
    lng: 2.3600,
    description: "A forgotten underground station sealed in 1939. Wartime graffiti, original wooden benches, and timetables for trains that never came back.",
    risk: "MEDIUM",
    lastVisited: "2024-12"
  }
];
