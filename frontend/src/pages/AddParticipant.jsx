import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { createParticipant } from '../api';

const TRAINING_TYPES = ['Dispatch Graduate', 'Human Factors', 'Recurrent'];

const ALL_MODULES = [
  'Air Law',
  'Aircraft Systems',
  'Navigation',
  'Meteorology',
  'Flight Planning',
  'Human Performance',
  'Mass & Balance',
  'Operational Procedures',
  'Communications',
  'General Navigation',
  'Radio Navigation',
  'Principles of Flight',
];

export default function AddParticipant() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    participant_name: '',
    company: '',
    department: '',
    training_type: '',
    training_date: '',
    modules: [],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleModule = (mod) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.includes(mod)
        ? prev.modules.filter((m) => m !== mod)
        : [...prev.modules, mod],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.participant_name || !form.company || !form.department || !form.training_type || !form.training_date) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setSaving(true);
      await createParticipant(form);
      toast.success('Participant added successfully');
      navigate('/admin/participants');
    } catch {
      toast.error('Failed to add participant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-700 transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-primary-800">Add Participant</h1>
        <p className="text-sm text-primary-400 mt-1">Create a new training record</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="label">Participant Name *</label>
          <input
            name="participant_name"
            value={form.participant_name}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter full name"
          />
        </div>

        {/* Company & Department */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Company *</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="input-field"
              placeholder="Company name"
            />
          </div>
          <div>
            <label className="label">Department *</label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              className="input-field"
              placeholder="Department"
            />
          </div>
        </div>

        {/* Training Type & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Type of Training *</label>
            <select
              name="training_type"
              value={form.training_type}
              onChange={handleChange}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="">Select training type</option>
              {TRAINING_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Training Date *</label>
            <input
              type="date"
              name="training_date"
              value={form.training_date}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Modules (only for Recurrent) */}
        {form.training_type === 'Recurrent' && (
          <div className="animate-fade-in">
            <label className="label">Training Modules</label>
            <p className="text-xs text-primary-400 mb-3">Select all modules completed during recurrent training</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_MODULES.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => toggleModule(mod)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                    form.modules.includes(mod)
                      ? 'border-accent-400 bg-accent-50 text-accent-700 font-medium'
                      : 'border-primary-200 text-primary-600 hover:border-primary-300'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${
                      form.modules.includes(mod) ? 'bg-accent-500' : 'border border-primary-300'
                    }`}
                  >
                    {form.modules.includes(mod) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {mod}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary-200">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Add Participant'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
