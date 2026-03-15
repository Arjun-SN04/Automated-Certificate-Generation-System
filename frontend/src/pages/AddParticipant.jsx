import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineArrowLeft,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { createParticipant } from '../api';
import { useAuth } from '../context/AuthContext';

const TRAINING_TYPES = [
  { value: 'FDI', label: 'FDI – Flight Dispatch Initial' },
  { value: 'FDR', label: 'FDR – Flight Dispatch Recurrent' },
  { value: 'FDA', label: 'FDA – Flight Dispatch Advanced' },
  { value: 'FTL', label: 'FTL – Flight Time Limitations' },
  { value: 'NDG', label: 'NDG – Dangerous Goods No-Carry' },
  { value: 'HF',  label: 'HF – Human Factors for OCC' },
  { value: 'GD',  label: 'GD – Ground Operations' },
  { value: 'TCD', label: 'TCD – Training Competencies Development' },
];

const ALL_MODULES = [
  'Air Law', 'Aircraft Systems', 'Navigation', 'Meteorology',
  'Flight Planning', 'Human Performance', 'Mass & Balance',
  'Operational Procedures', 'Communications', 'General Navigation',
  'Radio Navigation', 'Principles of Flight',
];

const emptyRow = () => ({
  id: Date.now() + Math.random(),
  first_name: '',
  last_name: '',
});

