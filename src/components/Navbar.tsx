import React from 'react';
import {
  ShieldAlert,
  QrCode,
  Layers,
  Sun,
  Moon,
  Users,
  ChevronDown,
  Activity,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
  LogOut,
  Menu,
} from 'lucide-react';
import { User, FamilyMember, PatientProfile } from '../types';

interface NavbarProps {
  user?: User;
  currentUser?: User;
  patientProfile?: PatientProfile;
  familyMembers: FamilyMember[];
  activeFamilyMember: FamilyMember;
  onSelectFamilyMember: (member: FamilyMember) => void;
  onOpenQrPassport?: () => void;
  onOpenEmergencyPassport?: () => void;
  onOpenArchitecture?: () => void;
  onSwitchRole?: (role: 'patient' | 'doctor' | 'admin') => void;
  darkMode?: boolean;
  theme?: 'dark' | 'light';
  onToggleDarkMode?: () => void;
  onToggleTheme?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenAuthModal: () => void;
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentUser,
  familyMembers,
  activeFamilyMember,
  onSelectFamilyMember,
  onOpenQrPassport,
  onOpenEmergencyPassport,
  onOpenArchitecture,
  onSwitchRole,
  darkMode,
  theme,
  onToggleDarkMode,
  onToggleTheme,
  onToggleMobileMenu,
  onOpenAuthModal,
}) => {
  const [memberDropdownOpen, setMemberDropdownOpen] = React.useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);

  const activeUser = currentUser || user || {
    id: 'usr_tariq',
    name: 'Tariq Vance',
    email: 'tariq.vance@dawaverify.ai',
    role: 'patient' as const,
    avatar: DEFAULT_AVATAR,
  };

  const handleOpenPassport = onOpenEmergencyPassport || onOpenQrPassport || (() => {});
  const handleToggleThemeMode = onToggleTheme || onToggleDarkMode || (() => {});
  const isDark = theme ? theme === 'dark' : darkMode !== false;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 shadow-lg shadow-teal-500/20 text-white font-black text-xl">
            <span>D</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                DAWAVERIFY <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 font-extrabold">X</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-cyan-500/15 text-teal-300 border border-teal-500/30 shadow-sm shadow-teal-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                AI HEALTH INTELLIGENCE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Clinical Pharmacovigilance & Health Vault
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Family Member Switcher */}
          {familyMembers && familyMembers.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/70 hover:border-teal-500/50 text-slate-200 text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-teal-500/10 active:scale-[0.98] group"
                title="Switch Active Family Health Vault Record"
              >
                <div className="w-5 h-5 rounded-md bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                  <Users className="w-3 h-3 text-teal-400" />
                </div>
                <span className="max-w-[105px] truncate font-medium text-slate-200 group-hover:text-white transition-colors">
                  {activeFamilyMember?.name || 'Primary'}
                </span>
                <span className="text-[9px] font-semibold tracking-wider text-teal-300 uppercase px-1.5 py-0.5 rounded-md bg-teal-950/80 border border-teal-700/50 shadow-inner">
                  {activeFamilyMember?.relationship || 'Self'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400 transition-colors ml-0.5" />
              </button>

              {memberDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 flex items-center justify-between">
                    <span>Family Health Vault</span>
                    <span className="text-teal-400">{familyMembers.length} Records</span>
                  </div>
                  <div className="py-1 space-y-0.5">
                    {familyMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          onSelectFamilyMember(member);
                          setMemberDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                          activeFamilyMember?.id === member.id
                            ? 'bg-teal-500/15 text-teal-300 font-medium border border-teal-500/30'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <img
                          src={member.avatar || DEFAULT_AVATAR}
                          alt={member.name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="truncate text-slate-200 font-medium">{member.name}</p>
                            <span className="text-[10px] text-slate-400">{member.bloodGroup}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {member.relationship} • {member.activeMedicationsCount || 0} meds active
                          </p>
                        </div>
                        {activeFamilyMember?.id === member.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Emergency QR Passport CTA */}
          <button
            onClick={handleOpenPassport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/60 text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-emerald-500/15 active:scale-[0.98] group"
            title="Open Emergency QR Health Passport"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
            <span className="hidden sm:inline-flex items-center gap-1.5 font-semibold text-emerald-300 group-hover:text-emerald-200 tracking-wide">
              QR Passport
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={handleToggleThemeMode}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            title="Toggle theme mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* User Role Switcher & Profile */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <img
                src={activeUser.avatar || DEFAULT_AVATAR}
                alt={activeUser.name}
                className="w-7 h-7 rounded-full object-cover border border-teal-500/40"
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[90px]">{activeUser.name}</p>
                <p className="text-[10px] text-teal-400 capitalize">{activeUser.role}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-200">{activeUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{activeUser.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] font-mono text-emerald-400">Firebase & Firestore Active</span>
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-2 py-1 text-[10px] uppercase font-semibold text-slate-400">
                    Switch Simulation Persona
                  </div>
                  <button
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole('patient');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                    <span>Patient View (Tariq)</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole('doctor');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Doctor View (Dr. Malik)</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Telemetry View</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-teal-300 hover:bg-teal-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Manage Firebase Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
