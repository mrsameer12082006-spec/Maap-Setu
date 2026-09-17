import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserCheck, ArrowLeft, Calendar, CheckCircle, ShieldCheck, MapPin, Award } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';

export const AssignOfficerPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAppId = searchParams.get('appId') || '';

  const { applications, officers, assignOfficer } = useData();

  const unassignedList = applications.filter((a) => a.status === 'submitted' || a.status === 'under_review' || a.status === 'assigned');

  const [selectedAppId, setSelectedAppId] = useState(preselectedAppId || (unassignedList[0] ? unassignedList[0].id : ''));
  const [selectedOfficerId, setSelectedOfficerId] = useState(officers[0] ? officers[0].id : '');
  const [scheduledDate, setScheduledDate] = useState('2026-08-29');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const currentApp = applications.find((a) => a.id === selectedAppId);
  const currentOfficer = officers.find((o) => o.id === selectedOfficerId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppId || !selectedOfficerId) {
      alert('Please select both an application and an officer');
      return;
    }

    setLoading(true);
    await assignOfficer(selectedAppId, selectedOfficerId, scheduledDate, adminNotes);
    setLoading(false);
    navigate('/lmd');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/lmd" className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Assign Verification Officer / GATC</h1>
        <p className="text-xs text-neutral-600">
          Assign an authorized Legal Metrology Officer (LMO) or Government Approved Test Centre (GATC) to conduct physical field verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Application */}
        <Card title="1. Select Application for Officer Assignment">
          <Select
            label="Application Queue"
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            required
            options={applications.map((app) => ({
              value: app.id,
              label: `${app.id} - ${app.instrumentName} (${app.applicantName})`
            }))}
          />

          {currentApp && (
            <div className="mt-4 p-5 bg-[#FDF9F6] rounded-2xl border border-[#003943]/15 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#003943]/10 pb-2">
                <span className="font-mono font-bold text-[#00959C]">{currentApp.id}</span>
                <Badge status={currentApp.status}>{currentApp.status}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-[#003943]/10">
                <div>
                  <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Vendor Business Name</span>
                  <p className="font-serif font-bold text-[#003943] text-sm">{currentApp.applicantName}</p>
                </div>
                <div>
                  <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Machine / Instrument</span>
                  <p className="font-bold text-[#003943]">{currentApp.instrumentName}</p>
                </div>
                <div>
                  <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Verification Type</span>
                  <p className="font-semibold text-[#003943]">{currentApp.applicationType}</p>
                </div>
                <div>
                  <span className="text-[#003943]/60 text-[10px] font-bold block uppercase">Installation Location</span>
                  <p className="font-semibold text-[#003943] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#00959C] shrink-0" /> {currentApp.inspectionLocation}
                  </p>
                </div>
              </div>

              {currentApp.assignedOfficerName ? (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                    Currently Assigned Verifier for Vendor
                  </span>
                  <p className="font-serif font-bold text-[#003943] text-sm">{currentApp.assignedOfficerName}</p>
                  <p className="text-[11px] text-[#003943]/70">
                    Scheduled Field Inspection: <span className="font-semibold">{currentApp.scheduledInspectionDate || 'Pending Date'}</span>
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 font-bold text-xs">
                  ⚠️ No Verifier Assigned Yet — Ready to allocate LMO Inspector or GATC Centre below.
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Select Officer */}
        <Card title="2. Select LMO Inspector or GATC Center">
          <div className="space-y-4">
            <Select
              label="Authorized Verifier Roster"
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              required
              options={officers.map((off) => ({
                value: off.id,
                label: `${off.name} (${off.role}) - ${off.zone}`
              }))}
            />

            {/* Officer Details Preview */}
            {currentOfficer && (
              <div className="p-4 bg-primary-light/40 rounded-lg border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img src={currentOfficer.avatar} alt={currentOfficer.name} className="w-12 h-12 rounded-full object-cover border border-white shrink-0" />
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{currentOfficer.name}</h4>
                    <p className="text-neutral-600">{currentOfficer.designation}</p>
                    <p className="text-neutral-600 font-medium mt-0.5">Zone: {currentOfficer.zone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-white px-2.5 py-1 rounded font-bold text-primary border border-neutral-300">
                    Active Load: {currentOfficer.activeCount} verifications
                  </span>
                  <p className="text-emerald-700 font-semibold mt-1">★ {currentOfficer.rating} Inspector Rating</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Scheduled Inspection Date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />

              <Input
                label="Special Instructions / Test Weights Required"
                placeholder="e.g., Carry 20T standard deadweight truck or prover loop measures"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-300">
          <Link to="/lmd">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" loading={loading} icon={UserCheck}>
            Confirm Officer Assignment & Schedule Inspection
          </Button>
        </div>
      </form>
    </div>
  );
};
