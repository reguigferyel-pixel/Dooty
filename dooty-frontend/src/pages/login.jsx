import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, motDePasse);
      navigate('/'); // Redirige vers l'application
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4eef8' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', color: '#7c3aed', marginBottom: '20px' }}>✨ Dooty</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>Connectez-vous pour continuer</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={motDePasse} 
            onChange={(e) => setMotDePasse(e.target.value)} 
            required 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
          <button type="submit" style={{ padding: '12px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}