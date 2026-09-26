import React from 'react';
import { ShieldCheck, Award, Printer, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildCertificateVerificationUrl } from '../../utils/urlHelpers';
import { Badge } from './Badge';
import { Button } from './Button';

export const CertificateView = ({ certificate, showActions = true }) => {
  if (!certificate) return null;

  const isExpired = new Date(certificate.expiryDate) < new Date();
  const statusDisplay = isExpired ? 'EXPIRED' : certificate.status;

  const handlePrint = () => {
    window.print();
  };

  if (!certificate.qrToken) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 shadow-sm">
        <p className="font-bold">Configuration Error</p>
        <p className="text-sm">Missing required QR verification token for this certificate. Cryptographic verification unavailable.</p>
      </div>
    );
  }

  let verificationUrl = '';
  let qrError = '';
  try {
    verificationUrl = buildCertificateVerificationUrl(certificate.qrToken);
  } catch (err) {
    qrError = err.message;
  }

  return (
    <div className="bg-white text-neutral-900 rounded-card border-2 border-primary/20 shadow-md overflow-hidden max-w-3xl mx-auto my-4 relative">
      {/* Top Banner */}
      <div className="bg-primary text-white p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">Verification Certificate</h2>
              <p className="text-sm text-primary-light">Department of Legal Metrology</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-primary-light uppercase tracking-wider mb-1">Certificate No.</p>
            <p className="font-mono text-lg font-bold">{certificate.certificateNumber}</p>
          </div>
        </div>
        <Award className="absolute -right-8 -bottom-8 w-40 h-40 text-black/10 z-0" />
      </div>

      <div className="p-6 space-y-6 relative z-10">
        
        {/* Status Badge */}
        <div className="flex justify-between items-center border-b border-neutral-300 pb-4">
           <div>
            <p className="text-xs text-neutral-600 mb-1">Verification Status</p>
            {statusDisplay === 'VERIFIED' && <Badge variant="success" icon={CheckCircle}>ACTIVE & VERIFIED</Badge>}
            {statusDisplay === 'EXPIRED' && <Badge variant="warning" icon={AlertTriangle}>EXPIRED</Badge>}
            {statusDisplay === 'REVOKED' && <Badge variant="danger" icon={ShieldCheck}>REVOKED</Badge>}
            {statusDisplay === 'NOT_VERIFIED' && <Badge variant="neutral" icon={AlertTriangle}>LEGACY / UNSIGNED</Badge>}
           </div>
           <div className="text-right">
             <p className="text-xs text-neutral-600 mb-1">Date of Issue</p>
             <p className="text-sm font-semibold">{certificate.verificationDate}</p>
           </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Instrument Details</h3>
              <div className="bg-neutral-50 p-3 rounded border border-neutral-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-600">Type</span>
                  <span className="text-xs font-semibold">{certificate.instrumentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-600">Manufacturer</span>
                  <span className="text-xs font-semibold">{certificate.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-600">Model</span>
                  <span className="text-xs font-semibold">{certificate.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-600">Serial No.</span>
                  <span className="text-xs font-mono font-bold">{certificate.serialNumber}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-300 pt-2 mt-2">
                  <span className="text-xs text-neutral-600">Capacity</span>
                  <span className="text-xs font-semibold">{certificate.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-600">Class</span>
                  <span className="text-xs font-semibold">{certificate.accuracyClass}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Validity</h3>
              <div className="bg-neutral-50 p-3 rounded border border-neutral-300 flex justify-between items-center">
                <span className="text-xs text-neutral-600">Valid Until</span>
                <span className={`text-sm font-bold ${isExpired ? 'text-danger' : 'text-neutral-900'}`}>
                  {certificate.expiryDate}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Ownership</h3>
              <div className="bg-neutral-50 p-3 rounded border border-neutral-300 space-y-2">
                <p className="text-sm font-bold text-neutral-900">{certificate.ownerName}</p>
                <p className="text-xs text-neutral-600 leading-relaxed">{certificate.ownerAddress}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Verification Authority</h3>
              <div className="bg-neutral-50 p-3 rounded border border-neutral-300 space-y-2">
                <p className="text-sm font-bold text-neutral-900">{certificate.verificationAuthority}</p>
                {certificate.verificationOfficer && (
                  <p className="text-xs text-neutral-600">Inspected by: {certificate.verificationOfficer}</p>
                )}
                {certificate.sealNumber && (
                   <div className="flex justify-between border-t border-neutral-300 pt-2 mt-2">
                   <span className="text-xs text-neutral-600">Seal No.</span>
                   <span className="text-xs font-mono font-bold">{certificate.sealNumber}</span>
                 </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {certificate.remarks && (
          <div>
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Remarks</h3>
            <p className="text-xs text-neutral-900 bg-neutral-100 p-3 rounded border border-neutral-300 italic">
              "{certificate.remarks}"
            </p>
          </div>
        )}

        {/* QR Verification Block */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-dashed border-neutral-300 rounded-lg gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-sm border border-neutral-300 flex flex-col items-center justify-center shrink-0 w-[74px] h-[74px]">
              {qrError ? (
                <div className="text-red-500 text-[9px] text-center font-bold leading-tight flex items-center justify-center w-full h-full p-1 bg-red-50">
                  {qrError.includes('configured') ? 'Public verification URL is not configured.' : 'QR Error'}
                </div>
              ) : (
                <QRCodeSVG value={verificationUrl} size={64} level="M" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900">Digital Authenticity Verification</p>
              <p className="text-[10px] text-neutral-600 max-w-[250px] truncate" title={verificationUrl}>Scan QR or visit {verificationUrl}</p>
              <p className="text-[10px] text-primary mt-0.5 font-semibold">Cryptographically signed digital record</p>
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
        </div>
      )}
    </div>
  );
};
