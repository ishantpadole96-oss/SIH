import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ruralcare_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('ruralcare_token') || null;
  });

  const [selectedVillage, setSelectedVillage] = useState(() => {
    const saved = localStorage.getItem('ruralcare_selected_village');
    return saved ? JSON.parse(saved) : { village_id: 1, village_name: 'Shivapur', district: 'Pune', lat: 18.2851, lng: 73.8824 };
  });

  const [villages, setVillages] = useState([]);

  // Fetch villages list
  useEffect(() => {
    fetch('/api/villages')
      .then(res => res.json())
      .then(data => {
        if (data.villages) {
          setVillages(data.villages);
          // If no village selected or mismatch, default to Shivapur
          if (!selectedVillage || !selectedVillage.village_id) {
            const shivapur = data.villages.find(v => v.village_name === 'Shivapur') || data.villages[0];
            setSelectedVillage(shivapur);
          }
        }
      })
      .catch(err => console.error('Failed to load villages:', err));
  }, []);

  // Save selected village
  useEffect(() => {
    if (selectedVillage) {
      localStorage.setItem('ruralcare_selected_village', JSON.stringify(selectedVillage));
    }
  }, [selectedVillage]);

  // Login handler
  const login = async (identifier, password, role) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, role })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('ruralcare_user', JSON.stringify(data.user));
    localStorage.setItem('ruralcare_token', data.token);

    // If user belongs to a village, set selected village
    if (data.user.village_id && villages.length > 0) {
      const v = villages.find(vil => vil.village_id === data.user.village_id);
      if (v) setSelectedVillage(v);
    }

    return data.user;
  };

  // Quick Demo Login using universal demo_user / demo_password
  const demoLogin = async (role) => {
    return await login('demo_user', 'demo_password', role);
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ruralcare_user');
    localStorage.removeItem('ruralcare_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role: user ? user.role : 'guest',
      selectedVillage,
      setSelectedVillage,
      villages,
      login,
      demoLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
