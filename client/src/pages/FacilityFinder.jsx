import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { 
  Search, Filter, MapPin, Hospital, Stethoscope, Bed, ShieldAlert, 
  Pill, Star, Phone, Navigation, Calendar, ChevronRight, CheckCircle2 
} from 'lucide-react';

export function FacilityFinder({ setActiveTab, setSelectedFacilityForBooking }) {
  const { selectedVillage } = useAuth();
  const { t } = useLanguage();

  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'cards' | 'map'

  const handleSelectFacility = (facility, fromMap = false) => {
    setSelectedFacility(facility);
    if (fromMap && facility?.facility_id) {
      setTimeout(() => {
        const cardEl = document.getElementById(`facility-card-${facility.facility_id}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [facilityType, setFacilityType] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [maxDistance, setMaxDistance] = useState('');

  // Sync district with user's selected village/district
  useEffect(() => {
    if (selectedVillage?.district) {
      setSelectedDistrict(selectedVillage.district);
    }
  }, [selectedVillage]);

  const fetchFacilities = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedDistrict && selectedDistrict !== 'All') params.append('district', selectedDistrict);
    if (facilityType !== 'All') params.append('facility_type', facilityType);
    if (selectedService !== 'All') params.append('service', selectedService);
    if (emergencyOnly) params.append('emergency_only', 'true');
    if (openNow) params.append('open_now', 'true');
    if (maxDistance) params.append('max_distance', maxDistance);

    if (selectedVillage) {
      params.append('village_id', selectedVillage.village_id);
      const uLat = selectedVillage.latitude || selectedVillage.lat;
      const uLng = selectedVillage.longitude || selectedVillage.lng;
      if (uLat && uLng) {
        params.append('user_lat', uLat);
        params.append('user_lng', uLng);
      }
    }

    fetch(`/api/facilities?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setFacilities(data.facilities || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load facilities:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFacilities();
  }, [searchTerm, selectedDistrict, facilityType, selectedService, emergencyOnly, openNow, maxDistance, selectedVillage]);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Page Title & View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#11322A', fontWeight: 800 }}>
            {t('tile_find_healthcare')}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Discover government health sub-centres, PHCs, CHCs, and District Hospitals near <b>{selectedVillage?.village_name}</b>
          </p>
        </div>

        {/* View mode toggle buttons */}
        <div style={{ display: 'flex', background: 'var(--color-bg-card)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setViewMode('both')}
            className={`btn btn-sm ${viewMode === 'both' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '0.35rem 0.8rem' }}
          >
            Split View (Map + List)
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '0.35rem 0.8rem' }}
          >
            Cards Only
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '0.35rem 0.8rem' }}
          >
            Map Only
          </button>
        </div>
      </div>

      {/* Authoritative Source Banner (Master Technical Spec Sec 2.1 & 18) */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: '#38BDF8', fontWeight: 700 }}>✓ Official Facility Directory:</span> Mapped from Public Health Department & NHM Maharashtra. GPS coordinates and routing are calculated directly from user location.
        </div>
        <a
          href="tel:112"
          className="btn btn-emergency btn-sm"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ShieldAlert size={14} /> National Emergency 112 (ERSS)
        </a>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          
          {/* Keyword Search */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search Facility or Town</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Khed, PHC, Manchar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* District Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">District (Maharashtra)</label>
            <select
              className="form-select"
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
            >
              <option value="All">All 36 Districts</option>
              <option value="Ahmednagar">Ahmednagar (Ahilyanagar)</option>
              <option value="Akola">Akola</option>
              <option value="Amravati">Amravati</option>
              <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
              <option value="Beed">Beed</option>
              <option value="Bhandara">Bhandara</option>
              <option value="Buldhana">Buldhana</option>
              <option value="Chandrapur">Chandrapur</option>
              <option value="Dhule">Dhule</option>
              <option value="Gadchiroli">Gadchiroli</option>
              <option value="Gondia">Gondia</option>
              <option value="Hingoli">Hingoli</option>
              <option value="Jalgaon">Jalgaon</option>
              <option value="Jalna">Jalna</option>
              <option value="Kolhapur">Kolhapur</option>
              <option value="Latur">Latur</option>
              <option value="Mumbai City">Mumbai City</option>
              <option value="Mumbai Suburban">Mumbai Suburban</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Nanded">Nanded</option>
              <option value="Nandurbar">Nandurbar</option>
              <option value="Nashik">Nashik</option>
              <option value="Dharashiv">Dharashiv (Osmanabad)</option>
              <option value="Palghar">Palghar</option>
              <option value="Parbhani">Parbhani</option>
              <option value="Pune">Pune</option>
              <option value="Raigad">Raigad</option>
              <option value="Ratnagiri">Ratnagiri</option>
              <option value="Sangli">Sangli</option>
              <option value="Satara">Satara</option>
              <option value="Sindhudurg">Sindhudurg</option>
              <option value="Solapur">Solapur</option>
              <option value="Thane">Thane</option>
              <option value="Wardha">Wardha</option>
              <option value="Washim">Washim</option>
              <option value="Yavatmal">Yavatmal</option>
            </select>
          </div>

          {/* Facility Type Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Facility Tier</label>
            <select
              className="form-select"
              value={facilityType}
              onChange={e => setFacilityType(e.target.value)}
            >
              <option value="All">All Tiers</option>
              <option value="Sub-Centre">Sub-Centre (Village level)</option>
              <option value="PHC">Primary Health Centre (PHC)</option>
              <option value="CHC">Community Health Centre (CHC)</option>
              <option value="Sub-District Hospital">Sub-District Hospital</option>
              <option value="Government Hospital">District / Civil Hospital</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Required Service</label>
            <select
              className="form-select"
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
            >
              <option value="All">All Clinical Services</option>
              <option value="General">General Outpatient (OPD)</option>
              <option value="Emergency">Emergency & Trauma</option>
              <option value="Maternal">Maternal & Delivery Care</option>
              <option value="Child">Child Immunization / Pediatrics</option>
              <option value="X-Ray">X-Ray & Ultrasound Diagnostics</option>
              <option value="Lab">Laboratory Blood Diagnostics</option>
            </select>
          </div>

          {/* Distance Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Max Distance (km)</label>
            <select
              className="form-select"
              value={maxDistance}
              onChange={e => setMaxDistance(e.target.value)}
            >
              <option value="">Any Distance</option>
              <option value="5">Within 5 km</option>
              <option value="15">Within 15 km</option>
              <option value="30">Within 30 km</option>
            </select>
          </div>

        </div>

        {/* Checkbox Quick Toggles */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={e => setEmergencyOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#EF4444' }}
            />
            <span>🚨 24x7 Emergency Available Only</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={openNow}
              onChange={e => setOpenNow(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#0D9488' }}
            />
            <span>🟢 Open Right Now</span>
          </label>

          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <b>{facilities.length}</b> verified government facilities
          </span>
        </div>
      </div>

      {/* Main Content: Map & Facilities List */}
      <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'both' ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        
        {/* Interactive GIS Map */}
        {(viewMode === 'both' || viewMode === 'map') && (
          <div style={{ position: viewMode === 'both' ? 'sticky' : 'relative', top: viewMode === 'both' ? '90px' : 'auto', height: viewMode === 'both' ? '680px' : '560px' }}>
            <InteractiveMap
              facilities={facilities}
              selectedFacility={selectedFacility}
              currentLocation={selectedVillage}
              onFacilitySelect={(fac) => handleSelectFacility(fac, true)}
              height="100%"
            />
          </div>
        )}

        {/* Facility Cards List */}
        {(viewMode === 'both' || viewMode === 'cards') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Loading healthcare facilities...
              </div>
            ) : facilities.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Hospital size={44} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <h3>No Facilities Found</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                  Try adjusting your distance or service filter.
                </p>
              </div>
            ) : (
              facilities.map(f => {
                const isSelected = selectedFacility && (selectedFacility.facility_id === f.facility_id || selectedFacility.id === f.id);

                return (
                  <div
                    key={f.facility_id}
                    id={`facility-card-${f.facility_id}`}
                    className="card"
                    style={{
                      background: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'var(--color-bg-card)',
                      border: isSelected 
                        ? '2px solid #2DD4BF' 
                        : (f.emergency_available ? '1px solid rgba(13, 148, 136, 0.4)' : '1px solid var(--border-subtle)'),
                      boxShadow: isSelected ? '0 0 20px rgba(45, 212, 191, 0.28)' : 'none',
                      padding: '1.4rem',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {/* Top Bar: Type, Distance & Rating */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-info" style={{ fontWeight: 700 }}>
                          {f.facility_type}
                        </span>
                        <span className={`badge ${f.current_status === 'Open' ? 'badge-success' : 'badge-danger'}`}>
                          {f.current_status}
                        </span>
                        {f.emergency_available ? (
                          <span className="badge badge-danger">
                            🚨 24x7 Emergency
                          </span>
                        ) : null}
                        {isSelected && (
                          <span className="badge badge-success" style={{ background: '#0D9488', color: '#FFFFFF', fontWeight: 700 }}>
                            📍 Map Focused
                          </span>
                        )}
                      </div>

                      {/* Distance from selected village */}
                      {f.distanceKm !== null && (
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2DD4BF' }}>
                            {f.distanceKm} km
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            from {selectedVillage?.village_name}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Facility Name & Address */}
                    <h3 
                      onClick={() => handleSelectFacility(f)} 
                      style={{ fontSize: '1.25rem', color: '#11322A', marginBottom: '0.25rem', fontWeight: 700, cursor: 'pointer' }}
                      title="Click to locate on map"
                    >
                      {f.facility_name}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      📍 {f.address}
                    </p>
                    <div style={{ fontSize: '0.76rem', color: '#38BDF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.85rem' }}>
                      <MapPin size={13} /> GPS: {f.latitude?.toFixed(4)}° N, {f.longitude?.toFixed(4)}° E &bull; {f.district || 'Maharashtra'}
                    </div>

                    {/* 4 Core Availability Indicators (Real-time from Database) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '0.5rem',
                      background: 'var(--color-bg-primary)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem'
                    }}>
                      {/* Doctors */}
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Stethoscope size={13} /> Doctors
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: f.doctors_available_count > 0 ? '#34D399' : '#F87171' }}>
                          {f.doctors_available_count} Available
                        </div>
                      </div>

                      {/* Beds */}
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Bed size={13} /> Beds
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38BDF8' }}>
                          {f.available_beds} / {f.total_beds}
                        </div>
                      </div>

                      {/* Medicines */}
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Pill size={13} /> Medicines
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: f.medicine_summary?.out_of_stock > 1 ? '#FBBF24' : '#34D399' }}>
                          {f.medicine_summary?.in_stock || 0} in stock
                        </div>
                      </div>

                      {/* Rating */}
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Star size={13} color="#FBBF24" /> Rating
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#11322A' }}>
                          ⭐ {f.average_rating} ({f.total_reviews_count || 4})
                        </div>
                      </div>
                    </div>

                    {/* Services tags */}
                    {f.services && f.services.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {f.services.slice(0, 4).map((s, idx) => (
                          <span key={idx} style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Data Provenance (Master Spec Sec 0 & 32) */}
                    <div style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <span>Source: <b>{f.source_name || 'Govt of Maharashtra / NHM'}</b></span>
                      <span style={{ color: f.is_demo_data ? '#F59E0B' : '#34D399', fontWeight: 600 }}>
                        {f.is_demo_data ? 'DEMO RECORD' : '✓ Verified Public Facility'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSelectFacility(f)}
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        title="Focus and zoom to this hospital on the map"
                      >
                        <MapPin size={15} /> {isSelected ? 'Focused on Map' : 'Locate on Map'}
                      </button>

                      <button
                        onClick={() => {
                          if (setSelectedFacilityForBooking) setSelectedFacilityForBooking(f);
                          setActiveTab('book-appointment');
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Calendar size={16} /> Book Appointment
                      </button>
                      <a
                        href={`tel:${f.contact}`}
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        <Phone size={16} /> Call
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: 'none' }}
                        title="Open exact GPS coordinates in Google Maps"
                      >
                        <Navigation size={16} /> Directions
                      </a>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

    </div>
  );
}
