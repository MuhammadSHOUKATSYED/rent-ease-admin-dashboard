'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { FaTrashAlt, FaPhoneAlt, FaMapMarkerAlt, FaUserAlt, FaSearch } from 'react-icons/fa';

export default function QueriesPage() {
  const [queries, setQueries] = useState<any[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<any[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<any | null>(null);
  const [editingQuery, setEditingQuery] = useState<any | null>(null);

  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [fullImageOpen, setFullImageOpen] = useState(false);

  const filterQueries = () => {
    let filtered = queries;
  
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((q) =>
        q.title.toLowerCase().includes(query)
      );
    }
  
    if (filterStatus === 'resolved') {
      filtered = filtered.filter((q) => q.status === 'resolved');
    } else if (filterStatus === 'unresolved') {
      filtered = filtered.filter((q) => q.status !== 'resolved' && q.status !== 'RESOLVED');
    }
  
    setFilteredQueries(filtered);
  };
  useEffect(() => {
    filterQueries();
  }, [searchQuery, queries, filterStatus]);
    
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const { data, error } = await supabase
          .from('queries')
          .select(`
            id,
            title,
            image_url,
            status,
            content,
            user_id,
            user:profiles(id, name, profilePicture, phone, address)
          `);

        if (error) {
          console.error('Error fetching queries:', error.message);
          return;
        }

        if (data) {
          setQueries(data);
          setFilteredQueries(data); // Initialize filtered queries with all fetched data
        }
      } catch (error) {
        console.error('Unexpected error fetching queries:', error);
      }
    };

    fetchQueries();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('queries').delete().eq('id', id);
    if (error) console.error('Error deleting query:', error);
    else {
      setQueries(queries.filter((q) => q.id !== id));
      setFilteredQueries(filteredQueries.filter((q) => q.id !== id)); // Update filtered queries
    }
  };

  const handleRowClick = (query: any) => {
    setSelectedQuery(query);
  };

  const handleEditClick = (query: any) => {
    setEditingQuery(query);
    setStatus(query.status);
  };

  const handleSave = async () => {
    if (!editingQuery) return;
    const { error } = await supabase
      .from('queries')
      .update({
        status,
      })
      .eq('id', editingQuery.id);

    if (error) console.error('Error updating query:', error);
    else {
      setQueries(queries.map((q) =>
        q.id === editingQuery.id ? { ...q, status } : q
      ));
      setFilteredQueries(filteredQueries.map((q) =>
        q.id === editingQuery.id ? { ...q, status } : q
      ));
      setEditingQuery(null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    filterQueries();
  }, [searchQuery, queries]);
  
  const markAsResolved = async (query: any) => {
    const { error } = await supabase
      .from('queries')
      .update({ status: 'resolved' })
      .eq('id', query.id);
  
    if (error) {
      console.error('Error marking as resolved:', error);
    } else {
      const updatedQueries = queries.map((q) =>
        q.id === query.id ? { ...q, status: 'resolved' } : q
      );
      setQueries(updatedQueries);
      setFilteredQueries(updatedQueries);
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Help Center</h1>

{/* Search Bar with Filter */}
<div className="mb-6 flex items-center space-x-4">
  <div className="relative w-full flex items-center">
    <FaSearch className="absolute left-3 text-gray-600" size={16} />
    <input
      type="text"
      value={searchQuery}
      onChange={handleSearchChange}
      placeholder="Search by title"
      className="w-full pl-10 pr-4 p-3 border border-gray-300 rounded-lg"
    />
  </div>

  {/* Filter Dropdown */}
  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value as any)}
    className="p-3 border border-gray-300 rounded-lg bg-white text-gray-700"
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
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueries.map((q, i) => (
              <tr
                key={q.id}
                onClick={() => handleRowClick(q)}
                className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t cursor-pointer hover:bg-gray-100`}
              >
                <td className="px-4 py-3">{q.title}</td>
                <td className="px-4 py-3">{q.status}</td>
                <td className="px-4 py-3">
                  {q.user?.name}
                  <div className="text-xs text-gray-500">{q.user?.phone}</div>
                  <div className="text-xs text-gray-500">{q.user?.address}</div>
                </td>
                <td className="px-4 py-3 flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                        e.stopPropagation();
                        markAsResolved(q);
                        }}
                        className="text-green-600 hover:text-green-800 hover:bg-green-100 px-3 py-1 rounded-lg border border-green-600 text-xs"
                    >
                        Mark as Resolved
                    </button>
                    <button
                        onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(q.id);
                        }}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded-full"
                    >
                        <FaTrashAlt size={16} />
                    </button>
                    </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

{/* Modal for Query Details */}
{selectedQuery && !editingQuery && (
  <>
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-3xl w-full mx-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Query Details</h2>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          {/* User Details */}
          <div>
            <p className="font-semibold">{selectedQuery.user?.name || 'User'}</p>
            <p className="text-sm text-gray-600 flex items-center space-x-2">
              <FaPhoneAlt size={14} />
              <span>{selectedQuery.user?.phone || 'N/A'}</span>
            </p>
            <p className="text-sm text-gray-600 flex items-center space-x-2">
              <FaMapMarkerAlt size={14} />
              <span>{selectedQuery.user?.address || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Query Content */}
        <div className="text-lg text-gray-700">{selectedQuery.content}</div>
          {/* Report Image - clipped with full-view on click */}
          {selectedQuery.image_url && (
            <div className="relative group cursor-pointer" onClick={() => setFullImageOpen(true)}>
              <img
                src={selectedQuery.image_url}
                alt="Damage"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-white/30 bg-opacity-30 flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition">
                Click to view full image
              </div>
            </div>
          )}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setSelectedQuery(null)}
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
            src={selectedQuery.image_url}
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
