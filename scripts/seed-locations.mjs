import pg from "pg";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const LOCATIONS = [
  { name: "Hôpital Militaire Abandonné", category: "hospital", latitude: 48.8400, longitude: 2.3200, description: "A decommissioned military hospital frozen in 1987. Peeling paint, scattered medical files, and rows of empty iron beds still perfectly arranged.", risk_level: "high", abandonment_score: 91, last_visited: "2024-11" },
  { name: "Usine Citroën Oubliée", category: "factory", latitude: 48.8380, longitude: 2.2770, description: "A vast automobile factory silenced in the '90s. Rust-eaten assembly lines and ghost cars still mid-production on conveyor belts.", risk_level: "medium", abandonment_score: 78, last_visited: "2024-09" },
  { name: "Théâtre Grand Siècle", category: "mall", latitude: 48.8710, longitude: 2.3440, description: "Baroque theater shuttered after a structural failure. The velvet seats remain, facing a stage where no curtain has risen in 30 years.", risk_level: "low", abandonment_score: 62, last_visited: "2025-01" },
  { name: "Centrale Électrique Est", category: "industrial", latitude: 48.8490, longitude: 2.4020, description: "A massive coal power station with turbines the size of houses. The control room looks like a retro-futurist film set.", risk_level: "high", abandonment_score: 88, last_visited: "2024-07" },
  { name: "Villa des Artistes", category: "school", latitude: 48.8640, longitude: 2.3010, description: "An art deco mansion abandoned mid-renovation. Canvases still on easels, a grand piano in the salon, and a half-finished mural on the staircase wall.", risk_level: "low", abandonment_score: 54, last_visited: "2025-02" },
  { name: "Gare Fantôme du Nord", category: "tunnel", latitude: 48.8800, longitude: 2.3600, description: "A forgotten underground station sealed in 1939. Wartime graffiti, original wooden benches, and timetables for trains that never came back.", risk_level: "medium", abandonment_score: 83, last_visited: "2024-12" },
  { name: "Caserne Militaire Désaffectée", category: "industrial", latitude: 48.8320, longitude: 2.3880, description: "A sprawling garrison abandoned after the Cold War. Empty barracks, a rusted armory, and a parade ground slowly being consumed by weeds.", risk_level: "high", abandonment_score: 94, last_visited: "2024-06" },
  { name: "Lycée de la République", category: "school", latitude: 48.8550, longitude: 2.3350, description: "A grand school building closed in the 1970s. Chalkboards still bear half-erased equations. Student desks remain in perfect rows, gathering dust.", risk_level: "low", abandonment_score: 58, last_visited: "2025-03" },
  { name: "Abbaye Saint-Gilles", category: "mall", latitude: 48.8760, longitude: 2.3100, description: "A medieval abbey crumbling since the Revolution. Stained glass shards litter the nave floor. The crypt below remains untouched and sealed.", risk_level: "medium", abandonment_score: 75, last_visited: "2024-10" },
  { name: "Hôtel Particulier Fantôme", category: "mall", latitude: 48.8600, longitude: 2.3680, description: "A 19th-century private mansion frozen in time. Rotting drapes, a dining table still set for guests, and a library of moldering first editions.", risk_level: "low", abandonment_score: 49, last_visited: "2025-01" },
];

async function seed() {
  const existing = await pool.query("SELECT COUNT(*) FROM locations");
  if (parseInt(existing.rows[0].count) > 0) {
    console.log("Locations already seeded, skipping.");
    await pool.end();
    return;
  }

  for (const loc of LOCATIONS) {
    await pool.query(
      `INSERT INTO locations (name, category, latitude, longitude, description, risk_level, abandonment_score, last_visited)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [loc.name, loc.category, loc.latitude, loc.longitude, loc.description, loc.risk_level, loc.abandonment_score, loc.last_visited]
    );
  }
  console.log(`Seeded ${LOCATIONS.length} locations.`);
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
