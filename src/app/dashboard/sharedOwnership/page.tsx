'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { FaEdit, FaTrashAlt, FaPhoneAlt, FaMapMarkerAlt, FaUserAlt, FaSearch } from 'react-icons/fa';

export default function SharedOwnershipPage() {
  const [ownerships, setOwnerships] = useState<any[]>([]);
  const [filteredOwnerships, setFilteredOwnerships] = useState<any[]>([]);
  const [selectedOwnership, setSelectedOwnership] = useState<any | null>(null);
  const [editingOwnership, setEditingOwnership] = useState<any | null>(null);

  const [status, setStatus] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOwnerships = async () => {
      try {
        const { data, error } = await supabase
          .from('shared_ownership')
          .select(`
            id,
            status,
            user_id1,
            user_id2,
            user1:profiles!user_id1(id, name, profilePicture, phone, address),
            user2:profiles!user_id2(id, name, profilePicture, phone, address)
          `);

        if (error) {
          console.error('Error fetching shared ownerships:', error.message);
          return;
        }

        if (data) {
          setOwnerships(data);
          setFilteredOwnerships(data); // Initialize filtered ownerships with all fetched data
        }
      } catch (error) {
        console.error('Unexpected error fetching shared ownerships:', error);
      }
    };

    fetchOwnerships();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('shared_ownership').delete().eq('id', id);
    if (error) console.error('Error deleting shared ownership:', error);
    else {
      setOwnerships(ownerships.filter((o) => o.id !== id));
      setFilteredOwnerships(filteredOwnerships.filter((o) => o.id !== id)); // Update filtered ownerships
    }
  };

  const handleRowClick = (ownership: any) => {
    setSelectedOwnership(ownership);
  };

  const handleEditClick = (ownership: any) => {
    setEditingOwnership(ownership);
    setStatus(ownership.status);
  };

  const handleSave = async () => {
    if (!editingOwnership) return;
    const { error } = await supabase
      .from('shared_ownership')
      .update({
        status,
      })
      .eq('id', editingOwnership.id);

    if (error) console.error('Error updating shared ownership:', error);
    else {
      setOwnerships(ownerships.map((o) =>
        o.id === editingOwnership.id ? { ...o, status } : o
      ));
      setFilteredOwnerships(filteredOwnerships.map((o) =>
        o.id === editingOwnership.id ? { ...o, status } : o
      ));
      setEditingOwnership(null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filterOwnerships = () => {
    if (!searchQuery) {
      setFilteredOwnerships(ownerships);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = ownerships.filter(
        (ownership) =>
          ownership.user1.name.toLowerCase().includes(query) ||
          ownership.user2.name.toLowerCase().includes(query)
      );
      setFilteredOwnerships(filtered);
    }
  };

  useEffect(() => {
    filterOwnerships();
  }, [searchQuery, ownerships]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Shared Ownerships</h1>

      {/* Search Bar */}
      <div className="mb-6 flex items-center space-x-4">
        <FaSearch className="text-gray-600" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by user1 or user2 name"
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse rounded-lg shadow">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">User 1</th>
              <th className="px-4 py-3">User 2</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOwnerships.map((o, i) => (
              <tr
                key={o.id}
                onClick={() => handleRowClick(o)}
                className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t cursor-pointer hover:bg-gray-100`}
              >
                <td className="px-4 py-3">
                  {o.user1?.name}
                  <div className="text-xs text-gray-500">{o.user1?.phone}</div>
                  <div className="text-xs text-gray-500">{o.user1?.address}</div>
                </td>
                <td className="px-4 py-3">
                  {o.user2?.name}
                  <div className="text-xs text-gray-500">{o.user2?.phone}</div>
                  <div className="text-xs text-gray-500">{o.user2?.address}</div>
                </td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3 flex items-center space-x-2">
                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(o); }} className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-1.5 rounded-full">
                    <FaEdit size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }} className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded-full">
                    <FaTrashAlt size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Shared Ownership Details */}
      {selectedOwnership && !editingOwnership && (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-3xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Shared Ownership Details</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                {/* User 1 Details */}
                <div className="w-16 h-16 rounded-full bg-gray-200 flex justify-center items-center">
                  {selectedOwnership.user1?.profilePicture ? (
                    <img
                      src={selectedOwnership.user1.profilePicture}
                      alt="User 1"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUserAlt size={24} className="text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{selectedOwnership.user1?.name || 'User 1'}</p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaPhoneAlt size={14} />
                    <span>{selectedOwnership.user1?.phone || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaMapMarkerAlt size={14} />
                    <span>{selectedOwnership.user1?.address || 'N/A'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* User 2 Details */}
                <div className="w-16 h-16 rounded-full bg-gray-200 flex justify-center items-center">
                  {selectedOwnership.user2?.profilePicture ? (
                    <img
                      src={selectedOwnership.user2.profilePicture}
                      alt="User 2"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUserAlt size={24} className="text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{selectedOwnership.user2?.name || 'User 2'}</p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaPhoneAlt size={14} />
                    <span>{selectedOwnership.user2?.phone || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaMapMarkerAlt size={14} />
                    <span>{selectedOwnership.user2?.address || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="text-lg font-semibold text-gray-700">Status: {selectedOwnership.status}</div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setSelectedOwnership(null)}            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Ownership */}
      {editingOwnership && (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-3xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-sm">Status</label>
                <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditingOwnership(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition">
                Cancel
              </button>
              <button onClick={handleSave} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition"> 
              Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
