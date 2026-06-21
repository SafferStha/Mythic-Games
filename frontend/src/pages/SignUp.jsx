import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, User, ArrowRight, CheckCircle2, Flame } from 'lucide-react';
import { toast } from 'sonner';

import logo from '../assets/MythicLogo.png';
import { Input, PasswordInput } from '../components/ui/Input';
import { PrimaryButton } from '../components/ui/Button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-linear-to-br from-bg via-[#1a1040] to-bg" />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -top-32 -right-32 w-125 h-125 rounded-full bg-primary/20 blur-[110px]"
    />
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
      transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      className="absolute -bottom-32 -left-32 w-100 h-100 rounded-full bg-accent/15 blur-[90px]"
    />
    <div
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage:
          'linear-gradient(#A29BFE 1px, transparent 1px), linear-gradient(90deg, #A29BFE 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />
  </div>
);

const perks = [
  'Instant access to 500+ premium games',
  'Exclusive member-only discounts',
  'Secure eSewa & card payments',
  'Download invoices & receipts',
];

const SignUp = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!username.trim())               e.username = 'Username is required.';
    if (!email.trim())                  e.email    = 'Email is required.';
    if (!password)                      e.password = 'Password is required.';
    else if (password.length < 6)      e.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword)   e.confirm  = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || 'Registration failed.');

      toast.success('Account created! Welcome to Mythic Games 🎮');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      toast.error(err?.message || 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-12">
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
              <img src={logo} alt="Mythic Games" className="h-14 w-14 group-hover:scale-105 transition-transform" />
            </Link>
            <h1 className="text-2xl font-extrabold text-foreground mb-1">Create Account</h1>
            <p className="text-sm text-subtle">Join thousands of gamers on Mythic Games</p>
          </div>

          {/* Perks list */}
          <div className="grid grid-cols-1 gap-2 mb-7 p-4 rounded-2xl bg-primary/5 border border-primary/15">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-2.5 text-xs text-muted">
                <CheckCircle2 size={13} className="text-success shrink-0" />
                {p}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4 mb-6">
              <Input
                label="Username"
                placeholder="Your gamer tag"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={errors.username}
                autoComplete="username"
                leftIcon={<User size={15} />}
              />
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
                leftIcon={<Mail size={15} />}
              />
              <PasswordInput
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="new-password"
              />
              <PasswordInput
                label="Confirm Password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirm}
                autoComplete="new-password"
              />
            </div>

            <PrimaryButton
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              rightIcon={!loading && <ArrowRight size={17} />}
            >
              Create Account
            </PrimaryButton>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-subtle">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <p className="text-center text-sm text-subtle">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-light hover:text-foreground font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Tags */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          {['100% Secure', 'No Hidden Fees', 'Instant Activation'].map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 text-xs text-subtle bg-white/4 border border-white/6 px-3 py-1.5 rounded-full"
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

export default SignUp;
