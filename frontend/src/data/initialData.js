export const INITIAL_INSTRUMENTS = [
  {
    id: 'INST-2026-001',
    type: 'Heavy Electronic Weighbridge',
    manufacturer: 'Avery India Ltd',
    model: 'WB-60T-PRO',
    serialNumber: 'AV-984210-IN',
    capacity: '60,000 kg (60 Tonnes)',
    accuracyClass: 'Class III (Medium)',
    scaleInterval: '10 kg',
    location: 'Warehouse Unit 4, Plot 88, MIDC Industrial Area, Nagpur, Maharashtra',
    ownerName: 'Apex Logistics & Freight Corp',
    registrationDate: '2026-01-15',
    status: 'Verified',
    lastVerifiedDate: '2026-01-20',
    nextDuePeriod: '2027-01-19',
    certificateId: 'CERT-2026-8891'
  },
  {
    id: 'INST-2026-002',
    type: 'Retail Digital Counter Scale',
    manufacturer: 'Essae-Teraoka Ltd',
    model: 'DS-252 Digital Scale',
    serialNumber: 'ES-774129',
    capacity: '30 kg',
    accuracyClass: 'Class II (High Accuracy)',
    scaleInterval: '1 g',
    location: 'Store No. 12, Main Market, Sector 17, Chandigarh',
    ownerName: 'Apex Logistics & Freight Corp',
    registrationDate: '2026-02-10',
    status: 'Pending Verification',
    lastVerifiedDate: '2025-02-14',
    nextDuePeriod: '2026-02-14',
    certificateId: null
  },
  {
    id: 'INST-2026-003',
    type: 'Fuel Dispensing Meter (Multi-Product)',
    manufacturer: 'Gilbarco Veeder-Root',
    model: 'Horizon-5000',
    serialNumber: 'GV-330198-F',
    capacity: '80 L/min',
    accuracyClass: 'Class 0.5 (Fuel Dispenser)',
    location: 'Bharat Petroleum Outlet, NH-44 Expressway, Ambala, Haryana',
    ownerName: 'Apex Logistics & Freight Corp',
    registrationDate: '2025-08-01',
    status: 'Expired',
    lastVerifiedDate: '2025-08-05',
    nextDuePeriod: '2026-08-04',
    certificateId: 'CERT-2025-3310'
  },
  {
    id: 'INST-2026-004',
    type: 'Industrial Automatic Liquid Flowmeter',
    manufacturer: 'Emerson Process Management',
    model: 'Micro Motion Elite CMF',
    serialNumber: 'EM-551042-X',
    capacity: '500 L/min',
    accuracyClass: 'Class 0.3 (High Precision)',
    location: 'Chemical Terminal 2, Jawaharlal Nehru Port, Navi Mumbai',
    ownerName: 'Apex Logistics & Freight Corp',
    registrationDate: '2026-03-01',
    status: 'Verified',
    lastVerifiedDate: '2026-03-05',
    nextDuePeriod: '2027-03-04',
    certificateId: 'CERT-2026-9012'
  }
];

