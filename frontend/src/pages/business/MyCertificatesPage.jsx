import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, QrCode, Download, Eye, Calendar, ShieldCheck, Printer, ExternalLink } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CertificateView } from '../../components/common/CertificateView';

export const MyCertificatesPage = () => {
  const { certificates } = useData();
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Digital Verification Certificates</h1>
        <p className="text-xs text-neutral-600">
          Official digital certificates and stamped verification records issued under the Legal Metrology Act, 2009.
        </p>
      </div>

      {certificates.length === 0 ? (
        <Card className="text-center py-12">
          <Award className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">No Certificates Issued Yet</h3>
          <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
            Certificates are automatically generated and linked to your profile once an LMO inspector submits a PASS result for your instrument.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const isExpired = new Date(cert.expiryDate) < new Date();
            return (
              <Card key={cert.id} className="flex flex-col justify-between hover:border-primary/50 transition-all space-y-4">
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded">
                      {cert.id}
                    </span>
                    <Badge status={isExpired ? 'EXPIRED' : cert.status}>
                      {isExpired ? 'EXPIRED' : cert.status}
                    </Badge>
                  </div>

                  {/* Instrument info */}
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">{cert.instrumentType}</h3>
                    <p className="text-xs text-neutral-600">
                      S/N: <span className="font-mono font-semibold text-neutral-900">{cert.serialNumber}</span> • {cert.manufacturer}
                    </p>
                  </div>

                  {/* Dates Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-100 rounded-md border border-neutral-300 text-xs">
                    <div>
                      <p className="text-[10px] text-neutral-600 uppercase font-semibold">Verification Date</p>
                      <p className="font-medium text-neutral-900">{cert.verificationDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-600 uppercase font-semibold">Valid Until</p>
                      <p className={`font-semibold ${isExpired ? 'text-danger' : 'text-accent'}`}>{cert.expiryDate}</p>
                    </div>
                  </div>

                  {/* Officer info & QR preview thumbnail */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div>
                      <p className="text-[10px] text-neutral-600">Authorized Officer</p>
                      <p className="font-medium text-neutral-900 truncate max-w-[200px]">{cert.verificationOfficer}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-900 text-white p-1.5 rounded text-[10px] font-mono">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>QR Active</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-neutral-300 flex items-center justify-between gap-2">
                  <Button variant="secondary" size="sm" icon={Eye} onClick={() => setSelectedCert(cert)}>
                    View / Print
                  </Button>
                  <Link to={`/verify/${cert.id}`} target="_blank">
                    <Button variant="ghost" size="sm" icon={ExternalLink}>
                      Public Verify
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Download}
                    onClick={() => alert(`Downloading official PDF for ${cert.id}...`)}
                  >
                    PDF
                  </Button>
                </div>
              </Card>
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
