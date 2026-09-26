import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, QrCode, Download, Eye, Calendar, ShieldCheck, Printer, ExternalLink, ArrowLeft } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CertificateView } from '../../components/common/CertificateView';
import { TechnicalSpecCard } from '../../components/common/TechnicalSpecCard';
import { VernierRuler } from '../../components/common/VernierRuler';

export const MyCertificatesPage = () => {
  const { certificates } = useData();
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <div className="space-y-6">
      {/* 1. Header with Tactile Instrument Aesthetic */}
      <div className="relative bg-white border border-slate-200 rounded-sm p-6 shadow-none overflow-hidden text-left">
        <div className="h-1 bg-[#C87541] w-full absolute top-0 left-0" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#C87541] block">
              OFFICIAL REPOSITORY • LEGAL METROLOGY ACT, 2009
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0B315B] tracking-tight">
              Digital Verification Certificates
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Official digital certificates and stamped verification records issued under Section 24(1).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge status="passed" variant="stamp" subtext={`${certificates.length} ACTIVE CERTIFICATES`}>
              STAMP REGISTRY
            </Badge>
            <Link to="/business">
              <Button variant="secondary" size="sm" icon={ArrowLeft} className="font-mono text-xs">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
        <VernierRuler className="mt-4" />
      </div>

      {certificates.length === 0 ? (
        <Card className="text-center py-12 rounded-sm" accent>
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No Certificates Issued Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-mono">
            Certificates are automatically generated and linked to your profile once an LMO inspector submits a PASS result for your instrument.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const isExpired = new Date(cert.expiryDate) < new Date();
            return (
              <TechnicalSpecCard
                key={cert.id}
                title={cert.instrumentType}
                recordId={cert.id}
                subtitle="Verification Record • Sec. 24(1)"
                stampStatus={isExpired ? 'DEFECTIVE' : 'VERIFIED'}
                stampSubtext={isExpired ? 'EXPIRED' : 'NPL TRACEABLE'}
                specs={[
                  { label: 'SERIAL NO.', value: cert.serialNumber, mono: true },
                  { label: 'MANUFACTURER', value: cert.manufacturer },
                  { label: 'VERIFIED DATE', value: cert.verificationDate, mono: true },
                  { label: 'VALID UNTIL', value: cert.expiryDate, mono: true },
                  { label: 'OFFICER IN CHARGE', value: cert.verificationOfficer },
                  { label: 'LEAD SEAL INTEGRITY', value: 'Intact • QR Stamp Active', mono: true }
                ]}
                actionLabel="View Certificate"
                onAction={() => setSelectedCert(cert)}
                secondaryAction={
                  <Link
                    to={`/verify/${cert.id}`}
                    target="_blank"
                    className="text-xs font-mono text-[#0B315B] hover:text-[#C87541] flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Public Verify</span>
                  </Link>
                }
              />
            );
          })}
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          title={`Digital Certificate: ${selectedCert.id}`}
          maxWidth="max-w-4xl"
          footer={
            <Button variant="secondary" onClick={() => setSelectedCert(null)}>
              Close
            </Button>
          }
        >
          <CertificateView certificate={selectedCert} showActions={true} />
        </Modal>
      )}
    </div>
  );
};
