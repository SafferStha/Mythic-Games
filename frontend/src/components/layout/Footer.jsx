import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { FaGithub, FaXTwitter, FaInstagram, FaDiscord } from 'react-icons/fa6';
import logo from '../../assets/MythicLogo.png';

const footerLinks = {
  Store: [
    { label: 'Discover', to: '/discover' },
    { label: 'Browse Games', to: '/browse' },
    { label: 'News', to: '/news' },
    { label: 'Cart', to: '/cart' },
  ],
  Account: [
    { label: 'My Account', to: '/account' },
    { label: 'My Library', to: '/library' },
    { label: 'Orders', to: '/orders' },
    { label: 'Wishlist', to: '/wishlist' },
  ],
  Support: [
    { label: 'Help Center', to: '#' },
    { label: 'Contact Us', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
};

const Footer = () => (
  <footer className="bg-[#0A0F1E] border-t border-white/6 mt-auto">
    <div className="max-w-350 mx-auto px-6 py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <img src={logo} alt="Mythic Games" className="h-9 w-9 group-hover:scale-105 transition-transform" />
            <span className="text-lg font-bold text-white">
              Mythic<span className="text-primary-light">Games</span>
            </span>
          </Link>
          <p className="text-sm text-subtle leading-relaxed max-w-xs mb-6">
            Your premier destination for premium gaming experiences. Discover, play, and own your
            favourite titles.
          </p>
          <div className="flex items-center gap-3">
            <SocialLink href="#" icon={FaGithub}   label="GitHub" />
            <SocialLink href="#" icon={FaXTwitter} label="Twitter" />
            <SocialLink href="#" icon={FaInstagram} label="Instagram" />
            <SocialLink href="#" icon={FaDiscord}  label="Discord" />
          </div>
        </div>

        {/* Links */}
        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section}>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {section}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {links.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-subtle hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/6 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#475569]">
          © {new Date().getFullYear()} Mythic Games. All rights reserved.
        </p>
        <p className="text-xs text-[#475569] flex items-center gap-1.5">
          Built with <span className="text-primary-light">♥</span> for gamers everywhere.
        </p>
      </div>
    </div>
  </footer>
);

const SocialLink = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    aria-label={label}
    className="w-9 h-9 rounded-xl bg-surface border border-white/8 flex items-center justify-center text-subtle hover:text-white hover:border-primary/40 hover:bg-primary/10 transition-all duration-200"
  >
    <Icon size={15} />
  </a>
);

export default Footer;
