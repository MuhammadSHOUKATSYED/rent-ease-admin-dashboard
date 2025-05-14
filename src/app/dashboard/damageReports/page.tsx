'use client';

import { useEffect} from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { FaTrashAlt, FaSearch } from 'react-icons/fa';
import { useState } from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaUserAlt } from "react-icons/fa";

export default function DamageReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fullImageOpen, setFullImageOpen] = useState(false);


  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('damage_reports')
        .select(`
          *,
          user:user_id (
            name,
            profilePicture,
            phone,
            address
          ),
          clash_partner:clash_partner_id (
            name,
            profilePicture,
            phone,
            address
          )
        `);

      if (error) console.error('Error fetching damage reports:', error);
      else {
        setReports(data);
        setFilteredReports(data);  // Initialize filtered reports with all fetched reports
      }
    };
    fetchReports();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredReports(filtered);
  };

  const markAsResolved = async (reportId: string) => {
    const { error } = await supabase
      .from('damage_reports')
      .update({ status: 'resolved' })
      .eq('id', reportId);

    if (error) {
      console.error('Error marking report as resolved:', error);
    } else {
      // Update local reports state after marking as resolved
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: 'resolved' } : report
        )
      );
      filterReports(); // Re-filter the reports after status change
    }
  };

  useEffect(() => {
    filterReports();
  }, [searchQuery, reports, statusFilter]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Damage Reports</h1>

      {/* Search Bar and Status Filter */}
      <div className="mb-6 flex items-center space-x-4">
        <FaSearch className="text-gray-600" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by title or description"
          className="w-full p-3 border border-gray-300 rounded-lg"
        />

        {/* Status Filter Dropdown */}
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="ml-4 p-3 border border-gray-300 rounded-lg"
        >
          <option value="all">All</option>
          <option value="resolved">Resolved</option>
          <option value="unresolved">Unresolved</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse rounded-lg shadow">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((r, i) => (
              <tr
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t cursor-pointer hover:bg-gray-100`}
              >
                <td className="px-4 py-3">{r.title}</td>
                <td className="px-4 py-3">{r.description}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3 flex items-center space-x-2">
                <button
                        onClick={(e) => {
                        e.stopPropagation();
                        markAsResolved(r.id);
                        }}
                        className="text-green-600 hover:text-green-800 hover:bg-green-100 px-3 py-1 rounded-lg border border-green-600 text-xs"
                    >
                        Mark as Resolved
                    </button>
                  <button onClick={(e) => { e.stopPropagation(); /* Add delete logic here */ }} className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded-full">
                    <FaTrashAlt size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Report Details */}
      {selectedReport && (
  <>
    {/* Report Modal */}
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-3xl w-full mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Damage Report Details</h2>
        <div className="space-y-6">
          {/* Report Image - clipped with full-view on click */}
          {selectedReport.image_url && (
            <div className="relative group cursor-pointer" onClick={() => setFullImageOpen(true)}>
              <img
                src={selectedReport.image_url}
                alt="Damage"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-white/30 bg-opacity-30 flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition">
                Click to view full image
              </div>
            </div>
          )}
          {/* Reporter Details */}
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-700">Reporter</h3>
            <div className="w-14 h-14 rounded-full bg-gray-100 flex justify-center items-center">
              {selectedReport.user?.profilePicture ? (
                <img
                  src={selectedReport.user.profilePicture}
                  alt="Reporter"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaUserAlt size={20} className="text-gray-500" />
              )}
            </div>
            <div>
              <p className="font-semibold">{selectedReport.user?.name || 'Reporter'}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <FaPhoneAlt size={12} />
                <span>{selectedReport.user?.phone || 'N/A'}</span>
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <FaMapMarkerAlt size={12} />
                <span>{selectedReport.user?.address || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Clash Partner Details */}
          {selectedReport.clash_partner ? (
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-700">Clash With</h3>
              <div className="w-14 h-14 rounded-full bg-gray-100 flex justify-center items-center">
                {selectedReport.clash_partner.profilePicture ? (
                  <img
                    src={selectedReport.clash_partner.profilePicture}
                    alt="Clash Partner"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FaUserAlt size={20} className="text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-semibold">{selectedReport.clash_partner.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FaPhoneAlt size={12} />
                  <span>{selectedReport.clash_partner.phone || 'N/A'}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FaMapMarkerAlt size={12} />
                  <span>{selectedReport.clash_partner.address || 'N/A'}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="italic text-gray-400 text-center">No clash partner details available</div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setSelectedReport(null)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition">
            Close
          </button>
        </div>
      </div>
    </div>

    {/* Full Image Modal */}
    {fullImageOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        onClick={() => setFullImageOpen(false)}
      >
        <img
          src={selectedReport.image_url}
          alt="Full View"
          className="max-w-full max-h-full rounded-lg shadow-lg"
        />
      </div>
    )}
  </>
)}
    </div>
  );
}
