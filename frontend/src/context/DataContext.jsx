import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApiService } from '../services/api';
import { useAuth, USER_ROLES } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { currentRole, session, user } = useAuth();
  const [instruments, setInstruments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Data from Supabase
  const loadData = async () => {
    if (!session) {
      setInstruments([]);
      setApplications([]);
      setCertificates([]);
      setOfficers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [insts, apps, certs, offs] = await Promise.all([
        mockApiService.getInstruments(),
        mockApiService.getApplications(),
        mockApiService.getCertificates(),
        mockApiService.getOfficers()
      ]);
      const appsWithCerts = apps.map(app => {
        const cert = certs.find(c => c.applicationId === app.id);
        return cert ? { ...app, certificate: cert, certificateId: cert.id } : app;
      });
      setInstruments(insts);
      setApplications(appsWithCerts);
      setCertificates(certs);
      setOfficers(offs);
    } catch (error) {
      console.error('Error loading data:', error);
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
