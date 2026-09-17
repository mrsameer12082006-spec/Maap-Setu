import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Eye, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

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
      header: 'Application',
      key: 'applicationNumber',
      render: (row) => (
        <div>
          <p className="font-mono font-bold text-primary text-xs">{row.applicationNumber || row.id}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">{row.applicationType}</p>
        </div>
      )
    },
    {
      header: 'Instrument',
      key: 'instrumentName',
      render: (row) => (
        <div>
          <p className="font-semibold text-neutral-900 text-sm">{row.instrumentName}</p>
          {row.instrument?.serialNumber && (
            <p className="text-[11px] font-mono text-neutral-500">S/N: {row.instrument.serialNumber}</p>
          )}
        </div>
      )
    },
    {
      header: 'Inspection Address',
      key: 'inspectionLocation',
      render: (row) => (
        <span className="text-xs text-neutral-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          {row.inspectionLocation?.split(',')[0] || '—'}
        </span>
      )
    },
    {
      header: 'Scheduled Date',
      key: 'scheduledInspectionDate',
      render: (row) => (
        <span className="text-xs font-semibold text-neutral-900">
          {row.scheduledInspectionDate
            ? new Date(row.scheduledInspectionDate).toLocaleDateString('en-IN')
            : <span className="text-neutral-400 font-normal italic">Not scheduled</span>}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <Badge status={row.status}>{row.status?.replace('_', ' ')}</Badge>
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Eye}
          onClick={() => navigate(`/officer/record/${row.id}`)}
        >
          View Record
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Assigned Inspection Queue</h1>
        <p className="text-xs text-neutral-600 mt-1">
          Field inspection registry. Open any record to view full case details or start physical verification.
        </p>
      </div>

      <Card className="p-4 bg-white">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-600 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by App ID, instrument, serial, applicant, or site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-input border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-600" />
            <span className="text-xs text-neutral-600 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-input border border-neutral-300 text-xs py-2 px-3 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All ({getStatusCount('all')})</option>
              <option value="assigned">Assigned ({getStatusCount('assigned')})</option>
              <option value="in_progress">In Progress ({getStatusCount('in_progress')})</option>
              <option value="passed">Passed ({getStatusCount('passed')})</option>
              <option value="failed">Failed ({getStatusCount('failed')})</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-600 font-medium">
            Showing <span className="font-bold text-neutral-900">{assignedList.length}</span> of {officerApps.length} records
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="text-xs font-semibold text-[#00959C] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      <Table columns={columns} data={assignedList} emptyMessage="No verifications currently assigned." />
    </div>
  );
};
