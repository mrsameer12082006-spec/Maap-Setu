import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ArrowRight,
  Clock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const BusinessDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { instruments, applications, certificates } = useData();

  const userName = user?.name ? user.name.split(' ')[0] : 'Vikramaditya';

  // --- DATA DERIVATION ---
  
  // 1. My Instruments
  const myInstruments = instruments.filter(inst => inst.ownerId === user?.id);

  // 2. Certified Instruments (Join with certificates table)
  const myCertifiedInstruments = myInstruments.filter(inst => {
    return certificates.some(cert => cert.instrumentId === inst.id && cert.status === 'VERIFIED');
  }).map(inst => {
    const cert = certificates.find(c => c.instrumentId === inst.id && c.status === 'VERIFIED');
    return { ...inst, certificate: cert };
  });

  // 3. Expiring Soon (< 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const myExpiringCertificates = certificates.filter(cert => {
    if (cert.status !== 'VERIFIED') return false;
    if (!myInstruments.some(inst => inst.id === cert.instrumentId)) return false;
    
    const expiry = new Date(cert.expiryDate);
    return expiry > today && expiry <= thirtyDaysFromNow;
  }).map(cert => {
    const inst = myInstruments.find(i => i.id === cert.instrumentId);
    return { ...cert, instrument: inst };
  });

  // 4. In Progress Applications
  const myApplications = [...applications]
    .filter(app => app.applicantId === user?.id)
    .sort((a, b) => new Date(b.submissionDate || b.created_at) - new Date(a.submissionDate || a.created_at));
  

  const certifiedCount = myCertifiedInstruments.length;
  const expiringCount = myExpiringCertificates.length;
  const inProgressCount = myApplications.filter(app => ['submitted', 'under_review', 'assigned', 'in_progress'].includes(app.status)).length;

  return (
    <div className="w-full space-y-8 pb-16 text-left">
      {/* 1. WELCOME HEADER & PRIMARY ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B315B] tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-sm text-slate-500">
            Overview of weighing and measuring instrument compliance.
          </p>
        </div>

        {/* Primary Action Button (Single Primary Action) */}
        <button
          type="button"
          onClick={() => navigate('/business/register')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md bg-[#0B315B] hover:bg-blue-900 text-white font-medium text-sm transition-colors shadow-none shrink-0"
        >
          <ArrowRight className="w-4 h-4 shrink-0" />
          <span>Register New Instrument</span>
        </button>
      </div>

      {/* 2. SUMMARY STAT CARDS (8px Grid & Flat Hierarchy) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Certified */}
        <div className="bg-white rounded-md p-6 border border-slate-200 shadow-none text-left space-y-1">
          <p className="text-xs uppercase font-medium text-slate-500 tracking-wider">
            Certified Instruments
          </p>
          <p className="text-3xl font-semibold text-[#0B315B] tabular-nums">
            {certifiedCount}
          </p>
          <p className="text-xs text-slate-400">Active verification seals</p>
        </div>

        {/* Card 2: Expiring Soon */}
        <div className="bg-white rounded-md p-6 border border-slate-200 shadow-none text-left space-y-1">
          <p className="text-xs uppercase font-medium text-slate-500 tracking-wider">
            Expiring Within 30 Days
          </p>
          <p className={`text-3xl font-semibold tabular-nums ${expiringCount > 0 ? 'text-[#C87541]' : 'text-[#0B315B]'}`}>
            {expiringCount}
          </p>
          <p className="text-xs text-slate-400">Re-verification required</p>
        </div>

        {/* Card 3: In Progress */}
        <div className="bg-white rounded-md p-6 border border-slate-200 shadow-none text-left space-y-1">
          <p className="text-xs uppercase font-medium text-slate-500 tracking-wider">
            Applications In Progress
          </p>
          <p className="text-3xl font-semibold text-[#0B315B] tabular-nums">
            {inProgressCount}
          </p>
          <p className="text-xs text-slate-400">Under review or field verification</p>
        </div>
      </div>

      {/* 3. CERTIFIED INSTRUMENTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-medium text-[#0B315B]">
            Certified Instruments
          </h2>
          <button
            type="button"
            onClick={() => navigate('/business/certificates')}
            className="text-xs font-medium text-[#C87541] hover:underline"
          >
            View All Certificates &rarr;
          </button>
        </div>

        {certifiedCount === 0 ? (
          <div className="bg-white rounded-md p-8 border border-slate-200 shadow-none text-left space-y-1">
            <p className="font-medium text-slate-800 text-sm">No certified instruments found</p>
            <p className="text-xs text-slate-500">
              Instruments verified and stamped by Legal Metrology Officers will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myCertifiedInstruments.map((inst) => (
              <div key={inst.id} className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{inst.instrumentName}</h4>
                    <p className="text-xs text-slate-500 tabular-nums">
                      Certificate #{inst.certificate.certificateNumber || inst.certificate.id} • Valid until {inst.certificate.expiryDate}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/verify/${inst.certificate.id}`)}
                  className="px-3.5 py-2 rounded-md border border-[#C87541] text-[#C87541] hover:bg-[#FDF3EC] font-medium text-xs transition-colors shrink-0 min-h-[36px]"
                >
                  View Certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. EXPIRING SOON SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-medium text-[#0B315B]">
            Expiring Instruments
          </h2>
          <span className="text-xs text-slate-400">30-day regulatory window</span>
        </div>

        {expiringCount === 0 ? (
          <div className="bg-white rounded-md p-6 border border-slate-200 shadow-none text-left space-y-1">
            <p className="font-medium text-slate-800 text-sm">No instruments expiring soon</p>
            <p className="text-xs text-slate-500">
              Automatic alerts appear here 30 days prior to annual re-verification deadlines.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myExpiringCertificates.map((cert) => {
              const daysLeft = Math.ceil((new Date(cert.expiryDate) - today) / (1000 * 60 * 60 * 24));
              return (
                <div key={cert.id} className="bg-white rounded-md p-4 sm:p-5 border border-amber-200 bg-amber-50/30 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{cert.instrument?.instrumentName}</h4>
                      <p className="text-xs text-amber-800 tabular-nums">Expires in {daysLeft} days • {cert.expiryDate}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/business/register')}
                    className="px-3.5 py-2 rounded-md bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs transition-colors shrink-0 min-h-[36px]"
                  >
                    Request Re-verification
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. RECENT APPLICATIONS PREVIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-medium text-[#0B315B]">
            Recent Applications
          </h2>
          <button
            type="button"
            onClick={() => navigate('/business/applications')}
            className="text-xs font-medium text-[#C87541] hover:underline"
          >
            View All Applications &rarr;
          </button>
        </div>

        {myApplications.length === 0 ? (
          <div className="bg-white rounded-md p-6 border border-slate-200 shadow-none text-left space-y-1">
            <p className="font-medium text-slate-800 text-sm">No applications found</p>
            <p className="text-xs text-slate-500">
              When you submit a new verification application, its workflow status will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myApplications.slice(0, 5).map((app) => (
              <div key={app.id} className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                      <span>{app.instrumentName}</span>
                      <span className="text-xs font-mono text-slate-400 tabular-nums">#{app.id}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      Status: <span className="font-medium text-slate-700 capitalize">{app.status.replace('_', ' ')}</span>
                      {app.assignedOfficerName && (' • Assigned: ' + app.assignedOfficerName)}
                      {app.scheduledInspectionDate && (' • Scheduled: ' + app.scheduledInspectionDate)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/business/applications')}
                  className="px-3.5 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors shrink-0"
                >
                  View Application Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};







