/**
 * RuralCare Offline Storage & Field Synchronization Engine
 * Enables village health workers (ASHA/ANM) to register patients, record vitals,
 * perform AI triage, and create smart referrals with ZERO internet connectivity.
 * When connectivity is restored, queues automatically sync with the central server.
 */

const STORAGE_KEYS = {
  SIMULATED_OFFLINE: 'ruralcare_simulated_offline',
  PENDING_QUEUE: 'ruralcare_offline_queue',
  CACHED_PATIENTS: 'ruralcare_cached_patients',
  CACHED_FACILITIES: 'ruralcare_cached_facilities'
};

class OfflineStorageEngine {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    // Listen to browser network changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());

      if (!localStorage.getItem(STORAGE_KEYS.CACHED_PATIENTS)) {
        const defaultCached = [
          { patient_id: 1, name: 'Sunita Patil', age: 28, gender: 'Female', phone: '9822012345', village_name: 'Shivapur', health_journey_id: 'MH-RURAL-2026-1042', existing_conditions: 'Pregnant 24 wks, Mild Anemia' },
          { patient_id: 2, name: 'Ramesh Jadhav', age: 52, gender: 'Male', phone: '9822054321', village_name: 'Khedgaon', health_journey_id: 'MH-RURAL-2026-2189', existing_conditions: 'Type 2 Diabetes, Hypertension' },
          { patient_id: 3, name: 'Kavita Shinde', age: 34, gender: 'Female', phone: '9822098765', village_name: 'Bhor', health_journey_id: 'MH-RURAL-2026-3401', existing_conditions: 'Asthma' }
        ];
        this.cachePatients(defaultCached);
      }
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const status = this.getStatus();
    this.listeners.forEach(fn => fn(status));
  }

  isSimulatedOffline() {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
  }

  setSimulatedOffline(val) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, val ? 'true' : 'false');
    this.notify();
  }

  toggleSimulatedOffline() {
    const nextState = !this.isSimulatedOffline();
    this.setSimulatedOffline(nextState);
    return nextState;
  }

  isOnline() {
    if (typeof window === 'undefined') return true;
    if (this.isSimulatedOffline()) return false;
    return navigator.onLine;
  }

  handleNetworkChange() {
    this.notify();
  }

  getQueue() {
    if (typeof window === 'undefined') return { patients: [], screenings: [], referrals: [] };
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PENDING_QUEUE);
      return raw ? JSON.parse(raw) : { patients: [], screenings: [], referrals: [] };
    } catch (e) {
      return { patients: [], screenings: [], referrals: [] };
    }
  }

  setQueue(queue) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(queue));
    this.notify();
  }

  getPendingCount() {
    const q = this.getQueue();
    const patients = q.patients?.length || 0;
    const screenings = q.screenings?.length || 0;
    const referrals = q.referrals?.length || 0;
    return {
      total: patients + screenings + referrals,
      patients,
      screenings,
      referrals
    };
  }

  getStatus() {
    return {
      isOnline: this.isOnline(),
      isSimulatedOffline: this.isSimulatedOffline(),
      pending: this.getPendingCount()
    };
  }

  // Caching helpers
  cachePatients(patients) {
    if (typeof window === 'undefined' || !Array.isArray(patients)) return;
    localStorage.setItem(STORAGE_KEYS.CACHED_PATIENTS, JSON.stringify(patients.slice(0, 100)));
  }

  getCachedPatients() {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CACHED_PATIENTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  cacheFacilities(facilities) {
    if (typeof window === 'undefined' || !Array.isArray(facilities)) return;
    localStorage.setItem(STORAGE_KEYS.CACHED_FACILITIES, JSON.stringify(facilities.slice(0, 100)));
  }

  getCachedFacilities() {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CACHED_FACILITIES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Offline creation operations
  saveOfflinePatient(patientData) {
    const queue = this.getQueue();
    const tempId = `offline-pat-${Date.now()}`;
    const journeyId = `MH-RURAL-2026-OFF${Math.floor(100 + Math.random() * 900)}`;

    const newPat = {
      ...patientData,
      temp_id: tempId,
      patient_id: tempId,
      health_journey_id: journeyId,
      created_offline_at: new Date().toISOString(),
      is_offline: true
    };

    queue.patients.push(newPat);
    this.setQueue(queue);

    // Also update local cached list so user sees them immediately in patient lists
    const cached = this.getCachedPatients();
    this.cachePatients([newPat, ...cached]);

    return newPat;
  }

  saveOfflineScreening(screeningData) {
    const queue = this.getQueue();
    const tempId = `offline-scr-${Date.now()}`;

    const newScr = {
      ...screeningData,
      temp_id: tempId,
      created_offline_at: new Date().toISOString(),
      is_offline: true
    };

    queue.screenings.push(newScr);
    this.setQueue(queue);
    return newScr;
  }

  saveOfflineReferral(referralData) {
    const queue = this.getQueue();
    const tempId = `offline-ref-${Date.now()}`;
    const queueToken = `Q-DH-${Math.floor(100 + Math.random() * 900)}`;

    const newRef = {
      ...referralData,
      temp_id: tempId,
      referral_id: tempId,
      queue_token: queueToken,
      current_stage: 'Created',
      created_offline_at: new Date().toISOString(),
      is_offline: true
    };

    queue.referrals.push(newRef);
    this.setQueue(queue);
    return newRef;
  }

  /**
   * Sync all pending items with central backend
   */
  async syncWithServer(token) {
    if (!this.isOnline()) {
      throw new Error('Network is currently unavailable or in Offline Mode.');
    }

    const queue = this.getQueue();
    const pendingCount = this.getPendingCount();

    if (pendingCount.total === 0) {
      return { synced: 0, message: 'Local storage is already fully synchronized.' };
    }

    const res = await fetch('/api/sync/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(queue)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to synchronize offline data');
    }

    // Clear synchronized queue
    this.setQueue({ patients: [], screenings: [], referrals: [] });

    return {
      synced: pendingCount.total,
      details: data
    };
  }

  async syncPendingRecords(token) {
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('ruralcare_token') || 'demo_token';
    }
    return this.syncWithServer(token);
  }
}

export const offlineStorage = new OfflineStorageEngine();
export default offlineStorage;
