import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, ShieldAlert, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, QrCode } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { mockApiService } from '../../services/api';
import { CertificateView } from '../../components/common/CertificateView';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { VernierRuler } from '../../components/common/VernierRuler';

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
      {/* 1. Official Header with Tactile Metrology Banner */}
      <div className="relative bg-white border border-slate-200 rounded-sm p-6 shadow-none overflow-hidden text-left">
        <div className="h-1 bg-[#C87541] w-full absolute top-0 left-0" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <Link to="/" className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-[#0B315B] mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#C87541] block">
              PUBLIC VERIFICATION DESK • SEC. 24(1)
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0B315B] tracking-tight">
              Statutory Certificate Verification
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify calibration certificates and tamper-evident lead seals against the national metrology ledger.
            </p>
          </div>
        </div>
        <VernierRuler className="mt-4" />
      </div>

      {/* Search Input Card */}
      <div className="bg-white border border-slate-200 rounded-sm p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <QrCode className="w-5 h-5 text-[#0B315B]" />
            </div>
            <input
              type="text"
              placeholder="ENTER CERTIFICATE ID (E.G. CERT-2026-8891)..."
              value={inputCertId}
              onChange={(e) => setInputCertId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-slate-300 bg-white font-mono text-xs uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B]"
            />
          </div>
          <Button type="submit" variant="primary" icon={Search} className="font-mono text-xs">
            Verify Certificate
          </Button>
        </form>
      </div>

      {/* Verification Output Container */}
      {loading ? (
        <Card className="text-center py-12 rounded-sm" accent>
          <Loader2 className="w-8 h-8 text-[#0B315B] animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-900 font-mono">QUERYING NATIONAL METROLOGY LEDGER...</p>
          <p className="text-xs text-slate-500 font-mono mt-1">Verifying digital signature & tamper-evident seal records</p>
        </Card>
      ) : result ? (
        result.found ? (
          <div>
            {result.status === 'EXPIRED' && (
              <div className="p-4 mb-4 bg-red-50 border border-red-300 rounded-sm flex items-center gap-3 text-red-900 text-xs font-mono">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                <span>WARNING: THIS CERTIFICATE HAS EXPIRED. THE ASSOCIATED COMMERCIAL INSTRUMENT IS NOT AUTHORIZED UNDER THE LEGAL METROLOGY ACT, 2009.</span>
              </div>
            )}
            <CertificateView certificate={result.certificate} showActions={true} />
          </div>
        ) : (
          <div className="p-8 text-center border border-red-300 bg-red-50/50 rounded-sm">
            <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-red-900 font-mono">NO OFFICIAL RECORD FOUND</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto font-mono">
              No registered Legal Metrology certificate matches ID <span className="font-mono font-bold text-slate-900">{inputCertId}</span>. Please verify the Certificate ID printed on the physical stamp or QR code.
            </p>
          </div>
        )
      ) : null}
    </div>
  );
};
