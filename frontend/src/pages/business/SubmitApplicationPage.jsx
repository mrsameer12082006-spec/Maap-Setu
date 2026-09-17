import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Upload, CheckCircle, Calendar, MapPin, AlertCircle, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/business" className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Submit Verification Application</h1>
        <p className="text-xs text-neutral-600">
          Request official Legal Metrology verification or mandatory periodic re-verification for your registered instrument.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Instrument */}
        <Card title="1. Select Registered Instrument" subtitle="Choose from instruments registered in your business profile">
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
              <div className="p-4 bg-neutral-100 rounded-lg border border-neutral-300 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">{selectedInst.type}</span>
                  <Badge status={selectedInst.status}>{selectedInst.status}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-600 pt-1">
                  <div>
                    <span className="block font-medium text-[10px] text-neutral-600 uppercase">Serial No</span>
                    <span className="font-mono font-bold text-neutral-900">{selectedInst.serialNumber}</span>
                  </div>
                  <div>
                    <span className="block font-medium text-[10px] text-neutral-600 uppercase">Capacity</span>
                    <span className="font-medium text-neutral-900">{selectedInst.capacity}</span>
                  </div>
                  <div>
                    <span className="block font-medium text-[10px] text-neutral-600 uppercase">Accuracy</span>
                    <span className="font-medium text-neutral-900">{selectedInst.accuracyClass}</span>
                  </div>
                  <div>
                    <span className="block font-medium text-[10px] text-neutral-600 uppercase">Last Verified</span>
                    <span className="font-medium text-neutral-900">{selectedInst.lastVerifiedDate || 'None'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-600 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{selectedInst.location}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Step 2: Application Details */}
        <Card title="2. Application Details & Preferred Schedule">
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
            <label className="block text-sm font-medium text-neutral-900 mb-1">
              Inspection Address / Special Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide site access instructions, contact person phone number, or required test weight equipment details..."
              className="w-full rounded-input border border-neutral-300 text-sm text-neutral-900 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </Card>

        {/* Step 3: Mock Document Upload */}
        <Card title="3. Supporting Documents" subtitle="Upload calibration reports, model approval certificates, or purchase invoices">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 bg-neutral-100/50 text-center relative">
              <Upload className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-900">Drag & Drop files or click to upload</p>
              <p className="text-xs text-neutral-600 mt-1">Accepted: PDF, JPG, PNG (Max 10MB per file)</p>
              <input
                type="file"
                onChange={handleAddFile}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Uploaded File List */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Attached Documents ({files.length})</p>
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-md border border-neutral-300 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-semibold text-neutral-900">{file.name}</p>
                      <p className="text-[10px] text-neutral-600">{file.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="text-neutral-600 hover:text-danger p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-300">
          <Link to="/business">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" loading={submitLoading} icon={CheckCircle}>
            Submit Verification Request
          </Button>
        </div>
      </form>
    </div>
  );
};
