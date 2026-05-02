import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store';
import { Users, Store, Plus, X, Edit, Trash2, Search, Shield, ShoppingBag, BarChart3 } from 'lucide-react';

interface User {
  User_ID: number;
  User_FName: string;
  User_LName: string;
  User_Email: string;
  User_PhoneNum: string;
  User_Role: string;
  User_Address: string;
}

interface Store {
  Store_ID: number;
  Store_Name: string;
  Store_City: string;
  Store_Loc: string;
  Store_ContactNum: string;
  Store_OwnerID: number;
  Store_Status: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [userForm, setUserForm] = useState({
    User_FName: '', User_LName: '', User_Email: '', User_PhoneNum: '', User_Address: '', User_Role: 'CUSTOMER', User_Password: ''
  });
  const [storeForm, setStoreForm] = useState({
    Store_Name: '', Store_City: '', Store_Loc: '', Store_ContactNum: '', Store_OwnerID: '', Store_Status: 'ACTIVE'
  });

  useEffect(() => {
    console.log('[Admin] Active tab:', activeTab);
    console.log('[Admin] Current user:', useAuthStore.getState().user);
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data?.data || []);
      } else {
        const res = await api.get('/admin/stores');
        setStores(res.data?.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch data:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.User_ID}`, userForm);
      } else {
        await api.post('/admin/users', userForm);
      }
      fetchData();
      closeUserModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.User_ID !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSaveStore = async () => {
    try {
      const payload = {
        ...storeForm,
        Store_OwnerID: parseInt(storeForm.Store_OwnerID)
      };
      if (editingStore) {
        await api.put(`/admin/stores/${editingStore.Store_ID}`, payload);
      } else {
        await api.post('/admin/stores', payload);
      }
      fetchData();
      closeStoreModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save store');
    }
  };

  const handleDeleteStore = async (id: number) => {
    if (!confirm('Delete this store? This will also delete all associated products.')) return;
    try {
      await api.delete(`/admin/stores/${id}`);
      setStores(stores.filter(s => s.Store_ID !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete store');
    }
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      User_FName: user.User_FName,
      User_LName: user.User_LName,
      User_Email: user.User_Email,
      User_PhoneNum: user.User_PhoneNum || '',
      User_Address: user.User_Address || '',
      User_Role: user.User_Role,
      User_Password: ''
    });
    setShowUserModal(true);
  };

  const openEditStore = (store: Store) => {
    setEditingStore(store);
    setStoreForm({
      Store_Name: store.Store_Name,
      Store_City: store.Store_City,
      Store_Loc: store.Store_Loc,
      Store_ContactNum: store.Store_ContactNum || '',
      Store_OwnerID: store.Store_OwnerID.toString(),
      Store_Status: store.Store_Status
    });
    setShowStoreModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ User_FName: '', User_LName: '', User_Email: '', User_PhoneNum: '', User_Address: '', User_Role: 'CUSTOMER', User_Password: '' });
  };

  const closeStoreModal = () => {
    setShowStoreModal(false);
    setEditingStore(null);
    setStoreForm({ Store_Name: '', Store_City: '', Store_Loc: '', Store_ContactNum: '', Store_OwnerID: '', Store_Status: 'ACTIVE' });
  };

  const filteredUsers = users.filter(u => 
    `${u.User_FName} ${u.User_LName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.User_Email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStores = stores.filter(s => 
    s.Store_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Store_City.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-500' },
    { label: 'Total Stores', value: stores.length, icon: Store, color: 'bg-green-50 text-green-500' },
    { label: 'Active Stores', value: stores.filter(s => s.Store_Status === 'OPEN').length, icon: ShoppingBag, color: 'bg-orange-50 text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">Admin Panel</p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#333333]">System Management</h1>
          <p className="mt-2 font-medium text-[#777777]">Manage users and stores across the platform.</p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="soft-card rounded-2xl p-5">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-[#777777]">{stat.label}</p>
              <p className="mt-1 text-3xl font-extrabold text-[#333333]">{stat.value}</p>
            </div>
          );
        })}
      </section>

      <div className="soft-card overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {[
              { label: 'Users', icon: Users, tab: 'users' },
              { label: 'Stores', icon: Store, tab: 'stores' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 font-extrabold transition-all ${
                    activeTab === item.tab
                      ? 'app-gradient text-white'
                      : 'text-[#777777] hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-sm font-medium outline-none focus:border-orange-400"
              />
            </div>
            <button
              onClick={() => activeTab === 'users' ? closeUserModal() : closeStoreModal()}
              className="pressable app-gradient flex items-center gap-2 rounded-xl px-4 py-2 font-extrabold text-white"
            >
              <Plus className="h-4 w-4" />
              Add {activeTab === 'users' ? 'User' : 'Store'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-gray-100" />)}
          </div>
        ) : activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-gray-50 text-sm font-extrabold text-[#777777]">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.User_ID} className="bg-white">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-extrabold text-[#333333]">{user.User_FName} {user.User_LName}</p>
                        <p className="text-sm text-[#777777]">{user.User_Address || 'No address'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#777777]">{user.User_Email}</td>
                    <td className="px-5 py-4 font-medium text-[#777777]">{user.User_PhoneNum || '-'}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
                        user.User_Role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.User_Role === 'STORE_OWNER' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.User_Role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditUser(user)} className="rounded-lg p-2 hover:bg-gray-100">
                          <Edit className="h-4 w-4 text-orange-500" />
                        </button>
                        <button onClick={() => handleDeleteUser(user.User_ID)} className="rounded-lg p-2 hover:bg-gray-100">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center font-semibold text-[#777777]">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-gray-50 text-sm font-extrabold text-[#777777]">
                <tr>
                  <th className="px-5 py-4">Store</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Owner ID</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStores.map((store) => (
                  <tr key={store.Store_ID} className="bg-white">
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-[#333333]">{store.Store_Name}</p>
                      <p className="text-sm text-[#777777]">{store.Store_City}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#777777]">{store.Store_Loc || '-'}</td>
                    <td className="px-5 py-4 font-medium text-[#777777]">{store.Store_ContactNum || '-'}</td>
                    <td className="px-5 py-4 font-medium text-[#777777]">{store.Store_OwnerID}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
                        store.Store_Status === 'OPEN' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {store.Store_Status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditStore(store)} className="rounded-lg p-2 hover:bg-gray-100">
                          <Edit className="h-4 w-4 text-orange-500" />
                        </button>
                        <button onClick={() => handleDeleteStore(store.Store_ID)} className="rounded-lg p-2 hover:bg-gray-100">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStores.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center font-semibold text-[#777777]">No stores found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="soft-card w-full max-w-md rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#333333]">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={closeUserModal} className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">First Name</label>
                  <input
                    type="text"
                    value={userForm.User_FName}
                    onChange={(e) => setUserForm({ ...userForm, User_FName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">Last Name</label>
                  <input
                    type="text"
                    value={userForm.User_LName}
                    onChange={(e) => setUserForm({ ...userForm, User_LName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#777777]">Email</label>
                <input
                  type="email"
                  value={userForm.User_Email}
                  onChange={(e) => setUserForm({ ...userForm, User_Email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">Password</label>
                  <input
                    type="password"
                    value={userForm.User_Password}
                    onChange={(e) => setUserForm({ ...userForm, User_Password: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">Phone</label>
                  <input
                    type="text"
                    value={userForm.User_PhoneNum}
                    onChange={(e) => setUserForm({ ...userForm, User_PhoneNum: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">Role</label>
                  <select
                    value={userForm.User_Role}
                    onChange={(e) => setUserForm({ ...userForm, User_Role: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#777777]">Address</label>
                <input
                  type="text"
                  value={userForm.User_Address}
                  onChange={(e) => setUserForm({ ...userForm, User_Address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={closeUserModal} className="flex-1 rounded-xl border-2 border-gray-200 py-3 font-extrabold text-[#777777]">
                Cancel
              </button>
              <button onClick={handleSaveUser} className="flex-1 app-gradient rounded-xl py-3 font-extrabold text-white">
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="soft-card w-full max-w-md rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#333333]">
                {editingStore ? 'Edit Store' : 'Add New Store'}
              </h3>
              <button onClick={closeStoreModal} className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-[#777777]">Store Name</label>
                <input
                  type="text"
                  value={storeForm.Store_Name}
                  onChange={(e) => setStoreForm({ ...storeForm, Store_Name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">City</label>
                  <input
                    type="text"
                    value={storeForm.Store_City}
                    onChange={(e) => setStoreForm({ ...storeForm, Store_City: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">Status</label>
                  <select
                    value={storeForm.Store_Status}
                    onChange={(e) => setStoreForm({ ...storeForm, Store_Status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#777777]">Location</label>
                <input
                  type="text"
                  value={storeForm.Store_Loc}
                  onChange={(e) => setStoreForm({ ...storeForm, Store_Loc: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">Contact Number</label>
                  <input
                    type="text"
                    value={storeForm.Store_ContactNum}
                    onChange={(e) => setStoreForm({ ...storeForm, Store_ContactNum: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">Owner ID</label>
                  <input
                    type="number"
                    value={storeForm.Store_OwnerID}
                    onChange={(e) => setStoreForm({ ...storeForm, Store_OwnerID: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={closeStoreModal} className="flex-1 rounded-xl border-2 border-gray-200 py-3 font-extrabold text-[#777777]">
                Cancel
              </button>
              <button onClick={handleSaveStore} className="flex-1 app-gradient rounded-xl py-3 font-extrabold text-white">
                {editingStore ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
