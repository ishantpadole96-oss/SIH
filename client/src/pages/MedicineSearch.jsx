import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Pill, Search, Hospital, Edit2, AlertCircle, CheckCircle2, Phone, X, Sparkles, TrendingDown, ArrowRight } from 'lucide-react';
import VoiceReader from '../components/VoiceReader';

export function MedicineSearch() {
  const { user, role, token } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'generics'
  const [search, setSearch] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [groupedMedicines, setGroupedMedicines] = useState([]);
  const [generics, setGenerics] = useState([]);
  const [genericStats, setGenericStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit stock modal state
  const [editingMed, setEditingMed] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [newStatus, setNewStatus] = useState('In Stock');
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchMedicines = () => {
    setLoading(true);
    const url = search ? `/api/medicines?search=${encodeURIComponent(search)}` : '/api/medicines';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setMedicines(data.medicines || []);
        setGroupedMedicines(data.groupedByMedicine || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load medicines:', err);
        setLoading(false);
      });
  };

  const fetchGenerics = () => {
    setLoading(true);
    const url = search ? `/api/medicines/generic-alternatives?search=${encodeURIComponent(search)}` : '/api/medicines/generic-alternatives';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setGenerics(data.alternatives || []);
        setGenericStats({
          count: data.count,
          avgSavings: data.averageSavingsPercentage
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load generic medicines:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchMedicines();
    } else {
      fetchGenerics();
    }
  }, [search, activeTab]);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!editingMed) return;

    try {
      const res = await fetch(`/api/medicines/${editingMed.medicine_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: parseInt(newQuantity),
          stock_status: newStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update stock');

      setStatusMsg({ type: 'success', text: 'Stock inventory updated successfully!' });
      fetchMedicines();
      setTimeout(() => setEditingMed(null), 1200);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const canEdit = ['doctor', 'asha', 'admin'].includes(role);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--primary-teal)', padding: '0.35rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          <Pill size={16} /> National Essential Medicines List (NEML) & Jan Aushadhi
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#11322A', marginBottom: '0.5rem' }}>
          Rural Medicine Availability & Generic Finder
        </h1>
        <p style={{ color: '#52786D', maxWidth: '680px', margin: '0 auto', fontSize: '1rem' }}>
          Check real-time pharmacy stocks across Sub-Centres, PHCs, and District Hospitals, or find affordable government-subsidized Jan Aushadhi generic alternatives.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('inventory'); setSearch(''); }}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            border: activeTab === 'inventory' ? '2px solid #0D9488' : '1px solid var(--border-subtle)',
            background: activeTab === 'inventory' ? '#0D9488' : '#FFFFFF',
            color: activeTab === 'inventory' ? '#FFFFFF' : '#374151',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Hospital size={18} />
          <span>PHC & Hospital Live Stock</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('generics'); setSearch(''); }}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            border: activeTab === 'generics' ? '2px solid #F59E0B' : '1px solid var(--border-subtle)',
            background: activeTab === 'generics' ? 'rgba(245, 158, 11, 0.2)' : 'var(--card-bg)',
            color: activeTab === 'generics' ? '#FBBF24' : '#FFFFFF',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={18} className={activeTab === 'generics' ? 'text-amber-400 animate-spin-slow' : ''} />
          <span>Jan Aushadhi Generic Savings Finder (Save up to 87%)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.75rem', fontSize: '1rem', width: '100%' }}
              placeholder={activeTab === 'inventory'
                ? "Search essential medicines (e.g., Paracetamol, Anti-Snake Venom, Amoxicillin, Insulin)..."
                : "Search popular brand name (e.g. Augmentin, Pan-D, Glycomet, Telma, Dolo, Montair)..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button className="btn btn-secondary" onClick={() => setSearch('')}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* VIEW A: Jan Aushadhi Generic Savings Finder */}
      {activeTab === 'generics' ? (
        <div>
          {genericStats && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(13, 148, 136, 0.12) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              color: '#11322A'
            }}>
              <div>
                <strong style={{ fontSize: '1.1rem', color: '#B45309' }}>Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)</strong>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                  High-quality generic medicines matching WHO-GMP bioequivalence at a fraction of branded market retail cost.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0D9488' }}>~{genericStats.avgSavings}%</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Citizen Savings</div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading generic alternatives...</div>
          ) : generics.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No generic mapping found for "{search}". Try searching "Augmentin", "Pan-D", "Telma", or "Dolo".
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {generics.map(g => (
                <div key={g.generic_id} className="card" style={{
                  padding: '1.5rem',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    {/* Header Pill */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: '#F1F5F9', color: '#475569' }}>
                        {g.category}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <TrendingDown size={14} /> Save {g.savings_percentage}%
                      </span>
                    </div>

                    {/* Brand vs Generic Title */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Popular Brand Name</div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#11322A', margin: '0.1rem 0 0.5rem 0' }}>{g.brand_name}</h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0D9488', fontWeight: 600, fontSize: '0.95rem' }}>
                        <ArrowRight size={16} />
                        <span>Jan Aushadhi Generic Formula:</span>
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F766E', marginTop: '0.2rem' }}>
                        {g.generic_name}
                      </div>
                    </div>

                    {/* Price Comparison Widget */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      margin: '1rem 0'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Market Retail (MRP):</span>
                        <div style={{ fontSize: '1.1rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                          ₹{g.market_price.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>Jan Aushadhi Price:</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10B981' }}>
                          ₹{g.jan_aushadhi_price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {g.description}
                    </p>

                    <div style={{ fontSize: '0.8rem', color: '#CBD5E1', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Common Uses:</strong> {g.common_uses}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Form: {g.dosage_form}</span>
                    <VoiceReader text={`${g.brand_name}. Generic equivalent is ${g.generic_name}. Market price is ${g.market_price} rupees, government Jan Aushadhi price is only ${g.jan_aushadhi_price} rupees. You save ${g.savings_percentage} percent.`} label="Read Aloud" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VIEW B: Existing Live PHC & Hospital Stock */
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading pharmacy inventories...</div>
          ) : groupedMedicines.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No medicines found matching "{search}".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {groupedMedicines.map((group, idx) => (
                <div key={idx} className="card" style={{ padding: '1.5rem', background: '#FFFFFF', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#11322A' }}>{group.medicine_name}</h2>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: '#E8F5EE', color: '#0D9488', fontWeight: 600 }}>
                          {group.category}
                        </span>
                      </div>
                      <p style={{ color: '#52786D', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Available across {group.facilities.length} government healthcare centres
                      </p>
                    </div>

                    <VoiceReader text={`${group.medicine_name}, category ${group.category}. Available in ${group.facilities.length} healthcare facilities.`} />
                  </div>

                  {/* Facilities Grid for this medicine */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {group.facilities.map(fac => {
                      const isOutOfStock = fac.stock_status === 'Out of Stock' || fac.quantity === 0;
                      const isLowStock = fac.stock_status === 'Low Stock';

                      return (
                        <div
                          key={fac.facility_id}
                          style={{
                            background: '#F8FAF9',
                            border: `1px solid ${isOutOfStock ? 'rgba(239, 68, 68, 0.3)' : isLowStock ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#11322A' }}>{fac.facility_name}</h3>
                              <span
                                className={`badge ${isOutOfStock ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'}`}
                                style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', whiteSpace: 'nowrap' }}
                              >
                                {fac.stock_status}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.5rem' }}>
                              {fac.facility_type} • {fac.village_name || 'Pune District'}
                            </div>

                            <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '0.5rem' }}>
                              Current Quantity: <strong style={{ color: '#11322A' }}>{fac.quantity} {group.unit}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Updated: {fac.last_updated ? fac.last_updated.substring(0, 10) : 'Recent'}
                            </span>

                            {canEdit && (
                              <button
                                onClick={() => {
                                  setEditingMed(fac);
                                  setNewQuantity(fac.quantity);
                                  setNewStatus(fac.stock_status);
                                  setStatusMsg(null);
                                }}
                                className="btn btn-sm btn-outline"
                                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                              >
                                <Edit2 size={12} /> Edit Stock
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Staff Edit Medicine Stock Modal */}
      {editingMed && (
        <div className="modal-overlay" onClick={() => setEditingMed(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#11322A' }}>Update Pharmacy Inventory</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{editingMed.facility_name}</p>
              </div>
              <button onClick={() => setEditingMed(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {statusMsg && (
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: statusMsg.type === 'success' ? '#34D399' : '#F87171',
                fontSize: '0.85rem'
              }}>
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateStock}>
              <div className="form-group">
                <label className="form-label">Available Quantity (Strips/Vials/Sachets)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newQuantity}
                  onChange={e => setNewQuantity(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Status</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Stock Update
                </button>
                <button type="button" onClick={() => setEditingMed(null)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
