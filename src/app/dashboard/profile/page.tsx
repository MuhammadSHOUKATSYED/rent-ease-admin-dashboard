'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

export default function EditAdmin() {
  const [email, setEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [adminData, setAdminData] = useState({
    full_name: "",
    address: "",
    date_of_birth: "",
    profile_picture: "",
    phone: "",
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [missingInfo, setMissingInfo] = useState(false); // NEW

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('Unable to fetch user.');
          return;
        }

        setEmail(user.email || '');

        const { data, error: adminError } = await supabase
          .from('admins')
          .select('full_name, date_of_birth, address, phone, profile_picture')
          .eq('id', user.id)
          .single();

        if (adminError) {
          setError('Error fetching admin profile.');
        } else {
          setAdminData(data || {});

          // Check for missing fields
          const fields = ['full_name', 'date_of_birth', 'address', 'phone', 'profile_picture'];
          const hasMissingFields = fields.some(field => !data?.[field]);
          setMissingInfo(hasMissingFields);
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('User not authenticated.');
      return;
    }

    const { error: updateError } = await supabase
      .from('admins')
      .update(adminData)
      .eq('id', user.id);

    if (updateError) {
      setError('Failed to update profile.');
    } else {
      setSuccessMessage('Profile updated successfully.');
      setMissingInfo(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `admin-profiles/${fileName}`;

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        setError('Failed to upload image.');
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        setAdminData((prev) => ({ ...prev, profile_picture: publicUrlData.publicUrl }));
      }
    } catch (err) {
      console.error('Image upload failed', err);
      setError('Error uploading image.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Edit Admin Profile</h2>

        {missingInfo && (
          <div className="bg-yellow-100 text-yellow-800 text-sm font-medium px-4 py-2 rounded mb-4">
            Please update all your information.
          </div>
        )}

        <form
          onSubmit={handleUpdate}
          className="bg-white shadow-md rounded-lg px-6 pt-4 pb-6 mb-4 border border-gray-200"
        >
          {error && <p className="text-red-500 mb-3">{error}</p>}
          {successMessage && (
            <div className="text-green-600 mb-3">
              {successMessage}
            </div>
          )}

          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-54 h-54 rounded-full border-2 border-gray-300 overflow-hidden bg-purple-600 text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition"
              title="Click to upload profile picture"
            >
              {adminData.profile_picture ? (
                <img
                  src={adminData.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold">
                  {adminData.full_name?.split(' ')[0]?.charAt(0).toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Form Fields */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={adminData.full_name || ''}
              onChange={(e) => setAdminData({ ...adminData, full_name: e.target.value })}
              placeholder="Enter name..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Date of Birth</label>
            <input
              type="date"
              value={adminData.date_of_birth  || ''}
              onChange={(e) => setAdminData({ ...adminData, date_of_birth: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={adminData.address  || ''}
              onChange={(e) => setAdminData({ ...adminData, address: e.target.value })}
              placeholder="Enter address..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={adminData.phone  || ''}
              onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
              placeholder="Enter phone..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-blue-50"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-md transition duration-300"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
