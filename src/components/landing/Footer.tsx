import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'About', to: '/technology' },
    { label: 'Technology', to: '/technology' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Calibration', to: '/calibration' },
  ],
  Resources: [
    { label: 'Documentation', to: '/technology' },
    { label: 'Doctor Portal', to: '/doctor-portal' },
    { label: 'History', to: '/history' },
  ],
  Legal: [
    { label: 'Privacy', to: '/privacy' },
    { label: 'Terms', to: '/terms' },
    { label: 'Contact', to: '/contact' },
  ],
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-foreground text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-sm">FF</span>
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">FEMFLOU</span>
              </div>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-6">
              Empowering Every Pregnancy Through Intelligent Screening.
              AI-powered maternal health, accessible from any smartphone.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <span>Built with</span>
              <Heart className="w-3 h-3 text-critical/60 fill-critical/60" />
              <span>for maternal health</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} FEMFLOU. All rights reserved. For research and screening purposes only.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy
            </Link>
            <Link to="/technology" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
