import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Upload, CheckCircle, Calendar, MapPin, AlertCircle, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { VernierRuler } from '../../components/common/VernierRuler';

export const SubmitApplicationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInstId = searchParams.get('instId') || '';

  const { instruments, submitApplication } = useData();

  const [selectedInstId, setSelectedInstId] = useState(preselectedInstId || (instruments[0] ? instruments[0].id : ''));
  const [appType, setAppType] = useState('Periodic Re-verification');
  const [preferredDate, setPreferredDate] = useState('2026-08-30');
  const [notes, setNotes] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Mock File Upload List
  const [files, setFiles] = useState([
    { name: 'OEM_Factory_Calibration_Report.pdf', size: '1.4 MB' },
    { name: 'Purchase_Invoice_Form_C.pdf', size: '850 KB' }
  ]);

  const selectedInst = instruments.find((i) => i.id === selectedInstId);

  const handleAddFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles([...files, { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` }]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstId) {
      alert('Please select a registered instrument');
      return;
    }

    setSubmitLoading(true);
    await submitApplication({
      instrumentId: selectedInstId,
      applicationType: appType,
      preferredDate,
      inspectionLocation: selectedInst ? selectedInst.location : 'Factory Site',
      documents: files.map((f) => ({ name: f.name, size: f.size, url: '#' })),
      notes
    });
    setSubmitLoading(false);
    navigate('/business/applications');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div>
        <Link to="/business" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-[#0B315B] mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-0.5">
              Docket Request • Form LM-2
            </span>
            <h1 className="text-xl font-semibold text-[#0B315B] tracking-tight">Submit Verification Application</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 border border-slate-300 bg-white px-3 py-1 rounded-sm">
            <span className="text-[10px] font-mono uppercase text-slate-500">Standard:</span>
            <span className="text-xs font-mono font-semibold text-[#0B315B]">OIML R76 / Sec. 24</span>
          </div>
        </div>
        <VernierRuler className="my-3 opacity-75" />
        <p className="text-xs text-slate-600">
          Request official statutory verification or mandatory periodic re-verification for an instrument registered in your enterprise inventory.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Select Instrument */}
        <Card accent title="1. Select Registered Instrument" subtitle="Choose from instruments registered in your business profile">
          <div className="space-y-4">
            <Select
              label="Select Instrument"
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              required
              options={instruments.map((inst) => ({
                value: inst.id,
                label: `${inst.type} - S/N: ${inst.serialNumber} (${inst.manufacturer})`
              }))}
            />

            {selectedInst && (
              <div className="border border-slate-300 rounded-sm bg-white overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#0B315B]">{selectedInst.type}</span>
                    <span className="text-[10px] font-mono text-slate-500">({selectedInst.manufacturer})</span>
                  </div>
                  <Badge status={selectedInst.status} variant="stamp">{selectedInst.status}</Badge>
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 text-xs divide-x divide-y divide-slate-100 border-b border-slate-200">
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[11px]">SERIAL NO.</dt>
                    <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">{selectedInst.serialNumber}</dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[11px]">MAX CAPACITY</dt>
                    <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">{selectedInst.capacity}</dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[11px]">ACCURACY CLASS</dt>
                    <dd className="font-medium text-slate-900 mt-0.5">{selectedInst.accuracyClass}</dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[11px]">LAST VERIFIED</dt>
                    <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">{selectedInst.lastVerifiedDate || 'Initial'}</dd>
                  </div>
                </dl>
                <div className="p-2.5 bg-slate-50/60 flex items-center gap-1.5 text-xs text-slate-600 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-[#0B315B] shrink-0" />
                  <span>{selectedInst.location}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Step 2: Application Details */}
        <Card accent title="2. Application Details & Preferred Schedule">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Verification Type"
              value={appType}
              onChange={(e) => setAppType(e.target.value)}
              required
              options={[
                'Periodic Re-verification (Annual)',
                'Initial Verification (New Instrument)',
                'Re-verification After Stamping/Repair',
                'Emergency Field Calibration'
              ]}
            />

            <Input
              label="Preferred Inspection Date"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-[11px] font-mono uppercase font-semibold text-slate-600 mb-1">
              Inspection Address / Site Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide site access instructions, contact person phone number, or required test weight equipment details..."
              className="w-full rounded-sm border border-slate-300 text-xs text-slate-900 bg-white p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B]"
            />
          </div>
        </Card>

        {/* Step 3: Document Upload */}
        <Card accent title="3. Supporting Documents" subtitle="Upload calibration reports, model approval certificates, or purchase invoices">
          <div className="space-y-4">
            <div className="border border-dashed border-slate-300 hover:border-[#C87541] rounded-sm p-5 bg-slate-50/50 text-center relative transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-[#C87541] mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-800">Drag & Drop files or click to upload</p>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">Accepted: PDF, JPG, PNG (Max 10MB per file)</p>
              <input
                type="file"
                onChange={handleAddFile}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Uploaded File List */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Attached Documents ({files.length})</p>
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-sm border border-slate-300 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0B315B]" />
                    <div>
                      <p className="font-mono text-xs font-medium text-slate-900">{file.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 tabular-nums">{file.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Link to="/business">
            <Button variant="outline" size="sm" className="font-mono text-xs">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" size="sm" loading={submitLoading} icon={CheckCircle} className="font-mono uppercase tracking-wider text-xs">
            Submit Verification Docket
          </Button>
        </div>
      </form>
    </div>
  );
};
