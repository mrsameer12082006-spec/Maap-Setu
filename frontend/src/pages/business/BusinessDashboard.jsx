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
    <div className="w-full space-y-7 selection:bg-[#02B7BF] selection:text-white pb-16">
      {/* 1. WELCOME HEADER */}
      <div className="space-y-1.5 pt-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00959C]">
          BUSINESS OWNER
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#003943] tracking-tight">
          Welcome back, {userName}
        </h1>
        <p className="text-xs sm:text-sm text-[#003943]/70 font-medium">
          Here's what needs your attention.
        </p>
      </div>

      {/* 2. PRIMARY CTA BANNER */}
      <div
        onClick={() => navigate('/business/register')}
        className="w-full bg-[#003943] hover:bg-[#002B33] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-[#00959C]/30 flex items-center justify-between cursor-pointer transition-all duration-200 group"
      >
        <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
          Register a new instrument
        </h3>
        <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1.5 transition-transform shrink-0 ml-4" />
      </div>

      {/* 3. THREE SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Certified */}
        <div className="bg-white rounded-2xl p-5 border border-[#003943]/15 shadow-xs text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-serif font-bold text-[#003943]">
            {certifiedCount}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-[#003943]/70">
            Certified
          </p>
        </div>

        {/* Card 2: Expiring soon */}
        <div className="bg-white rounded-2xl p-5 border border-[#003943]/15 shadow-xs text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-serif font-bold text-[#003943]">
            {expiringCount}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-[#003943]/70">
            Expiring soon
          </p>
        </div>

        {/* Card 3: In progress */}
        <div className="bg-white rounded-2xl p-5 border border-[#003943]/15 shadow-xs text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-serif font-bold text-[#003943]">
            {inProgressCount}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-[#003943]/70">
            In progress
          </p>
        </div>
      </div>

      {/* 4. CERTIFIED INSTRUMENTS SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#003943]">
            Certified instruments
          </h2>
          <button
            type="button"
            className="text-xs font-bold text-[#00959C] hover:underline"
          >
            View all
          </button>
        </div>

        {certifiedCount === 0 ? (
          /* EMPTY STATE CARD */
          <div className="bg-white rounded-2xl p-8 border border-[#003943]/15 shadow-xs text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#E0F5F6] text-[#00959C] flex items-center justify-center mx-auto mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-serif font-bold text-[#003943] text-base">No certified instruments yet</p>
            <p className="text-xs text-[#003943]/60 max-w-sm mx-auto">
              Instruments verified and stamped by Legal Metrology Officers will appear here.
            </p>
          </div>
        ) : (
          /* POPULATED ITEMS */
          <div className="space-y-3">
            {myCertifiedInstruments.map((inst) => (
              <div key={inst.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-[#003943]/15 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#003943] text-sm sm:text-base">{inst.instrumentName}</h4>
                    <p className="text-xs text-[#003943]/60 font-mono">{inst.certificate.certificateNumber} â€¢ Valid until {inst.certificate.expiryDate}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/verify/${inst.certificate.id}`)}
                  className="px-4 py-2 rounded-full bg-[#003943] text-white font-bold text-xs hover:bg-[#002B33] transition-colors shrink-0"
                >
                  View certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. EXPIRING SOON SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#003943]">
            Expiring soon
          </h2>
          <button
            type="button"
            className="text-xs font-bold text-[#00959C] hover:underline"
          >
            View all
          </button>
        </div>

        {expiringCount === 0 ? (
          /* EMPTY STATE CARD */
          <div className="bg-white rounded-2xl p-8 border border-[#003943]/15 shadow-xs text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="font-serif font-bold text-[#003943] text-base">No instruments expiring soon</p>
            <p className="text-xs text-[#003943]/60 max-w-sm mx-auto">
              You will receive automatic alerts 30 days prior to annual re-verification deadlines.
            </p>
          </div>
        ) : (
          /* POPULATED ITEMS */
          <div className="space-y-3">
            {myExpiringCertificates.map((cert) => {
              // Calculate days left
              const daysLeft = Math.ceil((new Date(cert.expiryDate) - today) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={cert.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-[#003943]/15 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#003943] text-sm sm:text-base">{cert.instrument?.instrumentName}</h4>
                      <p className="text-xs text-red-600 font-semibold">Expires in {daysLeft} days â€¢ {cert.expiryDate}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-[#A82B2B] text-white font-bold text-xs hover:bg-[#8A2323] transition-colors shrink-0"
                  >
                    Start re-verification
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. RECENT APPLICATIONS PREVIEW */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#003943]">
            My Applications
          </h2>
          <button
            type="button"
            onClick={() => navigate('/business/applications')}
            className="text-xs font-bold text-[#00959C] hover:underline"
          >
            View all applications &rarr;
          </button>
        </div>

        {myApplications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#003943]/15 shadow-xs text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#E0F5F6] text-[#00959C] flex items-center justify-center mx-auto mb-1">
              <FileText className="w-6 h-6" />
            </div>
            <p className="font-serif font-bold text-[#003943] text-base">No active applications</p>
            <p className="text-xs text-[#003943]/60 max-w-sm mx-auto">
              When you submit a new verification application, its status will be tracked here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myApplications.slice(0, 5).map((app) => (
              <div key={app.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-[#003943]/15 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E0F5F6] text-[#00959C] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#003943] text-sm sm:text-base">{app.instrumentName} <span className="ml-2 text-xs font-mono text-[#003943]/50">{app.id}</span></h4>
                    <p className="text-xs text-[#003943]/60">
                      Status: <span className="font-semibold capitalize text-[#003943]">{app.status.replace('_', ' ')}</span>
                      {app.assignedOfficerName && (' • Assigned: ' + app.assignedOfficerName)}
                      {app.scheduledInspectionDate && (' • Scheduled: ' + app.scheduledInspectionDate)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/business/applications')}
                  className="text-[#00959C] text-xs font-bold hover:underline shrink-0"
                >
                  View &rarr;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};







