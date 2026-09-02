// Builds the stage-profile elevation dataset for the rental drive (Wed → Sun).
// Samples the generated full-tour route, asks Open-Meteo for ground elevation,
// then snaps each named pass to the nearest local maximum on the sampled line.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const SAMPLE_METRES = 400;
const BATCH = 100;
const DISPLAY_BUCKET_METRES = 1000;

// Approximate pass coordinates. Each is snapped to the route and then to the
// nearest local maximum, so small errors self-correct; a bad one fails loudly.
const passes = [
  { name: 'Col des Aravis', altitude: 1486, leg: 'wednesday-personal', lat: 45.8747, lon: 6.4642, note: 'You join here · 13:00' },
  { name: 'Col des Saisies', altitude: 1650, leg: 'wednesday-personal', lat: 45.7639, lon: 6.5333 },
  { name: 'Cormet de Roselend', altitude: 1968, leg: 'wednesday-personal', lat: 45.6725, lon: 6.6672 },
  { name: 'Petit-Saint-Bernard', altitude: 2188, leg: 'wednesday-personal', lat: 45.6806, lon: 6.8833, note: 'France → Italy' },
  { name: 'Grand-Saint-Bernard', altitude: 2469, leg: 'thursday-loop', lat: 45.8686, lon: 7.1706, note: 'Italy → Switzerland' },
  { name: 'Furkapass', altitude: 2429, leg: 'thursday-loop', lat: 46.5722, lon: 8.4153, note: 'Goldfinger road' },
  { name: 'Gotthard · Tremola', altitude: 2106, leg: 'thursday-loop', lat: 46.5556, lon: 8.5661, note: 'Cobbled hairpins' },
  { name: 'Nufenenpass', altitude: 2478, leg: 'thursday-loop', lat: 46.4772, lon: 8.3872, note: 'Highest of your drive' },
  { name: 'Grimselpass', altitude: 2164, leg: 'friday-san-bernardino', lat: 46.5608, lon: 8.3372 },
  { name: 'Sustenpass', altitude: 2224, leg: 'friday-san-bernardino', lat: 46.7261, lon: 8.4458 },
  { name: 'Oberalppass', altitude: 2044, leg: 'friday-san-bernardino', lat: 46.6597, lon: 8.6714, note: 'Lunch · route decision' },
  { name: 'Lukmanierpass', altitude: 1915, leg: 'friday-san-bernardino', lat: 46.5678, lon: 8.8028 },
  { name: 'San Bernardino', altitude: 2066, leg: 'friday-san-bernardino', lat: 46.4939, lon: 9.1717 },
  // Albula is not on this line: the roadbook's "Albula Pass" waypoint sits near Tiefencastel,
  // so the generated long-option route runs San Bernardino → Thusis → Lenzerheide instead.
  { name: 'Julierpass', altitude: 2284, leg: 'saturday-ascona', lat: 46.4708, lon: 9.7211 },
  { name: 'Malojapass', altitude: 1815, leg: 'saturday-ascona', lat: 46.4022, lon: 9.6939 },
  { name: 'Splügenpass', altitude: 2113, leg: 'saturday-ascona', lat: 46.5058, lon: 9.3306, note: 'Italy → Switzerland' },
  { name: 'San Bernardino', altitude: 2066, leg: 'saturday-ascona', lat: 46.4939, lon: 9.1717, note: 'Second crossing' },
];

const toRadians = (value) => (value * Math.PI) / 180;

