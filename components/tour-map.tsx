'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, ExternalLink, FileArchive, MapPin, Navigation, Route } from 'lucide-react';
import routePlans from '@/data/tour-routes.json';

type Stop = {
  time: string;
  name: string;
  detail: string;
  lat: number;
  lon: number;
};

type RoutePlan = {
  id: string;
  day: string;
  title: string;
  subtitle: string;
  color: string;
  stops: Stop[];
};

type RouteStats = { distanceMetres: number; durationSeconds: number } | null;
type RouteGeoJson = {
  properties: { distanceMetres: number; durationSeconds: number };
  features: Array<{
    properties?: { kind?: string };
    geometry: { coordinates: Array<[number, number]> };
  }>;
};

const plans = routePlans as RoutePlan[];

function directionsUrl(stops: Stop[], startIndex: number) {
  const remaining = stops.slice(startIndex);
  const coordinate = (stop: Stop) => `${stop.lat},${stop.lon}`;

  if (remaining.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinate(remaining[0]))}`;
  }

  const params = new URLSearchParams({
    api: '1',
    origin: coordinate(remaining[0]),
    destination: coordinate(remaining.at(-1)!),
    travelmode: 'driving',
  });
  if (remaining.length > 2) params.set('waypoints', remaining.slice(1, -1).map(coordinate).join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]!);
}

export function TourMap() {
  const [activeId, setActiveId] = useState('wednesday-personal');
  const [stats, setStats] = useState<RouteStats>(null);
  const [mapError, setMapError] = useState(false);
  const mapElement = useRef<HTMLDivElement>(null);
  const activePlan = useMemo(() => plans.find((plan) => plan.id === activeId) ?? plans[0], [activeId]);

  useEffect(() => {
    let disposed = false;
    let map: import('leaflet').Map | undefined;

    async function renderMap() {
      if (!mapElement.current) return;
      setMapError(false);
      setStats(null);

      try {
        const [L, response] = await Promise.all([
          import('leaflet'),
          fetch(`/routes/${activePlan.id}.geojson`),
        ]);
        if (!response.ok) throw new Error('Route file was not available');
        const geojson = await response.json() as RouteGeoJson;
        if (disposed || !mapElement.current) return;

        const routeFeature = geojson.features.find((feature: { properties?: { kind?: string } }) => feature.properties?.kind === 'route');
        if (!routeFeature) throw new Error('Route geometry was not available');
        const coordinates = routeFeature.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon] as [number, number]);

        map = L.map(mapElement.current, { scrollWheelZoom: false, zoomControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const routeLine = L.polyline(coordinates, {
          color: activePlan.color,
          weight: 5,
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(map);

        activePlan.stops.forEach((stop, index) => {
          const navigateUrl = directionsUrl(activePlan.stops, index);
          const gpxUrl = `/gpx/continue/${activePlan.id}-from-${String(index + 1).padStart(2, '0')}.gpx`;
          L.circleMarker([stop.lat, stop.lon], {
            radius: index === 0 || index === activePlan.stops.length - 1 ? 8 : 6,
            color: '#fffdf8',
            weight: 3,
            fillColor: activePlan.color,
            fillOpacity: 1,
          })
            .bindTooltip(`${index + 1}. ${stop.name}`, { direction: 'top' })
            .bindPopup(`
              <div class="map-popup">
                <span>${escapeHtml(stop.time || `Stop ${index + 1}`)}</span>
                <strong>${escapeHtml(stop.name)}</strong>
                <small>${escapeHtml(stop.detail)}</small>
                <a href="${navigateUrl}" target="_blank" rel="noreferrer">Navigate from here ↗</a>
                <a href="${gpxUrl}" download>Download remaining GPX ↓</a>
              </div>
            `)
            .addTo(map!);
        });

        map.fitBounds(routeLine.getBounds(), { padding: [24, 24] });
        setStats(geojson.properties ?? null);
      } catch {
        if (!disposed) setMapError(true);
      }
    }

    void renderMap();
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [activePlan]);

  const distance = stats ? `${Math.round(stats.distanceMetres / 1000)} km` : 'Loading distance';
  const hours = stats ? `${Math.floor(stats.durationSeconds / 3600)}h ${Math.round((stats.durationSeconds % 3600) / 60)}m mapped` : 'Loading time';

  return (
    <section id="navigator" className="border-y border-border bg-[#e8eee7]">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Route navigator</p>
            <h2 className="section-title">Restart from any stop</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pick a day, then tap the stop you are currently at. The Google Maps link carries forward every remaining waypoint; the companion GPX preserves the remaining TomTom track.
            </p>
          </div>
          <a href="/downloads/fondue-tour-2026-tomtom-gpx.zip" download className="map-button map-button-dark">
            <FileArchive className="size-4" /> Download all TomTom GPX
          </a>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-2" aria-label="Choose route">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setActiveId(plan.id)}
              className={`map-day-tab ${plan.id === activePlan.id ? 'is-active' : ''}`}
              style={plan.id === activePlan.id ? { backgroundColor: plan.color, borderColor: plan.color } : undefined}
            >
              {plan.day}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-[#fffdf8] shadow-[0_24px_60px_rgb(18_38_45_/_8%)]">
          <div className="grid min-w-0 lg:grid-cols-[minmax(300px,.72fr)_minmax(0,1.28fr)]">
            <div className="min-w-0 border-b border-border lg:border-b-0 lg:border-r">
              <div className="border-b border-border p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em]" style={{ color: activePlan.color }}>
                  <Route className="size-4" /> {activePlan.day}
                </div>
                <h3 className="text-xl font-semibold tracking-[-.03em]">{activePlan.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{activePlan.subtitle}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-muted-foreground">
                  <span className="rounded-full bg-[#f1eee6] px-3 py-1.5">{distance}</span>
                  <span className="rounded-full bg-[#f1eee6] px-3 py-1.5">{hours}</span>
                  <span className="rounded-full bg-[#f1eee6] px-3 py-1.5">{activePlan.stops.length} stops</span>
                </div>
                <a href={`/gpx/${activePlan.id}.gpx`} download className="mt-4 inline-flex items-center gap-2 text-xs font-semibold hover:underline" style={{ color: activePlan.color }}>
                  <Download className="size-3.5" /> Download this full GPX
                </a>
              </div>

              <div className="max-h-[540px] overflow-y-auto p-2 sm:p-3">
                <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">Start from…</p>
                {activePlan.stops.map((stop, index) => {
                  const remaining = activePlan.stops.length - index;
                  return (
                    <div key={`${stop.name}-${index}`} className="route-restart-row">
                      <a href={directionsUrl(activePlan.stops, index)} target="_blank" rel="noreferrer" className="route-restart-main">
                        <span className="route-restart-number" style={{ backgroundColor: activePlan.color }}>{index + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{stop.name}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                            {stop.time ? `${stop.time} · ` : ''}{remaining === 1 ? 'Open final stop' : `${remaining - 1} stop${remaining - 1 === 1 ? '' : 's'} remaining`}
                          </span>
                        </span>
                        <Navigation className="size-4 shrink-0" style={{ color: activePlan.color }} />
                      </a>
                      <a
                        href={`/gpx/continue/${activePlan.id}-from-${String(index + 1).padStart(2, '0')}.gpx`}
                        download
                        className="route-restart-gpx"
                        aria-label={`Download GPX from ${stop.name}`}
                        title="Download the remaining TomTom GPX"
                      >
                        GPX
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative min-h-[460px] min-w-0 bg-[#dfe8e0] lg:min-h-[680px]">
              {mapError ? (
                <div className="absolute inset-0 grid place-items-center p-8 text-center">
                  <div><MapPin className="mx-auto size-7 text-[#b84a32]" /><p className="mt-3 font-semibold">The map could not load.</p><p className="mt-1 text-xs text-muted-foreground">The restart links and GPX downloads still work.</p></div>
                </div>
              ) : null}
              <div ref={mapElement} className="absolute inset-0 z-0" aria-label={`OpenStreetMap route for ${activePlan.title}`} />
              <div className="pointer-events-none absolute bottom-4 left-4 z-[500] max-w-[250px] rounded-xl bg-[#10272f]/90 px-3 py-2 text-[10px] leading-4 text-white/75 shadow-lg backdrop-blur">
                Indicative OSRM route. Check closures and pass status before driving.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-xs leading-5 text-muted-foreground sm:grid-cols-2">
          <p><strong className="text-foreground">TomTom:</strong> import a downloaded GPX at Plan.TomTom.com → My Items → Routes → Import GPX, then sync it as a track.</p>
          <p><strong className="text-foreground">Google Maps:</strong> long waypoint lists can be shortened by some mobile clients. If that happens, use the next-stop link again or the complete GPX track.</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">
          <a href="https://plan.tomtom.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:underline">Open TomTom Plan <ExternalLink className="size-3.5" /></a>
          <a href="https://help.tomtom.com/hc/en-gb/articles/360013958599-Importing-items-in-Plan-TomTom-com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:underline">TomTom GPX instructions <ExternalLink className="size-3.5" /></a>
        </div>
      </div>
    </section>
  );
}
