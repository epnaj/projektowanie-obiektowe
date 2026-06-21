import { useState } from 'react';
import api from './api.js';

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [account, setAccount] = useState(null);
  const [errors, setErrors] = useState(null);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors(null);
    try {
      const res = await api.post('/api/login', form, { withCredentials: true });
      setAccount(res.data);
    } catch (err) {
      setErrors(err.response?.data?.errors || { form: 'request failed' });
    }
  };

  const refresh = async () => {
    try {
      const res = await api.get('/api/account', { withCredentials: true });
      setAccount(res.data);
    } catch (err) {
      setErrors(err.response?.data?.errors || { form: 'request failed' });
    }
  };

  if (account) {
    return (
      <section>
        <h2>Account</h2>
        <p>Logged in as <span data-testid="account-email">{account.email}</span></p>
        <button type="button" data-testid="refresh-account" onClick={refresh}>Refresh</button>
      </section>
    );
  }

  return (
    <section>
      <h2>Login</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 320 }}>
        <input data-testid="email" placeholder="email" value={form.email} onChange={update('email')} />
        <input data-testid="password" type="password" placeholder="password" value={form.password} onChange={update('password')} />
        <button data-testid="submit" type="submit">Login</button>
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
