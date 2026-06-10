import { useState } from 'react';
import api from './api.js';

export default function Register() {
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '' 
  });
  const [registered, setRegistered] = useState(null);
  const [errors, setErrors] = useState(null);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors(null);
    try {
      const res = await api.post('/api/register', form);
      setRegistered(res.data);
    } catch (err) {
      setErrors(err.response?.data?.errors || { form: 'request failed' });
    }
  };

  if (registered) {
    return (
      <section>
        <h2>Registered</h2>
        <p data-testid="welcome">Welcome, {registered.username}!</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Register</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 320 }}>
        <input data-testid="username" placeholder="username" value={form.username} onChange={update('username')} />
        <input data-testid="email" placeholder="email" value={form.email} onChange={update('email')} />
        <input data-testid="password" type="password" placeholder="password" value={form.password} onChange={update('password')} />
        <button data-testid="submit" type="submit">Register</button>
      </form>
      {errors && (
        <ul data-testid="errors" style={{ color: 'crimson' }}>
          {Object.entries(errors).map(([field, message]) => (
            <li key={field}>{field}: {message}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
