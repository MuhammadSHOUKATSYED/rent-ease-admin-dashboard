'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { FaEdit, FaTrashAlt, FaPhoneAlt, FaMapMarkerAlt, FaUserAlt, FaSearch } from 'react-icons/fa';


export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<any[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [editingDonation, setEditingDonation] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [fullImageOpen, setFullImageOpen] = useState(false);
    // State to track which image is open
const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

  const sendPushNotification = async (expoPushToken: string, title: string, message: string) => {
    try {
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expoPushToken, title, message }),
      });
    } catch (err) {
      console.error('Error calling push notification API:', err);
    }
  };
  

  useEffect(() => {
    const fetchDonations = async () => {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          profile:profiles (
            name,
            profilePicture,
            phone,
            address
          )
        `);
      if (error) console.error('Error fetching donations:', error);
      else {
        setDonations(data);
        setFilteredDonations(data);  // Initialize filtered donations with all fetched donations
      }
    };
    fetchDonations();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('donations').delete().eq('id', id);
    if (error) console.error('Error deleting donation:', error);
    else {
      setDonations(donations.filter((d) => d.id !== id));
      setFilteredDonations(filteredDonations.filter((d) => d.id !== id));  // Update filtered donations
    }
  };

  const handleRowClick = (donation: any) => {
    setSelectedDonation(donation);
  };

  const handleEditClick = (donation: any) => {
    setEditingDonation(donation);
    setName(donation.name);
    setCategory(donation.category);
    setAddress(donation.address);
  };

  const handleSave = async () => {
    if (!editingDonation) return;
    const { error } = await supabase
      .from('donations')
      .update({
        name,
        category,
        address,
      })
      .eq('id', editingDonation.id);

    if (error) console.error('Error updating donation:', error);
    else {
      setDonations(donations.map((d) =>
        d.id === editingDonation.id ? { ...d, name, category, address } : d
      ));
      setFilteredDonations(filteredDonations.map((d) =>
        d.id === editingDonation.id ? { ...d, name, category, address } : d
      ));
      setEditingDonation(null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filterDonations = () => {
    if (!searchQuery) {
      setFilteredDonations(donations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = donations.filter(
        (donation) =>
          donation.name.toLowerCase().includes(query) ||
          donation.category.toLowerCase().includes(query)
      );
      setFilteredDonations(filtered);
    }
  };

  useEffect(() => {
    filterDonations();
  }, [searchQuery, donations]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Donations</h1>

      {/* Search Bar */}
      <div className="mb-6 flex items-center space-x-4">
        <FaSearch className="text-gray-600" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name or category"
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse rounded-lg shadow">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">Donation Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonations.map((d, i) => (
              <tr
                key={d.id}
                onClick={() => handleRowClick(d)}
                className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t cursor-pointer hover:bg-gray-100`}
              >
                <td className="px-4 py-3">{d.name}</td>
                <td className="px-4 py-3">{d.category}</td>
                <td className="px-4 py-3">{d.address}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.approved === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {d.approved === 'yes' ? 'Approved' : 'Not Approved'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center space-x-2">
                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(d); }} className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-1.5 rounded-full">
                    <FaEdit size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded-full">
                    <FaTrashAlt size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Donation Details */}
      {selectedDonation && !editingDonation && (
        <>
  <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-3xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Donation Details</h2>
            <div className="space-y-6">
              {/* Donation Images */}
                      {/* Product Images */}
                      <div className="flex space-x-4 overflow-x-auto">
                        {['picture1', 'picture2', 'picture3'].map((key) => {
                          const imageUrl = selectedDonation[key];
                          if (!imageUrl) return null;

                          return (
                            <div
                              key={key}
                              className="relative group flex-shrink-0 w-64 h-64 cursor-pointer"
                              onClick={() => setFullImageUrl(imageUrl)}
                            >
                              <img
                                src={imageUrl}
                                alt="Product"
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-white/30 bg-opacity-30 flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition">
                                Click to view full image
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Full Image Modal */}
                      {fullImageUrl && (
                        <div
                          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                          onClick={() => setFullImageUrl(null)}
                        >
                          <img
                            src={fullImageUrl}
                            alt="Full View"
                            className="max-w-full max-h-full rounded-lg shadow-lg"
                          />
                        </div>
                      )}
              {/* Owner Details */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex justify-center items-center">
                  {selectedDonation.profile?.profilePicture ? (
                    <img
                      src={selectedDonation.profile.profilePicture}
                      alt="Owner"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUserAlt size={24} className="text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{selectedDonation.profile?.name || 'Owner'}</p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaPhoneAlt size={14} />
                    <span>{selectedDonation.profile?.phone || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaMapMarkerAlt size={14} />
                    <span>{selectedDonation.profile?.address || 'N/A'}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setSelectedDonation(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition">
                Close
              </button>
             {selectedDonation.approved !== 'yes' && (
              <button
              onClick={async () => {
                const { error: updateError } = await supabase
                  .from('donations')
                  .update({ approved: 'yes' })
                  .eq('id', selectedDonation.id);

                if (updateError) return console.error('Approval Error:', updateError);

                const updated = donations.map((d) =>
                  d.id === selectedDonation.id ? { ...d, approved: 'yes' } : d
                );
                setDonations(updated);
                setFilteredDonations(updated);
                setSelectedDonation({ ...selectedDonation, approved: 'yes' });

                const { data: user } = await supabase.auth.getUser();
                const sender_id = user?.user?.id;
                const owner_id = selectedDonation.profile_id;

                const { error: notifyError } = await supabase.from('notifications').insert({
                  profile_id: owner_id,
                  type: 'donation',
                  title: 'Donation Approved',
                  message: `Your donation "${selectedDonation.name}" has been approved.`,
                });

                if (notifyError) console.error('Notification Error:', notifyError);
                // Get recipient's push token
                const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('expo_push_token')
                .eq('id', owner_id)
                .single();

                if (profileError) {
                console.error('Error fetching push token:', profileError);
                } else if (profileData?.expo_push_token) {
                await sendPushNotification(
                  profileData.expo_push_token,
                  'Donation Approved',
                  `Your donation "${selectedDonation.name}" has been approved.`
                );
                }

              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Approve
            </button>
              )}

{selectedDonation.approved === 'yes' && (
                <button
                onClick={async () => {
                  const { error: updateError } = await supabase
                    .from('donations')
                    .update({ approved: 'no' })
                    .eq('id', selectedDonation.id);

                  if (updateError) return console.error('Rejection Error:', updateError);

                  const updated = donations.map((d) =>
                    d.id === selectedDonation.id ? { ...d, approved: 'no' } : d
                  );
                  setDonations(updated);
                  setFilteredDonations(updated);
                  setSelectedDonation({ ...selectedDonation, approved: 'no' });

                  const { data: user } = await supabase.auth.getUser();
                  const sender_id = user?.user?.id;
                  const owner_id = selectedDonation.profile_id;

                  const { error: notifyError } = await supabase.from('notifications').insert({
                    profile_id: owner_id,
                    type: 'donation',
                    title: 'Donation Rejected',
                    message: `Your donation "${selectedDonation.name}" has been rejected.`
                  });

                  if (notifyError) console.error('Notification Error:', notifyError);
                  // Get recipient's push token
                  const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('expo_push_token')
                  .eq('id', owner_id)
                  .single();

                  if (profileError) {
                  console.error('Error fetching push token:', profileError);
                  } else if (profileData?.expo_push_token) {
                  await sendPushNotification(
                    profileData.expo_push_token,
                    'Donation Rejected',
                    `Your donation "${selectedDonation.name}" has been rejected.`
                  );
                  }
                }}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
              >
                Reject
              </button>
              )}

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
          src={selectedDonation.picture1_url}
          alt="Full View"
          className="max-w-full max-h-full rounded-lg shadow-lg"
        />
      </div>
    )}
        {fullImageOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        onClick={() => setFullImageOpen(false)}
      >
        <img
          src={selectedDonation.picture2_url}
          alt="Full View"
          className="max-w-full max-h-full rounded-lg shadow-lg"
        />
      </div>
    )}
        {fullImageOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        onClick={() => setFullImageOpen(false)}
      >
        <img
          src={selectedDonation.picture3_url}
          alt="Full View"
          className="max-w-full max-h-full rounded-lg shadow-lg"
        />
      </div>
    )}
        {fullImageOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        onClick={() => setFullImageOpen(false)}
      >
        <img
          src={selectedDonation.picture4_url}
          alt="Full View"
          className="max-w-full max-h-full rounded-lg shadow-lg"
        />
      </div>
    )}
    </>
      )}

      {/* Modal for Editing Donation */}
      {editingDonation && (
  <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-3xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Donation</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-sm">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditingDonation(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition">
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
