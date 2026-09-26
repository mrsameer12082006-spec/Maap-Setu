import React from 'react';
import { ShieldCheck, Award, Printer, Download, CheckCircle, AlertTriangle, QrCode } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { VernierRuler } from './VernierRuler';

export const CertificateView = ({ certificate, showActions = true }) => {
  if (!certificate) return null;

  const isExpired = new Date(certificate.expiryDate) < new Date();
  const statusDisplay = isExpired ? 'EXPIRED' : certificate.status;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-slate-900 rounded-sm border border-slate-300 shadow-sm overflow-hidden max-w-3xl mx-auto my-4 relative font-sans text-left">
      {/* Top Mechanical Accent in Warm Copper */}
      <div className="h-1 bg-[#C87541] w-full" />

      {/* Official Header */}
      <div className="bg-[#0B315B] text-white p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-sm bg-white flex items-center justify-center border border-white/20 p-1 overflow-hidden shrink-0">
              <img src="/maapsetu_icon.png" alt="MaapSetu Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-[10px] text-amber-200/90 font-mono uppercase tracking-widest font-semibold">
                GOVERNMENT OF INDIA • LEGAL METROLOGY ACT, 2009
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-tight">
                Certificate of Verification & Stamping
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Issued pursuant to Rule 11 & Section 24(1)
              </p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xs border border-white/20 text-left sm:text-right">
            <p className="text-[10px] text-slate-300 font-mono uppercase">CERTIFICATE SERIAL</p>
            <p className="text-sm font-mono font-semibold text-white tabular-nums tracking-wide">{certificate.id}</p>
          </div>
        </div>
      </div>

      <VernierRuler className="border-t border-slate-300" />

      {/* Main Certificate Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Status bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 rounded-sm border border-slate-200 gap-3">
          <div className="flex items-center gap-2.5">
            {statusDisplay === 'VERIFIED' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">STATUTORY LEGAL STATUS</p>
              <p className="text-sm font-semibold text-slate-900">
                {statusDisplay === 'VERIFIED' ? 'Officially Certified, Calibrated & Lead-Stamped' : 'Certificate Expired / Statutory Stamping Invalid'}
              </p>
            </div>
          </div>
          <Badge status={statusDisplay} variant="stamp" subtext={statusDisplay === 'VERIFIED' ? 'OIML R76 COMPLIANT' : 'CALIBRATION VOID'} />
        </div>

        {/* High-Density Spec Sheet */}
        <div className="border border-slate-200 rounded-sm overflow-hidden text-xs">
          <div className="p-3 bg-slate-50/80 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-500">
            EQUIPMENT SPECIFICATIONS & STATUTORY METRICS
          </div>
          <dl className="grid grid-cols-2 text-xs divide-x divide-y divide-slate-100">
            <div className="p-3.5">
              <dt className="text-slate-500 font-mono text-[10px] uppercase">INSTRUMENT DESIGNATION</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">{certificate.instrumentType}</dd>
            </div>
            <div className="p-3.5">
              <dt className="text-slate-500 font-mono text-[10px] uppercase">SERIAL NUMBER</dt>
              <dd className="font-mono font-medium text-[#0B315B] mt-0.5 tabular-nums">{certificate.serialNumber}</dd>
            </div>
            <div className="p-3.5">
              <dt className="text-slate-500 font-mono text-[10px] uppercase">MANUFACTURER & MODEL</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{certificate.manufacturer} · {certificate.model}</dd>
            </div>
            <div className="p-3.5">
              <dt className="text-slate-500 font-mono text-[10px] uppercase">RATED CAPACITY (ACCURACY CLASS)</dt>
              <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">{certificate.capacity} ({certificate.accuracyClass})</dd>
            </div>
          </dl>
        </div>

        {/* Ownership & Authority Spec Sheet */}
        <div className="border border-slate-200 rounded-sm overflow-hidden text-xs">
          <div className="p-3 bg-slate-50/80 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-500">
            REGISTERED OWNER & JURISDICTIONAL AUTHORITY
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 text-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="p-3.5">
              <dt className="text-slate-500 font-mono text-[10px] uppercase">REGISTERED COMMERCIAL OWNER</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">{certificate.ownerName}</dd>
              <dd className="text-slate-500 text-[11px] font-mono mt-0.5">{certificate.ownerAddress}</dd>
            </div>
            <div className="p-3.5">
              <dt className="text-slate-500 font-mono text-[10px] uppercase">VERIFICATION AUTHORITY</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">{certificate.verificationAuthority}</dd>
              <dd className="text-slate-500 text-[11px] font-mono mt-0.5">Authorized Officer: {certificate.verificationOfficer}</dd>
            </div>
          </dl>
        </div>

        {/* Dates & Lead Seal Strip */}
        <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200 rounded-sm bg-slate-50/50 text-xs">
          <div className="p-3.5">
            <dt className="text-slate-500 font-mono text-[10px] uppercase">DATE OF VERIFICATION</dt>
            <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">{certificate.verificationDate}</dd>
          </div>
          <div className="p-3.5">
            <dt className="text-slate-500 font-mono text-[10px] uppercase">VALID UNTIL (NEXT DUE)</dt>
            <dd className={`font-mono font-medium mt-0.5 tabular-nums ${isExpired ? 'text-red-700' : 'text-[#C87541]'}`}>
              {certificate.expiryDate}
            </dd>
          </div>
          <div className="p-3.5">
            <dt className="text-slate-500 font-mono text-[10px] uppercase">LEAD SEAL IMPRESSION ID</dt>
            <dd className="font-mono font-semibold text-[#0B315B] mt-0.5 tabular-nums">{certificate.sealNumber}</dd>
          </div>
        </dl>

        {/* Remarks */}
        {certificate.remarks && (
          <div className="p-3.5 bg-slate-50 rounded-sm border border-slate-200 text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">OFFICER OBSERVATIONS & CALIBRATION REMARKS</span>
            <p className="text-slate-800 font-mono mt-1">
              "{certificate.remarks}"
            </p>
          </div>
        )}

        {/* QR Verification Block */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-dashed border-slate-300 rounded-sm gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-slate-900 text-white p-2 rounded-xs flex flex-col items-center justify-center shrink-0">
              <QrCode className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0B315B]">Cryptographic Public Audit QR</p>
              <p className="text-[11px] font-mono text-slate-600 mt-0.5">maapsetu.gov.in/verify/{certificate.id}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">NPL Traceable • Tamper-Evident Lead Seal Registered</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <img src="/maapsetu_icon.png" alt="Department Seal" className="w-10 h-10 object-contain inline-block mb-1 rounded-sm border border-slate-200 bg-white p-0.5" />
            <p className="text-[10px] font-mono uppercase text-slate-500">Legal Metrology Stamp</p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {showActions && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3 no-print">
          <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint} className="font-mono text-xs">
            Print Certificate
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={() => alert(`Certificate ${certificate.id} downloaded successfully (PDF)`)}
            className="font-mono text-xs"
          >
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
};
