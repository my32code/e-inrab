// client/src/services/auth.ts
export const register = async (userData: {
    nom: string;
    email: string;
    mot_de_passe: string;
    role: string;
  }) => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

export const login = async (credentials: {
  email: string;
  mot_de_passe: string;
}) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  
  const data = await response.json();
  console.log('Login response data:', data);
  
  // Stocker la session et les infos utilisateur
  localStorage.setItem('sessionId', data.sessionId);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
};

export const logout = async () => {
  try {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
    });
    }
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const sessionId = localStorage.getItem('sessionId');
    const user = getCurrentUser();
    console.log('Checking authentication:', { sessionId, user });
    
    if (!sessionId || !user) return false;

    const response = await fetch('http://localhost:3000/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${sessionId}`
      }
    });
    
    const isAuth = response.ok;
    console.log('Authentication status:', isAuth);
    return isAuth;
  } catch (error) {
    console.error('Authentication check error:', error);
    return false;
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  console.log('Current user:', user);
  return user;
};

export const updateProfile = async (nom: string, email: string): Promise<any> => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
      },
      body: JSON.stringify({ nom, email })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la mise à jour du profil');
    }

    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors du changement de mot de passe');
    }

    // Déconnexion après changement de mot de passe
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    throw error;
  }
};