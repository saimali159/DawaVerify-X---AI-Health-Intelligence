import React, { useState } from 'react';
import {
  User,
  ShieldAlert,
  HeartPulse,
  Phone,
  Droplets,
  Plus,
  Trash2,
  Check,
  Save,
  CheckCircle2,
  Calendar,
  MapPin,
  Heart,
} from 'lucide-react';
import { PatientProfile, Allergy, ChronicDisease, EmergencyContact } from '../../types';

interface PatientManagementProps {
  profile: PatientProfile;
  onUpdateProfile: (updated: PatientProfile) => void;
}

export const PatientManagement: React.FC<PatientManagementProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [formData, setFormData] = useState<PatientProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New item input states
  const [newAllergen, setNewAllergen] = useState('');
  const [newSeverity, setNewSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [newReaction, setNewReaction] = useState('');

  const [newDiseaseName, setNewDiseaseName] = useState('');
  const [newDiagnosisYear, setNewDiagnosisYear] = useState<number>(2024);

  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddAllergy = () => {
    if (!newAllergen.trim()) return;
    const newAllergyItem: Allergy = {
      id: `all_${Date.now()}`,
      allergen: newAllergen,
      severity: newSeverity,
      reaction: newReaction || 'Observed acute reaction',
      diagnosedYear: new Date().getFullYear(),
    };
    setFormData({
      ...formData,
      allergies: [...formData.allergies, newAllergyItem],
    });
    setNewAllergen('');
    setNewReaction('');
  };

  const handleRemoveAllergy = (id: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((a) => a.id !== id),
    });
  };

  const handleAddChronicDisease = () => {
    if (!newDiseaseName.trim()) return;
    const newCd: ChronicDisease = {
      id: `cd_${Date.now()}`,
      name: newDiseaseName,
      diagnosedDate: `${newDiagnosisYear}-01-01`,
      status: 'active',
      notes: 'Under regular pharmacotherapy monitoring',
    };
    setFormData({
      ...formData,
      chronicDiseases: [...formData.chronicDiseases, newCd],
    });
    setNewDiseaseName('');
  };

  const handleRemoveChronicDisease = (id: string) => {
    setFormData({
      ...formData,
      chronicDiseases: formData.chronicDiseases.filter((c) => c.id !== id),
    });
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const newCont: EmergencyContact = {
      id: `ec_${Date.now()}`,
      name: newContactName,
      relation: newContactRelation || 'Emergency Contact',
      phone: newContactPhone,
      isPrimary: formData.emergencyContacts.length === 0,
    };
    setFormData({
      ...formData,
      emergencyContacts: [...formData.emergencyContacts, newCont],
    });
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
  };

  const handleRemoveContact = (id: string) => {
    setFormData({
      ...formData,
      emergencyContacts: formData.emergencyContacts.filter((c) => c.id !== id),
    });
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
              MASTER CLINICAL IDENTITY
            </span>
            <span className="text-xs text-slate-400">Vault Partition: {formData.id}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Patient Management & Demographics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Core clinical parameters, serology, immuno-allergic records, and designated emergency points of contact.
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Profile Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Profile Updates</span>
            </>
          )}
        </button>
      </div>

      {/* 2-Col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Demographics & Blood Group */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Personal Information</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-teal-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-teal-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center justify-between">
                    <span>Blood Group</span>
                    <span className="text-[10px] text-teal-400 font-mono">Rh Factor</span>
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 font-mono font-bold focus:border-teal-500 outline-none"
                  >
                    <option value="O+">O+ (Universal RBC Recipient: O)</option>
                    <option value="O-">O- (Universal Donor)</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+ (Universal Plasma Donor)</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Organ Donor</label>
                  <select
                    value={formData.organDonor ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, organDonor: e.target.value === 'yes' })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-teal-500 outline-none"
                  >
                    <option value="yes">Yes (Registered Donor)</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-teal-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Chronic Diseases Management */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Chronic Diseases & Comorbidities</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {formData.chronicDiseases.length} Active
              </span>
            </div>

            <div className="space-y-2">
              {formData.chronicDiseases.map((cd) => (
                <div
                  key={cd.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{cd.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-950 text-teal-300">
                        Since {cd.diagnosedYear}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cd.notes}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveChronicDisease(cd.id)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add disease */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add condition (e.g. Asthma, Osteoarthritis)"
                value={newDiseaseName}
                onChange={(e) => setNewDiseaseName(e.target.value)}
                className="flex-1 text-xs p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
              />
              <button
                type="button"
                onClick={handleAddChronicDisease}
                className="px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Allergies & Emergency Contacts */}
        <div className="lg:col-span-6 space-y-6">
          {/* Immuno-Allergy Safety Register */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Allergies & Sensitivities</h3>
              </div>
              <span className="text-[11px] font-mono text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/40">
                Critical Safety Gate
              </span>
            </div>

            <div className="space-y-2">
              {formData.allergies.map((al) => (
                <div
                  key={al.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    al.severity === 'severe'
                      ? 'bg-rose-950/30 border-rose-900/60'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{al.allergen}</span>
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                          al.severity === 'severe'
                            ? 'bg-rose-900 text-rose-200'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {al.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">{al.reaction}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(al.id)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add allergy */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">Register New Allergen:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Allergen (e.g. Sulfa drugs, Peanuts)"
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
                />
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="text-xs p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
                >
                  <option value="mild">Mild (Rash, Itching)</option>
                  <option value="moderate">Moderate (Swelling, GI)</option>
                  <option value="severe">Severe (Anaphylaxis / Fatal)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Clinical reaction (e.g. Bronchospasm, facial edema)"
                  value={newReaction}
                  onChange={(e) => setNewReaction(e.target.value)}
                  className="flex-1 text-xs p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold"
                >
                  Log Allergen
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Designated Emergency Contacts</h3>
              </div>
            </div>

            <div className="space-y-2">
              {formData.emergencyContacts.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{c.name}</span>
                      <span className="text-[10px] text-teal-400">({c.relation})</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{c.phone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(c.id)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add contact */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">Add Emergency Contact:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
                />
                <input
                  type="text"
                  placeholder="Relation (e.g. Brother, Physician)"
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="text-xs p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Phone number (+1 555 000-0000)"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="flex-1 text-xs p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
                >
                  Save Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
