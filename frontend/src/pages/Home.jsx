import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Gamepad2, Sword, Shield, Zap,
  Globe, Users, Trophy, Star, ChevronRight,
  Flame, Clock, Tag, ShoppingBag,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { DiscountBadge, NewBadge } from '../components/ui/Badge';

/* ── Static featured data (replace with API when backend /games is ready) */
const featuredGames = [
  {
    id: 1, title: 'Red Dead Redemption 2', genre: 'Action Adventure',
    price: 3499, originalPrice: 4999,
    image: '/src/assets/RedDead.png', rating: 4.9, badge: 'sale',
  },
  {
    id: 2, title: 'God of War', genre: 'Action RPG',
    price: 2999, originalPrice: null,
    image: '/src/assets/GOW.png', rating: 4.8, badge: 'new',
  },
  {
    id: 3, title: "Assassin's Creed", genre: 'Stealth Action',
    price: 1999, originalPrice: 2999,
    image: '/src/assets/assasins.png', rating: 4.6, badge: 'sale',
  },
  {
    id: 4, title: 'Far Cry Primal', genre: 'Open World',
    price: 1499, originalPrice: null,
    image: '/src/assets/farcryPrimal.png', rating: 4.4, badge: null,
  },
];

const categories = [
  { icon: Sword,   label: 'Action',    color: 'from-red-500/20 to-orange-500/20',    border: 'border-red-500/20' },
  { icon: Shield,  label: 'RPG',       color: 'from-purple-500/20 to-primary/20',    border: 'border-purple-500/20' },
  { icon: Zap,     label: 'Sports',    color: 'from-yellow-500/20 to-amber-500/20',  border: 'border-yellow-500/20' },
  { icon: Globe,   label: 'Adventure', color: 'from-teal-500/20 to-accent/20',       border: 'border-teal-500/20' },
  { icon: Users,   label: 'Multiplayer',color: 'from-blue-500/20 to-cyan-500/20',    border: 'border-blue-500/20' },
  { icon: Trophy,  label: 'Strategy',  color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/20' },
];

const stats = [
  { value: '500+', label: 'Games Available' },
  { value: '50k+', label: 'Happy Gamers' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '24/7', label: 'Support' },
];

/* ── Animations ───────────────────────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.08 },
};

const staggerChild = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
};

/* ─── Section heading ────────────────────────────────────── */
const SectionHeading = ({ icon: Icon, label, subtitle, action }) => (
  <div className="flex items-end justify-between mb-8">
    <div>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={18} className="text-primary-light" />}
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-light">
          {label}
        </span>
      </div>
      {subtitle && (
        <h2 className="text-2xl md:text-3xl font-bold text-white">{subtitle}</h2>
      )}
    </div>
    {action && (
      <Link
        to={action.to}
        className="hidden sm:flex items-center gap-1 text-sm text-muted hover:text-primary-light transition-colors"
      >
        {action.label} <ChevronRight size={15} />
      </Link>
    )}
  </div>
);