function metresBetween([lon1, lat1], [lon2, lat2]) {
  const R = 6371008.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const geojson = JSON.parse(await readFile(path.join(root, 'public/routes/full-tour.geojson'), 'utf8'));

// Walk every leg end to end, emitting an evenly spaced sample every SAMPLE_METRES.
const samples = [];
const legs = [];
let travelled = 0;

for (const feature of geojson.features) {
  const coordinates = feature.geometry.coordinates;
  const legStart = travelled;
  let carry = samples.length === 0 ? 0 : SAMPLE_METRES;

  if (samples.length === 0) {
    samples.push({ lon: coordinates[0][0], lat: coordinates[0][1], metres: 0, leg: feature.properties.id });
  }

  for (let index = 1; index < coordinates.length; index += 1) {
    const from = coordinates[index - 1];
    const to = coordinates[index];
    const span = metresBetween(from, to);
    if (span === 0) continue;

    let along = carry;
    while (along <= span) {
      const ratio = along / span;
      samples.push({
        lon: from[0] + (to[0] - from[0]) * ratio,
        lat: from[1] + (to[1] - from[1]) * ratio,
        metres: travelled + along,
        leg: feature.properties.id,
      });
      along += SAMPLE_METRES;
    }
    carry = along - span;
    travelled += span;
  }

  legs.push({
    id: feature.properties.id,
    label: feature.properties.label,
    color: feature.properties.color,
    start: feature.properties.start,
    end: feature.properties.end,
    startKm: Number((legStart / 1000).toFixed(1)),
    endKm: Number((travelled / 1000).toFixed(1)),
  });
}

console.log(`Sampled ${samples.length} points across ${(travelled / 1000).toFixed(1)} km`);

// Open-Meteo elevation, 100 coordinates per request. Results are cached on disk
// so a rate-limited run can be resumed without refetching what already arrived.
const cachePath = path.join(root, 'data/.elevation-cache.json');
const cache = existsSync(cachePath) ? JSON.parse(await readFile(cachePath, 'utf8')) : {};
const cacheKey = (sample) => `${sample.lat.toFixed(5)},${sample.lon.toFixed(5)}`;

const elevations = [];
for (let index = 0; index < samples.length; index += BATCH) {
  const batch = samples.slice(index, index + BATCH);
  if (batch.every((sample) => cacheKey(sample) in cache)) {
    elevations.push(...batch.map((sample) => cache[cacheKey(sample)]));
    process.stdout.write(`\rElevation ${elevations.length}/${samples.length} (cached)`);
    continue;
  }
  const url = `https://api.open-meteo.com/v1/elevation?latitude=${batch.map((s) => s.lat.toFixed(5)).join(',')}&longitude=${batch.map((s) => s.lon.toFixed(5)).join(',')}`;
  let attempt = 0;
  for (;;) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'FondueTourPlanner/1.0' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.elevation) || payload.elevation.length !== batch.length) {
        throw new Error('Unexpected elevation payload');
      }
      elevations.push(...payload.elevation);
      batch.forEach((sample, offset) => { cache[cacheKey(sample)] = payload.elevation[offset]; });
      await writeFile(cachePath, JSON.stringify(cache));
      break;
    } catch (error) {
      attempt += 1;
      if (attempt > 6) throw error;
      await new Promise((resolve) => setTimeout(resolve, 4000 * attempt));
    }
  }
  process.stdout.write(`\rElevation ${elevations.length}/${samples.length}`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
process.stdout.write('\n');

samples.forEach((sample, index) => { sample.elevation = elevations[index]; });

// Snap each pass: nearest sample inside its own leg, then the local maximum near it.
const summits = legs.length === 0 ? [] : passes.map((pass) => {
  let best = null;
  samples.forEach((sample, index) => {
    if (sample.leg !== pass.leg) return;
    const distance = metresBetween([pass.lon, pass.lat], [sample.lon, sample.lat]);
    if (!best || distance < best.distance) best = { distance, index };
  });
  if (!best) throw new Error(`${pass.name}: no samples on leg ${pass.leg}`);
  if (best.distance > 6000) {
    throw new Error(`${pass.name}: nearest route point is ${Math.round(best.distance / 1000)} km away — check the coordinate`);
  }

  const window = Math.round(3000 / SAMPLE_METRES);
  let peak = best.index;
  for (let index = Math.max(0, best.index - window); index <= Math.min(samples.length - 1, best.index + window); index += 1) {
    if (samples[index].leg === pass.leg && samples[index].elevation > samples[peak].elevation) peak = index;
  }

  const sampled = Math.round(samples[peak].elevation);
  if (Math.abs(sampled - pass.altitude) > 150) {
    console.warn(`  ! ${pass.name}: sampled ${sampled} m vs stated ${pass.altitude} m`);
  }

  return {
    name: pass.name,
    altitude: pass.altitude,
    sampled,
    km: Number((samples[peak].metres / 1000).toFixed(1)),
    leg: pass.leg,
    note: pass.note ?? null,
  };
}).sort((a, b) => a.km - b.km);

// Downsample for drawing, keeping the highest point in each bucket so peaks survive.
const points = [];
const bucketCount = Math.ceil(travelled / DISPLAY_BUCKET_METRES);
for (let bucket = 0; bucket < bucketCount; bucket += 1) {
  const from = bucket * DISPLAY_BUCKET_METRES;
  const to = from + DISPLAY_BUCKET_METRES;
  let chosen = null;
  for (const sample of samples) {
    if (sample.metres < from || sample.metres >= to) continue;
    if (!chosen || sample.elevation > chosen.elevation) chosen = sample;
  }
  if (chosen) points.push([Number((chosen.metres / 1000).toFixed(2)), Math.round(chosen.elevation)]);
}
const last = samples.at(-1);
points.push([Number((last.metres / 1000).toFixed(2)), Math.round(last.elevation)]);

const dataset = {
  generatedBy: 'Open-Meteo elevation over the OSRM full-tour route',
  sampleSpacingMetres: SAMPLE_METRES,
  totalKm: Number((travelled / 1000).toFixed(1)),
  startElevation: Math.round(samples[0].elevation),
  endElevation: Math.round(last.elevation),
  legs,
  summits,
  points,
};

await writeFile(path.join(root, 'data/tour-elevation.json'), `${JSON.stringify(dataset)}\n`);
console.log(`Wrote data/tour-elevation.json — ${points.length} display points, ${summits.length} summits`);
for (const summit of summits) {
  console.log(`  ${String(summit.km).padStart(6)} km  ${String(summit.altitude).padStart(5)} m  (sampled ${summit.sampled})  ${summit.name}`);
}
