import React, { useRef } from 'react';
import { X, Printer, Shield, HeartPulse, User, MapPin, Phone, AlertCircle, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function DigitalHealthCard({ onClose }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const cardRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const healthId = user?.patient_id
    ? `RC-MH-2026-${String(user.patient_id).padStart(4, '0')}`
    : 'RC-MH-2026-0001';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content digital-health-card-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Shield className="text-teal" size={24} />
            <h2 className="modal-title">
              {language === 'hi' ? 'ग्रामीण स्वास्थ्य पहचान पत्र' : language === 'mr' ? 'ग्रामीण आरोग्य ओळखपत्र' : 'RuralCare Digital Health Card'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="health-card-container" ref={cardRef}>
          {/* Card Front */}
          <div className="health-card-badge">
            <div className="card-top-bar">
              <div className="card-emblem">
                <HeartPulse size={20} className="text-white" />
                <div>
                  <span className="card-gov-label">GOVT OF MAHARASHTRA • PUBLIC HEALTH</span>
                  <div className="card-title">RuralCare National Digital Health ID</div>
                </div>
              </div>
              <div className="card-chip"></div>
            </div>

            <div className="card-body-grid">
              <div className="card-photo-box">
                <User size={48} className="text-gray-400" />
                <span className="photo-label">Verified</span>
              </div>

              <div className="card-info-col">
                <div className="card-holder-name">{user?.name || 'Ramesh Patil'}</div>
                <div className="card-id-number">{healthId}</div>

                <div className="card-details-row">
                  <div>
                    <span className="detail-lbl">Age / Gender:</span>
                    <strong className="detail-val">{user?.age || 48} Y / {user?.gender || 'Male'}</strong>
                  </div>
                  <div>
                    <span className="detail-lbl">Blood Group:</span>
                    <strong className="detail-val text-red-600 font-bold">{user?.blood_group || 'B+'}</strong>
                  </div>
                </div>

                <div className="card-details-row">
                  <div>
                    <span className="detail-lbl">Village / Tehsil:</span>
                    <strong className="detail-val">{user?.village_name || 'Shivapur'}, Pune</strong>
                  </div>
                  <div>
                    <span className="detail-lbl">Emergency Phone:</span>
                    <strong className="detail-val">{user?.emergency_contact_phone || '9876543219'}</strong>
                  </div>
                </div>
              </div>

              <div className="card-qr-box">
                <div className="qr-visual">
                  <svg viewBox="0 0 100 100" width="70" height="70" className="qr-svg">
                    <rect width="100" height="100" fill="white" />
                    {/* Simulated 2D QR matrix */}
                    <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                    <rect x="9" y="9" width="17" height="17" fill="white" />
                    <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                    <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                    <rect x="74" y="9" width="17" height="17" fill="white" />
                    <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                    <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                    <rect x="9" y="74" width="17" height="17" fill="white" />
                    <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

                    <rect x="40" y="10" width="8" height="8" fill="#0f172a" />
                    <rect x="55" y="15" width="8" height="8" fill="#0f172a" />
                    <rect x="35" y="35" width="30" height="8" fill="#0f172a" />
                    <rect x="40" y="50" width="12" height="12" fill="#0f172a" />
                    <rect x="60" y="60" width="15" height="15" fill="#0f172a" />
                    <rect x="75" y="45" width="10" height="10" fill="#0f172a" />
                    <rect x="45" y="75" width="18" height="10" fill="#0f172a" />
                  </svg>
                </div>
                <span className="qr-caption">Scan for Records</span>
              </div>
            </div>

            <div className="card-bottom-footer">
              <span className="card-disclaimer">
                Non-transferable health credential for rural OPD, Jan Aushadhi subsidy, and emergency triage.
              </span>
              <span className="card-validity">Valid: Lifelong</span>
            </div>
          </div>
        </div>

        <div className="modal-actions-footer">
          <button className="btn btn-outline" onClick={onClose}>
            {language === 'hi' ? 'बंद करें' : language === 'mr' ? 'बंद करा' : 'Close'}
          </button>
          <button className="btn btn-primary flex items-center gap-2" onClick={handlePrint}>
            <Printer size={16} />
            <span>{language === 'hi' ? 'कार्ड प्रिंट करें' : language === 'mr' ? 'कार्ड प्रिंट करा' : 'Print / Save Card'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
