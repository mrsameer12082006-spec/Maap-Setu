import React from 'react';
import { ShieldCheck, Award, Printer, Download, CheckCircle, AlertTriangle, QrCode } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';

export const CertificateView = ({ certificate, showActions = true }) => {
  if (!certificate) return null;

  const isExpired = new Date(certificate.expiryDate) < new Date();
  const statusDisplay = isExpired ? 'EXPIRED' : certificate.status;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-neutral-900 rounded-card border-2 border-primary/20 shadow-md overflow-hidden max-w-3xl mx-auto my-4 relative">
      {/* Top Banner */}
      <div className="bg-primary text-white p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs text-primary-light uppercase tracking-wider font-semibold">Government of India</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">Legal Metrology Certificate</h2>
              <p className="text-xs text-primary-light/80">Issued under Legal Metrology (General) Rules, 2011</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20 text-right">
            <p className="text-xs text-primary-light font-medium">Certificate ID</p>
            <p className="text-base font-mono font-bold text-white">{certificate.id}</p>
          </div>
        </div>
      </div>

      {/* Main Certificate Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Status bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-neutral-100 rounded-lg border border-neutral-300 gap-3">
          <div className="flex items-center gap-2">
            {statusDisplay === 'VERIFIED' ? (
              <CheckCircle className="w-5 h-5 text-accent shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
            )}
            <div>
              <p className="text-xs text-neutral-600 font-medium">Verification Status</p>
              <p className="text-sm font-semibold">
                {statusDisplay === 'VERIFIED' ? 'Officially Certified & Stamped' : 'Certificate Expired / Invalid'}
              </p>
            </div>
          </div>
          <Badge status={statusDisplay}>{statusDisplay}</Badge>
        </div>

        {/* Instrument Grid */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 border-b border-neutral-300 pb-1 mb-3">
            Instrument Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-neutral-600">Instrument Type</p>
              <p className="font-semibold text-neutral-900">{certificate.instrumentType}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-600">Serial Number</p>
              <p className="font-mono font-semibold text-neutral-900">{certificate.serialNumber}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-600">Manufacturer & Model</p>
              <p className="font-medium text-neutral-900">{certificate.manufacturer} - {certificate.model}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-600">Capacity / Accuracy Class</p>
              <p className="font-medium text-neutral-900">{certificate.capacity} ({certificate.accuracyClass})</p>
            </div>
          </div>
        </div>

        {/* Ownership & Authority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 border-b border-neutral-300 pb-1 mb-3">
              Registered Owner
            </h4>
            <p className="font-semibold text-sm text-neutral-900">{certificate.ownerName}</p>
            <p className="text-xs text-neutral-600 mt-1">{certificate.ownerAddress}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 border-b border-neutral-300 pb-1 mb-3">
              Verification Authority
            </h4>
            <p className="font-semibold text-sm text-neutral-900">{certificate.verificationAuthority}</p>
            <p className="text-xs text-neutral-600 mt-1">{certificate.verificationOfficer}</p>
          </div>
        </div>

        {/* Dates & Seal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-primary-light/50 border border-primary/20 rounded-lg text-sm">
          <div>
            <p className="text-xs text-neutral-600">Verification Date</p>
            <p className="font-semibold text-neutral-900">{certificate.verificationDate}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600">Valid Until (Expiry)</p>
            <p className={`font-semibold ${isExpired ? 'text-danger' : 'text-accent'}`}>{certificate.expiryDate}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600">Government Lead Seal #</p>
            <p className="font-mono font-semibold text-neutral-900">{certificate.sealNumber}</p>
          </div>
        </div>

        {/* Remarks */}
        {certificate.remarks && (
          <div>
            <p className="text-xs text-neutral-600 font-semibold mb-1">Inspector Verification Remarks</p>
            <p className="text-xs text-neutral-900 bg-neutral-100 p-3 rounded border border-neutral-300 italic">
              "{certificate.remarks}"
            </p>
          </div>
        )}

        {/* QR Verification Block */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-dashed border-neutral-300 rounded-lg gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-neutral-900 text-white p-2 rounded-md flex flex-col items-center justify-center shrink-0">
              <QrCode className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900">Digital Authenticity Verification</p>
              <p className="text-xs text-neutral-600">Scan QR or visit maapsetu.gov.in/verify/{certificate.id}</p>
              <p className="text-[10px] text-neutral-600 mt-0.5">Cryptographically signed digital record</p>
            </div>
          </div>
          <div className="text-right">
            <Award className="w-10 h-10 text-primary opacity-80 inline-block mb-1" />
            <p className="text-[10px] text-neutral-600">Department Seal</p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {showActions && (
        <div className="bg-neutral-100 px-6 py-4 border-t border-neutral-300 flex justify-end gap-3 no-print">
          <Button variant="secondary" icon={Printer} onClick={handlePrint}>
            Print Certificate
          </Button>
          <Button
            variant="primary"
            icon={Download}
            onClick={() => alert(`Certificate ${certificate.id} downloaded successfully (PDF)`)}
          >
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
};
