import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Eye, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { VernierRuler } from '../../components/common/VernierRuler';

export const AssignedQueuePage = () => {
  const navigate = useNavigate();
  const { applications } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const officerApps = applications.filter(app =>
    ['assigned', 'in_progress', 'passed', 'failed'].includes(app.status)
  );

  // Sort: active/pending first (by scheduled date asc), then completed
  const sortedApps = [...officerApps].sort((a, b) => {
    const aActive = ['assigned', 'in_progress'].includes(a.status);
    const bActive = ['assigned', 'in_progress'].includes(b.status);
    if (aActive !== bActive) return aActive ? -1 : 1;
    return new Date(a.scheduledInspectionDate || a.submissionDate) - new Date(b.scheduledInspectionDate || b.submissionDate);
  });

  const searchedApps = sortedApps.filter((app) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      app.id?.toLowerCase().includes(search) ||
      app.applicationNumber?.toLowerCase().includes(search) ||
      app.applicantName?.toLowerCase().includes(search) ||
      app.instrumentName?.toLowerCase().includes(search) ||
      app.instrument?.model?.toLowerCase().includes(search) ||
      app.instrument?.serialNumber?.toLowerCase().includes(search) ||
      app.inspectionLocation?.toLowerCase().includes(search)
    );
  });

  const assignedList = searchedApps.filter(app =>
    statusFilter === 'all' || app.status === statusFilter
  );

  const getStatusCount = (status) =>
    searchedApps.filter(app => status === 'all' ? true : app.status === status).length;

  const columns = [
    {
      header: 'Application Docket',
      key: 'applicationNumber',
      render: (row) => (
        <div>
          <p className="font-mono font-medium text-[#0B315B] text-xs tabular-nums">{row.applicationNumber || row.id}</p>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">{row.applicationType}</p>
        </div>
      )
    },
    {
      header: 'Instrument & Serial',
      key: 'instrumentName',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900 text-xs">{row.instrumentName}</p>
          {row.instrument?.serialNumber && (
            <p className="text-[11px] font-mono text-slate-500 tabular-nums">S/N: {row.instrument.serialNumber}</p>
          )}
        </div>
      )
    },
    {
      header: 'Inspection Site',
      key: 'inspectionLocation',
      render: (row) => (
        <span className="text-xs text-slate-700 flex items-center gap-1.5 font-sans">
          <MapPin className="w-3.5 h-3.5 text-[#0B315B] shrink-0" />
          {row.inspectionLocation?.split(',')[0] || '—'}
        </span>
      )
    },
    {
      header: 'Scheduled Date',
      key: 'scheduledInspectionDate',
      render: (row) => (
        <span className="text-xs font-mono text-slate-900 tabular-nums">
          {row.scheduledInspectionDate
            ? new Date(row.scheduledInspectionDate).toLocaleDateString('en-IN')
            : <span className="text-slate-400 font-normal italic">Not scheduled</span>}
        </span>
      )
    },
    {
      header: 'Compliance Status',
      key: 'status',
      render: (row) => <Badge status={row.status} variant="stamp">{row.status?.replace('_', ' ')}</Badge>
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Eye}
          onClick={() => navigate(`/officer/record/${row.id}`)}
          className="text-xs font-medium"
        >
          View Docket
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-0.5">
              Docket Registry • Legal Metrology Act Sec. 24
            </span>
            <h1 className="text-xl font-semibold text-[#0B315B] tracking-tight">Assigned Field Verification Queue</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 border border-slate-300 bg-white px-3 py-1 rounded-sm">
            <span className="text-[10px] font-mono uppercase text-slate-500">Active Queue:</span>
            <span className="text-xs font-mono font-bold text-[#0B315B] tabular-nums">{officerApps.length} Dockets</span>
          </div>
        </div>
        <VernierRuler className="my-3 opacity-75" />
        <p className="text-xs text-slate-600">
          Field inspection registry for designated enforcement officers. Open any docket to inspect technical specifications, review documentary evidence, or conduct physical on-site verification.
        </p>
      </div>

      <Card accent className="p-4 bg-white border border-slate-300 rounded-sm shadow-none">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by App ID, instrument, serial, applicant, or site..."
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-sm border border-slate-300 text-xs py-1.5 px-2.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B315B] focus:border-[#0B315B] font-mono"
            >
              <option value="all">All ({getStatusCount('all')})</option>
              <option value="assigned">Assigned ({getStatusCount('assigned')})</option>
              <option value="in_progress">In Progress ({getStatusCount('in_progress')})</option>
              <option value="passed">Passed ({getStatusCount('passed')})</option>
              <option value="failed">Failed ({getStatusCount('failed')})</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200">
          <p className="text-xs text-slate-600 font-mono">
            Showing <span className="font-semibold text-slate-900 tabular-nums">{assignedList.length}</span> of <span className="tabular-nums">{officerApps.length}</span> dockets
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="text-xs font-mono font-medium text-[#C87541] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      <Table columns={columns} data={assignedList} emptyMessage="No verifications currently assigned in this queue." />
    </div>
  );
};
