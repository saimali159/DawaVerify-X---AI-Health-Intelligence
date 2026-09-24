import React from 'react';
import {
  LayoutDashboard,
  FileScan,
  ShieldAlert,
  BotMessageSquare,
  History,
  CalendarCheck2,
  FileBarChart2,
  QrCode,
  Users2,
  Stethoscope,
  FolderLock,
  FileText,
  UserCheck,
  Cpu,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { ActiveTab } from '../types';

export type { ActiveTab };

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  onTabChange?: (tab: ActiveTab) => void;
  criticalAlertsCount?: number;
  riskAlertsCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  criticalAlertsCount = 0,
  riskAlertsCount = 0,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (onTabChange) {
      onTabChange(tab);
    }
  };

  const totalAlerts = criticalAlertsCount || riskAlertsCount || 0;

  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        {
          id: 'overview' as ActiveTab,
          label: 'Executive Overview',
          icon: LayoutDashboard,
          badge: 'Live',
        },
        {
          id: 'prescription-ocr' as ActiveTab,
          label: 'AI Prescription OCR',
          icon: FileScan,
          highlightBadge: 'Gemini',
        },
        {
          id: 'risk-radar' as ActiveTab,
          label: 'Medical Risk Radar',
          icon: ShieldAlert,
          badge: totalAlerts > 0 ? `${totalAlerts} Alerts` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        },
      ],
    },
    {
      title: 'CLINICAL INTELLIGENCE',
      items: [
        {
          id: 'copilot' as ActiveTab,
          label: 'AI Health Copilot',
          icon: BotMessageSquare,
          highlightBadge: '3.8 Pro',
        },
        {
          id: 'memory-engine' as ActiveTab,
          label: 'Health Memory Engine',
          icon: History,
        },
        {
          id: 'med-tracker' as ActiveTab,
          label: 'Medication Tracker',
          icon: CalendarCheck2,
        },
        {
          id: 'lab-intel' as ActiveTab,
          label: 'Lab Intelligence (CBC)',
          icon: FileBarChart2,
        },
      ],
    },
    {
      title: 'RECORDS & PASS',
      items: [
        {
          id: 'qr-passport' as ActiveTab,
          label: 'QR Health Passport',
          icon: QrCode,
          badge: 'Emergency',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        {
          id: 'family-vault' as ActiveTab,
          label: 'Family Health Vault',
          icon: Users2,
        },
        {
          id: 'doctors' as ActiveTab,
          label: 'Doctor Portal & Rx',
          icon: Stethoscope,
        },
        {
          id: 'digitization' as ActiveTab,
          label: 'Smart Document Vault',
          icon: FolderLock,
        },
        {
          id: 'health-summary' as ActiveTab,
          label: 'AI Health Summary',
          icon: FileText,
        },
        {
          id: 'patient-profile' as ActiveTab,
          label: 'Patient Vitals & Profile',
          icon: UserCheck,
        },
      ],
    },
    {
      title: 'ENTERPRISE & TELEMETRY',
      items: [
        {
          id: 'analytics' as ActiveTab,
          label: 'Biometric Analytics',
          icon: Sparkles,
        },
        {
          id: 'admin-ops' as ActiveTab,
          label: 'Admin & Telemetry',
          icon: Cpu,
          badge: 'Ops',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {onToggleCollapse && (
          <div className="flex items-center justify-end px-2 hidden lg:flex">
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        )}

        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500/15 to-emerald-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-teal-400'
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                          item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {!collapsed && item.highlightBadge && (
                      <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        {item.highlightBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FYP Evaluation Banner */}
      {!collapsed && (
        <div className="p-3 mt-4 rounded-xl bg-gradient-to-br from-slate-900 via-teal-950/30 to-slate-900 border border-teal-900/40 text-[11px] space-y-1.5">
          <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Award-Level FYP Build</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[10px]">
            DAWAVERIFY X complies with FHIR R4 clinical schemas, HIPAA de-identification, and Gemini 3.8 pharmacovigilance.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`shrink-0 hidden lg:block border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md p-3.5 overflow-y-auto max-h-[calc(100vh-4rem)] transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => handleTabClick(activeTab)}
          />
          <div className="relative w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 p-4 z-10 overflow-y-auto flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-teal-400 font-extrabold">DAWAVERIFY X</span> Menu
              </span>
              <button
                onClick={() => handleTabClick(activeTab)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