export const INITIAL_APPLICATIONS = [
  {
    id: 'APP-2026-1001',
    instrumentId: 'INST-2026-001',
    instrumentName: 'Heavy Electronic Weighbridge (AV-984210-IN)',
    applicantName: 'Apex Logistics & Freight Corp',
    applicationType: 'Periodic Re-verification',
    submissionDate: '2026-08-20',
    preferredDate: '2026-08-28',
    status: 'passed',
    assignedOfficerId: 'OFF-101',
    assignedOfficerName: 'Inspector Rajesh V. Sharma (LMO Nagpur Zone)',
    assignedDate: '2026-08-22',
    scheduledInspectionDate: '2026-08-28',
    inspectionLocation: 'Nagpur MIDC Area, Maharashtra',
    observations: 'All 6 physical inspection criteria passed. Dead weight 60T test within MPE limits. Lead seal affixed & QR code digital stamp generated.',
    documents: [
      { name: 'Previous_Verification_Certificate_2025.pdf', size: '1.2 MB', url: '#' }
    ],
    notes: 'Requires heavy standard test weights (20-tonne truck load).',
    timeline: [
      { step: 'Application Submitted', date: '2026-08-20 10:30 AM', actor: 'Business Owner' },
      { step: 'Assigned to Inspector Rajesh V. Sharma', date: '2026-08-22 11:00 AM', actor: 'LMD Admin' },
      { step: 'Field Inspection Passed & Certified', date: '2026-08-28 02:15 PM', actor: 'Inspector Rajesh V. Sharma' }
    ]
  },
  {
    id: 'APP-2026-1002',
    instrumentId: 'INST-2026-002',
    instrumentName: 'Retail Digital Counter Scale (ES-774129)',
    applicantName: 'Apex Logistics & Freight Corp',
    applicationType: 'Initial Verification',
    submissionDate: '2026-08-24',
    preferredDate: '2026-08-30',
    status: 'in_progress',
    assignedOfficerId: 'OFF-101',
    assignedOfficerName: 'Inspector Rajesh V. Sharma (LMO Nagpur Zone)',
    assignedDate: '2026-08-25',
    scheduledInspectionDate: '2026-08-29',
    inspectionLocation: 'Sector 17, Commercial Complex, Chandigarh',
    observations: 'Physical inspection underway at retail site.',
    documents: [],
    notes: 'Commercial retail digital scale for grocery & retail counter.',
    timeline: [
      { step: 'Application Submitted', date: '2026-08-24 04:45 PM', actor: 'Business Owner' }
    ]
  },
  {
    id: 'APP-2026-1003',
    instrumentId: 'INST-2026-003',
    instrumentName: 'Fuel Dispensing Meter (GV-330198-F)',
    applicantName: 'Apex Logistics & Freight Corp',
    applicationType: 'Re-verification After Stamping/Repair',
    submissionDate: '2026-08-18',
    preferredDate: '2026-08-22',
    status: 'passed',
    assignedOfficerId: 'OFF-101',
    assignedOfficerName: 'Inspector Rajesh V. Sharma (LMO Nagpur Zone)',
    assignedDate: '2026-08-19',
    scheduledInspectionDate: '2026-08-25',
    inspectionLocation: 'NH-44 Expressway Fuel Station, Ambala',
    observations: 'Volumetric measure check 20L standard measure passed (-0.025% error). Multi-product nozzle lead seal attached.',
    documents: [
      { name: 'Previous_Verification_Certificate_2025.pdf', size: '1.2 MB', url: '#' }
    ],
    notes: 'Multi-product fuel dispenser (Petrol / Diesel). Volumetric measure check required.',
    timeline: [
      { step: 'Application Submitted', date: '2026-08-18 09:00 AM', actor: 'Business Owner' },
      { step: 'Field Inspection Passed', date: '2026-08-25 11:30 AM', actor: 'Inspector Rajesh V. Sharma' }
    ]
  },
  {
    id: 'APP-2026-1004',
    instrumentId: 'INST-2026-004',
    instrumentName: 'Industrial Automatic Liquid Flowmeter (EM-551042-X)',
    applicantName: 'Apex Logistics & Freight Corp',
    applicationType: 'Periodic Re-verification',
    submissionDate: '2026-08-21',
    preferredDate: '2026-08-27',
    status: 'failed',
    rejectionReason: 'MPE exceeded',
    assignedOfficerId: 'OFF-101',
    assignedOfficerName: 'Inspector Rajesh V. Sharma (LMO Nagpur Zone)',
    assignedDate: '2026-08-22',
    scheduledInspectionDate: '2026-08-29',
    inspectionLocation: 'Navi Mumbai Port Terminal Pipeline',
    observations: '[Rejection Reason: MPE exceeded] Flow rate measurement error exceeded allowable +/-0.15% MPE limit. Calibration required before re-testing.',
    documents: [
      { name: 'Previous_Verification_Certificate_2025.pdf', size: '1.2 MB', url: '#' }
    ],
    notes: 'Mass flowmeter line testing with reference prover loop.',
    timeline: [
      { step: 'Application Submitted', date: '2026-08-21 02:00 PM', actor: 'Business Owner' },
      { step: 'Inspection Failed - MPE Exceeded', date: '2026-08-29 03:00 PM', actor: 'Inspector Rajesh V. Sharma' }
    ]
  },
  {
    id: 'APP-2026-1005',
    instrumentId: 'INST-2026-005',
    instrumentName: 'Pre-packaged Quantity Check Scale (PK-991044)',
    applicantName: 'Apex Logistics & Freight Corp',
    applicationType: 'Initial Verification',
    submissionDate: '2026-08-23',
    preferredDate: '2026-08-28',
    status: 'in_progress',
    assignedOfficerId: 'OFF-101',
    assignedOfficerName: 'Inspector Rajesh V. Sharma (LMO Nagpur Zone)',
    assignedDate: '2026-08-24',
    scheduledInspectionDate: '2026-08-30',
    inspectionLocation: 'Packaging Plant Unit 4, MIDC Warehouse',
    documents: [],
    notes: 'Check net quantity package filling tare & sample weight deviation.',
    timeline: [
      { step: 'Application Submitted', date: '2026-08-23 11:15 AM', actor: 'Business Owner' }
    ]
  },
  {
    id: 'APP-2026-1006',
    instrumentId: 'INST-2026-006',
    instrumentName: 'Precision Laboratory Analytical Balance (AL-20045)',
    applicantName: 'Apex Logistics & Freight Corp',
    applicationType: 'Periodic Re-verification',
    submissionDate: '2026-08-22',
    preferredDate: '2026-08-29',
    status: 'failed',
    rejectionReason: 'Seal damaged',
    assignedOfficerId: 'OFF-101',
    assignedOfficerName: 'Inspector Rajesh V. Sharma (LMO Nagpur Zone)',
    assignedDate: '2026-08-23',
    scheduledInspectionDate: '2026-08-30',
    inspectionLocation: 'Quality Control Analytical Testing Lab 2',
    observations: '[Rejection Reason: Seal damaged] OEM lead seal found broken / tampered during physical inspection. Recalibration and re-sealing required.',
    documents: [
      { name: 'Previous_Verification_Certificate_2025.pdf', size: '1.2 MB', url: '#' }
    ],
    notes: 'Class I analytical balance (0.0001g resolution) calibration.',
    timeline: [
      { step: 'Application Submitted', date: '2026-08-22 03:30 PM', actor: 'Business Owner' },
      { step: 'Inspection Failed - Seal Damaged', date: '2026-08-30 01:15 PM', actor: 'Inspector Rajesh V. Sharma' }
    ]
  }
];

