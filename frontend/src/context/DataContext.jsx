import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApiService } from '../services/api';
import { useAuth, USER_ROLES } from './AuthContext';
import {
  INITIAL_INSTRUMENTS,
  INITIAL_APPLICATIONS,
  INITIAL_CERTIFICATES,
  MOCK_OFFICERS
} from '../data/initialData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { currentRole, session, user } = useAuth();
  const [instruments, setInstruments] = useState(INITIAL_INSTRUMENTS);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [certificates, setCertificates] = useState(INITIAL_CERTIFICATES);
  const [officers, setOfficers] = useState(MOCK_OFFICERS);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Data from Supabase
  const loadData = async () => {
    if (!session) {
      setInstruments(INITIAL_INSTRUMENTS);
      setApplications(INITIAL_APPLICATIONS);
      setCertificates(INITIAL_CERTIFICATES);
      setOfficers(MOCK_OFFICERS);
      setLoading(false);
      return;
    }

    try {
      const [insts, apps, certs, offs] = await Promise.all([
        mockApiService.getInstruments().catch(() => []),
        mockApiService.getApplications().catch(() => []),
        mockApiService.getCertificates().catch(() => []),
        mockApiService.getOfficers().catch(() => [])
      ]);

      const appsWithCerts = (apps || []).map(app => {
        const cert = (certs || []).find(c => c.applicationId === app.id);
        return cert ? { ...app, certificate: cert, certificateId: cert.id } : app;
      });

      const isDemoUser = session?.user?.email?.includes('demo') || session?.user?.id?.startsWith('demo-user');

      const finalInsts = (!isDemoUser && insts && insts.length > 0) ? insts : INITIAL_INSTRUMENTS;
      const finalApps = (!isDemoUser && appsWithCerts && appsWithCerts.length > 0) ? appsWithCerts : INITIAL_APPLICATIONS;
      const finalCerts = (!isDemoUser && certs && certs.length > 0) ? certs : INITIAL_CERTIFICATES;
      const finalOffs = (!isDemoUser && offs && offs.length > 0) ? offs : MOCK_OFFICERS;

      setInstruments(finalInsts);
      setApplications(finalApps);
      setCertificates(finalCerts);
      setOfficers(finalOffs);
    } catch (error) {
      console.warn('Error loading remote data, defaulting to demo dataset:', error);
      setInstruments(INITIAL_INSTRUMENTS);
      setApplications(INITIAL_APPLICATIONS);
      setCertificates(INITIAL_CERTIFICATES);
      setOfficers(MOCK_OFFICERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session, currentRole]);

  const currentStore = { instruments, applications, certificates, officers };

  // Actions
  const registerInstrument = async (formData) => {
    const newInst = await mockApiService.registerInstrument(currentStore, formData);
    await loadData(); // Reload from server
    return newInst;
  };

  const submitApplication = async (appFormData) => {
    const newApp = await mockApiService.submitApplication(currentStore, appFormData);
    await loadData();
    return newApp;
  };

  const assignOfficer = async (appId, officerId, scheduledDate, notes) => {
    await mockApiService.assignOfficerToApplication(
      currentStore,
      appId,
      officerId,
      scheduledDate,
      notes
    );
    await loadData();
    return true;
  };

  const submitVerificationResult = async ({ applicationId, outcome, checklist_results, technical_test_results, officer_remarks, rejection_reason, photo_evidence_urls }) => {
    // Payload normalized for backend edge function
    const response = await mockApiService.submitVerificationResult(currentStore, {
      applicationId,
      outcome,
      checklist_results,
      technical_test_results,
      officer_remarks,
      rejection_reason,
      photo_evidence_urls
    });
    await loadData();
    return response;
  };

  const generateCertificate = async (applicationId) => {
    const response = await mockApiService.generateCertificate(applicationId);
    await loadData();
    return response; // Should return { success: true, certificateId: '...' }
  };

  const uploadEvidencePhoto = async (applicationId, file) => {
    return await mockApiService.uploadEvidencePhoto(applicationId, file);
  };

  const getEvidenceSignedUrl = async (storagePath) => {
    return await mockApiService.getEvidenceSignedUrl(storagePath);
  };

  const getApplicationTimeline = async (applicationId) => {
    return await mockApiService.getApplicationTimeline(applicationId);
  };

  return (
    <DataContext.Provider
      value={{
        instruments,
        applications,
        certificates,
        officers,
        activityLogs,
        registerInstrument,
        submitApplication,
        assignOfficer,
        submitVerificationResult,
        generateCertificate,
        uploadEvidencePhoto,
        getEvidenceSignedUrl,
        getApplicationTimeline,
        loading,
        loadData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
