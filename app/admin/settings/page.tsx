"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getSiteSettings, updateSiteSettings } from "@/lib/db";
import type { SiteSettings } from "@/types";
import toast from "react-hot-toast";

const DEFAULTS: SiteSettings = {
  storeName: "Grommet",
  tagline: "Premium handcrafted gifts",
  whatsappNumber: "919999999999",
  announcementBar: ["NEW COLLECTION DROPPED", "FREE SHIPPING PAN-INDIA", "USE CODE WELCOME10"],
  socialLinks: { instagram: "" },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings().then((s) => { if (s) setSettings(s); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      toast.success("Settings saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, value: string, onChange: (v: string) => void, hint?: string) => (
    <div>
      <label className="block text-xs font-semibold text-brand-gray-600 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-brand-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-black"
      />
      {hint && <p className="text-xs text-brand-gray-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-brand-gray-400 mb-8">Manage your store configuration</p>

      <div className="max-w-xl space-y-6">
        <div className="bg-white rounded-xl border border-brand-gray-100 p-6 space-y-5">
          <h2 className="font-semibold">Store Info</h2>
          {field("Store Name", settings.storeName, (v) => setSettings((s) => ({ ...s, storeName: v })))}
          {field("Tagline", settings.tagline, (v) => setSettings((s) => ({ ...s, tagline: v })))}
        </div>

        <div className="bg-white rounded-xl border border-brand-gray-100 p-6 space-y-5">
          <h2 className="font-semibold">Contact & WhatsApp</h2>
          {field(
            "WhatsApp Number",
            settings.whatsappNumber,
            (v) => setSettings((s) => ({ ...s, whatsappNumber: v })),
            "Include country code. E.g. 919999999999"
          )}
          {field(
            "Instagram Handle",
            settings.socialLinks?.instagram || "",
            (v) => setSettings((s) => ({ ...s, socialLinks: { ...s.socialLinks, instagram: v } })),
            "Without @ symbol"
          )}
        </div>

        <div className="bg-white rounded-xl border border-brand-gray-100 p-6 space-y-5">
          <h2 className="font-semibold">Announcement Bar</h2>
          {settings.announcementBar.map((text, i) => (
            <div key={i}>
              <label className="block text-xs font-semibold text-brand-gray-600 mb-1.5">Message {i + 1}</label>
              <input
                type="text"
                value={text}
                onChange={(e) => {
                  const updated = [...settings.announcementBar];
                  updated[i] = e.target.value;
                  setSettings((s) => ({ ...s, announcementBar: updated }));
                }}
                className="w-full border border-brand-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-black"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-brand-black text-white py-3 rounded-full font-semibold text-sm hover:bg-brand-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
