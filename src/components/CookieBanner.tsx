import React, { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const [preferences, setPreferences] = useState({
    essential: true, // required
    functional: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('forge3d_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('forge3d_cookie_consent', JSON.stringify({ essential: true, functional: true, marketing: true }));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('forge3d_cookie_consent', JSON.stringify(preferences));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-stone-900 text-stone-100 p-5 rounded-3xl shadow-2xl border border-stone-800 font-sans space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-white">Privacy & 3D Slicing Cookies</h4>
            <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
              We use essential cookies for 3D slice rendering, currency rates, and anonymous store telemetry.
            </p>
          </div>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-stone-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {showPreferences && (
        <div className="space-y-2 border-t border-stone-800 pt-3 text-xs">
          <label className="flex items-center justify-between opacity-70">
            <span>Essential (Required for 3D Slicer & Cart)</span>
            <input type="checkbox" checked disabled className="rounded text-amber-500" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span>Functional & Currency Preferences</span>
            <input
              type="checkbox"
              checked={preferences.functional}
              onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
              className="rounded text-amber-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span>Marketing & Early Model Drop Alerts</span>
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
              className="rounded text-amber-500"
            />
          </label>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 text-xs font-semibold">
        {showPreferences ? (
          <button
            onClick={handleSavePreferences}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 py-2 rounded-xl transition-colors"
          >
            Save Preferences
          </button>
        ) : (
          <>
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 py-2 rounded-xl transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-2 rounded-xl transition-colors"
            >
              Customize
            </button>
          </>
        )}
      </div>
    </div>
  );
};
