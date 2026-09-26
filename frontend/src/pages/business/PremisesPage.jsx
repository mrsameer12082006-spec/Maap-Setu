import React from 'react';
import { PremiseManager } from '../../components/business/PremiseManager';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PremisesPage = () => {
  const location = useLocation();
  const returnTo = location.state?.returnTo;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {returnTo && (
        <div className="mb-2">
          <Link to={returnTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00959C] hover:text-[#007A80] transition-colors bg-[#00959C]/10 px-4 py-2 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
            Return to Application
          </Link>
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-[#003943]">Business Premises</h1>
        <p className="text-[#003943]/70">Manage the locations where your instruments are installed.</p>
      </div>
      
      <PremiseManager />
    </div>
  );
};
