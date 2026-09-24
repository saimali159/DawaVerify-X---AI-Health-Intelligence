import React, { useState } from 'react';
import {
  Users2,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Pill,
  ShieldAlert,
  Calendar,
  Heart,
  Baby,
  Activity,
  Plus,
} from 'lucide-react';
import { FamilyMember } from '../../types';

interface FamilyVaultProps {
  familyMembers: FamilyMember[];
  activeFamilyMember: FamilyMember;
  onSelectFamilyMember: (member: FamilyMember) => void;
  onAddFamilyMember: (member: FamilyMember) => void;
}

export const FamilyVault: React.FC<FamilyVaultProps> = ({
  familyMembers,
  activeFamilyMember,
  onSelectFamilyMember,
  onAddFamilyMember,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState<'Self' | 'Spouse' | 'Child' | 'Parent' | 'Sibling'>('Child');
  const [newAge, setNewAge] = useState<number>(12);
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newBlood, setNewBlood] = useState('O+');

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMember: FamilyMember = {
      id: `fam_${Date.now()}`,
      name: newName,
      relationship: newRelation,
      age: Number(newAge),
      gender: newGender,
      bloodGroup: newBlood,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      activeMedicationsCount: 0,
      allergiesCount: 0,
      lastUpdated: 'Just added',
    };

    onAddFamilyMember(newMember);
    setNewName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
              SHARED ACCOUNT • ZERO RECORD OVERLAP
            </span>
            <span className="text-xs text-slate-400">HIPAA Partitioned Family Graph</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Family Health Vault</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-generational dependents, pediatric immunization safety, and elderly polypharmacy under one secure account.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Active Member Notice */}
      <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-800/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={activeFamilyMember?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={activeFamilyMember?.name || 'Member'}
            className="w-10 h-10 rounded-full object-cover border-2 border-teal-400"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{activeFamilyMember?.name || 'Primary Member'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-900 text-teal-300 border border-teal-700/50 uppercase">
                Active Vault Focus
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {activeFamilyMember?.relationship || 'Self'} • {activeFamilyMember?.age || 34} yrs • Blood Group: {activeFamilyMember?.bloodGroup || 'O+'}
            </p>
          </div>
        </div>
        <span className="text-xs text-teal-300 font-semibold hidden sm:block">
          All timeline views & AI copilot queries are currently scoped to this record.
        </span>
      </div>

      {/* Family Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {familyMembers.map((member) => {
          const isActive = member.id === activeFamilyMember?.id;
          const isElderly = member.age >= 65;
          const isPediatric = member.age < 18;

          return (
            <div
              key={member.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                isActive
                  ? 'bg-gradient-to-br from-slate-900 via-teal-950/30 to-slate-900 border-teal-500/50 shadow-lg shadow-teal-950/40 ring-1 ring-teal-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={member?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={member.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{member.name}</h3>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {member.relationship}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {member.age} yrs old • {member.gender} • Blood Group: <strong className="text-slate-200">{member.bloodGroup}</strong>
                    </p>
                  </div>
                </div>

                {isActive && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-700/50">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Current
                  </span>
                )}
              </div>

              {/* Specific clinical flags based on age/records */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                {isElderly ? (
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                    <span>Geriatric Beers Criteria Guard Active (Polypharmacy Vigilance)</span>
                  </div>
                ) : isPediatric ? (
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <Baby className="w-3.5 h-3.5 shrink-0" />
                    <span>Pediatric Weight-Adjusted (mg/kg) Dosage Safety Net Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-teal-300">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Standard Pharmacovigilance & Allergy Screening Active</span>
                  </div>
                )}
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="text-slate-200 font-bold block">{member.activeMedicationsCount}</span>
                    <span className="text-[10px] text-slate-400">Active Meds</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="text-slate-200 font-bold block">{member.allergiesCount}</span>
                    <span className="text-[10px] text-slate-400">Allergies Logged</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 font-mono">Updated: {member.lastUpdated}</span>
                {!isActive && (
                  <button
                    onClick={() => onSelectFamilyMember(member)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-slate-700 hover:border-teal-500/40 text-xs font-semibold transition-all"
                  >
                    Switch to this Profile
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add Dependent or Family Member</h3>

            <form onSubmit={handleCreateMember} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Maryam Vance"
                  required
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Relationship</label>
                  <select
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-teal-500 outline-none"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-teal-500 outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Blood Group</label>
                  <select
                    value={newBlood}
                    onChange={(e) => setNewBlood(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-teal-500 outline-none font-mono"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
