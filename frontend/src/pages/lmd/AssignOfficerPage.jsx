import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserCheck, ArrowLeft, Calendar, CheckCircle, ShieldCheck, MapPin, Award } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { VernierRuler } from '../../components/common/VernierRuler';

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
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div>
        <Link to="/lmd" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-[#0B315B] mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-0.5">
              Enforcement Administration • Statutory Allocation
            </span>
            <h1 className="text-xl font-semibold text-[#0B315B] tracking-tight">Assign Verification Officer / GATC Center</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 border border-slate-300 bg-white px-3 py-1 rounded-sm">
            <span className="text-[10px] font-mono uppercase text-slate-500">Legal Authority:</span>
            <span className="text-xs font-mono font-semibold text-[#0B315B]">Act 2009 / Sec 14</span>
          </div>
        </div>
        <VernierRuler className="my-3 opacity-75" />
        <p className="text-xs text-slate-600">
          Assign an authorized Legal Metrology Officer (LMO) or Government Approved Test Centre (GATC) to conduct physical field calibration and stamping.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Select Application */}
        <Card accent title="1. Select Application Docket for Officer Assignment">
          <div className="space-y-4">
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
              <div className="border border-slate-300 rounded-sm bg-white overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-xs text-[#0B315B] tabular-nums">{currentApp.id}</span>
                    <span className="text-slate-400 font-mono">•</span>
                    <span className="font-mono text-[11px] text-slate-600 uppercase">{currentApp.applicationType}</span>
                  </div>
                  <Badge status={currentApp.status} variant="stamp">{currentApp.status}</Badge>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 text-xs divide-x divide-y divide-slate-100 border-b border-slate-200">
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[11px]">APPLICANT / ENTERPRISE</dt>
                    <dd className="font-medium text-slate-900 mt-0.5">{currentApp.applicantName}</dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-slate-500 font-mono text-[11px]">INSTRUMENT SPECIFICATION</dt>
                    <dd className="font-medium text-slate-900 mt-0.5">{currentApp.instrumentName}</dd>
                  </div>
                  <div className="p-3 sm:col-span-2">
                    <dt className="text-slate-500 font-mono text-[11px]">INSTALLATION / FIELD SITE</dt>
                    <dd className="font-sans text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0B315B] shrink-0" />
                      <span>{currentApp.inspectionLocation}</span>
                    </dd>
                  </div>
                </dl>

                {currentApp.assignedOfficerName ? (
                  <div className="p-3 bg-emerald-50/70 border-t border-emerald-200 text-emerald-950 space-y-0.5 font-sans">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-800 block">
                      Currently Assigned Verifier
                    </span>
                    <p className="font-semibold text-xs text-slate-900">{currentApp.assignedOfficerName}</p>
                    <p className="text-[11px] font-mono text-slate-500">
                      Scheduled Field Inspection: <span className="font-medium text-slate-800 tabular-nums">{currentApp.scheduledInspectionDate || 'Pending Date'}</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50/70 border-t border-amber-200 text-amber-900 font-mono text-xs flex items-center gap-2">
                    <span className="text-amber-600 font-bold">ℹ</span>
                    <span>No Verifier Assigned Yet — Ready to allocate LMO Inspector or GATC Centre below.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Select Officer */}
        <Card accent title="2. Select LMO Inspector or GATC Testing Centre">
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
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
                <div className="flex items-center gap-3">
                  <img src={currentOfficer.avatar} alt={currentOfficer.name} className="w-10 h-10 rounded-sm object-cover border border-slate-300 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs">{currentOfficer.name}</h4>
                    <p className="text-slate-500 font-mono text-[11px]">{currentOfficer.designation}</p>
                    <p className="text-slate-600 font-mono text-[11px] mt-0.5">Zone: {currentOfficer.zone}</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="inline-block bg-white px-2 py-0.5 rounded-xs font-mono text-[11px] font-semibold text-[#0B315B] border border-slate-300">
                    Active Load: <span className="tabular-nums">{currentOfficer.activeCount}</span> dockets
                  </span>
                  <p className="text-emerald-700 font-mono text-[11px] font-medium mt-1">★ {currentOfficer.rating} Verification Rating</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Input
                label="Scheduled Inspection Date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />

              <Input
                label="Special Directives / Test Weights Required"
                placeholder="e.g., Carry 20T standard deadweight truck or prover loop measures"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Link to="/lmd">
            <Button variant="outline" size="sm" className="font-mono text-xs">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" size="sm" loading={loading} icon={UserCheck} className="font-mono uppercase tracking-wider text-xs">
            Confirm Assignment & Schedule Inspection
          </Button>
        </div>
      </form>
    </div>
  );
};
