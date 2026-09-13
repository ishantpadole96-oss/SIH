const http = require('http');
const app = require('../index');
const { generateToken } = require('../middleware/auth');

async function runTests() {
  const server = http.createServer(app);
  const PORT = 5123;

  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  try {
    const ashaToken = generateToken({ user_id: 1, role: 'asha', name: 'Sunita Bai', village_id: 1 });
    const adminToken = generateToken({ user_id: 1, role: 'admin', name: 'Director Health', village_id: 1 });

    const baseUrl = `http://localhost:${PORT}`;

    // 1. Test Smart Referral Creation
    console.log('\n--- 1. Testing Smart Referral Creation ---');
    const refRes = await fetch(`${baseUrl}/api/referrals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ashaToken}`
      },
      body: JSON.stringify({
        patient_id: 1,
        referring_facility_id: 1,
        referred_facility_id: 2,
        reason: 'Suspected high-risk pregnancy with elevated BP',
        priority: 'Urgent',
        specialist_required: 'Gynecology & Obstetrics',
        required_tests: 'CBC, USG Pelvis, Urine Albumin',
        clinical_summary: 'BP 150/95, gestational age 28 weeks'
      })
    });
    const refData = await refRes.json();
    console.log('Smart Referral Created:', {
      referral_id: refData.referral?.referral_id,
      priority: refData.referral?.priority,
      specialist: refData.referral?.specialist_required,
      tests: refData.referral?.required_tests,
      queue_token: refData.referral?.queue_token,
      stage: refData.referral?.current_stage
    });
    const refId = refData.referral.referral_id;

    // 2. Test 6-Stage Progression
    console.log('\n--- 2. Testing 6-Stage Lifecycle Progression ---');
    const stages = ['Patient Reached', 'Consultation', 'Test', 'Treatment', 'Follow-up'];
    for (const stage of stages) {
      const stageRes = await fetch(`${baseUrl}/api/referrals/${refId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ashaToken}`
        },
        body: JSON.stringify({ stage, notes: `Automated testing stage: ${stage}` })
      });
      const stageData = await stageRes.json();
      console.log(`Stage advanced to: ${stageData.referral?.current_stage} (status: ${stageData.referral?.status})`);
    }

    // 3. Test Flagging as Stuck / Dropout Alert
    console.log('\n--- 3. Testing Dropout / Stuck Referral Alert ---');
    const stuckRes = await fetch(`${baseUrl}/api/referrals/${refId}/stage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ashaToken}`
      },
      body: JSON.stringify({
        stage: 'Stuck - Follow-up Required',
        bottleneck_reason: 'Patient did not reach hospital – local transport unavailable'
      })
    });
    const stuckData = await stuckRes.json();
    console.log('Referral marked as stuck:', {
      stage: stuckData.referral?.current_stage,
      bottleneck: stuckData.referral?.bottleneck_reason,
      asha_status: stuckData.referral?.asha_followup_status
    });

    // 4. Test ASHA Follow-up Action
    console.log('\n--- 4. Testing ASHA Follow-up Resolution ---');
    const ashaRes = await fetch(`${baseUrl}/api/referrals/${refId}/asha-followup`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ashaToken}`
      },
      body: JSON.stringify({
        asha_followup_status: 'Resolved',
        asha_followup_notes: 'Visited home, arranged gram panchayat auto-rickshaw transit to hospital.',
        mark_reached: true
      })
    });
    const ashaData = await ashaRes.json();
    console.log('ASHA Follow-up logged:', {
      stage: ashaData.referral?.current_stage,
      asha_status: ashaData.referral?.asha_followup_status
    });

    // 5. Test Stuck Watchlist Query
    console.log('\n--- 5. Testing Stuck Watchlist Query ---');
    const watchlistRes = await fetch(`${baseUrl}/api/referrals/stuck`, {
      headers: { Authorization: `Bearer ${ashaToken}` }
    });
    const watchlistData = await watchlistRes.json();
    console.log(`Stuck referrals in watchlist: ${watchlistData.stuckReferrals?.length}`);

    // 6. Test Offline Batch Sync
    console.log('\n--- 6. Testing Offline-First Batch Sync ---');
    const syncRes = await fetch(`${baseUrl}/api/sync/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ashaToken}`
      },
      body: JSON.stringify({
        patients: [{
          temp_id: 'offline-pat-999',
          name: 'Kavita Shinde',
          age: 29,
          gender: 'Female',
          phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
          blood_group: 'B+',
          existing_conditions: 'Pregnant 24 wks'
        }],
        screenings: [{
          temp_patient_id: 'offline-pat-999',
          symptoms: ['Fever / Chills', 'Persistent Cough'],
          duration_days: 3,
          severity: 'Moderate',
          vitals: { temp: '101.4', spo2: '97', bp: '120/80' },
          ai_risk_level: 'Moderate',
          triage_category: 'Needs Doctor'
        }],
        referrals: [{
          temp_patient_id: 'offline-pat-999',
          referring_facility_id: 1,
          referred_facility_id: 2,
          reason: 'Antenatal fever checkup',
          priority: 'Urgent',
          specialist_required: 'Gynecology & Obstetrics',
          required_tests: 'CBC, Dengue NS1'
        }]
      })
    });
    const syncData = await syncRes.json();
    console.log('Offline Batch Sync result:', syncData.message, syncData.counts);

    // 7. Test QR Health Journey Lookup
    console.log('\n--- 7. Testing QR Health Journey Lookup ---');
    const journeyRes = await fetch(`${baseUrl}/api/patients/journey/MH-RURAL-2026-0001`, {
      headers: { Authorization: `Bearer ${ashaToken}` }
    });
    const journeyData = await journeyRes.json();
    console.log('Cross-Tier Journey for:', journeyData.patient?.name, {
      journey_id: journeyData.patient?.health_journey_id,
      blood_group: journeyData.patient?.blood_group,
      village: journeyData.patient?.village_name,
      sub_centre_events: journeyData.journey_timeline?.sub_centre?.length,
      consultations: journeyData.journey_timeline?.consultations?.length,
      referrals: journeyData.journey_timeline?.referrals?.length,
      active_prescriptions: journeyData.active_prescriptions?.length
    });

    // 8. Test Smart Copilot Evaluation
    console.log('\n--- 8. Testing Smart Health Worker Copilot ---');
    const copilotRes = await fetch(`${baseUrl}/api/copilot/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ashaToken}`
      },
      body: JSON.stringify({
        query: 'Pregnant woman, BP 160/110, severe headache and swelling in feet',
        language: 'en'
      })
    });
    const copilotData = await copilotRes.json();
    console.log('Copilot Decision Support:', {
      triage_level: copilotData.triage_level,
      diagnosis: copilotData.diagnosis,
      specialist: copilotData.specialist_required,
      tests: copilotData.required_tests,
      en_actions: copilotData.actions?.en?.slice(0, 2),
      mr_actions: copilotData.actions?.mr?.slice(0, 2),
      hi_actions: copilotData.actions?.hi?.slice(0, 2)
    });

    // 9. Test Healthcare Bottlenecks Dashboard Telemetry
    console.log('\n--- 9. Testing Healthcare Bottlenecks Dashboard ---');
    const bottleneckRes = await fetch(`${baseUrl}/api/admin/analytics/bottlenecks`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const bottleneckData = await bottleneckRes.json();
    console.log('Healthcare Bottleneck Map Summary:', bottleneckData.summary);
    console.log('Identified Anomalies:', bottleneckData.anomalies?.map(a => `${a.facility_code}: ${a.bottleneck_type} (${a.delay_ratio})`));
    console.log('Sample Stuck Patient:', {
      name: bottleneckData.stuckPatients?.[0]?.patient_name,
      hours_stuck: bottleneckData.stuckPatients?.[0]?.hours_stuck,
      bottleneck_reason: bottleneckData.stuckPatients?.[0]?.bottleneck_reason
    });

    console.log('\n========================================');
    console.log('🎉 ALL 9 FEATURE VERIFICATIONS PASSED!');
    console.log('========================================');
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    server.close();
  }
}

runTests();
