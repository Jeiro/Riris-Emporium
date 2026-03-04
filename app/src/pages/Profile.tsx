import { useState } from 'react';
import { User, Mail, Phone, MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { useAuth } from '../hooks';
import { useUIStore } from '../store';
import { userService } from '../services';
import type { ShippingAddress } from '../types';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useUIStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });

  const [newAddress, setNewAddress] = useState<Omit<ShippingAddress, '_id'>>({
    street: '',
    city: '',
    state: '',
    country: 'Nigeria',
    zipCode: '',
    isDefault: false
  });

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(formData);
      addNotification({ type: 'success', message: 'Profile updated successfully' });
      setIsEditing(false);
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to update profile' });
    }
  };

  const handleAddAddress = async () => {
    try {
      await userService.addAddress(newAddress);
      addNotification({ type: 'success', message: 'Address added successfully' });
      setIsAddingAddress(false);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        country: 'Nigeria',
        zipCode: '',
        isDefault: false
      });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to add address' });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await userService.deleteAddress(addressId);
      addNotification({ type: 'success', message: 'Address deleted' });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to delete address' });
    }
  };

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container-custom">
        <h1
          className="text-3xl font-bold text-[#5D3A1A] mb-8"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          My Profile
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E8DFD0] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User className="text-[#8B5A2B]" size={24} />
                  <h2 className="text-xl font-semibold text-[#5D3A1A]">Personal Information</h2>
                </div>
                <button
                  onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                  className="flex items-center gap-2 text-[#8B5A2B] hover:text-[#6B4423] transition-colors"
                >
                  {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#A67B5B] mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-[#5D3A1A] font-medium">{user?.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#A67B5B] mb-1">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-[#5D3A1A] font-medium">{user?.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#A67B5B] mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="text-[#A67B5B]" size={16} />
                    <p className="text-[#5D3A1A]">{user?.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#A67B5B] mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="text-[#A67B5B]" size={16} />
                      <p className="text-[#5D3A1A]">{user?.phone || 'Not provided'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E8DFD0] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="text-[#8B5A2B]" size={24} />
                  <h2 className="text-xl font-semibold text-[#5D3A1A]">Shipping Addresses</h2>
                </div>
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="flex items-center gap-2 text-[#8B5A2B] hover:text-[#6B4423] transition-colors"
                >
                  <Plus size={18} />
                  Add Address
                </button>
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <div className="mb-6 p-4 bg-[#F5F1E8] rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        className="w-4 h-4 text-[#8B5A2B]"
                      />
                      <span className="text-sm text-[#5D3A1A]">Set as default</span>
                    </label>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleAddAddress} className="btn-primary text-sm">
                      Save Address
                    </button>
                    <button
                      onClick={() => setIsAddingAddress(false)}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Address List */}
              <div className="space-y-3">
                {user?.shippingAddresses?.map((address) => (
                  <div
                    key={address._id}
                    className={`p-4 border rounded-lg ${address.isDefault
                        ? 'border-[#8B5A2B] bg-[#F5F1E8]'
                        : 'border-[#E8DFD0]'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[#5D3A1A]">{address.street}</p>
                        <p className="text-[#A67B5B]">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-[#A67B5B]">{address.country}</p>
                        {address.isDefault && (
                          <span className="inline-block mt-2 text-xs bg-[#8B5A2B] text-white px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => address._id && handleDeleteAddress(address._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {(!user?.shippingAddresses || user.shippingAddresses.length === 0) && (
                  <p className="text-center text-[#A67B5B] py-4">
                    No addresses added yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E8DFD0] p-6">
              <h3 className="font-semibold text-[#5D3A1A] mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="/orders" className="block py-2 text-[#A67B5B] hover:text-[#8B5A2B] transition-colors">
                  My Orders
                </a>
                <a href="/wishlist" className="block py-2 text-[#A67B5B] hover:text-[#8B5A2B] transition-colors">
                  Wishlist
                </a>
                <a href="/change-password" className="block py-2 text-[#A67B5B] hover:text-[#8B5A2B] transition-colors">
                  Change Password
                </a>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E8DFD0] p-6">
              <h3 className="font-semibold text-[#5D3A1A] mb-4">Account Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A67B5B]">Member Since</span>
                  <span className="text-[#5D3A1A]">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A67B5B]">Email Verified</span>
                  <span className={user?.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
                    {user?.emailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
