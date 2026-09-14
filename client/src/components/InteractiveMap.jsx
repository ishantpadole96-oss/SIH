import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export function InteractiveMap({
  villages = [],
  facilities = [],
  selectedFacility = null,
  currentLocation = null,
  center = [19.7515, 75.7139],
  zoom = 7,
  onFacilitySelect,
  height = '480px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersMapRef = useRef({});

  // Initialize Leaflet map and base tile layer once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true
      });

      // OpenStreetMap Tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Fix tile cut-off when rendering in flex/grid container
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }
  }, []);

  // Update markers when villages or facilities change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous dynamic markers
    map.eachLayer(layer => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    markersMapRef.current = {};

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
        radius: 8,
        fillColor: color,
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map);

      villageMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 190px; color: #FFFFFF;">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: #94A3B8; font-weight: 700; letter-spacing: 0.5px;">Village Location</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #FFFFFF; margin: 2px 0 6px 0;">${v.village_name}</div>
          <div style="font-size: 0.82rem; color: #CBD5E1; margin-bottom: 3px;">District: <b>${v.district || 'Maharashtra'}</b></div>
          <div style="font-size: 0.82rem; color: #CBD5E1; margin-bottom: 3px;">Population: <b>${(v.population || 0).toLocaleString()}</b></div>
          <div style="font-size: 0.82rem; color: #CBD5E1; margin-bottom: 6px;">Accessibility Score: <b>${v.accessibility_score}/100</b></div>
          <div style="font-size: 0.75rem; color: #94A3B8; margin-bottom: 8px;">GPS: ${v.latitude?.toFixed(4)}° N, ${v.longitude?.toFixed(4)}° E</div>
          <div style="background: rgba(255,255,255,0.12); padding: 4px 8px; border-radius: 4px; font-size: 0.76rem; font-weight: 600;">
            ${statusLabel}
          </div>
        </div>
      `);

      bounds.extend([v.latitude, v.longitude]);
    });

    // Add Facility Markers
    facilities.forEach(f => {
      if (!f.latitude || !f.longitude) return;

      const isSelected = selectedFacility && (
        (selectedFacility.facility_id && selectedFacility.facility_id === f.facility_id) ||
        (selectedFacility.id && selectedFacility.id === f.id)
      );

      // Distinctive pin styling: if selected, use glowing gold/cyan animated pin
      const iconHtml = `
        <div style="
          background: ${isSelected ? '#F59E0B' : f.emergency_available ? '#0D9488' : '#2563EB'};
          border: ${isSelected ? '3px solid #FFFFFF' : '2px solid #FFFFFF'};
          border-radius: 50%;
          width: ${isSelected ? '38px' : '32px'};
          height: ${isSelected ? '38px' : '32px'};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: ${isSelected ? '0 0 20px #F59E0B, 0 4px 12px rgba(0,0,0,0.8)' : '0 4px 10px rgba(0,0,0,0.5)'};
          color: white;
          font-weight: bold;
          font-size: ${isSelected ? '18px' : '15px'};
          cursor: pointer;
          transition: transform 0.2s ease;
          ${isSelected ? 'animation: markerPulse 1.5s infinite;' : ''}
        ">
          🏥
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: `facility-marker ${isSelected ? 'facility-marker-selected' : ''}`,
        iconSize: isSelected ? [38, 38] : [32, 32],
        iconAnchor: isSelected ? [19, 19] : [16, 16],
        popupAnchor: [0, isSelected ? -19 : -16]
      });

      const facilityMarker = L.marker([f.latitude, f.longitude], { icon: customIcon }).addTo(map);
      const fKey = f.facility_id || f.id;
      markersMapRef.current[fKey] = facilityMarker;

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 240px; max-width: 280px; color: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 4px;">
            <span style="background: #0D9488; color: #FFFFFF; font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              ${f.facility_type}
            </span>
            <span style="font-size: 0.72rem; color: ${f.emergency_available ? '#34D399' : '#94A3B8'}; font-weight: 700;">
              ${f.emergency_available ? '🚨 24x7 Emergency' : 'Standard OPD'}
            </span>
          </div>
          <div style="font-size: 1.05rem; font-weight: 800; color: #FFFFFF; margin: 4px 0 2px 0; line-height: 1.3;">
            ${f.facility_name}
          </div>
          <div style="font-size: 0.8rem; color: #CBD5E1; margin-bottom: 4px;">
            📍 ${f.address}
          </div>
          <div style="font-size: 0.74rem; color: #38BDF8; font-weight: 600; margin-bottom: 6px;">
            🧭 GPS: ${f.latitude?.toFixed(4)}° N, ${f.longitude?.toFixed(4)}° E
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 6px 0; background: rgba(255,255,255,0.08); padding: 6px; border-radius: 6px;">
            <div>
              <div style="font-size: 0.68rem; color: #94A3B8;">Vacant Beds</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #38BDF8;">${f.available_beds} / ${f.total_beds}</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94A3B8;">Doctors on Duty</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #34D399;">${f.doctors_available || f.doctors_available_count || 1} Active</div>
            </div>
          </div>

          <div style="font-size: 0.78rem; color: #CBD5E1; margin-bottom: 8px;">
            📞 <a href="tel:${f.contact}" style="color: #38BDF8; font-weight: 600; text-decoration: none;">${f.contact}</a>
          </div>

          <a
            href="https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}"
            target="_blank"
            rel="noopener noreferrer"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: #0D9488;
              color: white;
              text-decoration: none;
              padding: 6px 12px;
              border-radius: 6px;
              font-weight: 700;
              font-size: 0.8rem;
              transition: background 0.2s ease;
            "
          >
            🧭 Directions in Google Maps
          </a>
        </div>
      `;

      facilityMarker.bindPopup(popupContent);

      facilityMarker.on('click', () => {
        if (onFacilitySelect) {
          onFacilitySelect(f);
        }
      });

      bounds.extend([f.latitude, f.longitude]);
    });

    // Add User Current Location Marker if provided
    const userLat = currentLocation?.latitude || currentLocation?.lat;
    const userLng = currentLocation?.longitude || currentLocation?.lng;
    if (userLat && userLng) {
      const userLocIcon = L.divIcon({
        html: `
          <div style="
            background: #DC2626;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 16px rgba(220, 38, 38, 0.8);
            color: white;
            font-size: 16px;
            cursor: pointer;
            animation: markerPulse 1.5s infinite;
          ">
            📍
          </div>
        `,
        className: 'user-location-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const userMarker = L.marker([userLat, userLng], { icon: userLocIcon }).addTo(map);
      userMarker.bindPopup(`
        <div style="font-family: 'Outfit', sans-serif; min-width: 180px; color: #111827; padding: 4px;">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: #0D9488; font-weight: 700;">Selected Location</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: #11322A; margin: 2px 0;">
            ${currentLocation.village_name || currentLocation.district || 'Your Location'}
          </div>
          <div style="font-size: 0.8rem; color: #4B5563;">
            District: <b>${currentLocation.district || 'Maharashtra'}</b>
          </div>
        </div>
      `);
      bounds.extend([userLat, userLng]);
    }

    // Fit map bounds only if no specific facility is currently selected
    if (!selectedFacility && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

  }, [villages, facilities, selectedFacility, currentLocation]);

  // When selectedFacility changes, smoothly pan/fly to its coordinates and open popup
  useEffect(() => {
    if (!selectedFacility || !mapInstanceRef.current) return;
    const lat = selectedFacility.latitude;
    const lng = selectedFacility.longitude;
    if (!lat || !lng) return;

    const map = mapInstanceRef.current;
    map.flyTo([lat, lng], 15, {
      animate: true,
      duration: 1.2
    });

    const fKey = selectedFacility.facility_id || selectedFacility.id;
    const marker = markersMapRef.current[fKey];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 400);
    }
  }, [selectedFacility]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Embedded CSS for pulsing selected marker */}
      <style>{`
        @keyframes markerPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
          70% { transform: scale(1.15); box-shadow: 0 0 0 14px rgba(245, 158, 11, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>

      {/* Floating Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(15, 23, 42, 0.92)',
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
        <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
          <span>GIS Precision Map</span>
          <span style={{ color: '#2DD4BF', fontSize: '0.7rem' }}>OSM Live</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></span>
          <span>Village: Good Access (&gt;70)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></span>
          <span>Village: Moderate (45-70)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></span>
          <span>Village: Underserved (&lt;45)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <span>🏥</span>
          <span>Healthcare Facility (Click to Inspect)</span>
        </div>
      </div>
    </div>
  );
}
