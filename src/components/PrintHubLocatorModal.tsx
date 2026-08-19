import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PRINT_HUBS } from '../data/hubs';
import { MapPin, X, Phone, Clock, Printer, CheckCircle2, Search } from 'lucide-react';

export const PrintHubLocatorModal: React.FC = () => {
  const { isPrintHubModalOpen, setIsPrintHubModalOpen } = useStore();
  const [searchCity, setSearchCity] = useState('');

  if (!isPrintHubModalOpen) return null;

  const filteredHubs = searchCity.trim()
    ? PRINT_HUBS.filter(
        (h) =>
          h.city.toLowerCase().includes(searchCity.toLowerCase()) ||
          h.name.toLowerCase().includes(searchCity.toLowerCase())
      )
    : PRINT_HUBS;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      <div
        onClick={() => setIsPrintHubModalOpen(false)}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 z-10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Check Print Hub Availability Near You
                </h2>
                <p className="text-xs text-stone-500">
                  Distributed additive production partners offering local 2-hour pickup or local delivery.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPrintHubModalOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9299]" />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search by city or PIN code (e.g. Bengaluru, Mumbai, Delhi, 560038)..."
              className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E2D9] rounded-xl text-xs text-[#2C2C2C] focus:outline-hidden focus:border-[#5A5A40]"
            />
          </div>

          {/* Hubs Grid */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredHubs.map((hub) => (
              <div
                key={hub.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:border-amber-500/50 hover:bg-amber-50/30 transition-all flex flex-col sm:flex-row justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-stone-900 text-sm">{hub.name}</h4>
                    {hub.pickupAvailable && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>2-Hour Pickup Ready</span>
                      </span>
                    )}
                  </div>
                  <p className="text-stone-600">{hub.address}</p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5 text-amber-700" />
                      <span>{hub.activePrinters} Active Beds</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Est. Queue: {hub.queueTimeHours}h</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{hub.phone}</span>
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg text-[11px]">
                    {hub.distanceKm} km away
                  </span>
                  <button
                    onClick={() => {
                      setIsPrintHubModalOpen(false);
                    }}
                    className="bg-[#2C2C2C] hover:bg-[#444444] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
                  >
                    Select Hub
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
