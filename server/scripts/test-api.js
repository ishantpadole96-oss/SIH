/**
 * RuralCare Automated API Smoke Test Script
 * Validates core REST endpoints, auth, relationships, screening, and admin analytics.
 */

const { app, server } = require('../index');

async function runTests() {
  console.log('\n🧪 Starting RuralCare API automated verification...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const PORT = (server && server.address && server.address()) ? server.address().port : (process.env.PORT || 5000);
  const baseUrl = `http://localhost:${PORT}`;

  async function api(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  try {
    // 1. Health check
    const health = await api('/api/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'Health check responds 200 OK');

    // 2. Demo accounts
    const demo = await api('/api/auth/demo-accounts');
    assert(demo.status === 200 && demo.data.demoAccounts.length >= 4, 'Demo accounts endpoint returns 4 role accounts');

    // 3. Citizen login (Ramesh)
    const citizenLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'ramesh@ruralcare.in', password: 'Demo@123' })
    });
    assert(citizenLogin.status === 200 && citizenLogin.data.token && citizenLogin.data.user.role === 'citizen', 'Citizen login returns valid JWT token and user profile');
    const citizenToken = citizenLogin.data.token;

    // 4. Admin login (Sharma)
    const adminLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@ruralcare.in', password: 'Demo@123' })
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login returns role admin');
    const adminToken = adminLogin.data.token;

    // 5. Doctor login (Dr. Rajesh)
    const docLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'dr.rajesh@ruralcare.in', password: 'Demo@123' })
    });
    assert(docLogin.status === 200 && docLogin.data.user.role === 'doctor', 'Doctor login returns role doctor');
    const docToken = docLogin.data.token;

    // 6. Facilities search & filters
    const facilities = await api('/api/facilities?emergency_only=true');
    assert(facilities.status === 200 && facilities.data.facilities.length > 0, 'Facility search with emergency_only filter works');

    // 7. Hospital live availability
    const avail = await api('/api/facilities/availability/all');
    assert(avail.status === 200 && avail.data.availabilityBoard.length >= 6, 'Hospital availability board returns live beds and doctor counts');

    // 8. Nearest emergency facility
    const emergency = await api('/api/facilities/emergency/nearest?village_id=1');
    assert(emergency.status === 200 && emergency.data.nearest_emergency_facility !== null, 'Nearest emergency facility found from village location');

    // 9. Medicine search
    const meds = await api('/api/medicines?search=Paracetamol');
    assert(meds.status === 200 && meds.data.medicines.length > 0, 'Medicine cross-facility search returns Paracetamol stocks');

    // 10. AI Health Screening
    const screening = await api('/api/screenings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({
        symptoms: ['High Fever', 'Breathlessness', 'Persistent Cough'],
        duration_days: 3,
        severity: 'Severe',
        vitals: { temp: '102.5', spo2: '93', bp: '135/85' }
      })
    });
    assert(
      screening.status === 201 && 
      (screening.data.screening_data.ai_risk_level === 'High' || screening.data.screening_data.ai_risk_level === 'Emergency') &&
      screening.data.matched_facilities.length > 0,
      'AI Health Screening returns High Risk triage with clinical recommendations & matched facilities'
    );

    // 11. Appointment booking
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const apt = await api('/api/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({
        facility_id: 4,
        doctor_id: 1,
        appointment_date: tomorrow,
        appointment_time: '11:00 AM',
        reason: 'Severe fever and breathing difficulty'
      })
    });
    assert(apt.status === 201 && apt.data.appointment.status === 'Scheduled', 'Appointment successfully booked in database');

    // 12. Complaint submission
    const comp = await api('/api/complaints', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({
        facility_id: 1,
        complaint_type: 'Long Waiting Time',
        description: 'Waiting room was overcrowded with only one doctor present'
      })
    });
    assert(comp.status === 201 && comp.data.complaint.status === 'Submitted', 'Citizen grievance ticket submitted');

    // 13. Admin resolves complaint
    const complaintId = comp.data.complaint.complaint_id;
    const resolveComp = await api(`/api/complaints/${complaintId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'Resolved',
        admin_response: 'Extra seating and secondary medical officer deployed during peak morning OPD hours.'
      })
    });
    assert(resolveComp.status === 200 && resolveComp.data.complaint.status === 'Resolved', 'Admin successfully updated complaint to Resolved with response');

    // 14. Health camps listing & registration
    const camps = await api('/api/camps');
    assert(camps.status === 200 && camps.data.camps.length >= 3, 'Health camps list returns upcoming camps');

    // 15. Admin overview analytics & GIS map
    const adminOverview = await api('/api/admin/analytics/overview', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      adminOverview.status === 200 && 
      adminOverview.data.overview.total_facilities >= 6 &&
      adminOverview.data.overview.villages.underserved_count > 0,
      'Admin analytics overview correctly aggregates live database KPIs and detects underserved villages'
    );

    const gis = await api('/api/admin/analytics/gis-map');
    assert(gis.status === 200 && gis.data.villages.length >= 8 && gis.data.facilities.length >= 6, 'GIS map endpoint returns geo-located villages with accessibility badges and facilities');

    // 16. Jan Aushadhi & Generic Medicine Alternatives
    const genericRes = await api('/api/medicines/generic-alternatives?search=Augmentin');
    assert(
      genericRes.status === 200 &&
      genericRes.data.alternatives.length > 0 &&
      genericRes.data.alternatives[0].savings_percentage >= 70,
      'Jan Aushadhi generic alternatives endpoint returns matches with >70% savings'
    );

    // 17. Maternal & Child Health (MCH) tracking
    const mchRes = await api('/api/mch', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      mchRes.status === 200 &&
      mchRes.data.records.length >= 2,
      'MCH tracking endpoint returns high-risk mothers and infant records'
    );

    // 18. Epidemiological Disease Surveillance & Outbreak Radar
    const survRes = await api('/api/surveillance/alerts');
    assert(
      survRes.status === 200 &&
      survRes.data.summary.totalActiveOutbreaks > 0 &&
      survRes.data.alerts.length >= 4,
      'Disease surveillance endpoint returns active disease outbreaks and clusters'
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server && typeof server.close === 'function') {
      server.close();
    }
    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
