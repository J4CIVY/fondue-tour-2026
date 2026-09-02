type Summit = {
  name: string;
  altitude: number;
  day: string;
  color: string;
  country: 'FR' | 'IT' | 'CH';
  note?: string;
  warmup?: boolean;
};

// Summit altitudes in driving order. Friday uses the long San Bernardino option.
export const summits: Summit[] = [
  { name: 'Cime de la Bonette', altitude: 2802, day: 'Tue', color: '#d39b31', country: 'FR', note: 'Highest paved loop in France', warmup: true },
  { name: 'Col de Vars', altitude: 2109, day: 'Tue', color: '#d39b31', country: 'FR', warmup: true },
  { name: 'Col d’Izoard', altitude: 2360, day: 'Tue', color: '#d39b31', country: 'FR', note: 'Casse Déserte', warmup: true },
  { name: 'Col du Mont-Cenis', altitude: 2081, day: 'Tue', color: '#d39b31', country: 'FR', warmup: true },
  { name: 'Col de l’Iseran', altitude: 2764, day: 'Wed', color: '#b84a32', country: 'FR', note: 'Highest pass of the tour' },
  { name: 'Cormet de Roselend', altitude: 1968, day: 'Wed', color: '#b84a32', country: 'FR' },
  { name: 'Col des Aravis', altitude: 1486, day: 'Wed', color: '#b84a32', country: 'FR', note: 'You join here · 13:00' },
  { name: 'Col des Saisies', altitude: 1650, day: 'Wed', color: '#b84a32', country: 'FR' },
  { name: 'Petit-Saint-Bernard', altitude: 2188, day: 'Wed', color: '#b84a32', country: 'IT', note: 'France → Italy' },
  { name: 'Grand-Saint-Bernard', altitude: 2469, day: 'Thu', color: '#396b67', country: 'CH', note: 'Italy → Switzerland' },
  { name: 'Furkapass', altitude: 2429, day: 'Thu', color: '#396b67', country: 'CH', note: 'Goldfinger road' },
  { name: 'Gotthard · Tremola', altitude: 2106, day: 'Thu', color: '#396b67', country: 'CH', note: 'Cobbled hairpins' },
  { name: 'Nufenenpass', altitude: 2478, day: 'Thu', color: '#396b67', country: 'CH' },
  { name: 'Grimselpass', altitude: 2164, day: 'Fri', color: '#5b637d', country: 'CH' },
  { name: 'Sustenpass', altitude: 2224, day: 'Fri', color: '#5b637d', country: 'CH' },
  { name: 'Oberalppass', altitude: 2044, day: 'Fri', color: '#5b637d', country: 'CH', note: 'Lunch · route decision' },
  { name: 'Lukmanierpass', altitude: 1915, day: 'Fri', color: '#5b637d', country: 'CH' },
  { name: 'San Bernardino', altitude: 2066, day: 'Fri', color: '#5b637d', country: 'CH' },
  { name: 'Albulapass', altitude: 2312, day: 'Fri', color: '#5b637d', country: 'CH' },
  { name: 'Julierpass', altitude: 2284, day: 'Sat', color: '#836036', country: 'CH' },
  { name: 'Malojapass', altitude: 1815, day: 'Sat', color: '#836036', country: 'CH' },
  { name: 'Splügenpass', altitude: 2113, day: 'Sat', color: '#836036', country: 'CH', note: 'Italy → Switzerland' },
  { name: 'San Bernardino', altitude: 2066, day: 'Sat', color: '#836036', country: 'CH', note: 'Second crossing' },
];

const rentalSummits = summits.filter((summit) => !summit.warmup);
export const rentalSummitCount = rentalSummits.length;
export const highestSummit = rentalSummits.reduce((best, summit) => (summit.altitude > best.altitude ? summit : best), rentalSummits[0]);
export const summitMetres = rentalSummits.reduce((total, summit) => total + summit.altitude, 0);

const CHART_HEIGHT = 150;
const MIN_ALTITUDE = 1200;
const MAX_ALTITUDE = 2900;

function altitudeY(altitude: number) {
  const ratio = (altitude - MIN_ALTITUDE) / (MAX_ALTITUDE - MIN_ALTITUDE);
  return CHART_HEIGHT - ratio * CHART_HEIGHT;
}

function SummitSkyline() {
  const step = 100 / summits.length;
  const points = summits.map((summit, index) => `${(index + 0.5) * step},${altitudeY(summit.altitude)}`);
  const area = `0,${CHART_HEIGHT} ${points.join(' ')} 100,${CHART_HEIGHT}`;

  return (
    <svg
      className="ledger-skyline"
      viewBox={`0 0 100 ${CHART_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyline-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e6b445" stopOpacity=".55" />
          <stop offset="1" stopColor="#e6b445" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[2000, 2500].map((line) => (
        <line key={line} x1="0" x2="100" y1={altitudeY(line)} y2={altitudeY(line)} className="ledger-gridline" />
      ))}
      <polygon points={area} fill="url(#skyline-fill)" />
      <polyline points={points.join(' ')} className="ledger-ridge" vectorEffect="non-scaling-stroke" />
      {summits.map((summit, index) => (
        <circle
          key={`${summit.name}-${index}`}
          cx={(index + 0.5) * step}
          cy={altitudeY(summit.altitude)}
          r="1.1"
          fill={summit.color}
          stroke="#f4ecda"
          strokeWidth=".45"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export function PassLedger() {
  return (
    <section id="passes" className="ledger">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow eyebrow-light">The pass ledger</p>
            <h2 className="display-title">Twenty-three summits.<br />One line through the roof of Europe.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/62">Summit altitudes in driving order. The four warm-up passes belong to the organiser’s Tuesday; everything from the Iseran onward is yours. Friday is drawn with the long San Bernardino option.</p>
          </div>
          <dl className="ledger-tally">
            <div><dt>Your summits</dt><dd>{rentalSummitCount}</dd></div>
            <div><dt>Summit metres</dt><dd>{summitMetres.toLocaleString('en-GB')}</dd></div>
            <div><dt>Highest</dt><dd>{highestSummit.altitude.toLocaleString('en-GB')}<span> m</span></dd></div>
          </dl>
        </div>
      </div>

      <div className="ledger-strip">
        <div className="ledger-track">
          <div className="ledger-chart">
            <span className="ledger-mark" style={{ top: `${(altitudeY(2500) / CHART_HEIGHT) * 100}%` }}>2,500 m</span>
            <span className="ledger-mark" style={{ top: `${(altitudeY(2000) / CHART_HEIGHT) * 100}%` }}>2,000 m</span>
            <SummitSkyline />
          </div>
          <ol className="ledger-plates">
            {summits.map((summit, index) => (
              <li key={`${summit.name}-${index}`} className={`ledger-plate${summit.warmup ? ' is-warmup' : ''}`} style={{ '--plate-color': summit.color } as React.CSSProperties}>
                <span className="ledger-plate-day">{summit.day} · {summit.country}</span>
                <span className="ledger-plate-alt">{summit.altitude.toLocaleString('en-GB')}<small>m</small></span>
                <span className="ledger-plate-name">{summit.name}</span>
                {summit.note ? <span className="ledger-plate-note">{summit.note}</span> : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p className="ledger-hint">Scroll sideways · warm-up passes dimmed · colours match the roadbook days</p>
    </section>
  );
}
