import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Gamepad2, ArrowRight, Flame } from 'lucide-react';
import { toast } from 'sonner';

import logo from '../assets/MythicLogo.png';
import { Input, PasswordInput } from '../components/ui/Input';
import { PrimaryButton } from '../components/ui/Button';
import { setStoredUser } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── Floating orb background ─────────────────────────────── */
const AuthBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-linear-to-br from-[#0F172A] via-[#1a1040] to-[#0F172A]" />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -top-32 -left-32 w-125 h-125 rounded-full bg-primary/25 blur-[100px]"
    />
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      className="absolute -bottom-32 -right-32 w-100 h-100 rounded-full bg-accent/20 blur-[90px]"
    />
    <div
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage: 'linear-gradient(#A29BFE 1px, transparent 1px), linear-gradient(90deg, #A29BFE 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get('returnTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let ok = true;
    setEmailError('');
    setPasswordError('');
    if (!email.trim()) { setEmailError('Email is required.'); ok = false; }
    if (!password)     { setPasswordError('Password is required.'); ok = false; }
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || 'Login failed.');

      setStoredUser(data.data);
      toast.success('Welcome back! 🎮');
      navigate(
        location.state?.from || returnTo || (data.data?.role === 'admin' ? '/manage-games' : '/account'),
        { replace: true },
      );
    } catch (err) {
      toast.error(err?.message || 'Unable to sign in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="glass rounded-3xl p-8 border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="group mb-6">
              <img
                src={logo}
                alt="Mythic Games"
                className="h-14 w-14 group-hover:scale-105 transition-transform"
              />
            </Link>
            <h1 className="text-2xl font-extrabold text-white mb-1">Welcome Back</h1>
            <p className="text-sm text-[#64748B]">Sign in to your Mythic Games account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4 mb-6">
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                autoComplete="email"
                leftIcon={<Mail size={15} />}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
                autoComplete="current-password"
              />
            </div>

            <div className="flex justify-end mb-6">
              <Link
                to="/reset-password"
                className="text-xs text-[#64748B] hover:text-primary-light transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <PrimaryButton
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              rightIcon={!loading && <ArrowRight size={17} />}
            >
              Sign In
            </PrimaryButton>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-[#475569]">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-[#64748B]">
            New to Mythic Games?{' '}
            <Link to="/signup" className="text-primary-light hover:text-white font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        {/* Feature tags */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          {['500+ Games', 'Instant Access', 'Secure Payments'].map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 text-xs text-[#475569] bg-white/4 border border-white/6 px-3 py-1.5 rounded-full"
            >
              <Flame size={10} className="text-primary-light" />
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
