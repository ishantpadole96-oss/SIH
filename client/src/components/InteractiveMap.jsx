import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export function InteractiveMap({
  villages = [],
  facilities = [],
  center = [18.2851, 73.8824],
  zoom = 11,
  onFacilitySelect,
  height = '480px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true
      });

      // Standard OpenStreetMap Tile layer (Free, open source, no API key watermark)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous dynamic layers
    map.eachLayer(layer => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds();

    // Add Village Markers (Color-coded by Accessibility Score)
    villages.forEach(v => {
      if (!v.latitude || !v.longitude) return;

      let color = '#EF4444'; // Red: Underserved
      let statusLabel = '🔴 Underserved (<45)';
      if (v.accessibility_score >= 70) {
        color = '#10B981'; // Green: Good
        statusLabel = '🟢 Good (>70)';
      } else if (v.accessibility_score >= 45) {
        color = '#F59E0B'; // Yellow: Moderate
        statusLabel = '🟡 Moderate (45-70)';
      }

      const villageMarker = L.circleMarker([v.latitude, v.longitude], {
        radius: 9,
        fillColor: color,
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map);

      villageMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 180px;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #94A3B8; font-weight: 700;">Village Location</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #FFFFFF; margin: 2px 0 6px 0;">${v.village_name}</div>
          <div style="font-size: 0.82rem; color: #CBD5E1; margin-bottom: 4px;">Population: <b>${v.population.toLocaleString()}</b></div>
          <div style="font-size: 0.82rem; color: #CBD5E1; margin-bottom: 8px;">Accessibility Score: <b>${v.accessibility_score}/100</b></div>
          <div style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 600; color: #F8FAFC;">
            ${statusLabel}
          </div>
        </div>
      `);

      bounds.extend([v.latitude, v.longitude]);
    });

    // Add Facility Markers
    facilities.forEach(f => {
      if (!f.latitude || !f.longitude) return;

      // Hospital / PHC pin icon
      const iconHtml = `
        <div style="
          background: #0D9488;
          border: 2px solid #FFFFFF;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          🏥
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'facility-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const facilityMarker = L.marker([f.latitude, f.longitude], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="background: #0D9488; color: #FFFFFF; font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              ${f.facility_type}
            </span>
            <span style="font-size: 0.75rem; color: ${f.emergency_available ? '#34D399' : '#94A3B8'}; font-weight: 700;">
              ${f.emergency_available ? '🚨 24x7 Emergency' : 'Standard OPD'}
            </span>
          </div>
          <div style="font-size: 1.05rem; font-weight: 800; color: #FFFFFF; margin: 4px 0;">${f.facility_name}</div>
          <div style="font-size: 0.82rem; color: #CBD5E1; margin-bottom: 4px;">${f.address}</div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 8px 0; background: rgba(255,255,255,0.06); padding: 6px; border-radius: 6px;">
            <div>
              <div style="font-size: 0.7rem; color: #94A3B8;">Available Beds</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #38BDF8;">${f.available_beds} / ${f.total_beds}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: #94A3B8;">Available Doctors</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #34D399;">${f.doctors_available || f.doctors_available_count || 1} Doc</div>
            </div>
          </div>

          <div style="font-size: 0.8rem; color: #94A3B8; margin-bottom: 6px;">
            📞 Contact: <a href="tel:${f.contact}" style="color: #38BDF8; font-weight: 600;">${f.contact}</a>
          </div>
        </div>
      `;

      facilityMarker.bindPopup(popupContent);

      if (onFacilitySelect) {
        facilityMarker.on('click', () => onFacilitySelect(f));
      }

      bounds.extend([f.latitude, f.longitude]);
    });

    // Fit map bounds if markers exist
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }

  }, [villages, facilities, center, zoom]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {/* Floating Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        fontSize: '0.78rem',
        color: '#F8FAFC',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px', marginBottom: '2px' }}>
          GIS Map Legend
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></span>
          <span>Village: High Accessibility (&gt;70)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></span>
          <span>Village: Moderate Accessibility (45-70)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></span>
          <span>Village: Underserved Critical (&lt;45)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <span>🏥</span>
          <span>Government Healthcare Facility</span>
        </div>
      </div>
    </div>
  );
}
