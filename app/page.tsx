import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Backpack,
  Bath,
  BedDouble,
  CableCar,
  CarFront,
  Check,
  Clock3,
  Coffee,
  Fuel,
  Map,
  MapPinned,
  Mountain,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FullTourOverview, TourMap } from '@/components/tour-map';

const mapsRoute = (origin: string, destination: string, waypoints: string[] = [], travelmode = 'driving') => {
  const params = new URLSearchParams({ api: '1', origin, destination, travelmode });
  if (waypoints.length) params.set('waypoints', waypoints.join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

const mapLinks = {
  personalMeet: mapsRoute(
    'ibis budget Zurich Airport, Flughofstrasse 45, 8152 Glattbrugg, Switzerland',
    'Restaurant Le Chalet Savoyard, 7400 Route du Col des Aravis, 74220 La Clusaz, France',
  ),
  tuesdayWarmupA: mapsRoute(
    'Menton, France',
    'Col d’Izoard, France',
    ['Col de la Bonette, France', 'Restaurant L’Igloo Varsin, Col de Vars, France'],
  ),
  tuesdayWarmupB: mapsRoute(
    'Col d’Izoard, France',
    'Saint Charles Hôtel & Spa Val Cenis, France',
    ['Avia, 9 Route de Gap, Briançon, France', 'Exilles, Italy'],
  ),
  wednesdayMorning: mapsRoute(
    'Saint Charles Hôtel & Spa Val Cenis, France',
    'Restaurant Le Chalet Savoyard, Col des Aravis, La Clusaz, France',
    ['Col de l’Iseran, France', 'Intermarché station-service Bourg-Saint-Maurice', 'Cormet de Roselend'],
  ),
  wednesdayAfternoon: mapsRoute(
    'Restaurant Le Chalet Savoyard, Col des Aravis, La Clusaz, France',
    'Chalet Eden, Frazione Villaret 74, La Thuile, Italy',
    ['Les Saisies, France', 'Le Chalet de Roselend, Beaufort, France', 'Hospice du Petit-Saint-Bernard'],
  ),
  thursdayMorning: mapsRoute(
    'Chalet Eden, Frazione Villaret 74, La Thuile, Italy',
    'Lac de Géronde, Sierre, Switzerland',
    ['Eni Station, Viale Piccolo San Bernardo, Aosta, Italy', 'Great St Bernard Hospice'],
  ),
  thursdayAfternoon: mapsRoute(
    'Lac de Géronde, Sierre, Switzerland',
    'Hotel Restaurant Landhaus, Münster-Geschinen, Switzerland',
    ['Hängebrücke Fürgangen Mühlebach, Switzerland'],
  ),
  thursdayLoop: mapsRoute(
    'Hotel Restaurant Landhaus, Münster-Geschinen, Switzerland',
    'Hotel Restaurant Landhaus, Münster-Geschinen, Switzerland',
    ['Belvedere Furka, Obergoms', 'Parcheggio Tremola, Airolo', 'Nufenenpass, Switzerland'],
  ),
  fridayMorning: mapsRoute(
    'Hotel Restaurant Landhaus, Münster-Geschinen, Switzerland',
    'Ustria Alpsu, Oberalppass, Switzerland',
    ['Gelmerbahn, Guttannen', 'Susten Pass, Switzerland'],
  ),
  fridaySanBernardinoA: mapsRoute(
    'Ustria Alpsu, Oberalppass, Switzerland',
    'San Bernardino Pass, Switzerland',
    ['Garviel da Medel, Switzerland', 'Motto, Acquarossa, Switzerland', 'Mesocco, Switzerland'],
  ),
  fridaySanBernardinoB: mapsRoute(
    'San Bernardino Pass, Switzerland',
    'Hotel Waldhaus am See, Valbella, Switzerland',
    ['Albula Pass, Switzerland', 'Migrol Tankstelle, Lantsch/Lenz, Switzerland'],
  ),
  fridayAlbula: mapsRoute(
    'Ustria Alpsu, Oberalppass, Switzerland',
    'Hotel Waldhaus am See, Valbella, Switzerland',
    ['Rothenbrunnen, Switzerland', 'Albula Pass, Switzerland', 'Migrol Tankstelle, Lantsch/Lenz, Switzerland'],
  ),
  saturdayMorning: mapsRoute(
    'Hotel Waldhaus am See, Valbella, Switzerland',
    'Bellavista, Maloja, Switzerland',
    ['Wasescha Sport Rent, Savognin, Switzerland', 'Restaurant PappaLoù, Silvaplana, Switzerland'],
  ),
  saturdayAfternoon: mapsRoute(
    'Bellavista, Maloja, Switzerland',
    'Hotel Ascona, Via Signor in Croce 1, Ascona, Switzerland',
    ['Shell, Strada Cantonale 79, Stampa, Switzerland', 'Berghaus Splügenpass', 'Ospizio San Bernardino'],
  ),
  sundayReturn: mapsRoute(
    'Hotel Ascona, Via Signor in Croce 1, Ascona, Switzerland',
    'AMAG Automobili e Motori SA, Via Monte Boglia 24, Lugano, Switzerland',
  ),
  luganoBellinzona: mapsRoute(
    'AMAG Automobili e Motori SA, Via Monte Boglia 24, Lugano, Switzerland',
    'Bellinzona railway station, Switzerland',
    [],
    'transit',
  ),
  bellinzonaMalpensa: mapsRoute(
    'Bellinzona railway station, Switzerland',
    'Milan Malpensa Airport Terminal 2, Italy',
    [],
    'transit',
  ),
};

type RouteButton = { label: string; href: string; note?: string };
type Stop = { time: string; place: string; note: string; icon?: LucideIcon };
type Day = {
  id: string;
  number: string;
  weekday: string;
  date: string;
  countries: string;
  title: string;
  subtitle: string;
  accent: string;
  badge?: string;
  routes: RouteButton[];
  stops: Stop[];
  callout?: { title: string; copy: string; icon: LucideIcon };
};

const days: Day[] = [
  {
    id: 'tuesday',
    number: '00',
    weekday: 'Tue',
    date: '08 Sep',
    countries: 'France · Italy · France',
    title: 'Menton → Val Cenis',
    subtitle: 'The organiser’s warm-up day. You will be flying to Zürich while this route runs.',
    accent: '#d39b31',
    badge: 'Warm-up crew',
    routes: [
      { label: 'Route A · Bonette to Izoard', href: mapLinks.tuesdayWarmupA },
      { label: 'Route B · Izoard to hotel', href: mapLinks.tuesdayWarmupB },
    ],
    stops: [
      { time: '09:30', place: 'Menton', note: 'Roadbook departure' },
      { time: '11:55', place: 'Col de la Bonette', note: 'Picnic stop', icon: Utensils },
      { time: '15:23', place: 'Col d’Izoard', note: 'Pass / coffee option', icon: Coffee },
      { time: '18:47', place: 'Val Cenis', note: 'Saint Charles Hôtel & Spa', icon: BedDouble },
    ],
    callout: { title: 'Your parallel plan', copy: 'Gatwick 17:05 → Zürich 19:50. Collect the car at 21:30, then sleep at ibis Budget Zürich Airport.', icon: Plane },
  },
  {
    id: 'wednesday',
    number: '01',
    weekday: 'Wed',
    date: '09 Sep',
    countries: 'France → Italy',
    title: 'Col des Aravis → La Thuile',
    subtitle: 'Rendezvous, Roselend, Petit-Saint-Bernard and the first group border crossing.',
    accent: '#b84a32',
    badge: 'Meet 13:00–14:00',
    routes: [
      { label: 'Your Zürich → meetup route', href: mapLinks.personalMeet, note: 'Leave 06:30–06:45' },
      { label: 'Group morning route', href: mapLinks.wednesdayMorning },
      { label: 'Group afternoon route', href: mapLinks.wednesdayAfternoon },
    ],
    stops: [
      { time: '13:14', place: 'Col des Aravis', note: 'Lunch & rendezvous', icon: Utensils },
      { time: '15:57', place: 'Les Saisies', note: 'Scenic leg' },
      { time: '16:42', place: 'Roselend', note: 'Coffee / photo stop', icon: Coffee },
      { time: '18:50', place: 'Chalet Eden', note: 'La Thuile · dinner 20:30', icon: BedDouble },
    ],
    callout: { title: 'Meetup pin', copy: 'Restaurant Le Chalet Savoyard, 7400 Route du Col des Aravis, La Clusaz. Aim to arrive before 13:00.', icon: MapPinned },
  },
  {
    id: 'thursday',
    number: '02',
    weekday: 'Thu',
    date: '10 Sep',
    countries: 'Italy → Switzerland',
    title: 'Great St Bernard → Furka loop',
    subtitle: 'Aosta, Great St Bernard, flexible lakeside lunch, Furka, Tremola and Nufenen.',
    accent: '#396b67',
    routes: [
      { label: 'Morning · La Thuile to Sierre', href: mapLinks.thursdayMorning },
      { label: 'Lunch to Landhaus', href: mapLinks.thursdayAfternoon },
      { label: 'Furka · Tremola · Nufenen loop', href: mapLinks.thursdayLoop },
    ],
    stops: [
      { time: '09:00', place: 'La Thuile', note: 'Depart hotel' },
      { time: '10:48', place: 'Great St Bernard', note: 'Photo stop', icon: Mountain },
      { time: '12:33', place: 'Lac de Géronde', note: 'Flexible lunch / swim', icon: Bath },
      { time: '15:14', place: 'Landhaus', note: 'Optional check-in' },
      { time: '15:40', place: 'Belvedere Furka', note: 'Glacier viewpoint' },
      { time: '18:26', place: 'Landhaus', note: 'Dinner 20:15', icon: BedDouble },
    ],
    callout: { title: 'Lunch stays flexible', copy: 'Choose Lac de Géronde or Restaurant Z’Matt. The hotel kitchen closes at 20:30, so preserve the 20:15 dinner.', icon: Utensils },
  },
  {
    id: 'friday',
    number: '03',
    weekday: 'Fri',
    date: '11 Sep',
    countries: 'Switzerland',
    title: 'Gelmerbahn → Valbella',
    subtitle: 'Grimsel, Gelmerbahn, Susten and Oberalp — then a weather-led choice for the afternoon.',
    accent: '#5b637d',
    badge: 'Printed voucher',
    routes: [
      { label: 'Morning · Gelmerbahn & Susten', href: mapLinks.fridayMorning },
      { label: 'Option 1A · to San Bernardino', href: mapLinks.fridaySanBernardinoA },
      { label: 'Option 1B · to Valbella', href: mapLinks.fridaySanBernardinoB },
      { label: 'Option 2 · direct via Albula', href: mapLinks.fridayAlbula },
    ],
    stops: [
      { time: '08:20', place: 'Landhaus', note: 'Early departure' },
      { time: '09:00', place: 'Gelmerbahn', note: 'Walk from parking', icon: CableCar },
      { time: '09:48', place: 'Ascent', note: 'Descent at 10:24', icon: Clock3 },
      { time: '12:21', place: 'Susten Pass', note: 'Drive to Oberalp' },
      { time: '13:21', place: 'Ustria Alpsu', note: 'Lunch & route decision', icon: Utensils },
      { time: '18:50', place: 'Valbella', note: 'Waldhaus · dinner 20:00', icon: BedDouble },
    ],
    callout: { title: 'Decision at Oberalp', copy: 'Choose the San Bernardino or Albula route using live pass status, weather and the clock — Google may otherwise reroute through tunnels.', icon: Route },
  },
  {
    id: 'saturday',
    number: '04',
    weekday: 'Sat',
    date: '12 Sep',
    countries: 'Switzerland → Italy → Switzerland',
    title: 'Mountain karts → Ascona',
    subtitle: 'Savognin, Engadin lakes, Maloja, Splügen and San Bernardino before the Ticino finish.',
    accent: '#836036',
    routes: [
      { label: 'Morning · Valbella to Maloja', href: mapLinks.saturdayMorning },
      { label: 'Afternoon · Maloja to Ascona', href: mapLinks.saturdayAfternoon },
    ],
    stops: [
      { time: '09:00', place: 'Valbella', note: 'Depart hotel' },
      { time: '09:28', place: 'Mountain karts', note: 'Wasescha Sport · to 11:58', icon: Sparkles },
      { time: '12:50', place: 'Maloja', note: 'Flexible lunch', icon: Utensils },
      { time: '15:00', place: 'Stampa', note: 'Fuel stop', icon: Fuel },
      { time: '16:18', place: 'Splügen Pass', note: '30-minute break' },
      { time: '18:44', place: 'Hotel Ascona', note: 'Heated pool', icon: BedDouble },
    ],
    callout: { title: 'Correct hotel address', copy: 'Use Hotel Ascona, Via Signor in Croce 1, 6612 Ascona. The address typed in the spreadsheet’s hotel row was copied from Valbella.', icon: AlertTriangle },
  },
  {
    id: 'sunday',
    number: '05',
    weekday: 'Sun',
    date: '13 Sep',
    countries: 'Switzerland',
    title: 'Ascona → Lugano → Bellinzona',
    subtitle: 'Your tour closes with the domestic one-way return and the trip home to family.',
    accent: '#263d45',
    badge: 'Car due 10:00',
    routes: [
      { label: 'Drive to AMAG Lugano', href: mapLinks.sundayReturn, note: 'Leave about 08:15–08:30' },
      { label: 'Public transport to Bellinzona', href: mapLinks.luganoBellinzona },
    ],
    stops: [
      { time: '08:15', place: 'Hotel Ascona', note: 'Suggested departure' },
      { time: 'Before 10', place: 'Refuel', note: 'Return at same level', icon: Fuel },
      { time: '10:00', place: 'AMAG Lugano', note: 'Via Monte Boglia 24', icon: CarFront },
      { time: 'After return', place: 'Bellinzona', note: 'Bus / train home', icon: Map },
    ],
    callout: { title: 'Document the return', copy: 'Photograph every panel, fuel gauge, mileage, parking bay and key-drop. Keep the final receipt and return evidence.', icon: ShieldCheck },
  },
];

function RouteButtonLink({ route }: { route: RouteButton }) {
  return (
    <a href={route.href} target="_blank" rel="noreferrer" className="route-button">
      <span>
        <span className="block">{route.label}</span>
        {route.note ? <span className="mt-0.5 block text-[10px] font-normal opacity-65">{route.note}</span> : null}
      </span>
      <ArrowUpRight className="size-4" />
    </a>
  );
}

function DayCard({ day }: { day: Day }) {
  return (
    <article id={day.id} className="day-card scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-card">
      <div className="grid lg:grid-cols-[230px_1fr]">
        <div className="day-panel p-6 text-white sm:p-8" style={{ backgroundColor: day.accent }}>
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-white/65">Day {day.number}</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-.05em]">{day.weekday}<br />{day.date}</p>
          <p className="mt-8 text-sm leading-5 text-white/70">{day.countries}</p>
        </div>

        <div className="min-w-0 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
            <div className="min-w-0">
              {day.badge ? <Badge variant="outline" className="mb-3 border-current/20" style={{ color: day.accent }}>{day.badge}</Badge> : null}
              <h3 className="text-2xl font-semibold tracking-[-.035em] sm:text-3xl">{day.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{day.subtitle}</p>
            </div>
            <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:w-[390px] xl:grid-cols-1">
              {day.routes.map((route) => <RouteButtonLink key={route.label} route={route} />)}
            </div>
          </div>

          <ol className="route-line mt-9 grid gap-0 sm:grid-cols-3 xl:grid-cols-6">
            {day.stops.map(({ time, place, note, icon: Icon }) => (
              <li key={`${time}-${place}`} className="relative min-w-0 border-l border-border pb-6 pl-6 last:pb-0 sm:border-l-0 sm:border-t sm:pb-0 sm:pl-0 sm:pt-6">
                <span className="route-dot" style={{ backgroundColor: day.accent, boxShadow: `0 0 0 1px ${day.accent}` }} />
                <div className="flex items-center gap-1.5" style={{ color: day.accent }}>
                  {Icon ? <Icon className="size-3.5" /> : null}
                  <p className="font-mono text-xs">{time}</p>
                </div>
                <p className="mt-1 truncate font-semibold sm:whitespace-normal">{place}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
              </li>
            ))}
          </ol>

          {day.callout ? (
            <div className="mt-8 flex gap-3 rounded-2xl bg-[#f1eee6] p-4 sm:p-5">
              <day.callout.icon className="mt-0.5 size-4 shrink-0" style={{ color: day.accent }} />
              <div>
                <p className="text-sm font-semibold">{day.callout.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{day.callout.copy}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c1d24]/92 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2 sm:px-8">
          <a href="#top" className="site-brand flex min-h-11 items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-full bg-[#f0bb4b] text-[#10272f]"><Mountain className="size-4" /></span>
            <span className="brand-long">Fondue Tour ’26</span><span className="brand-short">Fondue ’26</span>
          </a>
          <nav aria-label="Tour navigation" className="flex items-center gap-1 text-sm text-white/70">
            <a className="header-link rounded-full px-3 hover:bg-white/10 hover:text-white" href="#overview"><span className="nav-long">Full route</span><span className="nav-short">Route</span></a>
            <a className="header-link rounded-full px-3 hover:bg-white/10 hover:text-white" href="#roadbook"><span className="nav-long">Roadbook</span><span className="nav-short">Days</span></a>
            <a className="hidden rounded-full px-3 py-2 hover:bg-white/10 hover:text-white sm:block" href="#essentials">Essentials</a>
            <a className="hidden rounded-full px-3 py-2 hover:bg-white/10 hover:text-white sm:block" href="#homeward">Homeward</a>
          </nav>
        </div>
      </header>

      <section id="top" className="tour-hero relative overflow-hidden bg-[#10272f] text-white">
        <img
          src="/og.png"
          alt="Silver convertible on a winding Alpine road at sunrise"
          className="hero-image"
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div className="relative z-10">
            <Badge className="mb-5 bg-[#f0bb4b] text-[#10272f]">8–17 September 2026</Badge>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.24em] text-[#9dc1b3]">Switzerland · France · Italy</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[.96] tracking-[-.055em] sm:text-7xl">Five days.<br />One Alpine line.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/68 sm:text-lg">Your pocket roadbook for every pass, rendezvous, fuel stop and hotel — with restart navigation, open maps and TomTom tracks.</p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/12">
            {[
              ['Meet', 'Wed 09 · 13:00', Map],
              ['Start', 'Col des Aravis', Mountain],
              ['Rental', 'Zürich → Lugano', CarFront],
              ['Return', 'Sun 13 · 10:00', ShieldCheck],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="bg-[#10272f]/90 p-4 sm:p-5">
                <Icon className="mb-5 size-4 text-[#f0bb4b]" />
                <p className="text-[11px] uppercase tracking-[.16em] text-white/45">{label as string}</p>
                <p className="mt-1 font-medium">{value as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-[#edf2eb]" aria-label="Personal arrival plan">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#b84a32] shadow-sm"><Plane className="size-4" /></span>
            <div>
              <p className="font-semibold">Your runway to the rendezvous</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Tue 8: Gatwick 17:05 → Zürich 19:50 · Car 21:30 · ibis overnight · Depart 06:30–06:45</p>
            </div>
          </div>
          <a href={mapLinks.personalMeet} target="_blank" rel="noreferrer" className="map-button map-button-dark">Navigate to meetup <ArrowUpRight className="size-4" /></a>
        </div>
      </section>

      <FullTourOverview />

      <nav className="sticky top-[61px] z-20 overflow-x-auto border-b border-border bg-[#f7f4ed]/92 px-5 py-3 backdrop-blur-xl sm:px-8" aria-label="Jump to tour day">
        <div className="mx-auto flex w-max max-w-6xl gap-2">
          {days.map((day) => <a key={day.id} href={`#${day.id}`} className="day-chip"><span className="font-semibold">{day.weekday}</span><span className="text-muted-foreground">{day.date.split(' ')[0]}</span></a>)}
        </div>
      </nav>

      <TourMap />

      <section id="roadbook" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="eyebrow">Roadbook</p><h2 className="section-title">The tour, day by day</h2></div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">Times are the organiser’s plan. Google may recalculate around closures; live pass status remains the final call.</p>
        </div>
        <div className="space-y-6">{days.map((day) => <DayCard key={day.id} day={day} />)}</div>
      </section>

      <section id="essentials" className="bg-[#10272f] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-[#f0bb4b]">Before every departure</p>
              <h2 className="text-4xl font-semibold tracking-[-.05em] sm:text-5xl">The pocket check</h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/62">The mountain makes the final decision. Check conditions before the keys turn, then keep the day flexible.</p>
              <a href="https://alpen-paesse.ch/en/" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f0bb4b] px-4 py-3 text-sm font-semibold text-[#10272f] hover:bg-[#ffd16a]">Check Alpine passes <ArrowUpRight className="size-4" /></a>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/12 sm:grid-cols-2">
              {[
                ['Pass status & weather', 'Recheck every morning and again before the modular Friday route.', Mountain],
                ['Swiss vignette', 'Your Swiss rental should have it. Verify at pickup; do not buy a duplicate.', ShieldCheck],
                ['Printed voucher', 'Gelmerbahn: arrive 15 minutes early and allow the walk from parking.', CableCar],
                ['Swimwear', 'Pools, saunas or wellness areas feature at most overnight stops.', Bath],
                ['Fuel rhythm', 'Use the planned Aosta, Bourg-Saint-Maurice, Ulrichen and Stampa stops.', Fuel],
                ['Documents offline', 'Licence, passport, rental agreement, insurance and return evidence.', Backpack],
              ].map(([title, copy, Icon]) => (
                <div key={String(title)} className="bg-[#10272f] p-5 sm:p-6">
                  <Icon className="mb-5 size-5 text-[#f0bb4b]" />
                  <p className="font-semibold">{title as string}</p>
                  <p className="mt-2 text-xs leading-5 text-white/55">{copy as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="homeward" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="rounded-3xl bg-[#e4ebe3] p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="eyebrow">The way home</p>
              <h2 className="text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Bellinzona → Malpensa → Gatwick</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Thursday 17 September. Travel from Bellinzona to Malpensa Terminal 2, arrive around 14:15, then fly EZY8306 at 16:50. Scheduled Gatwick arrival: 17:50 UK time.</p>
            </div>
            <a href={mapLinks.bellinzonaMalpensa} target="_blank" rel="noreferrer" className="map-button map-button-dark">Open transit route <ArrowUpRight className="size-4" /></a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            {[
              ['Bellinzona', 'Train / S50 connection'],
              ['MXP Terminal 2', 'Aim to arrive 14:15'],
              ['London Gatwick', 'Arrive 17:50 UK'],
            ].map(([place, note], index) => (
              <div key={place} className="contents">
                <div className="rounded-2xl bg-white/70 p-4"><p className="font-semibold">{place}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>
                {index < 2 ? <ArrowRight className="mx-auto hidden size-4 text-muted-foreground sm:block" /> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Fondue Tour 2026 · Personal roadbook</p>
          <p className="flex items-center gap-1.5"><Check className="size-3.5 text-[#396b67]" /> Routes assembled from the organiser’s 31 Aug roadbook</p>
        </div>
      </footer>
    </main>
  );
}
