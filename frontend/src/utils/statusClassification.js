/**
 * Centralized Status Classification & Metrics Derivation Engine for MaapSetu
 *
 * Maps canonical database applications.status values to standard dashboard categories:
 * - NEW: newly submitted applications awaiting LMD review/action ('submitted')
 * - IN_PROGRESS: applications actively being processed/reviewed by LMD ('under_review')
 * - AWAITING_ASSIGN: applications eligible/approved waiting for a verifier assignment ('approved', 'awaiting_assignment')
 * - VERIFICATION: applications assigned to a verifier with field inspection in progress ('assigned', 'in_progress')
 * - COMPLETED: applications whose verification workflow has reached terminal state ('passed', 'failed')
 */

export const STATUS_CATEGORIES = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  AWAITING_ASSIGN: 'AWAITING_ASSIGN',
  VERIFICATION: 'VERIFICATION',
  COMPLETED: 'COMPLETED'
};

export const STATUS_CATEGORY_CONFIG = {
  [STATUS_CATEGORIES.NEW]: {
    key: 'new',
    label: 'New',
    colorClass: 'text-[#003943]',
    bgBadgeClass: 'bg-[#003943]/10 text-[#003943] border-[#003943]/20',
    description: 'Newly submitted applications awaiting LMD initial review'
  },
  [STATUS_CATEGORIES.IN_PROGRESS]: {
    key: 'in_progress',
    label: 'In Progress',
    colorClass: 'text-cyan-700',
    bgBadgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Applications actively under administrative review or processing'
  },
  [STATUS_CATEGORIES.AWAITING_ASSIGN]: {
    key: 'awaiting_assignment',
    label: 'Awaiting Assign',
    colorClass: 'text-[#00959C]',
    bgBadgeClass: 'bg-[#00959C]/10 text-[#00959C] border-[#00959C]/20',
    description: 'Applications reviewed/eligible and waiting for verifier assignment'
  },
  [STATUS_CATEGORIES.VERIFICATION]: {
    key: 'verification',
    label: 'Verification',
    colorClass: 'text-amber-700',
    bgBadgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Applications assigned to LMO/GATC with physical verification in progress'
  },
  [STATUS_CATEGORIES.COMPLETED]: {
    key: 'completed',
    label: 'Completed',
    colorClass: 'text-emerald-700',
    bgBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Applications reaching terminal verification outcome (Passed / Failed)'
  }
};

/**
 * Classifies a single application entity into one canonical status category.
 *
 * @param {Object} app - Application DTO
 * @returns {string} One of STATUS_CATEGORIES values
 */
export function getApplicationStatusCategory(app) {
  if (!app) return STATUS_CATEGORIES.NEW;
  const status = String(app.status || '').toLowerCase().trim();

  // 1. Terminal completed verification states
  if (['passed', 'failed', 'completed', 'rejected'].includes(status)) {
    return STATUS_CATEGORIES.COMPLETED;
  }

  // 2. Active field verification by assigned officer
  if (
    status === 'in_progress' ||
    status === 'under_verification' ||
    (status === 'assigned' && Boolean(app.assignedOfficerId || app.assigned_officer_id))
  ) {
    return STATUS_CATEGORIES.VERIFICATION;
  }

  // 3. Applications approved / awaiting verifier assignment
  // Deterministic rule: An application is Awaiting Assign if it has cleared LMD review (reviewedAt is populated)
  // or is marked awaiting_assignment/approved, and no verifier is currently assigned.
  if (
    status === 'awaiting_assignment' ||
    status === 'awaiting_assign' ||
    status === 'approved' ||
    (status === 'assigned' && !app.assignedOfficerId && !app.assigned_officer_id) ||
    (status === 'under_review' && Boolean(app.reviewedAt || app.reviewed_at) && !app.assignedOfficerId && !app.assigned_officer_id)
  ) {
    return STATUS_CATEGORIES.AWAITING_ASSIGN;
  }

  // 4. Actively being reviewed/processed by LMD
  // Deterministic rule: An application is In Progress if it is under_review but has not completed review (reviewedAt is null/undefined)
  if (status === 'under_review' || status === 'processing') {
    return STATUS_CATEGORIES.IN_PROGRESS;
  }

  // 5. Newly submitted applications awaiting initial LMD action
  if (status === 'submitted' || status === 'new' || status === 'pending') {
    return STATUS_CATEGORIES.NEW;
  }

  // Default fallback
  return STATUS_CATEGORIES.NEW;
}

