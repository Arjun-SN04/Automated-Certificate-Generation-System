import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlinePlusCircle,
  HiOutlineFilter,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getParticipants, deleteParticipant } from '../api';

export default function Participants() {
  const [records, setRecords] = useState([]);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete record for "${name}"?`)) return;
    try {
      await deleteParticipant(id);
      toast.success('Record deleted');
      fetchRecords();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const trainingTypes = ['Dispatch Graduate', 'Human Factors', 'Recurrent'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Participants</h1>
          <p className="text-sm text-primary-400 mt-1">Manage training participant records</p>
        </div>
        <Link to="/admin/participants/add" className="btn-primary flex items-center gap-2">
          <HiOutlinePlusCircle className="w-4 h-4" />
          Add Participant
        </Link>
      </div>

      {/* Filters bar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="Search by name, company, or department..."
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
                <th className="text-right text-[10px] font-semibold text-primary-500 uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary-400">
                      <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                      <span className="text-sm">Loading records...</span>
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
                records.map((record, idx) => (
                  <tr
                    key={record.id}
                    className="border-b border-primary-100 last:border-0 hover:bg-primary-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary-600">
                            {record.participant_name.split(' ').map(n => n[0]).join('')}
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/participants/edit/${record.id}`}
                          className="p-1.5 rounded-lg hover:bg-primary-100 transition-colors text-primary-400 hover:text-primary-600"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(record.id, record.participant_name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-primary-400 hover:text-red-500"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {records.length > 0 && (
          <div className="px-6 py-3 bg-primary-50/50 border-t border-primary-200">
            <p className="text-xs text-primary-400">
              Showing {records.length} record{records.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
