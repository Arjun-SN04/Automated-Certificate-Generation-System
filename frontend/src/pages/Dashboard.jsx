import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineArrowRight,
  HiOutlinePlusCircle,
} from 'react-icons/hi';
import { getParticipants } from '../api';

const statCards = [
  { label: 'Total Records', icon: HiOutlineUsers, color: 'bg-primary-800', key: 'total' },
  { label: 'Training Types', icon: HiOutlineAcademicCap, color: 'bg-accent-600', key: 'types' },
  { label: 'Certificates Ready', icon: HiOutlineDocumentText, color: 'bg-emerald-600', key: 'ready' },
  { label: 'This Month', icon: HiOutlineCalendar, color: 'bg-violet-600', key: 'month' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, types: 0, ready: 0, month: 0 });
  const [recentRecords, setRecentRecords] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getParticipants();
        const data = res.data;
        const types = new Set(data.map((p) => p.training_type));
        const now = new Date();
        const thisMonth = data.filter((p) => {
          const d = new Date(p.training_date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        setStats({
          total: data.length,
          types: types.size,
          ready: data.length,
          month: thisMonth.length,
        });
        setRecentRecords(data.slice(0, 5));
      } catch {
        // silent
      }
    }
    fetchData();
  }, []);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome section */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Welcome back</h1>
          <p className="text-sm text-primary-400 mt-1">
            Manage training records and generate certificates
          </p>
        </div>
        <Link to="/admin/participants/add" className="btn-primary flex items-center gap-2">
          <HiOutlinePlusCircle className="w-4 h-4" />
          New Record
        </Link>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-primary-400 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-primary-800 mt-2">{stats[card.key]}</p>
              </div>
              <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions + Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={item} className="card p-6">
          <h2 className="text-base font-bold text-primary-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/participants/add"
              className="flex items-center gap-3 p-3 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors group"
            >
              <div className="w-9 h-9 bg-accent-50 rounded-lg flex items-center justify-center">
                <HiOutlinePlusCircle className="w-5 h-5 text-accent-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-700">Add Participant</p>
                <p className="text-xs text-primary-400">Create a new training record</p>
              </div>
              <HiOutlineArrowRight className="w-4 h-4 text-primary-300 group-hover:text-primary-500 transition-colors" />
            </Link>
            <Link
              to="/admin/certificates"
              className="flex items-center gap-3 p-3 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors group"
            >
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-700">Generate Certificates</p>
                <p className="text-xs text-primary-400">Download or print certificates</p>
              </div>
              <HiOutlineArrowRight className="w-4 h-4 text-primary-300 group-hover:text-primary-500 transition-colors" />
            </Link>
            <Link
              to="/admin/participants"
              className="flex items-center gap-3 p-3 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors group"
            >
              <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-700">View All Records</p>
                <p className="text-xs text-primary-400">Browse participant database</p>
              </div>
              <HiOutlineArrowRight className="w-4 h-4 text-primary-300 group-hover:text-primary-500 transition-colors" />
            </Link>
          </div>
        </motion.div>

        {/* Recent Records */}
        <motion.div variants={item} className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-primary-800">Recent Records</h2>
            <Link to="/admin/participants" className="text-xs font-medium text-accent-600 hover:text-accent-700">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-200">
                  <th className="text-left text-[10px] font-semibold text-primary-400 uppercase tracking-wider pb-3">
                    Name
                  </th>
                  <th className="text-left text-[10px] font-semibold text-primary-400 uppercase tracking-wider pb-3">
                    Company
                  </th>
                  <th className="text-left text-[10px] font-semibold text-primary-400 uppercase tracking-wider pb-3">
                    Training
                  </th>
                  <th className="text-left text-[10px] font-semibold text-primary-400 uppercase tracking-wider pb-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record) => (
                  <tr key={record.id} className="border-b border-primary-100 last:border-0">
                    <td className="py-3 text-sm font-medium text-primary-800">
                      {record.participant_name}
                    </td>
                    <td className="py-3 text-sm text-primary-500">{record.company}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        {record.training_type}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-primary-400">
                      {new Date(record.training_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
                {recentRecords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-primary-400">
                      No records found. Add your first participant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
