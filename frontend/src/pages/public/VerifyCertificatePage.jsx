import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, ShieldAlert, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, QrCode } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { mockApiService } from '../../services/api';
import { CertificateView } from '../../components/common/CertificateView';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const VerifyCertificatePage = () => {
  const { certId } = useParams();
  const { certificates } = useData();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [inputCertId, setInputCertId] = useState(certId || '');

  const searchCert = async (targetId) => {
    if (!targetId) return;
    setLoading(true);
    // Call mock API service (pass store)
    const res = await mockApiService.getCertificateById({ certificates }, targetId);
    setResult(res);
    setLoading(false);
  };

  useEffect(() => {
    if (certId) {
      setInputCertId(certId);
      searchCert(certId);
    } else {
      setLoading(false);
    }
  }, [certId, certificates]);

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
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
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
              placeholder="Enter Legal Metrology Certificate ID (e.g., CERT-2026-8891)..."
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
      {loading ? (
        <Card className="text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-900">Querying National Metrology Verification Registry...</p>
          <p className="text-xs text-neutral-600 mt-1">Verifying digital signature & seal records</p>
        </Card>
      ) : result ? (
        result.found ? (
          <div>
            {result.status === 'EXPIRED' && (
              <div className="p-4 mb-4 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-3 text-danger text-sm font-semibold">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>WARNING: This certificate has expired! The associated instrument is not authorized for commercial use.</span>
              </div>
            )}
            <CertificateView certificate={result.certificate} showActions={true} />
          </div>
        ) : (
          <Card className="text-center py-12 border-danger/30 bg-danger/5">
            <ShieldAlert className="w-12 h-12 text-danger mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-900">Certificate Not Found</h3>
            <p className="text-sm text-neutral-600 mt-1 max-w-md mx-auto">
              No active Legal Metrology certificate matches ID <span className="font-mono font-bold text-neutral-900">{inputCertId}</span>. Please verify the Certificate ID printed on the physical stamp or QR code.
            </p>
          </Card>
        )
      ) : null}
    </div>
  );
};
