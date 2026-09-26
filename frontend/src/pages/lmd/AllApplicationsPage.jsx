import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Eye, FileText, CheckCircle2, MapPin } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { VernierRuler } from '../../components/common/VernierRuler';

export const AllApplicationsPage = () => {
  const { applications } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const param = searchParams.get('status');
    if (param && param !== statusFilter) {
      setStatusFilter(param);
    }
  }, [searchParams]);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    if (newStatus === 'all') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ status: newStatus });
    }
  };

  const sortedApps = [...applications].sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate) || a.id.localeCompare(b.id));
  const searchedApps = sortedApps.filter((app) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      app.id?.toLowerCase().includes(search) ||
      app.applicationNumber?.toLowerCase().includes(search) ||
      app.applicantName?.toLowerCase().includes(search) ||
      app.instrumentName?.toLowerCase().includes(search) ||
      app.applicationType?.toLowerCase().includes(search) ||
      app.assignedOfficerName?.toLowerCase().includes(search)
    );
  });

  const filteredApps = searchedApps.filter(app => statusFilter === 'all' || app.status === statusFilter);

  const getStatusCount = (status) => searchedApps.filter(app => status === 'all' ? true : app.status === status).length;

  const columns = [
    {
      header: 'Docket ID',
      key: 'id',
      render: (row) => <span className="font-mono font-medium text-[#0B315B] text-xs tabular-nums">{row.applicationNumber || row.id}</span>
    },
    {
      header: 'Applicant / Business',
      key: 'applicantName',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900 text-xs">{row.applicantName}</p>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5">Loc: {row.inspectionLocation?.split(',')[0] || '—'}</p>
        </div>
      )
    },
    {
      header: 'Instrument Specification',
      key: 'instrumentName',
      render: (row) => <span className="font-medium text-slate-900 text-xs">{row.instrumentName}</span>
    },
    {
      header: 'Application Category',
      key: 'applicationType',
      render: (row) => <span className="text-[11px] font-mono text-slate-600">{row.applicationType}</span>
    },
    {
      header: 'Assigned Verifier',
      key: 'assignedOfficerName',
      render: (row) => (
        <span className="text-xs font-mono text-slate-800">
          {row.assignedOfficerName || <span className="text-slate-400 italic">Unassigned</span>}
        </span>
      )
    },
    {
      header: 'Scheduled Date',
      key: 'scheduledInspectionDate',
      render: (row) => (
        <span className="text-xs font-mono text-slate-900 tabular-nums">
          {row.scheduledInspectionDate ? new Date(row.scheduledInspectionDate).toLocaleDateString('en-IN') : <span className="text-slate-400 italic">—</span>}
        </span>
      )
    },
    {
      header: 'Compliance Status',
      key: 'status',
      render: (row) => <Badge status={row.status} variant="stamp">{row.status?.replace('_', ' ')}</Badge>
    },
    {
      header: 'Actions',
      key: 'action',
      render: (row) => (
        <Button variant="outline" size="sm" icon={Eye} onClick={() => setSelectedApp(row)} className="font-mono text-xs">
          Docket
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-5 font-sans">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-0.5">
              Statewide Master Registry • Legal Metrology Act 2009
            </span>
            <h1 className="text-xl font-semibold text-[#0B315B] tracking-tight">Master Statutory Verification Registry</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 border border-slate-300 bg-white px-3 py-1 rounded-sm">
            <span className="text-[10px] font-mono uppercase text-slate-500">Registry Total:</span>
            <span className="text-xs font-mono font-bold text-[#0B315B] tabular-nums">{applications.length} Dockets</span>
          </div>
        </div>
        <VernierRuler className="my-3 opacity-75" />
        <p className="text-xs text-slate-600">
          Filter and search across all submitted, in-progress, passed, and rejected verification records statewide.
        </p>
      </div>

      <Card accent className="p-4 bg-white border border-slate-300 rounded-sm shadow-none">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search across all records by ID, machine, vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-sm border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B] font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-600 font-medium font-mono uppercase text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="rounded-sm border border-slate-300 text-xs py-1.5 px-2.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B] font-mono"
            >
              <option value="all">All ({getStatusCount('all')})</option>
              <option value="submitted">Submitted ({getStatusCount('submitted')})</option>
              <option value="assigned">Assigned ({getStatusCount('assigned')})</option>
              <option value="in_progress">In Progress ({getStatusCount('in_progress')})</option>
              <option value="passed">Passed ({getStatusCount('passed')})</option>
              <option value="failed">Failed ({getStatusCount('failed')})</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200">
          <p className="text-xs text-slate-600 font-mono">
            Showing <span className="font-semibold text-slate-900 tabular-nums">{filteredApps.length}</span> of <span className="tabular-nums">{applications.length}</span> dockets
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); handleStatusFilterChange('all'); }}
              className="text-xs font-mono font-medium text-[#C87541] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      <Table columns={columns} data={filteredApps} emptyMessage="No records match query in master archive." />

      {selectedApp && (
        <Modal maxWidth="max-w-4xl" isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Master Docket Record: ${selectedApp.applicationNumber || selectedApp.id}`}
          footer={<Button variant="outline" size="sm" onClick={() => setSelectedApp(null)} className="font-mono text-xs">Close Docket</Button>}
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-slate-50 rounded-sm border border-slate-300 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900 text-sm">{selectedApp.instrumentName}</p>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">{selectedApp.applicantName}</p>
              </div>
              <Badge status={selectedApp.status} variant="stamp">{selectedApp.status}</Badge>
            </div>

            <dl className="grid grid-cols-2 text-xs divide-x divide-y divide-slate-100 border border-slate-200 rounded-sm">
              <div className="p-2.5">
                <dt className="text-slate-400 font-mono text-[10px] uppercase">Application Category</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{selectedApp.applicationType}</dd>
              </div>
              <div className="p-2.5">
                <dt className="text-slate-400 font-mono text-[10px] uppercase">Field Location</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{selectedApp.inspectionLocation}</dd>
              </div>
              <div className="p-2.5">
                <dt className="text-slate-400 font-mono text-[10px] uppercase">Assigned Verifier</dt>
                <dd className="font-mono font-medium text-slate-900 mt-0.5">{selectedApp.assignedOfficerName || 'Pending'}</dd>
              </div>
              <div className="p-2.5">
                <dt className="text-slate-400 font-mono text-[10px] uppercase">Scheduled Inspection</dt>
                <dd className="font-mono font-medium text-slate-900 mt-0.5 tabular-nums">{selectedApp.scheduledInspectionDate || 'Not scheduled'}</dd>
              </div>
            </dl>

            <div>
              <p className="font-mono text-[11px] uppercase font-semibold text-slate-600 border-b border-slate-200 pb-1 mb-2">
                Statutory Audit Trail
              </p>
              <div className="space-y-2 pl-3 border-l-2 border-[#0B315B]">
                {selectedApp.timeline && selectedApp.timeline.length > 0 ? (
                  selectedApp.timeline.map((step, idx) => (
                    <div key={idx} className="text-[11px]">
                      <p className="font-semibold text-slate-900">{step.step}</p>
                      <p className="text-slate-500 font-mono text-[10px]">{step.date} • {step.actor}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 font-mono italic text-[11px]">No audit trail steps recorded.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
