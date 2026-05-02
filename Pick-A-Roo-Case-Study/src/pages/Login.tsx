import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import api from '../api/axios';
import { toast } from 'sonner';
import { mapUser } from '../api/mappers';
import { ArrowRight, LockKeyhole } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        User_Email: email,
        User_Password: password
      });
      login(res.data.token, mapUser(res.data.user));
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[72vh] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200/70 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden min-h-[560px] overflow-hidden bg-[#333333] p-8 text-white lg:flex lg:flex-col lg:justify-end">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80"
          alt="Fresh meal"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-yellow-300">Welcome back</p>
          <h1 className="text-4xl font-extrabold leading-tight">Your next basket is already close.</h1>
          <p className="mt-3 font-medium text-white/80">Sign in, discover stores, and checkout quickly.</p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#333333]">Log in</h2>
          <p className="mt-2 font-medium text-[#777777]">Use your Pickaroo account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#333333]">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-gray-200 bg-[#f7f7f7] px-4 py-3 font-semibold outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#333333]">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-2xl border border-gray-200 bg-[#f7f7f7] px-4 py-3 font-semibold outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="pressable app-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-extrabold text-white shadow-lg shadow-orange-200 disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Log in'}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>
          <p className="mt-6 text-center text-sm font-medium text-[#777777]">
            Don&apos;t have an account? <Link to="/register" className="font-extrabold text-orange-500 hover:underline">Sign up</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
