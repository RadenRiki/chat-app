import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../hooks/useSupabase';
import { Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      alert(error.message);
    } else if (user) {
      await supabase
        .from('users')
        .insert([{ id: user.id, email }]);
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="container auth-container">
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button disabled={loading}>
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>
      <div className="auth-link">
        Sudah punya akun? <Link to="/login">Login disini</Link>
        </div>
    </div>
  );
}