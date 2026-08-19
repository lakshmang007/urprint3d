import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CURRENCIES } from '../data/currencies';
import { CurrencyCode } from '../types';
import {
  ShieldCheck,
  Recycle,
  Truck,
  RotateCcw,
  Mail,
  Send,
  MapPin,
  Phone,
  Box,
  CheckCircle2,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, setIsPrintHubModalOpen } = useStore();
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#2C2C2C] text-[#D1CFB9] font-sans border-t border-[#3F3F2C]">
      {/* Trust Badges Bar */}
      <div className="border-b border-[#3F3F2C] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2 p-3">
            <div className="w-12 h-12 rounded-full bg-[#3F3F2C] flex items-center justify-center text-[#D1CFB9]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-[#FAF9F6] text-sm">100% Print Guarantee</h4>
            <p className="text-xs text-[#A5A898]">Zero-defect replacement if your print has layer flaws.</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-3">
            <div className="w-12 h-12 rounded-full bg-[#3F3F2C] flex items-center justify-center text-[#D1CFB9]">
              <Recycle className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-[#FAF9F6] text-sm">Eco Bio-Polymers</h4>
            <p className="text-xs text-[#A5A898]">100% industrially compostable PLA & plant resin options.</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-3">
            <div className="w-12 h-12 rounded-full bg-[#3F3F2C] flex items-center justify-center text-[#D1CFB9]">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-[#FAF9F6] text-sm">Express 48h Shipping</h4>
            <p className="text-xs text-[#A5A898]">Distributed local print hubs for ultra-fast delivery.</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-3">
            <div className="w-12 h-12 rounded-full bg-[#3F3F2C] flex items-center justify-center text-[#D1CFB9]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-[#FAF9F6] text-sm">Hassle-Free Returns</h4>
            <p className="text-xs text-[#A5A898]">30-day return policy on all standard catalog models.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand & Description */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5A5A40] flex items-center justify-center text-[#FAF9F6] font-bold">
              <Box className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF9F6]">
              UrPrint<span className="text-[#D1CFB9] font-sans font-light">-3D models</span>
            </span>
          </div>
          <p className="text-xs text-[#A5A898] max-w-sm leading-relaxed">
            Pioneering distributed 3D printing and digital fabrication. Order curated designer models or upload custom STL files for instant slicing and local production.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-[#A5A898]">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#D1CFB9]" />
              <span>5 Global Print Labs</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#D1CFB9]" />
              <span>+1 (800) 3D-FORGE</span>
            </div>
          </div>
        </div>

        {/* Column 1: Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FAF9F6]">Explore Catalog</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setCurrentView('catalog')} className="hover:text-[#FAF9F6] transition-colors">
                Home & Living Vases
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('catalog')} className="hover:text-[#FAF9F6] transition-colors">
                Kinetic Mechanical Clocks
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('catalog')} className="hover:text-[#FAF9F6] transition-colors">
                Articulated Crystal Dragons
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('catalog')} className="hover:text-[#FAF9F6] transition-colors">
                Minimalist Desk Organizers
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('catalog')} className="hover:text-[#FAF9F6] transition-colors">
                D&D Tabletop Miniatures
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: Customer Support & Hubs */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FAF9F6]">Services & Hubs</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setCurrentView('custom-upload')} className="hover:text-[#FAF9F6] transition-colors text-[#D1CFB9] font-medium">
                Upload Custom STL / OBJ
              </button>
            </li>
            <li>
              <button onClick={() => setIsPrintHubModalOpen(true)} className="hover:text-[#FAF9F6] transition-colors">
                Find Local Print Hub
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('account')} className="hover:text-[#FAF9F6] transition-colors">
                Track Existing Order
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentView('account')} className="hover:text-[#FAF9F6] transition-colors">
                Materials & Filament Specs
              </button>
            </li>
            <li>
              <a
                href="mailto:support@urprint3d.com"
                className="hover:text-[#FAF9F6] transition-colors inline-block"
              >
                Need Help? support@urprint3d.com
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Newsletter Signup */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FAF9F6]">Early Access Drops</h4>
          <p className="text-xs text-[#A5A898]">
            Subscribe for exclusive artisan 3D model drops and filament releases in your region.
          </p>

          {subscribed ? (
            <div className="bg-[#3F3F2C] border border-[#5A5A40] text-[#FAF9F6] text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D1CFB9] shrink-0" />
              <span>Subscribed! You'll receive early access drops for {country}.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#3F3F2C] text-[#FAF9F6] border border-[#5A5A40] rounded-lg text-xs px-2.5 py-1.5 focus:outline-hidden focus:border-[#D1CFB9]"
                >
                  <option value="All India (Domestic Delivery)">All India (Pan-India Express Delivery)</option>
                  <option value="Bengaluru Hub (Karnataka)">Bengaluru Hub (Karnataka)</option>
                  <option value="Mumbai Hub (Maharashtra)">Mumbai Hub (Maharashtra)</option>
                  <option value="Delhi NCR Hub (Delhi/Haryana/UP)">Delhi NCR Hub (Delhi/Haryana/UP)</option>
                  <option value="Hyderabad Hub (Telangana)">Hyderabad Hub (Telangana)</option>
                  <option value="Pune Hub (Maharashtra)">Pune Hub (Maharashtra)</option>
                  <option value="Chennai Hub (Tamil Nadu)">Chennai Hub (Tamil Nadu)</option>
                  <option value="Kolkata Hub (West Bengal)">Kolkata Hub (West Bengal)</option>
                  <option value="Ahmedabad Hub (Gujarat)">Ahmedabad Hub (Gujarat)</option>
                </select>
              </div>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address..."
                  required
                  className="w-full bg-[#3F3F2C] border border-[#5A5A40] rounded-lg text-xs px-3 py-2 text-[#FAF9F6] placeholder-[#A5A898] focus:outline-hidden focus:border-[#D1CFB9]"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#5A5A40] hover:bg-[#737758] text-[#FAF9F6] rounded-md font-semibold text-xs transition-colors flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#3F3F2C] py-6 px-4 sm:px-6 lg:px-8 text-xs text-[#8E9299] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <p>© 2026 UrPrint-3D India. All rights reserved. Pan-India Additive 3D Manufacturing Studio.</p>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="hover:text-[#FAF9F6] cursor-pointer">GST Invoicing</span>
          <span>•</span>
          <span className="hover:text-[#FAF9F6] cursor-pointer">Pan-India Courier Policy</span>
          <span>•</span>
          <span className="hover:text-[#FAF9F6] cursor-pointer">Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
};
