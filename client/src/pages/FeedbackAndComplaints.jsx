import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  MessageSquare, Star, AlertCircle, CheckCircle2, Clock, 
  Send, Hospital, ShieldCheck, ChevronRight, X 
} from 'lucide-react';

export function FeedbackAndComplaints() {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'feedback'
  const [facilities, setFacilities] = useState([]);
  
  // Complaints list & form
  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [complaintForm, setComplaintForm] = useState({
    facility_id: 1,
    complaint_type: 'Medicine Unavailable',
    description: ''
  });
  const [complaintMsg, setComplaintMsg] = useState(null);

  // Feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    facility_id: 1,
    rating: 5,
    feedback_text: ''
  });
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchFacilitiesAndComplaints = () => {
    fetch('/api/facilities')
      .then(res => res.json())
      .then(data => setFacilities(data.facilities || []));

    if (token) {
      setLoadingComplaints(true);
      fetch('/api/complaints/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setMyComplaints(data.complaints || []);
          setLoadingComplaints(false);
        })
        .catch(() => setLoadingComplaints(false));
    }
  };

  useEffect(() => {
    fetchFacilitiesAndComplaints();
  }, [token]);

  const handleLodgeComplaint = async (e) => {
    e.preventDefault();
    if (!token) {
      setComplaintMsg({ type: 'error', text: 'Please log in as a citizen to file a grievance ticket.' });
      return;
    }
    if (!complaintForm.description) {
      setComplaintMsg({ type: 'error', text: 'Please describe the healthcare issue encountered.' });
      return;
    }

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(complaintForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit complaint');

      setComplaintMsg({ type: 'success', text: `Grievance #${data.complaint.complaint_id} submitted to District Health Authority!` });
      setComplaintForm({ ...complaintForm, description: '' });
      fetchFacilitiesAndComplaints();
    } catch (err) {
      setComplaintMsg({ type: 'error', text: err.message });
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!token) {
      setFeedbackMsg({ type: 'error', text: 'Please log in to submit a review.' });
      return;
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(feedbackForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

      setFeedbackMsg({ type: 'success', text: 'Thank you! Your rating helps improve rural healthcare quality.' });
      setFeedbackForm({ ...feedbackForm, feedback_text: '', rating: 5 });
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const complaintTypes = [
    'Doctor Unavailable',
    'Medicine Unavailable',
    'Facility Closed',
    'Long Waiting Time',
    'Service Unavailable',
    'Poor Service',
    'Equipment Unavailable',
    'Other'
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#FFFFFF', fontWeight: 800 }}>
          {t('tile_feedback_complaints')}
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Transparent citizen grievance desk with administrative resolution tracking & facility star reviews
        </p>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <AlertCircle size={16} /> Grievance Tracker & Lodge Complaint
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`btn btn-sm ${activeTab === 'feedback' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Star size={16} /> Facility Ratings & Reviews
        </button>
      </div>

      {/* TAB 1: COMPLAINTS & TRACKING */}
      {activeTab === 'complaints' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Lodge Complaint Form */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '0.35rem' }}>
              Lodge Public Healthcare Grievance
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              All tickets are forwarded directly to the District Health Officer and monitored until resolved.
            </p>

            {complaintMsg && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                background: complaintMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: complaintMsg.type === 'success' ? '#34D399' : '#F87171',
                fontSize: '0.85rem'
              }}>
                {complaintMsg.text}
              </div>
            )}

            <form onSubmit={handleLodgeComplaint}>
              <div className="form-group">
                <label className="form-label">Healthcare Facility Concerned</label>
                <select
                  className="form-select"
                  value={complaintForm.facility_id}
                  onChange={e => setComplaintForm({ ...complaintForm, facility_id: parseInt(e.target.value) })}
                >
                  {facilities.map(f => (
                    <option key={f.facility_id} value={f.facility_id}>
                      {f.facility_name} ({f.facility_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nature of Complaint</label>
                <select
                  className="form-select"
                  value={complaintForm.complaint_type}
                  onChange={e => setComplaintForm({ ...complaintForm, complaint_type: e.target.value })}
                >
                  {complaintTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="State what happened, date/time, and specific issues faced (e.g. Doctor was absent from 10am to 1pm, essential medicine out of stock)..."
                  value={complaintForm.description}
                  onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Send size={18} /> Submit Official Grievance
              </button>
            </form>
          </div>

          {/* My Complaints Tracker */}
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '0.35rem' }}>
              My Grievance Tickets
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Lifecycle: <b>Submitted → In Progress → Resolved</b>
            </p>

            {loadingComplaints ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Loading grievance tickets...
              </div>
            ) : myComplaints.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <ShieldCheck size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No complaints lodged under your account.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myComplaints.map(c => {
                  let statusBadge = 'badge-warning';
                  let statusIndex = 0; // 0: Submitted, 1: In Progress, 2: Resolved
                  if (c.status === 'In Progress') {
                    statusBadge = 'badge-info';
                    statusIndex = 1;
                  } else if (c.status === 'Resolved') {
                    statusBadge = 'badge-success';
                    statusIndex = 2;
                  }

                  return (
                    <div key={c.complaint_id} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className={`badge ${statusBadge}`}>
                          {c.status}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Ticket #{c.complaint_id} • {c.created_at ? c.created_at.substring(0, 10) : ''}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', color: '#FFFFFF', fontWeight: 700, margin: '2px 0' }}>
                        {c.complaint_type}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                        Against: <b>{c.facility_name}</b>
                      </div>

                      <p style={{ fontSize: '0.86rem', color: '#CBD5E1', lineHeight: 1.4, background: 'var(--color-bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                        "{c.description}"
                      </p>

                      {/* Visual Lifecycle Steps */}
                      <div style={{ margin: '0.75rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '50%', left: '15%', right: '15%', height: '2px', background: 'var(--border-subtle)', transform: 'translateY(-50%)', zIndex: 1 }} />
                          {['Submitted', 'In Progress', 'Resolved'].map((st, i) => (
                            <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: i <= statusIndex ? (i === 2 ? '#10B981' : '#0D9488') : 'var(--color-bg-elevated)',
                                color: '#FFFFFF',
                                fontSize: '0.65rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700
                              }}>
                                {i <= statusIndex ? '✓' : i + 1}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: i <= statusIndex ? '#FFFFFF' : 'var(--text-muted)', marginTop: '2px' }}>
                                {st}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Official Administrative Response */}
                      {c.admin_response ? (
                        <div style={{ background: 'rgba(16, 185, 129, 0.12)', borderLeft: '3px solid #10B981', padding: '0.6rem 0.85rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700 }}>
                            Official Government Action / Response:
                          </div>
                          <p style={{ fontSize: '0.84rem', color: '#E2E8F0', marginTop: '2px' }}>
                            {c.admin_response}
                          </p>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.4rem' }}>
                          Pending administrative review by District Health Office.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: FACILITY RATINGS & FEEDBACK */}
      {activeTab === 'feedback' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '0.35rem' }}>
              Rate a Healthcare Facility
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your feedback is analyzed in the Government Admin Dashboard to identify quality bottlenecks.
            </p>

            {feedbackMsg && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                background: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: feedbackMsg.type === 'success' ? '#34D399' : '#F87171',
                fontSize: '0.85rem'
              }}>
                {feedbackMsg.text}
              </div>
            )}

            <form onSubmit={handleSendFeedback}>
              <div className="form-group">
                <label className="form-label">Healthcare Facility Visited</label>
                <select
                  className="form-select"
                  value={feedbackForm.facility_id}
                  onChange={e => setFeedbackForm({ ...feedbackForm, facility_id: parseInt(e.target.value) })}
                >
                  {facilities.map(f => (
                    <option key={f.facility_id} value={f.facility_id}>
                      {f.facility_name} ({f.facility_type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Selector */}
              <div className="form-group">
                <label className="form-label">Overall Experience & Quality Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Star
                        size={32}
                        color="#FBBF24"
                        fill={star <= feedbackForm.rating ? '#FBBF24' : 'none'}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FBBF24', marginLeft: '0.5rem', alignSelf: 'center' }}>
                    {feedbackForm.rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Comments & Constructive Feedback</label>
                <textarea
                  className="form-textarea"
                  placeholder="Share details regarding doctor conduct, cleanliness, wait times, or medicine availability..."
                  value={feedbackForm.feedback_text}
                  onChange={e => setFeedbackForm({ ...feedbackForm, feedback_text: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }}>
                <Star size={18} /> Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
