import React, { useState, useEffect } from 'react';
import { mockApiService as api } from '../../services/api';

export function GeoSelector({ 
  selectedStateId, 
  selectedDistrictId, 
  selectedSubdistrictId, 
  onGeoChange 
}) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);

  // Fetch States on mount
  useEffect(() => {
    async function loadStates() {
      try {
        const data = await api.getStates();
        setStates(data);
      } catch (err) {
        console.error('Failed to load states:', err);
      } finally {
        setLoadingStates(false);
      }
    }
    loadStates();
  }, []);

  // Fetch Districts when State changes
  useEffect(() => {
    if (!selectedStateId) {
      setDistricts([]);
      return;
    }
    async function loadDistricts() {
      try {
        const data = await api.getDistricts(selectedStateId);
        setDistricts(data);
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    }
    loadDistricts();
  }, [selectedStateId]);

  // Fetch Subdistricts when District changes
  useEffect(() => {
    if (!selectedStateId || !selectedDistrictId) {
      setSubdistricts([]);
      return;
    }
    async function loadSubdistricts() {
      try {
        const data = await api.getSubdistricts(selectedStateId, selectedDistrictId);
        setSubdistricts(data);
      } catch (err) {
        console.error('Failed to load subdistricts:', err);
      }
    }
    loadSubdistricts();
  }, [selectedStateId, selectedDistrictId]);

  const handleStateChange = (e) => {
    const newStateId = e.target.value;
    onGeoChange({ stateId: newStateId, districtId: '', subdistrictId: '' });
  };

  const handleDistrictChange = (e) => {
    const newDistrictId = e.target.value;
    onGeoChange({ stateId: selectedStateId, districtId: newDistrictId, subdistrictId: '' });
  };

  const handleSubdistrictChange = (e) => {
    const newSubdistrictId = e.target.value;
    onGeoChange({ stateId: selectedStateId, districtId: selectedDistrictId, subdistrictId: newSubdistrictId });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
          State <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedStateId}
          onChange={handleStateChange}
          required
          className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C]"
        >
          <option value="">Select State</option>
          {states.map(s => (
            <option key={s.state_id} value={s.state_id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
          District <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedDistrictId}
          onChange={handleDistrictChange}
          required
          disabled={!selectedStateId}
          className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C] disabled:opacity-50"
        >
          <option value="">Select District</option>
          {districts.map(d => (
            <option key={d.district_id} value={d.district_id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#003943]/80">
          Sub-District
        </label>
        <select
          value={selectedSubdistrictId}
          onChange={handleSubdistrictChange}
          disabled={!selectedDistrictId || subdistricts.length === 0}
          className="w-full bg-[#FDF9F6] border border-[#003943]/20 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#003943] focus:outline-none focus:border-[#00959C] disabled:opacity-50"
        >
          <option value="">Select Sub-District (Optional)</option>
          {subdistricts.map(sd => (
            <option key={sd.subdistrict_id} value={sd.subdistrict_id}>{sd.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
