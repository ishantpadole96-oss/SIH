import React, { useState, useEffect } from 'react';
import { Baby, Calendar, AlertTriangle, CheckCircle2, Clock, ShieldCheck, Heart, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MaternalChildTracker() {
  const { language } = useLanguage();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'high_risk' | 'infants'

  useEffect(() => {
    const token = localStorage.getItem('ruralcare_token');
    fetch('/api/mch', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.records) setRecords(data.records);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load MCH records:', err);
        setLoading(false);
      });
  }, []);

  const filtered = records.filter(r => {
    if (activeTab === 'high_risk') return r.high_risk_flag === 1;
    if (activeTab === 'infants') return r.category === 'Infant/Child';
    return true;
  });

  return (
    <div className="mch-tracker-container">
      <div className="mch-header-banner">
        <div>
          <h3 className="mch-title flex items-center gap-2">
            <Baby className="text-teal" size={24} />
            <span>Maternal & Child Health (MCH / RCH) Registry</span>
          </h3>
          <p className="mch-subtitle">
            Antenatal Care (ANC) tracking, High-Risk Pregnancy (HRP) surveillance, and Universal Immunization Programme (UIP)
          </p>
        </div>
        <div className="mch-tab-pills">
          <button
            className={`pill-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Cohorts ({records.length})
          </button>
          <button
            className={`pill-btn ${activeTab === 'high_risk' ? 'active' : ''}`}
            onClick={() => setActiveTab('high_risk')}
          >
            High-Risk Alert ({records.filter(r => r.high_risk_flag === 1).length})
          </button>
          <button
            className={`pill-btn ${activeTab === 'infants' ? 'active' : ''}`}
            onClick={() => setActiveTab('infants')}
          >
            Infant Immunizations ({records.filter(r => r.category === 'Infant/Child').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading MCH health registry...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No records found for the selected filter.</div>
      ) : (
        <div className="mch-cards-grid">
          {filtered.map(r => (
            <div key={r.mch_id} className={`mch-card ${r.high_risk_flag ? 'high-risk-border' : ''}`}>
              <div className="mch-card-top">
                <div className="flex items-center gap-2">
                  {r.category === 'Pregnant Mother' ? (
                    <span className="badge-category mother">Pregnant Mother</span>
                  ) : (
                    <span className="badge-category infant">Infant / Child</span>
                  )}
                  {r.high_risk_flag === 1 && (
                    <span className="badge-risk-alert flex items-center gap-1">
                      <AlertTriangle size={12} />
                      <span>HIGH RISK</span>
                    </span>
                  )}
                </div>
                <span className="mch-village-badge">{r.village_name || 'Shivapur'}</span>
              </div>

              <div className="mch-beneficiary-info">
                <h4 className="beneficiary-name">{r.patient_name}</h4>
                <div className="beneficiary-meta">
                  <span>Age: {r.age} yrs</span> •
                  <span>Blood: <strong className="text-red-600">{r.blood_group}</strong></span> •
                  <span>Phone: {r.patient_phone}</span>
                </div>
                {r.high_risk_reason && (
                  <div className="high-risk-callout">
                    <strong>Critical Factor:</strong> {r.high_risk_reason}
                  </div>
                )}
              </div>

              {r.category === 'Pregnant Mother' ? (
                <div className="anc-progress-box">
                  <div className="anc-status-header">
                    <span>ANC Visits Completed: <strong>{r.anc_visits_completed} of 4</strong></span>
                    <span>Gestational: <strong>{r.gestational_weeks} Weeks</strong></span>
                  </div>
                  <div className="anc-progress-bar">
                    <div
                      className="anc-progress-fill"
                      style={{ width: `${(r.anc_visits_completed / 4) * 100}%` }}
                    ></div>
                  </div>
                  <div className="anc-dates-row">
                    <span>Last Visit: {r.last_anc_date || 'N/A'}</span>
                    <span className="text-teal font-semibold">Next Due: {r.next_due_date || 'In 2 weeks'}</span>
                  </div>
                </div>
              ) : (
                <div className="immunization-list-box">
                  <div className="imm-header">Universal Immunization Milestones</div>
                  <div className="imm-tags-container">
                    {r.immunizations?.map((imm, idx) => (
                      <span
                        key={idx}
                        className={`imm-chip ${imm.status === 'Completed' ? 'done' : 'pending'}`}
                      >
                        {imm.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span>{imm.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mch-card-footer">
                <div className="asha-assigned">
                  <User size={13} />
                  <span>ASHA: {r.asha_name || 'Surekha Tai More'}</span>
                </div>
                <div className="mch-notes-snippet">{r.notes}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