export const INITIAL_CERTIFICATES = [
  {
    id: 'CERT-2026-8891',
    applicationId: 'APP-2026-0990',
    instrumentId: 'INST-2026-001',
    instrumentType: 'Heavy Electronic Weighbridge',
    manufacturer: 'Avery India Ltd',
    model: 'WB-60T-PRO',
    serialNumber: 'AV-984210-IN',
    capacity: '60,000 kg',
    accuracyClass: 'Class III',
    ownerName: 'Apex Logistics & Freight Corp',
    ownerAddress: 'Plot 88, MIDC Industrial Area, Nagpur, Maharashtra',
    verificationAuthority: 'Legal Metrology Department, Govt of Maharashtra',
    verificationOfficer: 'Inspector Rajesh V. Sharma (Badge #LMO-NGP-442)',
    verificationDate: '2026-01-20',
    expiryDate: '2027-01-19',
    status: 'VERIFIED', // VERIFIED | EXPIRED | SUSPENDED
    sealNumber: 'LMD-MH-NGP-2026-7781',
    qrCodeData: 'https://maapsetu.gov.in/verify/CERT-2026-8891',
    remarks: 'Instrument tested against 20T standard dead weights. Error within Maximum Permissible Error (MPE) limits (+/- 5kg at 20,000kg). Verification lead seal attached.',
    issuedAt: '2026-01-20 16:45 IST'
  },
  {
    id: 'CERT-2026-9012',
    applicationId: 'APP-2026-1004',
    instrumentId: 'INST-2026-004',
    instrumentType: 'Industrial Automatic Liquid Flowmeter',
    manufacturer: 'Emerson Process Management',
    model: 'Micro Motion Elite CMF',
    serialNumber: 'EM-551042-X',
    capacity: '500 L/min',
    accuracyClass: 'Class 0.3',
    ownerName: 'Apex Logistics & Freight Corp',
    ownerAddress: 'Chemical Terminal 2, JNPT Port, Navi Mumbai',
    verificationAuthority: 'Legal Metrology Department, Maharashtra Zone 2',
    verificationOfficer: 'Dr. Meenakshi Sundaram (Badge #LMO-MUM-901)',
    verificationDate: '2026-03-05',
    expiryDate: '2027-03-04',
    status: 'VERIFIED',
    sealNumber: 'LMD-MH-JNPT-2026-1092',
    qrCodeData: 'https://maapsetu.gov.in/verify/CERT-2026-9012',
    remarks: 'Prover loop volumetric test completed. Repeatability standard deviation < 0.05%. Certificate issued under Rule 14.',
    issuedAt: '2026-03-05 17:00 IST'
  },
  {
    id: 'CERT-2025-3310',
    applicationId: 'APP-2025-0412',
    instrumentId: 'INST-2026-003',
    instrumentType: 'Fuel Dispensing Meter (Multi-Product)',
    manufacturer: 'Gilbarco Veeder-Root',
    model: 'Horizon-5000',
    serialNumber: 'GV-330198-F',
    capacity: '80 L/min',
    accuracyClass: 'Class 0.5',
    ownerName: 'Apex Logistics & Freight Corp',
    ownerAddress: 'Bharat Petroleum Outlet, NH-44, Ambala',
    verificationAuthority: 'Department of Legal Metrology, Haryana',
    verificationOfficer: 'Inspector Harish Chandra (Badge #LMO-AMB-019)',
    verificationDate: '2025-08-05',
    expiryDate: '2026-08-04',
    status: 'EXPIRED',
    sealNumber: 'LMD-HR-AMB-2025-4421',
    qrCodeData: 'https://maapsetu.gov.in/verify/CERT-2025-3310',
    remarks: 'Certificate expired on 2026-08-04. Instrument requires mandatory re-verification before commercial operations.',
    issuedAt: '2025-08-05 14:20 IST'
  }
];

