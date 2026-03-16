import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineMail,
  HiOutlineDocumentDownload,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineX,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getParticipantsByAirline, deleteParticipant, deleteAirlineData, generateCertificateBlob, generateCertificateWithModules, updateFullCertId, getCertCounters, resetCertCounter, resetAllCertCounters } from '../api';
import ModuleSelector from '../components/ModuleSelector';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const TRAINING_LABELS = {
  FDI: 'FDI - Flight Dispatch Initial',
  FDR: 'FDR - Flight Dispatch Recurrent',
  FDA: 'FDA - Flight Dispatch Advanced',
  FTL: 'FTL - Flight Time Limitations',
  NDG: 'NDG - Dangerous Goods No-Carry',
  HF:  'HF - Human Factors for OCC',
  GD:  'GD - Ground Operations',
  TCD: 'TCD - Training Competencies Development',
};

const TRAINING_TYPES = Object.entries(TRAINING_LABELS).map(([v, l]) => ({ value: v, label: l }));

function badgeClass(type) {
  // All training type badges use the brand blue theme
  return '';
}

function badgeStyle() {
  return { background: '#eff6ff', color: '#0000ff', border: '1px solid #bfdbfe' };
}

function mkInitials(name = '') {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
}

function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// --- Template Variant Modal ---
function VariantModal({ open, variant, setVariant, onConfirm, onClose, count }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100">
            <div>
              <h2 className="text-base font-bold text-primary-800">Select Certificate Template</h2>
              <p className="text-xs text-primary-400 mt-0.5">Generating {count} certificate{count !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary-100 text-primary-400 transition-colors">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-3">
            <button
              onClick={() => setVariant('default')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                variant === 'default' ? 'border-emerald-400 bg-emerald-50' : 'border-primary-200 hover:border-primary-300 bg-white'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-emerald-700 tracking-tight">IFOA</span>
              </div>
              <div>
                <p className="text-sm font-bold text-primary-800">IFOA</p>
                <p className="text-xs text-primary-400">Standard green certificate template</p>
              </div>
              {variant === 'default' && <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500 ml-auto flex-shrink-0" />}
            </button>
            <button
              onClick={() => setVariant('india')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                variant === 'india' ? 'border-orange-400 bg-orange-50' : 'border-primary-200 hover:border-primary-300 bg-white'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 flex-col gap-0">
                <span className="text-[9px] font-bold text-orange-700 leading-tight block text-center">IFOA</span>
                <span className="text-[9px] font-bold text-orange-700 leading-tight block text-center">INDIA</span>
              </div>
              <div>
                <p className="text-sm font-bold text-primary-800">IFOA INDIA</p>
                <p className="text-xs text-primary-400">Orange variant for India region</p>
              </div>
              {variant === 'india' && <HiOutlineCheckCircle className="w-5 h-5 text-orange-500 ml-auto flex-shrink-0" />}
            </button>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button onClick={onConfirm} className="btn-primary flex-1">Generate</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Certificate Result Modal ---
function CertResultModal({ results, onClose }) {
  if (!results || results.length === 0) return null;
  const handleDownload = (item) => {
    const link = document.createElement('a');
    link.href = item.blobUrl;
    link.download = item.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handlePreview = (item) => { window.open(item.blobUrl, '_blank'); };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-primary-800">Certificates Generated</h2>
                <p className="text-xs text-primary-400">{results.length} certificate{results.length !== 1 ? 's' : ''} ready</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary-100 text-primary-400 hover:text-primary-600 transition-colors">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
          <div className="divide-y divide-primary-100 max-h-[60vh] overflow-y-auto">
            {results.map(item => (
              <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary-800 truncate">{item.name}</p>
                  <p className="text-[11px] text-primary-400 mt-0.5">{item.trainingType} &bull; {item.certId}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handlePreview(item)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 text-xs font-medium text-primary-600 transition-colors">
                    <HiOutlineEye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button onClick={() => handleDownload(item)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-800 text-xs font-medium text-white transition-colors">
                    <HiOutlineDocumentDownload className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-primary-50/50 border-t border-primary-100 flex justify-end">
            <button onClick={onClose} className="btn-primary text-sm">Done</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Counter Reset Modal ---
function CounterResetModal({ open, onClose, counters, ALL_TYPES, resetting, onReset, onResetAll }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100">
            <div>
              <h2 className="text-base font-bold text-primary-800">Reset Certificate Counters</h2>
              <p className="text-xs text-primary-400 mt-0.5">Reset to 0 wipes all cert numbers — admin must regenerate</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary-100 text-primary-400">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Warning banner */}
          <div className="mx-6 mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-xs text-red-700">
              <strong>Reset to 0</strong> clears ALL certificate numbers for that type.
              Existing certificates become invalid and admin must regenerate every participant&apos;s certificate.
            </p>
          </div>

          <div className="p-6 space-y-2">
            {ALL_TYPES.map(type => {
              const counter = counters.find(c => c.training_type === type);
              const current = counter?.seq ?? 0;
              return (
                <div key={type} className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary-50 border border-primary-100">
                  <div>
                    <span className="text-sm font-bold text-primary-800">{type}</span>
                    <span className="ml-2 text-xs text-primary-400">Current: {String(current).padStart(5, '0')}</span>
                  </div>
                  <button
                    onClick={() => onReset(type)}
                    disabled={resetting === type || resetting === 'ALL'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {resetting === type
                      ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                      : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    }
                    Reset to 0
                  </button>
                </div>
              );
            })}
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose} className="btn-outline flex-1">Close</button>
            <button
              onClick={onResetAll}
              disabled={resetting === 'ALL'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {resetting === 'ALL' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Reset All to 0
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Main Component ---
export default function Airlines() {
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('');
  const [expanded, setExpanded]     = useState({});
  const [checked, setChecked]       = useState(new Set());
  const [generating, setGenerating] = useState(false);
  const [certResults, setCertResults] = useState(null);
  const [rowPreview, setRowPreview]   = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [variantModal, setVariantModal]       = useState(false);
  const [templateVariant, setTemplateVariant] = useState('default');
  const pendingGenerate = useRef(null);

  const [moduleModal, setModuleModal] = useState({ open: false, record: null });
  const pendingFdrRecord = useRef(null);

  const [certEdits, setCertEdits] = useState({});

  const [counterModal, setCounterModal] = useState(false);
  const [counters, setCounters]         = useState([]);
  const [resetting, setResetting]       = useState(null);

  const ALL_TYPES = ['FDI', 'FDR', 'FDA', 'FTL', 'HF', 'NDG', 'GD', 'TCD'];

  const openCounterModal = async () => {
    try { const res = await getCertCounters(); setCounters(res.data); } catch { setCounters([]); }
    setCounterModal(true);
  };

  const handleResetCounter = async (type) => {
    if (!window.confirm(
      `Reset "${type}" counter to 0?\n\nThis will:\n• Clear ALL certificate numbers for ${type} participants\n• Existing certificates become invalid\n• Admin must regenerate every ${type} certificate\n\nNext certificate will start from 00001.`
    )) return;
    setResetting(type);
    try {
      await resetCertCounter(type, 0);   // pass 0 — full reset
      toast.success(`${type} reset to 0. All ${type} certificates must be regenerated.`, { duration: 5000 });
      const res = await getCertCounters(); setCounters(res.data);
    } catch { toast.error('Failed to reset'); }
    setResetting(null);
  };

  const handleResetAll = async () => {
    if (!window.confirm(
      'Reset ALL counters to 0?\n\nThis will:\n• Clear certificate numbers for EVERY participant\n• All existing certificates become invalid\n• Admin must regenerate ALL certificates\n\nThis cannot be undone.'
    )) return;
    setResetting('ALL');
    try {
      await resetAllCertCounters(0);     // pass 0 — full reset
      toast.success('All counters reset to 0. All certificates must be regenerated.', { duration: 5000 });
      const res = await getCertCounters(); setCounters(res.data);
    } catch { toast.error('Failed to reset'); }
    setResetting(null);
  };

  const startCertEdit = (pid, p) => {
    const dateStr = p.end_date || p.training_date || '';
    const currentYear = p.cert_year_override ||
      (dateStr ? new Date(dateStr.slice(0, 10)).getFullYear() : new Date().getFullYear());
    setCertEdits(prev => ({ ...prev, [pid]: { editing: true, seq: String(p.cert_sequence || ''), year: String(currentYear), saving: false, error: null } }));
  };

  const cancelCertEdit = (pid) =>
    setCertEdits(prev => { const n = { ...prev }; delete n[pid]; return n; });

  const saveCertEdit = async (pid) => {
    const edit = certEdits[pid];
    if (!edit) return;
    const seq  = Number(edit.seq);
    const year = Number(edit.year);
    if (!seq || seq <= 0)                    { setCertEdits(p => ({ ...p, [pid]: { ...p[pid], error: 'Invalid sequence number' } })); return; }
    if (!year || year < 2000 || year > 2100) { setCertEdits(p => ({ ...p, [pid]: { ...p[pid], error: 'Invalid year (2000-2100)' } })); return; }
    setCertEdits(prev => ({ ...prev, [pid]: { ...prev[pid], saving: true, error: null } }));
    try {
      await updateFullCertId(pid, seq, year);
      toast.success('Certificate ID updated');
      setCertEdits(prev => { const n = { ...prev }; delete n[pid]; return n; });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update';
      setCertEdits(prev => ({ ...prev, [pid]: { ...prev[pid], saving: false, error: msg } }));
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getParticipantsByAirline();
      setData(res.data);
      const init = {};
      res.data.forEach(({ airline }) => { init[airline.airlineName] = false; });
      setExpanded(init);
    } catch { toast.error('Failed to load airline data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete record for "${name}"?`)) return;
    try {
      await deleteParticipant(id);
      toast.success('Record deleted');
      setChecked(prev => { const n = new Set(prev); n.delete(id); return n; });
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const toggle = (airlineName) => setExpanded(prev => ({ ...prev, [airlineName]: !prev[airlineName] }));

  const toggleOne = (id) => {
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleGroupAll = (participants) => {
    const ids = participants.map(p => p.id || p._id);
    const allChecked = ids.every(id => checked.has(id));
    setChecked(prev => {
      const n = new Set(prev);
      if (allChecked) ids.forEach(id => n.delete(id));
      else ids.forEach(id => n.add(id));
      return n;
    });
  };

  const allParticipants = data.flatMap(({ participants }) => participants);
  const allIds = allParticipants.map(p => p.id || p._id);
  const allChecked = allIds.length > 0 && allIds.every(id => checked.has(id));
  const toggleSelectAll = () => { if (allChecked) setChecked(new Set()); else setChecked(new Set(allIds)); };

  const generateOneWithVariant = async (p, modulesOverride, variant) => {
    const pid = p.id || p._id;
    try {
      let res;
      if (modulesOverride) {
        res = await generateCertificateWithModules(pid, modulesOverride, variant);
      } else {
        res = await generateCertificateBlob(pid, variant);
      }
      const blob     = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl  = window.URL.createObjectURL(blob);
      const name     = (p.participant_name || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Certificate_${name}.pdf`;
      const certId   = p.cert_sequence ? `${p.training_type}-${String(p.cert_sequence).padStart(5, '0')}` : 'Assigned';
      return { id: pid, name: p.participant_name, trainingType: p.training_type, certId, blobUrl, filename };
    } catch {
      toast.error(`Failed to generate certificate for ${p.participant_name}`);
      return null;
    }
  };

  const runBulkGenerate = async (toGenerate, modulesMap, variant = 'default') => {
    setGenerating(true);
    const results = [];
    for (const p of toGenerate) {
      const pid = p.id || p._id;
      const result = await generateOneWithVariant(p, modulesMap[pid] || null, variant);
      if (result) results.push(result);
    }
    setGenerating(false);
    setChecked(new Set());
    fetchData();
    if (results.length > 0) setCertResults(results);
  };

  const handleGenerateSelected = async () => {
    if (checked.size === 0) { toast.error('Please select at least one participant'); return; }
    const toGenerate = allParticipants.filter(p => checked.has(p.id || p._id));
    const fdrNeedsModules = toGenerate.find(p => p.training_type === 'FDR' && !p.modules);
    if (fdrNeedsModules) {
      pendingFdrRecord.current = { record: fdrNeedsModules, rest: toGenerate.filter(p => (p.id || p._id) !== (fdrNeedsModules.id || fdrNeedsModules._id)) };
      setModuleModal({ open: true, record: fdrNeedsModules });
      return;
    }
    pendingGenerate.current = { toGenerate, modulesMap: {} };
    setVariantModal(true);
  };

  const handleModuleConfirm = (modules) => {
    const pending = pendingFdrRecord.current;
    pendingFdrRecord.current = null;
    setModuleModal({ open: false, record: null });
    if (!pending) return;
    const modulesMap = { [pending.record.id || pending.record._id]: modules };
    const allRecords = [pending.record, ...(pending.rest || [])];
    pendingGenerate.current = { toGenerate: allRecords, modulesMap };
    setVariantModal(true);
  };

  const handleVariantConfirm = async () => {
    setVariantModal(false);
    const { toGenerate, modulesMap } = pendingGenerate.current || {};
    pendingGenerate.current = null;
    if (!toGenerate) return;
    await runBulkGenerate(toGenerate, modulesMap, templateVariant);
  };

  const closeResults = () => {
    if (certResults) certResults.forEach(r => window.URL.revokeObjectURL(r.blobUrl));
    setCertResults(null);
  };

  const handleDownloadIssued = async (p) => {
    const pid = p.id || p._id;
    try {
      setDownloadingId(pid);
      const res  = await generateCertificateBlob(pid);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${(p.participant_name || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded');
    } catch { toast.error('Failed to download certificate'); }
    finally { setDownloadingId(null); }
  };

  const [checkedAirlines, setCheckedAirlines] = useState(new Set());

  const toggleAirline = (airlineName) => {
    setCheckedAirlines(prev => {
      const n = new Set(prev);
      n.has(airlineName) ? n.delete(airlineName) : n.add(airlineName);
      return n;
    });
  };

  const allAirlinesChecked = data.length > 0 && data.every(({ airline }) => checkedAirlines.has(airline.airlineName));
  const toggleAllAirlines = () => {
    if (allAirlinesChecked) setCheckedAirlines(new Set());
    else setCheckedAirlines(new Set(data.map(({ airline }) => airline.airlineName)));
  };

  const [deletingAirlines, setDeletingAirlines] = useState(false);

  const handleDeleteSelectedAirlines = async () => {
    if (checkedAirlines.size === 0) { toast.error('Select at least one airline'); return; }
    if (!window.confirm(`Delete ALL data for ${checkedAirlines.size} selected airline${checkedAirlines.size > 1 ? 's' : ''}?\n\nThis will remove all participant records. This cannot be undone.`)) return;
    setDeletingAirlines(true);
    const deleted = new Set();
    let fail = 0;
    for (const name of checkedAirlines) {
      try { await deleteAirlineData(name); deleted.add(name); } catch { fail++; }
    }
    setDeletingAirlines(false);
    // Remove deleted airlines from local state immediately — no re-fetch flicker
    setData(prev => prev.filter(d => !deleted.has(d.airline.airlineName)));
    setCheckedAirlines(new Set());
    setChecked(prev => {
      const n = new Set(prev);
      data.forEach(({ airline, participants }) => {
        if (deleted.has(airline.airlineName)) participants.forEach(p => n.delete(p.id || p._id));
      });
      return n;
    });
    if (fail === 0) toast.success(`${deleted.size} airline${deleted.size > 1 ? 's' : ''} deleted`);
    else toast.error(`${deleted.size} deleted, ${fail} failed`);
  };

  const [deletingSelected, setDeletingSelected] = useState(false);
  const handleDeleteSelected = async () => {
    if (checked.size === 0) { toast.error('Please select at least one participant'); return; }
    if (!window.confirm(`Delete ${checked.size} selected participant record(s)?\n\nThis action cannot be undone.`)) return;
    setDeletingSelected(true);
    let ok = 0, fail = 0;
    for (const id of checked) { try { await deleteParticipant(id); ok++; } catch { fail++; } }
    setDeletingSelected(false);
    setChecked(new Set());
    fetchData();
    if (fail === 0) toast.success(`${ok} record${ok !== 1 ? 's' : ''} deleted`);
    else toast.error(`${ok} deleted, ${fail} failed`);
  };

  const handleDeleteAirlineData = async (airlineName, participantCount) => {
    if (!window.confirm(`Delete ALL data for "${airlineName}"?\n\nThis will remove all ${participantCount} participant record(s). This cannot be undone.`)) return;
    try {
      const res = await deleteAirlineData(airlineName);
      toast.success(res.data.message || `"${airlineName}" deleted`);
      // Remove from local state immediately — no flicker
      setData(prev => prev.filter(d => d.airline.airlineName !== airlineName));
      setChecked(prev => {
        const n = new Set(prev);
        data.find(d => d.airline.airlineName === airlineName)?.participants.forEach(p => n.delete(p.id || p._id));
        return n;
      });
      setCheckedAirlines(prev => { const n = new Set(prev); n.delete(airlineName); return n; });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete airline'); }
  };

  const filtered = data.map(({ airline, participants }) => ({
    airline,
    participants: participants.filter(p => {
      const nameMatch = !search ||
        (p.participant_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.last_name  || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.department || '').toLowerCase().includes(search.toLowerCase());
      const typeMatch = !filterType || p.training_type === filterType;
      return nameMatch && typeMatch;
    }),
  // Always hide airlines with 0 participants (catches post-delete state instantly)
  })).filter(({ participants }) => participants.length > 0);

  const totalParticipants = allParticipants.length;
  const totalAirlines     = data.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      <ModuleSelector
        isOpen={moduleModal.open}
        onClose={() => { setModuleModal({ open: false, record: null }); pendingFdrRecord.current = null; }}
        onConfirm={handleModuleConfirm}
        initialModules={moduleModal.record?.modules ? moduleModal.record.modules.split(',').map(m => m.trim()) : []}
      />

      <VariantModal
        open={variantModal}
        variant={templateVariant}
        setVariant={setTemplateVariant}
        onConfirm={handleVariantConfirm}
        onClose={() => { setVariantModal(false); pendingGenerate.current = null; }}
        count={pendingGenerate.current?.toGenerate?.length || checked.size}
      />

      <CertResultModal results={certResults} onClose={closeResults} />

      <CounterResetModal
        open={counterModal}
        onClose={() => setCounterModal(false)}
        counters={counters}
        ALL_TYPES={ALL_TYPES}
        resetting={resetting}
        onReset={handleResetCounter}
        onResetAll={handleResetAll}
      />

      {/* Per-row preview modal */}
      <AnimatePresence>
        {rowPreview && (() => {
          const token = localStorage.getItem('token') || '';
          const pid   = rowPreview.id || rowPreview._id;
          const src   = `${API_BASE}/certificates/preview/${pid}?token=${encodeURIComponent(token)}`;
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setRowPreview(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
                  <div>
                    <p className="text-base font-bold text-primary-800">Certificate - {rowPreview.participant_name}</p>
                    <p className="text-xs text-primary-400 mt-0.5">{TRAINING_LABELS[rowPreview.training_type] || rowPreview.training_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadIssued(rowPreview)}
                      disabled={downloadingId === pid}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary-800 text-white text-xs font-semibold rounded-lg hover:bg-primary-900 transition-colors disabled:opacity-60"
                    >
                      {downloadingId === pid
                        ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <HiOutlineDocumentDownload className="w-4 h-4" />}
                      {downloadingId === pid ? 'Downloading...' : 'Download PDF'}
                    </button>
                    <button onClick={() => setRowPreview(null)} className="p-2 rounded-lg hover:bg-primary-100 text-primary-400 hover:text-primary-600 transition-colors">
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="bg-primary-50 relative" style={{ height: '70vh' }}>
                  <iframe src={src} title="Certificate Preview" className="w-full h-full border-0" />
                  <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[10px] text-primary-400">
                    If blank, click Download PDF
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Airlines &amp; Submissions</h1>
          <p className="text-sm text-primary-400 mt-1">View all airline submissions, generate and preview certificates</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-primary-400 uppercase tracking-wider">Airlines</p>
            <p className="text-xl font-bold text-primary-800">{totalAirlines}</p>
          </div>
          <div className="w-px h-8 bg-primary-200" />
          <div className="text-right">
            <p className="text-xs text-primary-400 uppercase tracking-wider">Participants</p>
            <p className="text-xl font-bold text-primary-800">{totalParticipants}</p>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <div className="card p-3 sm:p-4 space-y-3">
        {/* Row 1: Select all + count */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={toggleSelectAll}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                allChecked ? 'bg-primary-800 border-primary-800' : 'border-primary-300 hover:border-primary-500'
              }`}
            >
              {allChecked && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {!allChecked && checked.size > 0 && <div className="w-2 h-0.5 bg-primary-500 rounded" />}
            </div>
            <span className="text-sm font-medium text-primary-700">{allChecked ? 'Deselect All' : 'Select All'}</span>
          </label>
          {checked.size > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
              <HiOutlineCheckCircle className="w-3.5 h-3.5" />
              {checked.size} selected
            </span>
          )}
        </div>

        {/* Row 2: Action buttons — wrap on mobile */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDeleteSelected}
            disabled={checked.size === 0 || deletingSelected}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
              checked.size > 0 && !deletingSelected
                ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300'
                : 'border-primary-200 bg-primary-50 text-primary-300 cursor-not-allowed'
            }`}
          >
            {deletingSelected ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <HiOutlineTrash className="w-3.5 h-3.5" />}
            {deletingSelected ? 'Deleting...' : checked.size > 0 ? `Delete ${checked.size}` : 'Delete Selected'}
          </button>

          <button
            onClick={handleGenerateSelected}
            disabled={checked.size === 0 || generating}
            className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              checked.size > 0 && !generating
                ? 'bg-primary-800 text-white hover:bg-primary-900 shadow-md hover:shadow-lg'
                : 'bg-primary-100 text-primary-400 cursor-not-allowed'
            }`}
          >
            {generating ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineDocumentDownload className="w-3.5 h-3.5" />}
            {generating ? 'Generating...' : checked.size > 0 ? `Generate ${checked.size} Cert${checked.size > 1 ? 's' : ''}` : 'Generate Selected'}
          </button>

          <button
            onClick={openCounterModal}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            title="Reset certificate sequence counters"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset Counters</span>
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input type="text" placeholder="Search participants by name or department..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="relative">
            <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field pl-10 pr-8 appearance-none cursor-pointer min-w-[220px]">
              <option value="">All Training Types</option>
              {TRAINING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Airline-level select + delete bar */}
      {!loading && data.length > 0 && (
        <div className="card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={toggleAllAirlines}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                allAirlinesChecked ? 'bg-red-600 border-red-600' : 'border-primary-300 hover:border-red-400'
              }`}
            >
              {allAirlinesChecked && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {!allAirlinesChecked && checkedAirlines.size > 0 && <div className="w-2 h-0.5 bg-red-400 rounded" />}
            </div>
            <span className="text-sm font-medium text-primary-700">
              {allAirlinesChecked ? 'Deselect All Airlines' : 'Select All Airlines'}
            </span>
          </label>
          <div className="flex items-center gap-3">
            {checkedAirlines.size > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                <HiOutlineOfficeBuilding className="w-3.5 h-3.5" />
                {checkedAirlines.size} airline{checkedAirlines.size > 1 ? 's' : ''} selected
              </span>
            )}
            <button
              onClick={handleDeleteSelectedAirlines}
              disabled={checkedAirlines.size === 0 || deletingAirlines}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                checkedAirlines.size > 0 && !deletingAirlines
                  ? 'border-red-300 bg-red-600 text-white hover:bg-red-700 shadow-sm'
                  : 'border-primary-200 bg-primary-50 text-primary-300 cursor-not-allowed'
              }`}
            >
              {deletingAirlines
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <HiOutlineTrash className="w-4 h-4" />}
              {deletingAirlines ? 'Deleting...' : checkedAirlines.size > 0 ? `Delete ${checkedAirlines.size} Airline${checkedAirlines.size > 1 ? 's' : ''}` : 'Delete Selected Airlines'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card p-10 text-center text-sm text-primary-400">No airline submissions found.</div>
      )}

      {/* Airline Groups */}
      {!loading && filtered.map(({ airline, participants }) => {
        const groupIds   = participants.map(p => p.id || p._id);
        const groupAllCk = groupIds.length > 0 && groupIds.every(id => checked.has(id));
        const groupSome  = groupIds.some(id => checked.has(id));

        return (
          <div key={airline.airlineName} className="card overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 flex-wrap gap-2">
              {/* Per-airline checkbox */}
              <div
                onClick={e => { e.stopPropagation(); toggleAirline(airline.airlineName); }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors ${
                  checkedAirlines.has(airline.airlineName) ? 'bg-red-600 border-red-600' : 'border-primary-300 hover:border-red-400'
                }`}
              >
                {checkedAirlines.has(airline.airlineName) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <button onClick={() => toggle(airline.airlineName)} className="flex items-center gap-4 flex-1 text-left min-w-0">
                <div className="w-11 h-11 rounded-xl bg-primary-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{mkInitials(airline.airlineName)}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-base font-bold text-primary-800">{airline.airlineName}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-100 text-primary-600 uppercase tracking-wider">
                      <HiOutlineUsers className="w-3 h-3" />
                      {participants.length} participant{participants.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {airline.email && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <HiOutlineMail className="w-3 h-3 text-primary-400" />
                      <p className="text-xs text-primary-400">{airline.email}</p>
                    </div>
                  )}
                </div>
              </button>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                {expanded[airline.airlineName] && participants.length > 0 && (
                  <>
                    <button
                      onClick={handleDeleteSelected}
                      disabled={!groupSome || deletingSelected}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        groupSome && !deletingSelected
                          ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300'
                          : 'border-primary-200 text-primary-300 bg-primary-50 cursor-not-allowed'
                      }`}
                    >
                      {deletingSelected ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <HiOutlineTrash className="w-3.5 h-3.5" />}
                      Delete Selected
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        onClick={() => toggleGroupAll(participants)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                          groupAllCk ? 'bg-primary-800 border-primary-800' : groupSome ? 'border-primary-400 bg-primary-50' : 'border-primary-300 hover:border-primary-500'
                        }`}
                      >
                        {groupAllCk && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        {!groupAllCk && groupSome && <div className="w-2 h-0.5 bg-primary-500 rounded" />}
                      </div>
                      <span className="text-xs font-medium text-primary-600">{groupAllCk ? 'Deselect all' : 'Select all'}</span>
                    </label>
                  </>
                )}
                {/* Delete entire airline button */}
                <button
                  onClick={() => handleDeleteAirlineData(airline.airlineName, participants.length)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors border-red-300 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400"
                  title={`Delete all data for ${airline.airlineName}`}
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                  Delete Airline
                </button>
                <button onClick={() => toggle(airline.airlineName)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  {expanded[airline.airlineName] ? <HiOutlineChevronUp className="w-5 h-5 text-primary-400" /> : <HiOutlineChevronDown className="w-5 h-5 text-primary-400" />}
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expanded[airline.airlineName] && participants.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-primary-100 overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className="bg-primary-50/60">
                          <th className="w-10 px-3 py-2.5" />
                          <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">Participant</th>
                          <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">Dept</th>
                          <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">Training</th>
                          <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">Start</th>
                          <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">End</th>
                          <th className="text-right text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map(p => {
                          const pid      = p.id || p._id;
                          const fullName = p.participant_name || `${p.first_name || ''} ${p.last_name || ''}`.trim();
                          const isCk     = checked.has(pid);
                          const edit     = certEdits[pid];

                          const displayYear = p.cert_year_override ||
                            (() => { const d = p.end_date || p.training_date || ''; return d ? new Date(d.slice(0, 10)).getFullYear() : ''; })();

                          return (
                            <tr key={pid} className={`border-t border-primary-100 transition-colors ${isCk ? 'bg-accent-50/40' : 'hover:bg-primary-50/40'}`}>
                              <td className="px-4 py-3 w-10">
                                <div
                                  onClick={() => toggleOne(pid)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${isCk ? 'bg-primary-800 border-primary-800' : 'border-primary-300 hover:border-primary-600'}`}
                                >
                                  {isCk && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                              </td>

                              <td className="px-3 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-bold text-primary-600">{mkInitials(fullName)}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-primary-800">{fullName}</p>

                                    {p.cert_sequence && (
                                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border mt-0.5 ${
                                        p.templateVariant === 'india'
                                          ? 'text-orange-600 bg-orange-50 border-orange-200'
                                          : 'text-emerald-600 bg-emerald-50 border-emerald-200'
                                      }`}>
                                        {p.templateVariant === 'india' ? 'IFOA INDIA' : 'IFOA'}
                                      </span>
                                    )}

                                    {p.cert_sequence && (
                                      edit?.editing ? (
                                        <div className="mt-0.5 space-y-1">
                                          <div className="flex items-center gap-1 flex-wrap">
                                            <span className="text-[10px] text-primary-400">{p.training_type}-</span>
                                            <input
                                              type="number" min="1"
                                              value={edit.seq}
                                              onChange={e => setCertEdits(prev => ({ ...prev, [pid]: { ...prev[pid], seq: e.target.value, error: null } }))}
                                              onKeyDown={e => { if (e.key === 'Enter') saveCertEdit(pid); if (e.key === 'Escape') cancelCertEdit(pid); }}
                                              className="w-16 px-1.5 py-0.5 text-[11px] border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-accent-400"
                                              disabled={edit.saving}
                                              placeholder="00001"
                                              autoFocus
                                            />
                                            <span className="text-[10px] text-primary-400">-</span>
                                            <input
                                              type="number" min="2000" max="2100"
                                              value={edit.year}
                                              onChange={e => setCertEdits(prev => ({ ...prev, [pid]: { ...prev[pid], year: e.target.value, error: null } }))}
                                              onKeyDown={e => { if (e.key === 'Enter') saveCertEdit(pid); if (e.key === 'Escape') cancelCertEdit(pid); }}
                                              className="w-14 px-1.5 py-0.5 text-[11px] border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-accent-400"
                                              disabled={edit.saving}
                                              placeholder="2026"
                                            />
                                            <button onClick={() => saveCertEdit(pid)} disabled={edit.saving} className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 disabled:opacity-60">
                                              {edit.saving ? '...' : 'save'}
                                            </button>
                                            <button onClick={() => cancelCertEdit(pid)} className="text-[10px] px-1.5 py-0.5 bg-primary-100 text-primary-500 rounded hover:bg-primary-200">
                                              cancel
                                            </button>
                                          </div>
                                          {edit.error && <p className="text-[10px] text-red-500 font-medium">! {edit.error}</p>}
                                        </div>
                                      ) : (
                                        <button onClick={() => startCertEdit(pid, p)} title="Click to edit full certificate ID" className="flex items-center gap-1 mt-0.5 group">
                                          <span className="text-[10px] font-mono text-primary-700 bg-primary-50 border border-primary-200 px-1.5 py-0.5 rounded group-hover:bg-primary-100 transition-colors">
                                            {p.training_type}-{String(p.cert_sequence).padStart(5, '0')}-{displayYear}
                                          </span>
                                          <HiOutlinePencil className="w-2.5 h-2.5 text-primary-300 group-hover:text-primary-500 transition-colors" />
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-3 py-3 text-sm text-primary-600">{p.department}</td>

                              <td className="px-3 py-3">
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={badgeStyle()}
                                >
                                  {p.training_type}
                                </span>
                                <p className="text-[10px] mt-0.5 max-w-[150px] leading-tight" style={{ color: '#3b4f9e' }}>
                                  {TRAINING_LABELS[p.training_type] || p.training_type}
                                </p>
                              </td>

                              <td className="px-3 py-3 text-sm text-primary-500">{fmtDate(p.training_date)}</td>
                              <td className="px-3 py-3 text-sm text-primary-500">{fmtDate(p.end_date)}</td>

                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  {p.cert_sequence ? (
                                    <>
                                      <button onClick={() => setRowPreview(p)} title="Preview"
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors"
                                        style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#0000ff' }}
                                        onMouseEnter={e => e.currentTarget.style.background='#dbeafe'}
                                        onMouseLeave={e => e.currentTarget.style.background='#eff6ff'}
                                      >
                                        <HiOutlineEye className="w-3.5 h-3.5" /> Preview
                                      </button>
                                      <button onClick={() => handleDownloadIssued(p)} disabled={downloadingId === pid} title="Download" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-60 transition-colors">
                                        {downloadingId === pid ? <div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" /> : <HiOutlineDocumentDownload className="w-3.5 h-3.5" />}
                                        PDF
                                      </button>
                                    </>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                                      Pending
                                    </span>
                                  )}
                                  <Link to={`/admin/participants/edit/${pid}`} title="Edit" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary-200 text-xs font-medium text-primary-600 hover:bg-primary-100 transition-colors">
                                    <HiOutlinePencil className="w-3.5 h-3.5" /> Edit
                                  </Link>
                                  <button onClick={() => handleDelete(pid, fullName)} title="Delete" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
                                    <HiOutlineTrash className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {expanded[airline.airlineName] && participants.length === 0 && (
              <div className="border-t border-primary-100 px-6 py-6 text-center text-sm text-primary-400">
                No participants submitted by this airline yet.
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
