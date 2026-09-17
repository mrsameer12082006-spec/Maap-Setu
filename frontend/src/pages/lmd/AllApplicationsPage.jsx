import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Eye } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

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
      header: 'App ID',
      key: 'id',
      render: (row) => <span className="font-mono font-bold text-primary text-xs">{row.id}</span>
    },
    {
      header: 'Applicant / Business',
      key: 'applicantName',
      render: (row) => (
        <div>
          <p className="font-semibold text-neutral-900">{row.applicantName}</p>
          <p className="text-[11px] text-neutral-600">Loc: {row.inspectionLocation.split(',')[0]}</p>
        </div>
      )
    },
    {
      header: 'Instrument',
      key: 'instrumentName',
      render: (row) => <span className="font-semibold text-neutral-900">{row.instrumentName}</span>
    },
    {
      header: 'Application Type',
      key: 'applicationType',
      render: (row) => <span className="text-xs text-neutral-600">{row.applicationType}</span>
    },
    {
      header: 'Assigned Verifier',
      key: 'assignedOfficerName',
      render: (row) => (
        <span className="text-xs font-medium text-neutral-900">
          {row.assignedOfficerName || <span className="text-neutral-600 italic">Unassigned</span>}
        </span>
      )
    },
    {
      header: 'Scheduled Date',
      key: 'scheduledInspectionDate',
      render: (row) => (
        <span className="text-xs font-medium text-neutral-900">
          {row.scheduledInspectionDate || <span className="text-neutral-600 italic">-</span>}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      key: 'action',
      render: (row) => (
        <Button variant="ghost" size="sm" icon={Eye} onClick={() => setSelectedApp(row)}>
          Master Record
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Master Verification Registry</h1>
        <p className="text-xs text-neutral-600">Filter and search across all submitted, in-progress, passed, and failed verification records statewide.</p>
      </div>

      <Card className="p-4 bg-white">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-600 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search across all records..."
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
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="rounded-input border border-neutral-300 text-xs py-2 px-3 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
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
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-600 font-medium">
            Showing <span className="font-bold text-neutral-900">{filteredApps.length}</span> of <span className="font-bold text-neutral-900">{applications.length}</span> applications
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); handleStatusFilterChange('all'); }}
              className="text-xs font-semibold text-[#00959C] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      <Table columns={columns} data={filteredApps} emptyMessage="No records match query." />

      {selectedApp && (
        <Modal maxWidth="max-w-4xl" isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Master Application Record: ${selectedApp.id}`}
          footer={<Button variant="secondary" onClick={() => setSelectedApp(null)}>Close Record</Button>}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-neutral-100 rounded border border-neutral-300 flex justify-between items-center">
              <div>
                <p className="font-bold text-neutral-900">{selectedApp.instrumentName}</p>
                <p className="text-neutral-600">{selectedApp.applicantName}</p>
              </div>
              <Badge status={selectedApp.status}>{selectedApp.status}</Badge>
            </div>

            <div>
              <p className="font-semibold text-neutral-900 border-b pb-1 mb-2">Audit History</p>
              <div className="space-y-2 pl-2 border-l-2 border-primary">
                {selectedApp.timeline && selectedApp.timeline.length > 0 ? (
                  selectedApp.timeline.map((step, idx) => (
                    <div key={idx} className="text-[11px]">
                      <p className="font-semibold text-neutral-900">{step.step}</p>
                      <p className="text-neutral-600">{step.date} • {step.actor}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 italic">No legacy timeline steps recorded.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