export const MOCK_OFFICERS = [
  {
    id: 'OFF-101',
    name: 'Inspector Rajesh V. Sharma',
    role: 'LMO Officer',
    designation: 'Senior Inspector of Legal Metrology',
    zone: 'Nagpur Zone & Industrial Sub-Division',
    phone: '+91 98230 11244',
    email: 'r.sharma@lmd.gov.in',
    activeCount: 4,
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'OFF-102',
    name: 'Suresh Kumar (GATC Ambala)',
    role: 'GATC Testing Officer',
    designation: 'Government Approved Test Centre Officer',
    zone: 'Haryana & Northern Express Corridor',
    phone: '+91 98112 44321',
    email: 'suresh.gatc@ambalatesting.org',
    activeCount: 2,
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'OFF-103',
    name: 'Dr. Meenakshi Sundaram',
    role: 'LMO Officer',
    designation: 'Lead Technical Verifier (Flow & Pressure)',
    zone: 'Navi Mumbai & Maritime Ports',
    phone: '+91 97401 88902',
    email: 'm.sundaram@lmd.gov.in',
    activeCount: 1,
    rating: 5.0,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'OFF-104',
    name: 'Anil Deshmukh (GATC Central)',
    role: 'GATC Testing Officer',
    designation: 'Certified Precision Calibration Analyst',
    zone: 'Central Region Weighing Division',
    phone: '+91 94221 00981',
    email: 'a.deshmukh@gatc-india.gov.in',
    activeCount: 3,
    rating: 4.7,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
];

export const MOCK_ACTIVITY_LOGS = [
  { id: 1, timestamp: '10 minutes ago', text: 'Application APP-2026-1002 submitted for Retail Scale ES-774129', user: 'Apex Logistics' },
  { id: 2, timestamp: '1 hour ago', text: 'Officer Rajesh V. Sharma assigned to Heavy Weighbridge verification APP-2026-1001', user: 'LMD Admin' },
  { id: 3, timestamp: '3 hours ago', text: 'Certificate CERT-2026-9012 verified via public QR scanner', user: 'Public Scanner' },
  { id: 4, timestamp: 'Yesterday', text: 'Verification inspection completed for Industrial Liquid Flowmeter (PASS)', user: 'Officer Sundaram' }
];

