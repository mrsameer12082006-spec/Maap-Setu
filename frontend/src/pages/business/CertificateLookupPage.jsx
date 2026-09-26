import React, { useState } from 'react';
import { Search, Loader2, ShieldAlert, ShieldClose, AlertTriangle, CheckCircle2, QrCode } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CertificateView } from '../../components/common/CertificateView';

export const CertificateLookupPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputCertId, setInputCertId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const searchCert = async (targetId) => {
    if (!targetId) return;
    setLoading(true);
    setResult(null);
    setErrorMsg('');
    
    try {
      // Determine if we are querying by UUID (QR token) or Cert Number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
      const paramKey = isUUID ? 'qr_token' : 'cert_number';

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yrzhtrzelayycrnvmcup.supabase.co';
      const fnUrl = `${supabaseUrl}/functions/v1/verify-certificate?${paramKey}=${encodeURIComponent(targetId)}`;

      const res = await fetch(fnUrl, { method: 'GET' });
      if (!res.ok && res.status !== 200) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred connecting to the verification registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputCertId.trim()) {
      searchCert(inputCertId.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Certificate Lookup</h1>
          <p className="text-sm text-neutral-600 mt-1">Search the official Legal Metrology registry for any certified instrument.</p>
        </div>
      </div>

      <Card className="bg-white border-neutral-300">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-600">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <input
              type="text"
              placeholder="Enter Certificate Number (e.g. CERT-2026-8891) or Scan QR Token..."
              value={inputCertId}
              onChange={(e) => setInputCertId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-input border border-neutral-300 bg-white font-mono text-sm uppercase text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" variant="primary" icon={Search} disabled={loading || !inputCertId.trim()}>
            Lookup Certificate
          </Button>
        </form>
      </Card>

      {/* Verification Output Container */}
      {loading && (
        <Card className="text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-900">Querying National Metrology Verification Registry...</p>
        </Card>
      )}

      {!loading && errorMsg && (
        <Card className="text-center py-12 border-danger/30 bg-danger/5">
          <ShieldAlert className="w-12 h-12 text-danger mx-auto mb-3" />
          <h3 className="text-lg font-bold text-neutral-900">System Error</h3>
          <p className="text-sm text-neutral-600 mt-1">{errorMsg}</p>
        </Card>
      )}

      {!loading && result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result.verification_status === 'NOT_FOUND' && (
            <Card className="text-center py-12 border-danger/30 bg-danger/5">
              <ShieldClose className="w-12 h-12 text-danger mx-auto mb-3" />
              <h3 className="text-lg font-bold text-neutral-900">Certificate Not Found</h3>
              <p className="text-sm text-neutral-600 mt-1">
                No official record exists for the provided identifier. 
                Ensure you have entered a valid certificate number or scanned an authentic QR code.
              </p>
            </Card>
          )}

          {result.verification_status === 'MISMATCH' && (
             <Card className="text-center py-12 border-danger/50 bg-danger/10">
               <ShieldAlert className="w-12 h-12 text-danger mx-auto mb-3" />
               <h3 className="text-lg font-bold text-neutral-900">Tampering Detected</h3>
               <p className="text-sm text-neutral-600 mt-1">
                 This certificate exists, but its cryptographic signature does not match its contents. 
                 The document may have been altered after issuance.
               </p>
             </Card>
          )}

          {['VERIFIED', 'EXPIRED', 'REVOKED', 'NOT_VERIFIED'].includes(result.verification_status) && (
            <div>
              {result.verification_status === 'VERIFIED' && (
                <div className="p-4 mb-4 bg-success/10 border border-success/30 rounded-lg flex items-center gap-3 text-success text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>VERIFIED: Cryptographically secured and officially issued by Legal Metrology.</span>
                </div>
              )}
              {result.verification_status === 'EXPIRED' && (
                <div className="p-4 mb-4 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-3 text-warning-dark text-sm font-semibold">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>EXPIRED: This certificate's signature is authentic, but the validity period has expired.</span>
                </div>
              )}
              {result.verification_status === 'REVOKED' && (
                <div className="p-4 mb-4 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-3 text-danger text-sm font-semibold">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>REVOKED: This certificate's signature is authentic, but it has been officially REVOKED by the Legal Metrology Department.</span>
                </div>
              )}
              {result.verification_status === 'NOT_VERIFIED' && (
                <div className="p-4 mb-4 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-3 text-warning-dark text-sm font-semibold">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>LEGACY CERTIFICATE: This certificate predates the cryptographic signature system. Document data is shown as recorded. No tamper-evidence guarantee.</span>
                </div>
              )}
              
              <CertificateView 
                certificate={{
                  certificateNumber: result.certificate_number,
                  instrumentType: result.instrument_type,
                  manufacturer: result.manufacturer,
                  model: result.model,
                  capacity: result.capacity,
                  accuracyClass: result.accuracy_class,
                  serialNumber: result.serial_number,
                  ownerName: result.owner_name,
                  ownerAddress: result.owner_address,
                  verificationAuthority: result.verification_authority,
                  verificationDate: result.verification_date,
                  expiryDate: result.expiry_date,
                  sealNumber: result.seal_number,
                  status: result.verification_status,
                  qrToken: result.qr_code_token,
                }} 
                showActions={true} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
