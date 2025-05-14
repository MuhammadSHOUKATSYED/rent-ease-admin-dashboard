'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { FaEdit, FaSearch, FaTrashAlt } from 'react-icons/fa';

interface UserProfile {
  id: string;
  name: string;
  address: string;
  phone: string;
  verification: string;
  profilePicture?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Error fetching users:', error.message);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setName(user.name);
    setAddress(user.address);
    setPhone(user.phone);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({ name, address, phone })
      .eq('id', editingUser.id);

    if (error) {
      console.error('Error updating profile:', error.message);
    } else {
      setUsers(prev =>
        prev.map(user =>
          user.id === editingUser.id ? { ...user, name, address, phone } : user
        )
      );
      setEditingUser(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      console.error('Error deleting profile:', error.message);
    } else {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User Profiles</h1>

      <div className="mb-6 flex items-center space-x-4">
       <FaSearch className="text-gray-600" size={20} />
        <input
          type="text"
          placeholder="Search by name, address, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse rounded-lg shadow">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4">Profile</th>
              <th className="p-4">Name</th>
              <th className="p-4">Address</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Verification</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t hover:bg-gray-50 transition duration-300">
                <td className="p-4">
                  <img
                    src={user.profilePicture || '/default-profile.png'}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                  />
                </td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.address}</td>
                <td className="p-4">{user.phone}</td>
                <td className="p-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      user.verification === 'Verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user.verification}
                  </span>
                </td>
                <td className="p-9 flex gap-3">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-2 rounded-full"
                    title="Edit"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-full"
                    title="Delete"
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="edit-user-title"
    className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-3xl w-full mx-4">
      <h2 id="edit-user-title" className="text-xl font-semibold text-gray-800 mb-4">Edit User</h2>
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name ?? ""}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Address Input */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={address ?? ""}
            onChange={e => setAddress(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone Input */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            value={phone ?? ""}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={handleSave}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingUser(null)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
