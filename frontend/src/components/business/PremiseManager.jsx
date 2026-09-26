import React, { useState, useEffect } from 'react';
import { mockApiService as api } from '../../services/api';
import { GeoSelector } from './GeoSelector';
import { Plus, Edit2, CheckCircle, XCircle, MapPin, Building2 } from 'lucide-react';

export function PremiseManager() {
  const [premises, setPremises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    premisesName: '',
    premisesType: 'REGISTERED_OFFICE',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    stateId: '',
    districtId: '',
    subdistrictId: '',
    locality: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPremises();
  }, []);

  async function loadPremises() {
    try {
      setLoading(true);
      const data = await api.getMyPremises();
      setPremises(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load premises');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeoChange = (geoData) => {
    setFormData(prev => ({ ...prev, ...geoData }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.pincode.match(/^[0-9]{6}$/)) {
      setFormError('Pincode must be exactly 6 digits.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await api.updatePremise(editingId, formData);
      } else {
        await api.createPremise(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        premisesName: '',
        premisesType: 'REGISTERED_OFFICE',
        addressLine1: '',
        addressLine2: '',
        pincode: '',
        stateId: '',
        districtId: '',
        subdistrictId: '',
        locality: ''
      });
      await loadPremises();
    } catch (err) {
      setFormError(err.message || 'Failed to create premise');
    } finally {
      setSubmitting(false);
    }
  };


  const handleEdit = (premise) => {
    setFormData({
      premisesName: premise.premises_name || '',
      premisesType: premise.premises_type || 'REGISTERED_OFFICE',
      addressLine1: premise.address_line_1 || '',
      addressLine2: premise.address_line_2 || '',
      pincode: premise.pincode || '',
      stateId: premise.state_id || '',
      districtId: premise.district_id || '',
      subdistrictId: premise.subdistrict_id || '',
      locality: premise.locality || '',
      isPrimary: premise.is_primary || false
    });
    setEditingId(premise.id);
    setShowForm(true);
  };

  const toggleStatus = async (premise) => {
    try {
      await api.updatePremiseStatus(premise.id, !premise.is_active);
      await loadPremises();
    } catch (err) {
      alert(err.message || 'Failed to update premise status');
    }
  };

  if (loading) return <div className="p-8 text-center text-[#003943]">Loading premises...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold text-[#003943] flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[#00959C]" />
          My Business Premises
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#00959C] hover:bg-[#007A80] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Premise
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-[#003943]/10 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#003943]/10 pb-4">
            <h3 className="font-bold text-[#003943] text-lg">{editingId ? 'Edit Premise' : 'Register New Premise'}</h3>
            <button onClick={() => setShowForm(false)} className="text-[#003943]/60 hover:text-[#003943]">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          {formError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  Premise Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="premisesName"
                  value={formData.premisesName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Apex Logistics Warehouse"
                  className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-sm font-semibold focus:border-[#00959C] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  Premise Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="premisesType"
                  value={formData.premisesType}
                  onChange={handleInputChange}
                  className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-sm font-semibold focus:border-[#00959C] focus:outline-none"
                >
                  <option value="REGISTERED_OFFICE">Registered Office</option>
                  <option value="INSPECTION_SITE">Inspection Site</option>
                  <option value="MANUFACTURING_UNIT">Manufacturing Unit</option>
                  <option value="REPAIR_WORKSHOP">Repair Workshop</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                required
                placeholder="Building, Street, Area"
                className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-sm font-semibold focus:border-[#00959C] focus:outline-none"
              />
            </div>

            <GeoSelector 
              selectedStateId={formData.stateId} 
              selectedDistrictId={formData.districtId} 
              selectedSubdistrictId={formData.subdistrictId}
              onGeoChange={handleGeoChange} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  Locality (Optional)
                </label>
                <input
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleInputChange}
                  className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-sm font-semibold focus:border-[#00959C] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="6-digit pincode"
                  className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-sm font-semibold focus:border-[#00959C] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#003943]/10">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl font-bold text-[#003943]/60 hover:text-[#003943] hover:bg-[#003943]/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl font-bold text-white bg-[#00959C] hover:bg-[#007A80] disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Register Premise')}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && premises.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#003943]/10 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#00959C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-[#00959C]" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#003943] mb-2">No premises registered.</h3>
          <p className="text-[#003943]/70 mb-6 max-w-md mx-auto">
            You need to register at least one business premise (like a shop, factory, or office) before you can apply for instrument verification.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#00959C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#007A80] transition-colors"
          >
            Register Your First Premise
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premises.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border ${p.is_active ? 'border-[#00959C]/30 shadow-sm' : 'border-gray-200 opacity-75'} p-5 flex flex-col`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${p.is_active ? 'bg-[#00959C]/10 text-[#00959C]' : 'bg-gray-100 text-gray-500'}`}>
                    {p.premises_type.replace('_', ' ')}
                  </span>
                  {p.is_primary && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-[#003943]/10 text-[#003943]">
                      PRIMARY
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(p)}
                    className="text-xs font-bold px-3 py-1 rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button 
                    onClick={() => toggleStatus(p)}
                  className={`text-xs font-bold px-3 py-1 rounded-full ${p.is_active ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                >
                  {p.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
              
              <h4 className="font-bold text-[#003943] text-lg mb-1">{p.premises_name}</h4>
              <p className="text-[#003943]/70 text-sm mb-4 flex-grow flex items-start gap-1.5">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {p.address_line_1}
                  {p.address_line_2 && <>, {p.address_line_2}</>}
                  <br />
                  {p.locality && <>{p.locality}, </>}Pincode: {p.pincode}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