/* ─── Game card ──────────────────────────────────────────── */
const GameCard = ({ game, index = 0 }) => {
  const discount = game.originalPrice
    ? Math.round((1 - game.price / game.originalPrice) * 100)
    : null;

  return (
    <motion.div
      variants={staggerChild}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-surface rounded-2xl overflow-hidden border border-white/6 hover:border-primary/30 transition-colors duration-300 hover:shadow-[0_8px_40px_rgba(108,92,231,0.2)]"
    >
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden relative">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {game.badge === 'sale' && discount && <DiscountBadge percent={discount} />}
          {game.badge === 'new' && <NewBadge />}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
          <Star size={12} className="text-warning fill-warning" />
          <span className="text-xs font-semibold text-white">{game.rating}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-subtle mb-1">{game.genre}</p>
        <h3 className="font-semibold text-white mb-3 line-clamp-1">{game.title}</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary-light">
              ₹{game.price.toLocaleString()}
            </span>
            {game.originalPrice && (
              <span className="text-sm text-subtle line-through">
                ₹{game.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <Link
            to={`/game/${encodeURIComponent(game.title)}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary-light hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            View <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Home Page ──────────────────────────────────────────── */
const Home = () => (
  <div className="min-h-screen bg-[#0F172A]">
    <Navbar />

    {/* ── Hero ──────────────────────────────────────────── */}
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-br from-[#0F172A] via-[#1a1040] to-[#0F172A]" />
        {/* Orbs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/15 blur-[100px]"
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#A29BFE 1px, transparent 1px), linear-gradient(90deg, #A29BFE 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-350 mx-auto px-6 py-24 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-sm font-medium text-primary-light mb-8"
          >
            <Flame size={14} className="text-warning" />
            New games added weekly
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-none tracking-tight text-white mb-6"
          >
            Level Up Your{' '}
            <span className="gradient-text">Gaming</span>{' '}
            Experience
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted leading-relaxed mb-10 max-w-xl"
          >
            Discover premium titles, exclusive deals, and legendary gaming experiences. Your next
            adventure starts here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <PrimaryButton
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              onClick={() => window.location.assign('/discover')}
            >
              Explore Store
            </PrimaryButton>
            <SecondaryButton
              size="lg"
              onClick={() => window.location.assign('/browse')}
            >
              Browse All Games
            </SecondaryButton>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#475569]"
      >
        <span className="text-xs">Scroll to explore</span>
        <div className="w-px h-10 bg-gradient-to-b from-[#475569] to-transparent" />
      </motion.div>
    </section>

    {/* ── Stats ─────────────────────────────────────────── */}
    <section className="border-y border-white/6 bg-surface/30">
      <div className="max-w-350 mx-auto px-6 py-8">
        <motion.div
          {...stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map(({ value, label }) => (
            <motion.div key={label} variants={staggerChild} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold gradient-text mb-1">{value}</div>
              <div className="text-sm text-subtle">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── Featured Games ────────────────────────────────── */}
    <section className="max-w-350 mx-auto px-6 py-20">
      <motion.div {...fadeUp}>
        <SectionHeading
          icon={Star}
          label="Featured"
          subtitle="Hand-picked for You"
          action={{ label: 'View all', to: '/browse' }}
        />
      </motion.div>

      <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredGames.map((game, i) => (
          <GameCard key={game.id} game={game} index={i} />
        ))}
      </motion.div>
    </section>

    {/* ── Categories ───────────────────────────────────── */}
    <section className="bg-[#080D1A] border-y border-white/6 py-20">
      <div className="max-w-350 mx-auto px-6">
        <motion.div {...fadeUp}>
          <SectionHeading
            icon={Gamepad2}
            label="Browse By Genre"
            subtitle="Find Your Style"
            action={{ label: 'All genres', to: '/browse' }}
          />
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(({ icon: Icon, label, color, border }) => (
            <motion.div key={label} variants={staggerChild}>
              <Link
                to={`/browse?genre=${label}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${color} border ${border} hover:scale-105 transition-all duration-250 group cursor-pointer`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Icon size={22} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-white">{label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── On Sale ──────────────────────────────────────── */}
    <section className="max-w-350 mx-auto px-6 py-20">
      <motion.div {...fadeUp}>
        <SectionHeading
          icon={Tag}
          label="Special Offers"
          subtitle="Limited Time Deals"
          action={{ label: 'See all sales', to: '/browse?sale=true' }}
        />
      </motion.div>

      <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredGames
          .filter((g) => g.originalPrice)
          .map((game) => <GameCard key={game.id} game={game} />)}
      </motion.div>
    </section>

    {/* ── Trending ─────────────────────────────────────── */}
    <section className="bg-[#080D1A] border-y border-white/6 py-20">
      <div className="max-w-350 mx-auto px-6">
        <motion.div {...fadeUp}>
          <SectionHeading
            icon={Flame}
            label="Trending Now"
            subtitle="Most Popular This Week"
          />
        </motion.div>

        <motion.div {...stagger} className="flex flex-col gap-3">
          {featuredGames.map((game, i) => (
            <motion.div key={game.id} variants={staggerChild}>
              <Link
                to={`/game/${encodeURIComponent(game.title)}`}
                className="flex items-center gap-5 p-4 rounded-xl bg-surface/50 border border-white/6 hover:border-primary/30 hover:bg-surface transition-all duration-200 group"
              >
                <span className="text-2xl font-black text-[#1E293B] group-hover:text-primary/30 transition-colors w-8 shrink-0 text-center">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <img src={game.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-primary-light transition-colors truncate">
                    {game.title}
                  </h3>
                  <p className="text-sm text-subtle">{game.genre}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-warning fill-warning" />
                    <span className="text-sm font-semibold text-white">{game.rating}</span>
                  </div>
                  <span className="text-sm font-bold text-primary-light">
                    ₹{game.price.toLocaleString()}
                  </span>
                  <ArrowRight size={16} className="text-subtle group-hover:text-primary-light transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── CTA Banner ───────────────────────────────────── */}
    <section className="max-w-350 mx-auto px-6 py-20">
      <motion.div {...fadeUp}>
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-primary/30 via-surface to-accent/20" />
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3" />
          </div>
          <div className="relative px-8 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag size={16} className="text-accent" />
                <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                  Join Mythic Games
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                Start Your Gaming Journey Today
              </h2>
              <p className="text-muted text-base">
                Create an account, explore hundreds of titles, and get exclusive member deals.
                Your legendary adventure awaits.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <PrimaryButton size="lg" onClick={() => window.location.assign('/signup')}>
                Create Account
              </PrimaryButton>
              <SecondaryButton size="lg" onClick={() => window.location.assign('/browse')}>
                Browse Games
              </SecondaryButton>
            </div>
          </div>
        </div>
      </motion.div>
    </section>

    <Footer />
  </div>
);

export default Home;