// ─── Single-mode form ─────────────────────────────────────────────────────────
function SingleForm({ isAdmin, airlineName, onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    company: isAdmin ? '' : (airlineName || ''),
    department: '',
    training_type: '',
    training_date: '',
    end_date: '',
    location: '',
    modules: [],
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleModule = (mod) =>
    setForm(prev => ({
      ...prev,
      modules: prev.modules.includes(mod)
        ? prev.modules.filter(m => m !== mod)
        : [...prev.modules, mod],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error('Please enter both first and last name');
      return;
    }
    if (!form.company || !form.department || !form.training_type || !form.training_date) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setSaving(true);
      await createParticipant(form);
      toast.success('Participant added successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add participant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {/* First + Last name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">First Name *</label>
          <input name="first_name" value={form.first_name} onChange={handleChange} className="input-field" placeholder="e.g. Ahmed" />
        </div>
        <div>
          <label className="label">Last Name *</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} className="input-field" placeholder="e.g. Al Mansouri" />
        </div>
      </div>

      {/* Airline + Department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Airline Name *</label>
          <input
            name="company"
            value={form.company}
            onChange={isAdmin ? handleChange : undefined}
            readOnly={!isAdmin}
            className={`input-field ${!isAdmin ? 'bg-primary-100 cursor-not-allowed text-primary-500' : ''}`}
            placeholder="e.g. Emirates Airlines"
          />
          {!isAdmin && <p className="text-[10px] text-primary-400 mt-1">Auto-filled from your account</p>}
        </div>
        <div>
          <label className="label">Department *</label>
          <input name="department" value={form.department} onChange={handleChange} className="input-field" placeholder="e.g. Flight Operations" />
        </div>
      </div>

      {/* Training Type */}
      <div>
        <label className="label">Type of Training *</label>
        <select name="training_type" value={form.training_type} onChange={handleChange} className="input-field appearance-none cursor-pointer">
          <option value="">Select training type</option>
          {TRAINING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Start Date + End Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Start Date *</label>
          <input type="date" name="training_date" value={form.training_date} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label">End Date</label>
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="input-field"
            min={form.training_date || undefined} />
          <p className="text-[10px] text-primary-400 mt-1">Completion date shown on certificate</p>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="label">Training Location</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          className="input-field"
          placeholder="e.g. Dubai, UAE"
        />
      </div>

      {/* Modules for FDR */}
      {form.training_type === 'FDR' && (
        <div>
          <label className="label">Training Modules</label>
          <p className="text-xs text-primary-400 mb-3">Select all modules completed during recurrent training</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_MODULES.map(mod => (
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
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${
                  form.modules.includes(mod) ? 'bg-accent-500' : 'border border-primary-300'
                }`}>
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

      {!isAdmin && (
        <div className="flex items-start gap-2 p-3 rounded-lg border" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <span className="text-sm mt-0.5" style={{ color: '#0000ff' }}>ℹ</span>
          <p className="text-xs" style={{ color: '#3b4f9e' }}>
            Once submitted, this record will be <strong>locked</strong>. Only IFOA administrators can edit or delete it.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary-200">
        <button type="button" onClick={onSuccess} className="btn-outline">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : isAdmin ? 'Add Participant' : 'Submit Enrollment'}
        </button>
      </div>
    </form>
  );
}

// ─── Simple name-only row for bulk mode ──────────────────────────────────────
function BulkRow({ row, idx, onChange, onRemove, result }) {
  const hasError   = result?.status === 'error';
  const hasSuccess = result?.status === 'success';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl border transition-colors ${
        hasError   ? 'border-red-300 bg-red-50/40' :
        hasSuccess ? 'border-emerald-300 bg-emerald-50/40' :
        'border-primary-200 bg-white'
      }`}
    >
      {/* Row number */}
      <span className="w-6 text-center text-xs font-semibold text-primary-400 flex-shrink-0">{idx + 1}</span>

      {/* First name */}
      <input
        value={row.first_name}
        onChange={e => onChange(row.id, 'first_name', e.target.value)}
        className="input-field text-sm flex-1"
        placeholder="First name"
        disabled={hasSuccess}
      />

      {/* Last name */}
      <input
        value={row.last_name}
        onChange={e => onChange(row.id, 'last_name', e.target.value)}
        className="input-field text-sm flex-1"
        placeholder="Last name"
        disabled={hasSuccess}
      />

      {/* Status / remove */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {hasSuccess && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Saved
          </span>
        )}
        {hasError && (
          <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium" title={result.error}>
            <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
            {result.error || 'Failed'}
          </span>
        )}
        {!hasSuccess && (
          <button type="button" onClick={() => onRemove(row.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-primary-300 hover:text-red-500 transition-colors">
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Bulk mode form ───────────────────────────────────────────────────────────
function BulkForm({ isAdmin, airlineName, onSuccess }) {
  const [rows, setRows]       = useState([emptyRow(), emptyRow(), emptyRow()]);
  const [company, setCompany] = useState(isAdmin ? '' : (airlineName || ''));
  const [saving, setSaving]   = useState(false);
  const [results, setResults] = useState({});
  const [done, setDone]       = useState(false);

  // ── Shared session fields (apply to ALL participants) ──
  const [shared, setShared] = useState({
    department:    '',
    training_type: '',
    training_date: '',
    end_date:      '',
    location:      '',
    modules:       [],
  });

  const setSharedField = (field, value) => setShared(prev => ({ ...prev, [field]: value }));
  const toggleModule   = (mod) =>
    setShared(prev => ({
      ...prev,
      modules: prev.modules.includes(mod)
        ? prev.modules.filter(m => m !== mod)
        : [...prev.modules, mod],
    }));

  const addRow    = () => setRows(prev => [...prev, emptyRow()]);
  const removeRow = (id) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
    setResults(prev => { const n = {...prev}; delete n[id]; return n; });
  };
  const updateRow = (id, field, value) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdmin && !company.trim()) { toast.error('Please enter the airline name'); return; }
    if (!shared.department.trim())  { toast.error('Please enter the department'); return; }
    if (!shared.training_type)      { toast.error('Please select a training type'); return; }
    if (!shared.training_date)      { toast.error('Please select a start date'); return; }

    const pending = rows.filter(r => results[r.id]?.status !== 'success');
    if (pending.length === 0) { toast.success('All participants already submitted!'); return; }

    const invalid = pending.filter(r => !r.first_name.trim() || !r.last_name.trim());
    if (invalid.length > 0) {
      toast.error(`${invalid.length} row${invalid.length > 1 ? 's are' : ' is'} missing a name`);
      setResults(prev => {
        const n = {...prev};
        invalid.forEach(r => { n[r.id] = { status: 'error', error: 'Name required' }; });
        return n;
      });
      return;
    }

    setSaving(true);
    let successCount = 0, failCount = 0;

    for (const row of pending) {
      try {
        await createParticipant({
          first_name:    row.first_name.trim(),
          last_name:     row.last_name.trim(),
          company:       isAdmin ? company.trim() : airlineName,
          department:    shared.department.trim(),
          training_type: shared.training_type,
          training_date: shared.training_date,
          end_date:      shared.end_date      || null,
          location:      shared.location      || null,
          modules:       shared.modules,
        });
        setResults(prev => ({ ...prev, [row.id]: { status: 'success' } }));
        successCount++;
      } catch (err) {
        const msg = err.response?.data?.error || 'Submission failed';
        setResults(prev => ({ ...prev, [row.id]: { status: 'error', error: msg } }));
        failCount++;
      }
    }

    setSaving(false);
    if (failCount === 0) {
      toast.success(`${successCount} participant${successCount > 1 ? 's' : ''} added successfully!`);
      setDone(true);
    } else if (successCount > 0) {
      toast.error(`${successCount} saved, ${failCount} failed. Fix errors and resubmit.`);
    } else {
      toast.error('All submissions failed. Please check the errors and try again.');
    }
  };

  const successCount = Object.values(results).filter(r => r.status === 'success').length;
  const pendingCount = rows.length - successCount;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Shared Training Details ── */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">Training Details <span className="text-primary-400 font-normal normal-case">(applies to all participants below)</span></h3>

        {/* Airline – admin only */}
        {isAdmin && (
          <div>
            <label className="label">Airline Name *</label>
            <input value={company} onChange={e => setCompany(e.target.value)}
              className="input-field max-w-sm" placeholder="e.g. Emirates Airlines" />
          </div>
        )}

        {/* Department + Training Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Department *</label>
            <input value={shared.department} onChange={e => setSharedField('department', e.target.value)}
              className="input-field" placeholder="e.g. Flight Operations" />
          </div>
          <div>
            <label className="label">Training Type *</label>
            <select value={shared.training_type} onChange={e => setSharedField('training_type', e.target.value)}
              className="input-field appearance-none cursor-pointer">
              <option value="">Select training type</option>
              {TRAINING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Start + End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date *</label>
            <input type="date" value={shared.training_date} onChange={e => setSharedField('training_date', e.target.value)}
              className="input-field" />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" value={shared.end_date} onChange={e => setSharedField('end_date', e.target.value)}
              className="input-field" min={shared.training_date || undefined} />
            <p className="text-[10px] text-primary-400 mt-1">Completion date shown on certificate</p>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="label">Training Location</label>
          <input value={shared.location} onChange={e => setSharedField('location', e.target.value)}
            className="input-field" placeholder="e.g. Dubai, UAE" />
        </div>

        {/* Modules – FDR only */}
        {shared.training_type === 'FDR' && (
          <div>
            <label className="label">Training Modules</label>
            <p className="text-xs text-primary-400 mb-2">Select all modules completed during this recurrent training</p>
            <div className="grid grid-cols-3 gap-2">
              {ALL_MODULES.map(mod => (
                <button key={mod} type="button" onClick={() => toggleModule(mod)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                    shared.modules.includes(mod)
                      ? 'border-accent-400 bg-accent-50 text-accent-700 font-medium'
                      : 'border-primary-200 text-primary-600 hover:border-primary-300'
                  }`}>
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${
                    shared.modules.includes(mod) ? 'bg-accent-500' : 'border border-primary-300'
                  }`}>
                    {shared.modules.includes(mod) && (
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
      </div>

      {/* ── Participant Names ── */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">Participants</h3>
          <span className="text-xs text-primary-400">{rows.length} name{rows.length !== 1 ? 's' : ''} added</span>
        </div>

        {/* Column header */}
        <div className="flex items-center gap-3 px-4">
          <span className="w-6" />
          <span className="flex-1 text-[10px] font-semibold text-primary-400 uppercase tracking-wider">First Name</span>
          <span className="flex-1 text-[10px] font-semibold text-primary-400 uppercase tracking-wider">Last Name</span>
          <span className="w-8" />
        </div>

        <AnimatePresence mode="popLayout">
          {rows.map((row, idx) => (
            <BulkRow key={row.id} row={row} idx={idx}
              onChange={updateRow} onRemove={removeRow} result={results[row.id]} />
          ))}
        </AnimatePresence>

        {!done && (
          <button type="button" onClick={addRow}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-primary-200 rounded-xl text-sm font-medium text-primary-400 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all">
            <HiOutlinePlusCircle className="w-4 h-4" />
            Add Row
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="flex items-start gap-2 p-3 rounded-lg border" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <span className="text-sm mt-0.5" style={{ color: '#0000ff' }}>ℹ</span>
          <p className="text-xs" style={{ color: '#3b4f9e' }}>
            Once submitted, records will be <strong>locked</strong>. Only IFOA administrators can edit or delete them.
          </p>
        </div>
      )}

      <div className="card p-4 flex items-center justify-between gap-4">
        <div className="text-sm text-primary-600">
          {successCount > 0
            ? <span className="text-emerald-600 font-medium">{successCount} submitted · {pendingCount} pending</span>
            : <span>{rows.length} participant{rows.length !== 1 ? 's' : ''} to submit</span>}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onSuccess} className="btn-outline">{done ? 'Done' : 'Cancel'}</button>
          {!done && (
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
              ) : (
                <><HiOutlineCheckCircle className="w-4 h-4" />Submit {pendingCount > 0 ? `${pendingCount} ` : ''}Enrollment{pendingCount !== 1 ? 's' : ''}</>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export default function AddParticipant() {
  const navigate = useNavigate();
  const { admin, isAdmin } = useAuth();
  const airlineName = admin?.airlineName || '';
  const [mode, setMode] = useState('single'); // 'single' | 'bulk'

  const handleSuccess = () => navigate(isAdmin ? '/admin/airlines' : '/admin/participants');

  const TABS = [
    { val: 'single', label: 'Single',   Icon: HiOutlineUser },
    { val: 'bulk',   label: 'Group Add', Icon: HiOutlineUserGroup },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-700 transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">
            {isAdmin ? 'Add Participant' : 'New Enrollment'}
          </h1>
          <p className="text-sm text-primary-400 mt-1">
            {isAdmin ? 'Create one or multiple training records' : 'Submit training enrollments for your airline'}
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-primary-100 rounded-xl self-start sm:self-auto">
          {TABS.map(({ val, label, Icon }) => (
            <button key={val} type="button" onClick={() => setMode(val)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === val ? 'bg-white text-primary-800 shadow-sm' : 'text-primary-500 hover:text-primary-700'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'single' && (
          <motion.div key="single" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <SingleForm isAdmin={isAdmin} airlineName={airlineName} onSuccess={handleSuccess} />
          </motion.div>
        )}
        {mode === 'bulk' && (
          <motion.div key="bulk" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <BulkForm isAdmin={isAdmin} airlineName={airlineName} onSuccess={handleSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
