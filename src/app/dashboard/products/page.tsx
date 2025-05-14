'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { FaEdit, FaTrashAlt, FaPhoneAlt, FaMapMarkerAlt, FaUserAlt, FaSearch } from 'react-icons/fa';


export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [address, setAddress] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const [fullImageOpen, setFullImageOpen] = useState(false);
  // State to track which image is open
const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);


  // Push Notification Sender
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
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('product_listings')
        .select(`
          *,
          owner1_profile:owner1 (
            name,
            profilePicture,
            phone,
            address,
            expo_push_token
          ),
          owner2_profile:owner2 (
            name,
            profilePicture,
            phone,
            address,
            expo_push_token
          )
        `);
      if (error) console.error('Error fetching products:', error);
      else {
        setProducts(data);
        setFilteredProducts(data);  // Initialize filtered products with all fetched products
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('product_listings').delete().eq('id', id);
    if (error) console.error('Error deleting product:', error);
    else {
      setProducts(products.filter((p) => p.id !== id));
      setFilteredProducts(filteredProducts.filter((p) => p.id !== id));  // Update filtered products
    }
  };

  const handleRowClick = (product: any) => {
    setSelectedProduct(product);
  };

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPricePerHour(product.price_per_hour);
    setAddress(product.address);
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    const { error } = await supabase
      .from('product_listings')
      .update({
        name,
        category,
        price_per_hour: pricePerHour,
        address,
      })
      .eq('id', editingProduct.id);

    if (error) console.error('Error updating product:', error);
    else {
      setProducts(products.map((p) =>
        p.id === editingProduct.id ? { ...p, name, category, price_per_hour: pricePerHour, address } : p
      ));
      setFilteredProducts(filteredProducts.map((p) =>
        p.id === editingProduct.id ? { ...p, name, category, price_per_hour: pricePerHour, address } : p
      ));
      setEditingProduct(null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filterProducts = () => {
    if (!searchQuery) {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);
  const approveProduct = async () => {
    if (!selectedProduct) return;

    const { error: updateError } = await supabase
      .from('product_listings')
      .update({ approved: 'yes' })
      .eq('id', selectedProduct.id);

    if (updateError) {
      console.error('Error approving product:', updateError);
      return;
    }

    const notifications = [
      {
        profile_id: selectedProduct.owner1,
        type: 'approval',
        title: 'Product Approved',
        message: `Your product "${selectedProduct.name}" has been approved.`
      },
    ];

    if (selectedProduct.owner2) {
      notifications.push({
        profile_id: selectedProduct.owner2,
        type: 'approval',
        title: 'Product Approved',
        message: `Your shared product "${selectedProduct.name}" has been approved.`
      });
    }

    const { error: notifyError } = await supabase.from('notifications').insert(notifications);
    if (notifyError) console.error('Error sending notifications:', notifyError);

    // Send push notifications
    if (selectedProduct.owner1_profile?.expo_push_token) {
      await sendPushNotification(
        selectedProduct.owner1_profile.expo_push_token,
        'Product Approved',
        `Your product "${selectedProduct.name}" has been approved.`
      );
    }
    if (selectedProduct.owner2_profile?.expo_push_token) {
      await sendPushNotification(
        selectedProduct.owner2_profile.expo_push_token,
        'Product Approved',
        `Your shared product "${selectedProduct.name}" has been approved.`
      );
    }

    const updated = products.map((p) =>
      p.id === selectedProduct.id ? { ...p, approved: 'yes' } : p
    );
    setProducts(updated);
    setFilteredProducts(updated);
    setSelectedProduct({ ...selectedProduct, approved: 'yes' });
  };

  const rejectProduct = async () => {
    if (!selectedProduct) return;

    const { error: updateError } = await supabase
      .from('product_listings')
      .update({ approved: 'no' })
      .eq('id', selectedProduct.id);

    if (updateError) {
      console.error('Error rejecting product:', updateError);
      return;
    }

    const notifications = [
      {
        profile_id: selectedProduct.owner1,
        type: 'rejection',
        title: 'Product Rejected',
        message: `Your product "${selectedProduct.name}" has been rejected.`
      },
    ];

    if (selectedProduct.owner2) {
      notifications.push({
        profile_id: selectedProduct.owner2,
        type: 'rejection',
        title: 'Product Rejected',
        message: `Your shared product "${selectedProduct.name}" has been rejected.`
      });
    }

    const { error: notifyError } = await supabase.from('notifications').insert(notifications);
    if (notifyError) console.error('Error sending notifications:', notifyError);

    // Send push notifications
    if (selectedProduct.owner1_profile?.expo_push_token) {
      await sendPushNotification(
        selectedProduct.owner1_profile.expo_push_token,
        'Product Rejected',
        `Your product "${selectedProduct.name}" has been rejected.`
      );
    }
    if (selectedProduct.owner2_profile?.expo_push_token) {
      await sendPushNotification(
        selectedProduct.owner2_profile.expo_push_token,
        'Product Rejected',
        `Your shared product "${selectedProduct.name}" has been rejected.`
      );
    }

    const updated = products.map((p) =>
      p.id === selectedProduct.id ? { ...p, approved: 'no' } : p
    );
    setProducts(updated);
    setFilteredProducts(updated);
    setSelectedProduct({ ...selectedProduct, approved: 'no' });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Listings</h1>

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
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price/Hour</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, i) => (
              <tr
                key={p.id}
                onClick={() => handleRowClick(p)}
                className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t cursor-pointer hover:bg-gray-100`}
              >
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">Rs: {p.price_per_hour}</td>
                <td className="px-4 py-3">{p.address}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.approved === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.approved === 'yes' ? 'Approved' : 'Not Approved'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center space-x-2">
                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(p); }} className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-1.5 rounded-full">
                    <FaEdit size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded-full">
                    <FaTrashAlt size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Product Details */}
      {selectedProduct && (
      <>
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-3xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Product Details</h2>
            <div className="space-y-6">
                  {/* Product Images */}
                  <div className="flex space-x-4 overflow-x-auto">
                    {['picture1_url', 'picture2_url', 'picture3_url'].map((key) => {
                      const imageUrl = selectedProduct[key];
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
              {/* Owner 1 Details */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex justify-center items-center">
                  {selectedProduct.owner1_profile?.profilePicture ? (
                    <img
                      src={selectedProduct.owner1_profile.profilePicture}
                      alt="Owner 1"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUserAlt size={24} className="text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{selectedProduct.owner1_profile?.name || 'Owner 1'}</p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaPhoneAlt size={14} />
                    <span>{selectedProduct.owner1_profile?.phone || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaMapMarkerAlt size={14} />
                    <span>{selectedProduct.owner1_profile?.address || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Owner 2 Details */}
              {selectedProduct.owner2_profile ? (
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex justify-center items-center">
                    {selectedProduct.owner2_profile.profilePicture ? (
                      <img
                        src={selectedProduct.owner2_profile.profilePicture}
                        alt="Owner 2"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FaUserAlt size={24} className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedProduct.owner2_profile.name}</p>
                    <p className="text-sm text-gray-600 flex items-center space-x-2">
                      <FaPhoneAlt size={14} />
                      <span>{selectedProduct.owner2_profile.phone || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center space-x-2">
                      <FaMapMarkerAlt size={14} />
                      <span>{selectedProduct.owner2_profile.address || 'N/A'}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="italic text-gray-400">No second owner available</div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setSelectedProduct(null)}
               className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition">
                Close
              </button>
              {selectedProduct.approved !== 'yes' ? (
          <button
          onClick={approveProduct}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Approve
        </button>

                ) : (
            <button
              onClick={rejectProduct}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
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
                    src={selectedProduct.picture1_url}
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
                    src={selectedProduct.picture2_url}
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
                    src={selectedProduct.picture3_url}
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
                    src={selectedProduct.picture4_url}
                    alt="Full View"
                    className="max-w-full max-h-full rounded-lg shadow-lg"
                  />
                </div>
              )}
                </>
      )}

      {/* Modal for Editing Product */}
      {editingProduct && (
  <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-3xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Product</h2>
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
                <label className="block mb-1 font-medium text-sm">Price per Hour</label>
                <input type="text" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditingProduct(null)}             className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition">
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
