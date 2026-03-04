import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  Eye,
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  User,
  ShoppingBag,
  Target,
  Crown,
  MapPin,
  Clock
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { supabase } from '../../lib/supabase';
import {
  Dialog,
  DialogContent,
} from '../../components/ui/dialog';


interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
  lastActive?: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      const mappedUsers: UserData[] = (data || []).map((user: any) => ({
        id: user.id || user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.created_at || user.createdAt,
        orderCount: user.orderCount || 0,
        totalSpent: user.totalSpent || 0,
        lastActive: user.last_active || new Date().toISOString()
      }));
      setUsers(mappedUsers);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setUserDetailOpen(true);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
          <Shield size={12} className="fill-purple-700/10" />
          Administrator
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
        <User size={12} className="fill-blue-700/10" />
        Client
      </span>
    );
  };

  const getUserTier = (spent: number) => {
    if (spent >= 500000) return { label: 'Imperial', color: 'text-amber-600', icon: Crown, bg: 'bg-amber-50' };
    if (spent >= 100000) return { label: 'Sovereign', color: 'text-[#8B5A2B]', icon: Target, bg: 'bg-[#FAF7F2]' };
    return { label: 'Classic', color: 'text-[#A67B5B]', icon: User, bg: 'bg-gray-50' };
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.3em] mb-2">Relationship Management</p>
            <h1 className="text-4xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Client Directory
            </h1>
            <p className="text-[#A67B5B] text-sm mt-1">Manage and nurture your store's growing community.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-[32px] border border-[#E8DFD0] p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B] group-focus-within:text-[#8B5A2B] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by name, email or identification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-[#FAF7F2] border border-[#D4C4A8] rounded-2xl text-[#5D3A1A] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D4C4A8] rounded-2xl overflow-hidden shadow-sm">
                <Filter size={16} className="text-[#8B5A2B]" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="text-xs font-bold text-[#5D3A1A] bg-transparent focus:outline-none cursor-pointer uppercase tracking-widest"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Customers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-[40px] border border-[#E8DFD0] shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-24 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#FAF7F2] border-t-[#8B5A2B] rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest">Synchronizing Directory...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-20 h-20 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-[#D4C4A8]" />
              </div>
              <h3 className="text-xl font-bold text-[#5D3A1A] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Empty Directory</h3>
              <p className="text-[#A67B5B] text-sm">No clients match your current search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#F5F1E8]">
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.2em]">Profile</th>
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.2em]">Tier & Role</th>
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.2em]">Engagement</th>
                    <th className="px-8 py-5 text-left text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.2em]">Joined</th>
                    <th className="px-8 py-5 text-right text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.2em]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F1E8]">
                  {filteredUsers.map((user) => {
                    const tier = getUserTier(user.totalSpent || 0);
                    const TierIcon = tier.icon;
                    return (
                      <tr key={user.id} className="hover:bg-[#FAF7F2]/40 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative flex-shrink-0">
                              <div className="w-full h-full bg-[#8B5A2B] rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#8B5A2B]/10 group-hover:scale-105 transition-transform">
                                {(user.firstName || 'U')[0]}{(user.lastName || '')[0]}
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.emailVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            </div>
                            <div>
                              <p className="font-bold text-[#5D3A1A] text-sm">{user.firstName} {user.lastName}</p>
                              <div className="flex items-center gap-1.5 text-[11px] text-[#A67B5B] mt-0.5">
                                <Mail size={12} />
                                <span>{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            {getRoleBadge(user.role)}
                            <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter ${tier.color} px-2 py-0.5 ${tier.bg} rounded-md w-fit`}>
                              <TierIcon size={10} />
                              {tier.label}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="font-bold text-[#8B5A2B] text-sm">₦{(user.totalSpent || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-[#A67B5B] font-medium">{user.orderCount || 0} Acquisitions</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2.5 text-[#5D3A1A]">
                            <Calendar size={14} className="text-[#A67B5B]" />
                            <span className="text-xs font-semibold">
                              {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="w-10 h-10 bg-white border border-[#E8DFD0] rounded-xl flex items-center justify-center text-[#8B5A2B] hover:bg-[#8B5A2B] hover:text-white transition-all shadow-sm"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Client Profile Drawer (Dialog adapted) */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="max-w-2xl rounded-[40px] border-[#E8DFD0] p-0 overflow-hidden shadow-2xl">
          {selectedUser && (
            <div className="flex flex-col">
              {/* Cover Header */}
              <div className="h-32 bg-gradient-to-r from-[#3B1F0A] to-[#8B5A2B] relative">
                <div className="absolute -bottom-10 left-10">
                  <div className="w-24 h-24 bg-white p-1.5 rounded-[32px] shadow-xl">
                    <div className="w-full h-full bg-[#8B5A2B] rounded-[28px] flex items-center justify-center text-white text-3xl font-bold">
                      {(selectedUser.firstName || 'U')[0]}{(selectedUser.lastName || '')[0]}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-14 px-10 pb-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      {getRoleBadge(selectedUser.role)}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Verified Identity
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest mb-1">Lifetime Value</p>
                    <p className="text-2xl font-black text-[#8B5A2B]">₦{(selectedUser.totalSpent || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-[#FAF7F2] rounded-3xl border border-[#E8DFD0] space-y-4">
                    <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest">Connect</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-[#5D3A1A] font-medium">
                        <Mail size={16} className="text-[#8B5A2B]" />
                        {selectedUser.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#5D3A1A] font-medium">
                        <Phone size={16} className="text-[#8B5A2B]" />
                        {selectedUser.phone || 'No contact provided'}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#5D3A1A] font-medium">
                        <MapPin size={16} className="text-[#8B5A2B]" />
                        Nigeria (Primary)
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#FAF7F2] rounded-3xl border border-[#E8DFD0] space-y-4">
                    <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest">Statistics</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-[#5D3A1A] font-medium">
                          <ShoppingBag size={16} className="text-[#8B5A2B]" />
                          Total Acquisitions
                        </div>
                        <span className="font-bold text-[#5D3A1A]">{selectedUser.orderCount || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-[#5D3A1A] font-medium">
                          <Clock size={16} className="text-[#8B5A2B]" />
                          Member For
                        </div>
                        <span className="font-bold text-[#5D3A1A]">
                          {Math.floor((Date.now() - new Date(selectedUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))} Days
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-[#5D3A1A] font-medium">
                          <Crown size={16} className="text-[#8B5A2B]" />
                          Tier Status
                        </div>
                        <span className="font-bold text-[#8B5A2B]">{getUserTier(selectedUser.totalSpent || 0).label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button className="flex-1 h-14 bg-[#8B5A2B] text-white rounded-2xl font-bold hover:bg-[#6B4423] transition-all shadow-lg shadow-[#8B5A2B]/10">
                    View Complete Order History
                  </button>
                  <button className="h-14 px-6 border border-[#D4C4A8] text-[#5D3A1A] rounded-2xl font-bold hover:bg-[#FAF7F2] transition-all">
                    Edit Role
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

// Helper for checkmark icon missing in imports
const CheckCircle2 = ({ size, className }: { size: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
