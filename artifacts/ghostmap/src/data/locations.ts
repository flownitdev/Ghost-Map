import type { Location } from "@/types/location";

// Helper: date N days ago as ISO string
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const LOCATIONS: Location[] = [
  {
    id: 1,
    name: "Hôpital Militaire Abandonné",
    category: "hospital",
    latitude: 48.8400,
    longitude: 2.3200,
    description:
      "A decommissioned military hospital frozen in 1987. Peeling paint, scattered medical files, and rows of empty iron beds still perfectly arranged.",
    riskLevel: "extreme",
    abandonmentScore: 91,
    lastVisited: "2024-11",
    createdAt: daysAgo(4),
  },
  {
    id: 2,
    name: "Usine Citroën Oubliée",
    category: "factory",
    latitude: 48.8380,
    longitude: 2.2770,
    description:
      "A vast automobile factory silenced in the '90s. Rust-eaten assembly lines and ghost cars still mid-production on conveyor belts.",
    riskLevel: "high",
    abandonmentScore: 78,
    lastVisited: "2024-09",
    createdAt: daysAgo(60),
  },
  {
    id: 3,
    name: "Théâtre Grand Siècle",
    category: "mall",
    latitude: 48.8710,
    longitude: 2.3440,
    description:
      "Baroque theater shuttered after a structural failure. The velvet seats remain, facing a stage where no curtain has risen in 30 years.",
    riskLevel: "low",
    abandonmentScore: 62,
    lastVisited: "2025-01",
    createdAt: daysAgo(90),
  },
  {
    id: 4,
    name: "Centrale Électrique Est",
    category: "industrial",
    latitude: 48.8490,
    longitude: 2.4020,
    description:
      "A massive coal power station with turbines the size of houses. The control room looks like a retro-futurist film set.",
    riskLevel: "extreme",
    abandonmentScore: 95,
    lastVisited: "2024-07",
    createdAt: daysAgo(12),
  },
  {
    id: 5,
    name: "Villa des Artistes",
    category: "school",
    latitude: 48.8640,
    longitude: 2.3010,
    description:
      "An art deco mansion abandoned mid-renovation. Canvases still on easels, a grand piano in the salon, and a half-finished mural on the staircase wall.",
    riskLevel: "low",
    abandonmentScore: 54,
    lastVisited: "2025-02",
    createdAt: daysAgo(120),
  },
  {
    id: 6,
    name: "Gare Fantôme du Nord",
    category: "tunnel",
    latitude: 48.8800,
    longitude: 2.3600,
    description:
      "A forgotten underground station sealed in 1939. Wartime graffiti, original wooden benches, and timetables for trains that never came back.",
    riskLevel: "medium",
    abandonmentScore: 83,
    lastVisited: "2024-12",
    createdAt: daysAgo(8),
  },
  {
    id: 7,
    name: "Caserne Militaire Désaffectée",
    category: "industrial",
    latitude: 48.8320,
    longitude: 2.3880,
    description:
      "A sprawling garrison abandoned after the Cold War. Empty barracks, a rusted armory, and a parade ground slowly being consumed by weeds.",
    riskLevel: "high",
    abandonmentScore: 88,
    lastVisited: "2024-06",
    createdAt: daysAgo(200),
  },
  {
    id: 8,
    name: "Lycée de la République",
    category: "school",
    latitude: 48.8550,
    longitude: 2.3350,
    description:
      "A grand school building closed in the 1970s. Chalkboards still bear half-erased equations. Student desks remain in perfect rows, gathering dust.",
    riskLevel: "low",
    abandonmentScore: 58,
    lastVisited: "2025-03",
    createdAt: daysAgo(180),
  },
  {
    id: 9,
    name: "Abbaye Saint-Gilles",
    category: "mall",
    latitude: 48.8760,
    longitude: 2.3100,
    description:
      "A medieval abbey crumbling since the Revolution. Stained glass shards litter the nave floor. The crypt below remains untouched and sealed.",
    riskLevel: "medium",
    abandonmentScore: 75,
    lastVisited: "2024-10",
    createdAt: daysAgo(150),
  },
  {
    id: 10,
    name: "Hôtel Particulier Fantôme",
    category: "mall",
    latitude: 48.8600,
    longitude: 2.3680,
    description:
      "A 19th-century private mansion frozen in time. Rotting drapes, a dining table still set for guests, and a library of moldering first editions.",
    riskLevel: "low",
    abandonmentScore: 49,
    lastVisited: "2025-01",
    createdAt: daysAgo(300),
  },
  {
    id: 11,
    name: "Souterrain des Catacombes Oubliées",
    category: "tunnel",
    latitude: 48.8430,
    longitude: 2.3310,
    description:
      "An unmapped section of the Paris underground. Bones stacked centuries ago, crude torch marks on the walls, and an eerie silence broken only by dripping water.",
    riskLevel: "extreme",
    abandonmentScore: 97,
    lastVisited: "2024-05",
    createdAt: daysAgo(2),
  },
  {
    id: 12,
    name: "Centre Commercial Perdu",
    category: "mall",
    latitude: 48.8900,
    longitude: 2.2900,
    description:
      "A 1980s shopping mall that never opened. Storefront signs still intact, escalators frozen mid-ride, and a food court frozen in advertising from 40 years ago.",
    riskLevel: "medium",
    abandonmentScore: 71,
    lastVisited: "2025-01",
    createdAt: daysAgo(18),
  },
];
