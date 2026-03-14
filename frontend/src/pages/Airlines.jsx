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
import { getParticipantsByAirline, deleteParticipant, deleteAirlineData, generateCertificateBlob, generateCertificateWithModules } from '../api';
import ModuleSelector from '../components/ModuleSelector';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─────────────────────────────────────────────────────────────────────────────

const TRAINING_LABELS = {
  FDI: 'FDI – Flight Dispatch Initial',
  FDR: 'FDR – Flight Dispatch Recurrent',
  FDA: 'FDA – Flight Dispatch Advanced',
  FTL: 'FTL – Flight Time Limitations',
  NDG: 'NDG – Dangerous Goods No-Carry',
  HF:  'HF – Human Factors for OCC',
  GD:  'GD – Ground Operations',
  TCD: 'TCD – Training Competencies Development',
};

const TRAINING_TYPES = Object.entries(TRAINING_LABELS).map(([v, l]) => ({ value: v, label: l }));

function badgeClass(type) {
  if (['FDI', 'FDA'].includes(type)) return 'bg-emerald-100 text-emerald-700';
  if (['FDR', 'FTL'].includes(type)) return 'bg-violet-100 text-violet-700';
  if (type === 'HF')  return 'bg-amber-100 text-amber-700';
  if (type === 'NDG') return 'bg-red-100 text-red-700';
  return 'bg-blue-100 text-blue-700';
}

