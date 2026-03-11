import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineDocumentDownload,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineEye,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getParticipants, generateCertificateUrl, generateCertificateWithModules } from '../api';
import ModuleSelector from '../components/ModuleSelector';

export default function Certificates() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [moduleModal, setModuleModal] = useState({ open: false, record: null });
  const [generating, setGenerating] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterType) params.training_type = filterType;
      const res = await getParticipants(params);
      setRecords(res.data);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filterType, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleGenerate = async (record) => {
    // If recurrent and no modules saved, prompt for module selection
    if (record.training_type === 'Recurrent' && !record.modules) {
      setModuleModal({ open: true, record });
      return;
    }

    try {
      setGenerating(record.id);
      // Direct download for non-recurrent or recurrent with saved modules
      const url = generateCertificateUrl(record.id);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${record.participant_name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Certificate downloaded');
    } catch {
      toast.error('Failed to generate certificate');
    } finally {
      setGenerating(null);
    }
  };

  const handleModuleConfirm = async (modules) => {
    const record = moduleModal.record;
    setModuleModal({ open: false, record: null });

    try {
      setGenerating(record.id);
      const res = await generateCertificateWithModules(record.id, modules);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${record.participant_name.replace(/\s+/g, '_')}_Recurrent.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded');
      fetchRecords(); // Refresh to show saved modules
    } catch {
      toast.error('Failed to generate certificate');
    } finally {
      setGenerating(null);
    }
  };

  const handlePreview = (record) => {
    if (record.training_type === 'Recurrent' && !record.modules) {
      setModuleModal({ open: true, record: { ...record, _preview: true } });
      return;
    }
    window.open(`/api/certificates/preview/${record.id}`, '_blank');
  };

  const trainingTypes = ['Dispatch Graduate', 'Human Factors', 'Recurrent'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Module selector modal */}
      <ModuleSelector
        isOpen={moduleModal.open}
        onClose={() => setModuleModal({ open: false, record: null })}
        onConfirm={handleModuleConfirm}
        initialModules={
          moduleModal.record?.modules
            ? moduleModal.record.modules.split(',').map((m) => m.trim())
            : []
        }
      />

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-800">Certificates</h1>
        <p className="text-sm text-primary-400 mt-1">
          Generate and download training certificates
        </p>
      </div>

      {/* Info card */}
      <div className="card p-4 bg-accent-50/50 border-accent-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <HiOutlineDocumentDownload className="w-4 h-4 text-accent-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-accent-800">Certificate Generation</p>
            <p className="text-xs text-accent-600 mt-0.5">
              Click "Generate PDF" to create and download a certificate. For Recurrent training, you'll be prompted to select the training modules to include on the certificate.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="Search participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </form>
          <div className="relative">
            <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field pl-10 pr-8 appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="">All Training Types</option>
              {trainingTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-50 border-b border-primary-200">
                <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-6 py-3">
                  Participant Name
                </th>
                <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-6 py-3">
                  Company
                </th>
                <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-6 py-3">
                  Department
                </th>
                <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-6 py-3">
                  Type of Training
                </th>
                <th className="text-left text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-6 py-3">
                  Training Date
                </th>
                <th className="text-center text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary-400">
                      <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-primary-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-primary-100 last:border-0 hover:bg-primary-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary-600">
                            {record.participant_name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-primary-800">
                          {record.participant_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary-600">{record.company}</td>
                    <td className="px-6 py-4 text-sm text-primary-600">{record.department}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.training_type === 'Recurrent'
                            ? 'bg-violet-100 text-violet-700'
                            : record.training_type === 'Human Factors'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {record.training_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary-500">
                      {new Date(record.training_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePreview(record)}
                          className="p-1.5 rounded-lg hover:bg-primary-100 transition-colors text-primary-400 hover:text-primary-600"
                          title="Preview Certificate"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleGenerate(record)}
                          disabled={generating === record.id}
                          className="btn-accent flex items-center gap-1.5 text-xs disabled:opacity-50"
                        >
                          {generating === record.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <HiOutlineDocumentDownload className="w-3.5 h-3.5" />
                              Generate PDF
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {records.length > 0 && (
          <div className="px-6 py-3 bg-primary-50/50 border-t border-primary-200">
            <p className="text-xs text-primary-400">
              {records.length} certificate{records.length !== 1 ? 's' : ''} available for generation
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
