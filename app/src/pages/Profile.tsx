import { useState } from 'react';
import { User, Mail, Phone, MapPin, Plus, Edit2, Check } from 'lucide-react';
import { useAuth } from '../hooks';
import { useUIStore } from '../store';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useUIStore();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
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
                  disabled aria-describedby="saved-addresses-status"
                  className="flex items-center gap-2 text-[#8B5A2B] hover:text-[#6B4423] transition-colors"
                >
                  <Plus size={18} />
                  Add Address
                </button>
              </div>

              <p id="saved-addresses-status" role="status" className="text-sm text-[#A67B5B]">
                Saved addresses are unavailable. Enter your delivery details at WhatsApp checkout.
              </p>
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
                <p className="block py-2 text-[#A67B5B]">Password changes are unavailable during setup.</p>
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
                    {user?.emailVerified === undefined ? 'Not confirmed' : user.emailVerified ? 'Yes' : 'No'}
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