function mkInitials(name = '') {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Certificate Result Modal (shown after generate) ─────────────────────────
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

  const handlePreview = (item) => {
    window.open(item.blobUrl, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
          {/* Header */}
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

          {/* List */}
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
                  <button
                    onClick={() => handlePreview(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 text-xs font-medium text-primary-600 transition-colors"
                  >
                    <HiOutlineEye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownload(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-800 text-xs font-medium text-white transition-colors"
                  >
                    <HiOutlineDocumentDownload className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-primary-50/50 border-t border-primary-100 flex justify-end">
            <button onClick={onClose} className="btn-primary text-sm">Done</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Airlines() {
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('');
  const [expanded, setExpanded]     = useState({});

  // checked = Set of participant IDs
  const [checked, setChecked]       = useState(new Set());
  const [generating, setGenerating] = useState(false);

  // Generated certificate results (bulk)
  const [certResults, setCertResults] = useState(null);

  // Per-row preview (only for already-issued certs)
  const [rowPreview, setRowPreview]     = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Module selector for FDR participants
  const [moduleModal, setModuleModal] = useState({ open: false, record: null });
  const pendingFdrRecord = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getParticipantsByAirline();
      setData(res.data);
      const init = {};
      res.data.forEach(({ airline }) => { init[airline.airlineName] = true; });
      setExpanded(init);
    } catch {
      toast.error('Failed to load airline data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete record for "${name}"?`)) return;
    try {
      await deleteParticipant(id);
      toast.success('Record deleted');
      setChecked(prev => { const n = new Set(prev); n.delete(id); return n; });
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggle = (airlineName) =>
    setExpanded(prev => ({ ...prev, [airlineName]: !prev[airlineName] }));

  // ── Checkbox helpers ─────────────────────────────────────────────────────────
  const toggleOne = (id) => {
    setChecked(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
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

  const toggleSelectAll = () => {
    if (allChecked) setChecked(new Set());
    else setChecked(new Set(allIds));
  };

  // ── Core: generate one cert, return result item (no auto-download) ────────────
  const generateOne = async (p, modulesOverride) => {
    const pid = p.id || p._id;
    try {
      let res;
      if (modulesOverride) {
        res = await generateCertificateWithModules(pid, modulesOverride);
      } else {
        res = await generateCertificateBlob(pid);
      }
      const blob    = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      const suffix  = modulesOverride ? '_Recurrent' : '';
      const name    = (p.participant_name || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Certificate_${name}${suffix}.pdf`;
      const certId = p.cert_sequence
        ? `${p.training_type}-${String(p.cert_sequence).padStart(5, '0')}`
        : 'Assigned';
      return { id: pid, name: p.participant_name, trainingType: p.training_type, certId, blobUrl, filename };
    } catch {
      toast.error(`Failed to generate certificate for ${p.participant_name}`);
      return null;
    }
  };

  const runBulkGenerate = async (toGenerate, modulesMap) => {
    setGenerating(true);
    const results = [];
    for (const p of toGenerate) {
      const pid = p.id || p._id;
      const result = await generateOne(p, modulesMap[pid] || null);
      if (result) results.push(result);
    }
    setGenerating(false);
    setChecked(new Set());
    fetchData();
    if (results.length > 0) setCertResults(results);
  };

  // ── Bulk generate selected ────────────────────────────────────────────────────
  const handleGenerateSelected = async () => {
    if (checked.size === 0) { toast.error('Please select at least one participant'); return; }
    const toGenerate = allParticipants.filter(p => checked.has(p.id || p._id));

    // If any FDR has no modules saved, prompt for modules first
    const fdrNeedsModules = toGenerate.find(p => p.training_type === 'FDR' && !p.modules);
    if (fdrNeedsModules) {
      pendingFdrRecord.current = { record: fdrNeedsModules, rest: toGenerate.filter(p => (p.id || p._id) !== (fdrNeedsModules.id || fdrNeedsModules._id)) };
      setModuleModal({ open: true, record: fdrNeedsModules });
      return;
    }

    await runBulkGenerate(toGenerate, {});
  };

  const handleModuleConfirm = async (modules) => {
    const pending = pendingFdrRecord.current;
    pendingFdrRecord.current = null;
    setModuleModal({ open: false, record: null });
    if (!pending) return;
    const modulesMap = { [pending.record.id || pending.record._id]: modules };
    const allRecords = [pending.record, ...(pending.rest || [])];
    await runBulkGenerate(allRecords, modulesMap);
  };

  const closeResults = () => {
    if (certResults) certResults.forEach(r => window.URL.revokeObjectURL(r.blobUrl));
    setCertResults(null);
  };

  // ── Per-row download for already-issued certificates ───────────────────────────
  const handleDownloadIssued = async (p) => {
    const pid = p.id || p._id;
    try {
      setDownloadingId(pid);
      const res = await generateCertificateBlob(pid);
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
    } catch {
      toast.error('Failed to download certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Delete ALL data for an airline ─────────────────────────────────────────────
  const handleDeleteAirlineData = async (airlineName, participantCount) => {
    if (!window.confirm(
      `⚠️ Delete ALL ${participantCount} participant record(s) for "${airlineName}"?\n\nThis action cannot be undone.`
    )) return;
    try {
      const res = await deleteAirlineData(airlineName);
      toast.success(res.data.message || `All data for "${airlineName}" deleted`);
      setChecked(prev => {
        const n = new Set(prev);
        data.find(d => d.airline.airlineName === airlineName)
          ?.participants.forEach(p => n.delete(p.id || p._id));
        return n;
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete airline data');
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────────
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
  })).filter(({ participants }) => participants.length > 0 || (!search && !filterType));

  const totalParticipants = allParticipants.length;
  const totalAirlines = data.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Module selector (FDR only) */}
      <ModuleSelector
        isOpen={moduleModal.open}
        onClose={() => { setModuleModal({ open: false, record: null }); pendingFdrRecord.current = null; }}
        onConfirm={handleModuleConfirm}
        initialModules={
          moduleModal.record?.modules
            ? moduleModal.record.modules.split(',').map(m => m.trim())
            : []
        }
      />

      {/* Certificate result modal (bulk generate) */}
      <CertResultModal results={certResults} onClose={closeResults} />

      {/* Per-row preview modal (issued certs only) */}
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
                    <p className="text-base font-bold text-primary-800">Certificate — {rowPreview.participant_name}</p>
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
                      {downloadingId === pid ? 'Downloading…' : 'Download PDF'}
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

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Airlines & Submissions</h1>
          <p className="text-sm text-primary-400 mt-1">
            View all airline submissions, generate and preview certificates
          </p>
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

      {/* ── Bulk Action Bar ── */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={toggleSelectAll}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                allChecked
                  ? 'bg-primary-800 border-primary-800'
                  : 'border-primary-300 hover:border-primary-500'
              }`}
            >
              {allChecked && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {!allChecked && checked.size > 0 && (
                <div className="w-2 h-0.5 bg-primary-500 rounded" />
              )}
            </div>
            <span className="text-sm font-medium text-primary-700">
              {allChecked ? 'Deselect All' : 'Select All'}
            </span>
          </label>

          {checked.size > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
              <HiOutlineCheckCircle className="w-3.5 h-3.5" />
              {checked.size} selected
            </span>
          )}
        </div>

        <button
          onClick={handleGenerateSelected}
          disabled={checked.size === 0 || generating}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            checked.size > 0 && !generating
              ? 'bg-primary-800 text-white hover:bg-primary-900 shadow-md hover:shadow-lg'
              : 'bg-primary-100 text-primary-400 cursor-not-allowed'
          }`}
        >
          {generating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <HiOutlineDocumentDownload className="w-4 h-4" />
          )}
          {generating
            ? 'Generating…'
            : checked.size > 0
            ? `Generate ${checked.size} Certificate${checked.size > 1 ? 's' : ''}`
            : 'Generate Selected'}
        </button>
      </div>

      {/* ── Search + Filter ── */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="Search participants by name or department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="input-field pl-10 pr-8 appearance-none cursor-pointer min-w-[220px]"
            >
              <option value="">All Training Types</option>
              {TRAINING_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card p-10 text-center text-sm text-primary-400">
          No airline submissions found.
        </div>
      )}

      {/* ── Airline Groups ── */}
      {!loading && filtered.map(({ airline, participants }) => {
        const groupIds   = participants.map(p => p.id || p._id);
        const groupAllCk = groupIds.length > 0 && groupIds.every(id => checked.has(id));
        const groupSome  = groupIds.some(id => checked.has(id));

        return (
          <div key={airline.airlineName} className="card overflow-hidden">

            {/* Airline header */}
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => toggle(airline.airlineName)}
                className="flex items-center gap-4 flex-1 text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{mkInitials(airline.airlineName)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
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

              <div className="flex items-center gap-3">
                {/* Delete All Data button — admin only, destructive */}
                {participants.length > 0 && (
                  <button
                    onClick={() => handleDeleteAirlineData(airline.airlineName, participants.length)}
                    title={`Delete all ${participants.length} record(s) from ${airline.airlineName}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-colors"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                    Delete All Data
                  </button>
                )}

                {participants.length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => toggleGroupAll(participants)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        groupAllCk
                          ? 'bg-primary-800 border-primary-800'
                          : groupSome
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-primary-300 hover:border-primary-500'
                      }`}
                    >
                      {groupAllCk && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {!groupAllCk && groupSome && (
                        <div className="w-2 h-0.5 bg-primary-500 rounded" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-primary-600">
                      {groupAllCk ? 'Deselect all' : 'Select all'}
                    </span>
                  </label>
                )}

                <button onClick={() => toggle(airline.airlineName)} className="p-1">
                  {expanded[airline.airlineName]
                    ? <HiOutlineChevronUp className="w-5 h-5 text-primary-400" />
                    : <HiOutlineChevronDown className="w-5 h-5 text-primary-400" />
                  }
                </button>
              </div>
            </div>

            {/* Participants table */}
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
                    <table className="w-full">
                      <thead>
                        <tr className="bg-primary-50/60">
                          <th className="w-10 px-4 py-2.5" />
                          <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">Participant</th>
                          <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">Department</th>
                          <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">Training</th>
                          <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">Start Date</th>
                          <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-3 py-2.5">End Date</th>
                          <th className="text-right text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-4 py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map(p => {
                          const pid      = p.id || p._id;
                          const fullName = p.participant_name || `${p.first_name || ''} ${p.last_name || ''}`.trim();
                          const isCk     = checked.has(pid);

                          return (
                            <tr
                              key={pid}
                              className={`border-t border-primary-100 transition-colors ${
                                isCk ? 'bg-accent-50/40' : 'hover:bg-primary-50/40'
                              }`}
                            >
                              {/* Row checkbox */}
                              <td className="px-4 py-3 w-10">
                                <div
                                  onClick={() => toggleOne(pid)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                                    isCk
                                      ? 'bg-primary-800 border-primary-800'
                                      : 'border-primary-300 hover:border-primary-600'
                                  }`}
                                >
                                  {isCk && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </td>

                              {/* Name */}
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-bold text-primary-600">{mkInitials(fullName)}</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-primary-800">{fullName}</p>
                                    {p.first_name && p.last_name && (
                                      <p className="text-[10px] text-primary-400">{p.first_name} · {p.last_name}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Department */}
                              <td className="px-3 py-3 text-sm text-primary-600">{p.department}</td>

                              {/* Training */}
                              <td className="px-3 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass(p.training_type)}`}>
                                  {p.training_type}
                                </span>
                                <p className="text-[10px] text-primary-400 mt-0.5 max-w-[150px] leading-tight">
                                  {TRAINING_LABELS[p.training_type] || p.training_type}
                                </p>
                              </td>

                              {/* Dates */}
                              <td className="px-3 py-3 text-sm text-primary-500">{fmtDate(p.training_date)}</td>
                              <td className="px-3 py-3 text-sm text-primary-500">{fmtDate(p.end_date)}</td>

                              {/* Actions */}
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  {p.cert_sequence ? (
                                    // ── Certificate already generated: show Preview + Download ──
                                    <>
                                      <button
                                        onClick={() => setRowPreview(p)}
                                        title="Preview certificate"
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-accent-200 text-xs font-medium text-accent-700 bg-accent-50 hover:bg-accent-100 hover:border-accent-300 transition-colors"
                                      >
                                        <HiOutlineEye className="w-3.5 h-3.5" />
                                        Preview
                                      </button>
                                      <button
                                        onClick={() => handleDownloadIssued(p)}
                                        disabled={downloadingId === pid}
                                        title="Download certificate"
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-60 transition-colors"
                                      >
                                        {downloadingId === pid ? (
                                          <div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                                        ) : (
                                          <HiOutlineDocumentDownload className="w-3.5 h-3.5" />
                                        )}
                                        PDF
                                      </button>
                                    </>
                                  ) : (
                                    // ── Not yet generated: show Pending badge ──
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                                      Pending
                                    </span>
                                  )}

                                  {/* Edit */}
                                  <Link
                                    to={`/admin/participants/edit/${pid}`}
                                    title="Edit record"
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary-200 text-xs font-medium text-primary-600 hover:bg-primary-100 hover:border-primary-300 transition-colors"
                                  >
                                    <HiOutlinePencil className="w-3.5 h-3.5" />
                                    Edit
                                  </Link>

                                  {/* Delete */}
                                  <button
                                    onClick={() => handleDelete(pid, fullName)}
                                    title="Delete record"
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors"
                                  >
                                    <HiOutlineTrash className="w-3.5 h-3.5" />
                                    Delete
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
