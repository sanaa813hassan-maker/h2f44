import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="font-body text-sm text-muted-foreground mt-4 max-w-sm leading-relaxed">
              Curating the intersection of heritage elegance and modern rebellion. 
              Every piece tells a story of disciplined affluence.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">Navigation</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Shop All', to: '/shop' },
                { label: 'Old Money', to: '/shop?category=old_money' },
                { label: 'Star Boy', to: '/shop?category=star_boy' },
                { label: 'About', to: '/about' },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">Contact</h4>
            <div className="flex flex-col gap-3 font-body text-sm text-muted-foreground">
              <span>info@h2f.co</span>
              <span>+1 (888) H2F-WEAR</span>
              <span>New York · London · Dubai</span>
            </div>
          </div>
        </div>

        <div className="hairline mt-16 mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            © {new Date().getFullYear()} H²F. All rights reserved.
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Velocity of Tradition
          </p>
        </div>
      </div>
    </footer>
  );
}
