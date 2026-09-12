import React, { useState, useEffect } from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle, MapPin, Activity, Flame, ShieldCheck } from 'lucide-react';

export default function DiseaseRadarWidget() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/surveillance/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.alerts) setAlerts(data.alerts);
        if (data.summary) setSummary(data.summary);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load surveillance alerts:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="surveillance-radar-card">
      <div className="radar-header">
        <div className="flex items-center gap-2">
          <div className="radar-sweep-icon">
            <Flame className="text-red-500 animate-pulse" size={22} />
          </div>
          <div>
            <h3 className="radar-title">Epidemiological Disease Surveillance & Outbreak Radar</h3>
            <p className="radar-subtitle">
              Integrated Disease Surveillance Programme (IDSP) • Syndromic Cluster Alerts
            </p>
          </div>
        </div>

        {summary && (
          <div className="radar-stats-pills">
            <div className="stat-pill severe">
              <strong>{summary.severeOutbreaks}</strong> Active Outbreaks
            </div>
            <div className="stat-pill total">
              <strong>{summary.totalCasesReported}</strong> Total Cases Reported
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Scanning district surveillance radar...</div>
      ) : (
        <div className="radar-alerts-list">
          {alerts.map(a => (
            <div
              key={a.report_id}
              className={`radar-alert-item ${a.severity === 'Severe/Outbreak' ? 'border-severe' : 'border-moderate'}`}
            >
              <div className="alert-meta-top">
                <div className="flex items-center gap-2">
                  <span className={`severity-badge ${a.severity === 'Severe/Outbreak' ? 'severe' : 'moderate'}`}>
                    {a.severity.toUpperCase()}
                  </span>
                  <span className="category-badge">{a.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status-badge ${a.containment_status === 'Active' ? 'active' : 'contained'}`}>
                    {a.containment_status}
                  </span>
                  <span className="text-xs text-gray-400">{a.reported_date}</span>
                </div>
              </div>

              <div className="alert-body">
                <div className="alert-disease-title flex items-center justify-between">
                  <h4 className="text-base font-bold text-gray-900">{a.disease_name}</h4>
                  <span className="cases-badge">
                    <strong>{a.cases_reported}</strong> Verified Cases
                  </span>
                </div>

                <div className="alert-location-row flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <MapPin size={14} className="text-teal" />
                  <span>Village: <strong>{a.village_name}</strong> (Pop: {a.population.toLocaleString()})</span>
                  <span>•</span>
                  <span>Reported By: {a.reported_by}</span>
                </div>

                {a.action_taken && (
                  <div className="alert-containment-action mt-2">
                    <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                    <span><strong>Action:</strong> {a.action_taken}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