/**
 * Derives dynamic status counts from canonical applications state.
 * De-duplicates by application ID to guarantee 1 application = 1 count.
 *
 * @param {Array} applications - List of applications from DataContext / Supabase
 * @returns {Object} Category counts map
 */
export function calculateLmdDashboardCounts(applications = []) {
  const counts = {
    [STATUS_CATEGORIES.NEW]: 0,
    [STATUS_CATEGORIES.IN_PROGRESS]: 0,
    [STATUS_CATEGORIES.AWAITING_ASSIGN]: 0,
    [STATUS_CATEGORIES.VERIFICATION]: 0,
    [STATUS_CATEGORIES.COMPLETED]: 0,
    total: 0
  };

  if (!Array.isArray(applications)) return counts;

  const seenIds = new Set();

  for (const app of applications) {
    if (!app || !app.id || seenIds.has(app.id)) continue;
    seenIds.add(app.id);

    const category = getApplicationStatusCategory(app);
    if (counts[category] !== undefined) {
      counts[category] += 1;
    }
    counts.total += 1;
  }

  return counts;
}

/**
 * Returns actionable applications for LMD administrator:
 * - Newly submitted applications requiring initial review ('submitted')
 * - Under review applications requiring processing ('under_review')
 * - Awaiting assignment applications requiring verifier assignment
 * - Passed applications requiring certificate issuance (status === 'passed' && !certificateId)
 *
 * Applications actively under verification by an assigned officer ('assigned', 'in_progress')
 * are in the Officer's active inspection queue and do not require LMD action until verification is submitted.
 *
 * @param {Array} applications
 * @returns {Array} Sorted actionable applications
 */
export function getActionableLmdApplications(applications = []) {
  if (!Array.isArray(applications)) return [];

  const seenIds = new Set();
  const actionable = [];

  for (const app of applications) {
    if (!app || !app.id || seenIds.has(app.id)) continue;
    seenIds.add(app.id);

    const status = String(app.status || '').toLowerCase().trim();
    const category = getApplicationStatusCategory(app);

    const isNew = category === STATUS_CATEGORIES.NEW;
    const isUnderReview = category === STATUS_CATEGORIES.IN_PROGRESS;
    const isAwaitingAssign = category === STATUS_CATEGORIES.AWAITING_ASSIGN;
    const isInspection =
      String(app.applicationType || '').toLowerCase().includes('in-service') ||
      String(app.applicationType || '').toLowerCase().includes('in_service') ||
      String(app.applicationType || '').toLowerCase().includes('surveillance');

    const isPassedAwaitingCert = (status === 'passed' || status === 'completed') && !app.certificateId && !isInspection;

    if (isNew || isUnderReview || isAwaitingAssign || isPassedAwaitingCert) {
      actionable.push(app);
    }
  }

  // Sort: prioritize newly submitted / unassigned, then by submissionDate descending
  return actionable.sort((a, b) => {
    const aIsNew = a.status === 'submitted' ? 1 : 0;
    const bIsNew = b.status === 'submitted' ? 1 : 0;
    if (aIsNew !== bIsNew) return bIsNew - aIsNew;

    const dateA = new Date(a.submissionDate || a.created_at || 0).getTime();
    const dateB = new Date(b.submissionDate || b.created_at || 0).getTime();
    return dateB - dateA;
  });
}
