import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, ShieldAlert, ArrowLeft, Loader2, AlertTriangle, CheckCircle2, ShieldClose, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { CertificateView } from '../../components/common/CertificateView';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const ROLE_BACK_NAV = {
  business: { to: '/business', label: '← Back to Dashboard' },
  lmd:      { to: '/lmd',      label: '← Back to Dashboard' },
  officer:  { to: '/officer',  label: '← Back to Dashboard' },
};
const GUEST_BACK_NAV = { to: '/', label: '← Back to Home' };

export const VerifyCertificatePage = () => {
  const { certId } = useParams();
  const { currentRole } = useAuth();

  const backNav = ROLE_BACK_NAV[currentRole] ?? GUEST_BACK_NAV;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [inputCertId, setInputCertId] = useState(certId || '');
  const [errorMsg, setErrorMsg] = useState('');

  const searchCert = async (targetId) => {
    if (!targetId) return;
    setLoading(true);
    setResult(null);
    setErrorMsg('');
    
    try {
      // Determine if we are querying by UUID (QR token) or Cert Number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
      const queryParams = isUUID ? { qr_token: targetId } : { cert_number: targetId };

      const { data, error } = await supabase.functions.invoke('verify-certificate', {
        method: 'GET',
        query: queryParams
      });

      if (error) throw error;
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred connecting to the verification registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certId) {
      setInputCertId(certId);
      searchCert(certId);
    } else {
      setLoading(false);
    }
  }, [certId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputCertId.trim()) {
      searchCert(inputCertId.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to={backNav.to} className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> {backNav.label}
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Public Certificate Verification</h1>
          <p className="text-xs text-neutral-600">Scan QR code or verify certificate authenticity using official Legal Metrology registry.</p>
        </div>
      </div>

      {/* Search Input Card */}
      <Card className="bg-white border-neutral-300">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-600">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <input
              type="text"
              placeholder="Enter Certificate Number (e.g. CERT-2026-8891) or Scan QR..."
              value={inputCertId}
              onChange={(e) => setInputCertId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-input border border-neutral-300 bg-white font-mono text-sm uppercase text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" variant="primary" icon={Search}>
            Lookup Certificate
          </Button>
        </form>
      </Card>

      {/* Verification Output Container */}
      {loading && (
        <Card className="text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-900">Querying National Metrology Verification Registry...</p>
          <p className="text-xs text-neutral-600 mt-1">Verifying cryptographic digital signature & seal records</p>
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
        <>
          {result.verification_status === 'NOT_FOUND' && (
            <Card className="text-center py-12 border-neutral-300 bg-neutral-50">
              <ShieldAlert className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-neutral-900">Certificate Not Found</h3>
              <p className="text-sm text-neutral-600 mt-1">
                No record exists for <span className="font-mono font-bold">{inputCertId}</span>.
              </p>
            </Card>
          )}

          {result.verification_status === 'NOT_VERIFIED' && (
            <Card className="text-center py-12 border-warning/30 bg-warning/5">
              <ShieldAlert className="w-12 h-12 text-warning mx-auto mb-3" />
              <h3 className="text-lg font-bold text-neutral-900">Legacy / Unsigned Certificate</h3>
              <p className="text-sm text-neutral-600 mt-1">
                This certificate exists but predates the cryptographic signature system (no issuance log found).
              </p>
            </Card>
          )}

          {result.verification_status === 'MISMATCH' && (
             <Card className="text-center py-12 border-danger/50 bg-danger/10">
               <ShieldClose className="w-12 h-12 text-danger mx-auto mb-3" />
               <h3 className="text-lg font-bold text-danger">TAMPERED / FORGED CERTIFICATE</h3>
               <p className="text-sm text-neutral-800 mt-1 max-w-md mx-auto">
                 The cryptographic signature failed verification. The contents of this certificate have been tampered with or the certificate is forged. DO NOT TRUST.
               </p>
             </Card>
          )}

          {['VERIFIED', 'EXPIRED', 'REVOKED'].includes(result.verification_status) && (
            <div>
              {result.verification_status === 'VERIFIED' && (
                <div className="p-4 mb-4 bg-success/10 border border-success/30 rounded-lg flex items-center gap-3 text-success text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>CRYPTOGRAPHICALLY VERIFIED: This certificate is authentic and currently valid.</span>
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
              
              {/* Translate safe DTO to old CertificateView expected keys */}
              <CertificateView 
                certificate={{
                  certificateNumber: result.certificate_number,
                  instrumentType: result.instrument_type,
                  serialNumber: result.serial_number,
                  manufacturer: result.manufacturer,
                  model: result.model,
                  capacity: result.capacity,
                  accuracyClass: result.accuracy_class,
                  ownerName: result.owner_name,
                  ownerAddress: result.owner_address,
                  verificationAuthority: result.verification_authority,
                  verificationDate: result.verification_date,
                  expiryDate: result.expiry_date,
                  sealNumber: result.seal_number,
                  status: result.verification_status,
                  // the public endpoint doesn't return qr_token anymore, so QR code rendering inside CertificateView shouldn't rely on it (or we can just show static or no QR for this view)
                }} 
                showActions={true} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
