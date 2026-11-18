'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Phone,
  MessageCircle,
  MapPin,
  Lock,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import initialCommunities from '@/data/communities.json';

interface CommunityItem {
  id: string;
  slug: string;
  name: string;
  location: string;
  assignedStore: string;
  phone?: string;
  whatsapp?: string;
  storeAddress?: string;
  isActive: boolean;
  status: string;
  services: string[];
  estimatedPickup: string;
}

const STORE_OPTIONS = [
  'Narsingi Studio',
  'Kokapet Studio',
  'Chandanagar Studio',
];

export default function CommunityAdminPage() {
  // Simple admin auth gate
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Communities state
  const [communities, setCommunities] = useState<CommunityItem[]>(() =>
    (initialCommunities as any[]).map((c) => ({
      ...c,
      assignedStore: c.assignedStore || 'Narsingi Studio',
      isActive: c.isActive !== false,
      status: c.status || 'Currently Serving',
      services: c.services || [
        'Dry Cleaning',
        'Steam Ironing',
        'Wash & Fold',
        'Shoe Cleaning',
      ],
      estimatedPickup: c.estimatedPickup || 'Same Day Collection',
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [editingCommunity, setEditingCommunity] = useState<CommunityItem | null>(null);
  const [previewCommunity, setPreviewCommunity] = useState<CommunityItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    assignedStore: STORE_OPTIONS[0],
    phone: '',
    whatsapp: '',
    storeAddress: '',
    isActive: true,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin pass code for development/initial access
    if (passcode === 'spynn2026' || passcode === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid administrator pass code. Please try again.');
    }
  };

  const filteredCommunities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return communities;
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.assignedStore.toLowerCase().includes(q)
    );
  }, [communities, searchQuery]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      location: '',
      assignedStore: STORE_OPTIONS[0],
      phone: '',
      whatsapp: '',
      storeAddress: '',
      isActive: true,
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (comm: CommunityItem) => {
    setEditingCommunity(comm);
    setFormData({
      name: comm.name,
      location: comm.location,
      assignedStore: comm.assignedStore,
      phone: comm.phone || '',
      whatsapp: comm.whatsapp || '',
      storeAddress: comm.storeAddress || '',
      isActive: comm.isActive,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) return;

    if (editingCommunity) {
      // Update existing
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === editingCommunity.id
            ? {
                ...c,
                name: formData.name.trim(),
                location: formData.location.trim(),
                assignedStore: formData.assignedStore,
                phone: formData.phone.trim() || undefined,
                whatsapp: formData.whatsapp.trim() || undefined,
                storeAddress: formData.storeAddress.trim() || undefined,
                isActive: formData.isActive,
              }
            : c
        )
      );
      setEditingCommunity(null);
    } else {
      // Create new
      const newId = `c_${Date.now()}`;
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const newRecord: CommunityItem = {
        id: newId,
        slug,
        name: formData.name.trim(),
        location: formData.location.trim(),
        assignedStore: formData.assignedStore,
        phone: formData.phone.trim() || undefined,
        whatsapp: formData.whatsapp.trim() || undefined,
        storeAddress: formData.storeAddress.trim() || undefined,
        isActive: formData.isActive,
        status: 'Currently Serving',
        services: ['Dry Cleaning', 'Steam Ironing', 'Wash & Fold', 'Shoe Cleaning'],
        estimatedPickup: 'Same Day Collection',
      };

      setCommunities((prev) => [newRecord, ...prev]);
      setIsCreateOpen(false);
    }
  };

  const handleToggleActive = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this community from the directory?')) {
      setCommunities((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Auth Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F3F7FC] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl border-slate-200 shadow-xl bg-white p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#0866C5]/10 flex items-center justify-center text-[#0866C5]">
              <Lock className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#071B49] font-heading">
                Community Directory Admin
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your SPYNN administrative pass code to manage residential community directory.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 mt-2">
              {authError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                  {authError}
                </div>
              )}
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="passcode" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Admin Pass Code
                </Label>
                <Input
                  id="passcode"
                  type="password"
                  placeholder="Enter administrator pass code"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="h-12 rounded-xl border-slate-200"
                  autoFocus
                />
                <span className="text-[11px] text-slate-400">Default access code: spynn2026</span>
              </div>
              <Button type="submit" className="h-12 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-sm">
                Unlock Directory Admin
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F7FC] pb-24 pt-24 md:pt-32">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Directory Control Panel
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#071B49] font-heading">
              Community Directory Management
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Add, update, or assign SPYNN studios to gated residential communities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/communities">
              <Button variant="outline" className="rounded-full text-xs font-semibold h-11 border-slate-200 text-[#071B49] hover:bg-white">
                <Eye className="h-4 w-4 mr-1.5" /> View Public Page
              </Button>
            </Link>
            <Button
              onClick={handleOpenCreate}
              className="rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-xs h-11 px-5 shadow-xs"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add New Community
            </Button>
          </div>
        </div>

        {/* Search & Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Filter by community name, area, or assigned store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-2xl bg-white border-slate-200 text-sm"
            />
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Listed</span>
            <span className="text-xl font-black text-[#071B49] font-heading">{communities.length}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Active Serving</span>
            <span className="text-xl font-black text-emerald-600 font-heading">
              {communities.filter((c) => c.isActive).length}
            </span>
          </div>
        </div>

        {/* Communities Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Community Name</th>
                  <th className="py-4 px-6">Area / Locality</th>
                  <th className="py-4 px-6">Assigned SPYNN Store</th>
                  <th className="py-4 px-6">Direct WhatsApp</th>
                  <th className="py-4 px-6">Direct Phone</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCommunities.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#071B49]">
                      {c.name}
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 font-normal">slug: {c.slug}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-[#F3F7FC] text-[#071B49] font-medium text-[11px]">
                        {c.location}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#0866C5]">
                      {c.assignedStore}
                    </td>
                    <td className="py-4 px-6">
                      {c.whatsapp ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {c.whatsapp}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not configured</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {c.phone ? (
                        <span className="text-slate-700 font-medium flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-[#0866C5]" />
                          {c.phone}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not configured</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase transition-colors ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-slate-400" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewCommunity(c)}
                          className="h-8 px-2 text-slate-500 hover:text-[#0866C5]"
                          title="Customer Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(c)}
                          className="h-8 px-2 text-slate-500 hover:text-[#0866C5]"
                          title="Edit Community"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(c.id)}
                          className="h-8 px-2 text-slate-400 hover:text-red-600"
                          title="Delete Community"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add / Edit Community Modal */}
      <Dialog
        open={isCreateOpen || Boolean(editingCommunity)}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingCommunity(null);
          }
        }}
      >
        <DialogContent className="max-w-lg rounded-3xl bg-white p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#071B49] font-heading">
              {editingCommunity ? 'Edit Community' : 'Add New Community'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure society details, assigned studio, and optional phone/WhatsApp contacts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Community / Society Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                required
                placeholder="e.g. Hallmark Skyrena"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Area / Locality <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  required
                  placeholder="e.g. Puppalaguda"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignedStore" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assigned SPYNN Store <span className="text-red-500">*</span>
                </Label>
                <select
                  id="assignedStore"
                  value={formData.assignedStore}
                  onChange={(e) => setFormData({ ...formData, assignedStore: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-[#071B49] focus:outline-none"
                >
                  {STORE_OPTIONS.map((store) => (
                    <option key={store} value={store}>
                      {store}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="whatsapp" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  WhatsApp Number (Optional)
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="e.g. 919866635661"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="h-11 rounded-xl border-slate-200"
                />
                <span className="text-[10px] text-slate-400">Leave blank if unavailable</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Phone Number (Optional)
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g. +91 98666 35661"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 rounded-xl border-slate-200"
                />
                <span className="text-[10px] text-slate-400">Leave blank if unavailable</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeAddress" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Optional Store / Society Collection Point
              </Label>
              <Input
                id="storeAddress"
                placeholder="e.g. Main Gate Society Valet Desk"
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-[#0866C5]"
              />
              <Label htmlFor="isActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Active in Customer Directory (Serving doorstep pickup)
              </Label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCommunity(null);
                }}
                className="rounded-full text-xs font-semibold h-10 px-5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white text-xs font-bold h-10 px-6"
              >
                {editingCommunity ? 'Save Changes' : 'Create Community'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Live Customer Preview Modal */}
      <Dialog
        open={Boolean(previewCommunity)}
        onOpenChange={(open) => {
          if (!open) setPreviewCommunity(null);
        }}
      >
        <DialogContent className="max-w-md rounded-3xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-[#071B49] font-heading">
              Customer Card Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              This is how residents see this community in the directory:
            </DialogDescription>
          </DialogHeader>

          {previewCommunity && (
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-md p-6 flex flex-col gap-4 mt-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#F3F7FC] text-[#0866C5] flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {previewCommunity.location}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Active Doorstep Service
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#071B49] font-heading">
                  {previewCommunity.name}
                </h3>
                <div className="mt-2 p-3 rounded-xl bg-[#F3F7FC] border border-slate-100 flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Assigned SPYNN Store
                  </span>
                  <span className="font-bold text-[#071B49] text-xs">
                    {previewCommunity.assignedStore}
                  </span>
                  {previewCommunity.storeAddress && (
                    <span className="text-[11px] text-slate-500">{previewCommunity.storeAddress}</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                {previewCommunity.whatsapp || previewCommunity.phone ? (
                  <div className="grid grid-cols-2 gap-2">
                    {previewCommunity.whatsapp && (
                      <Button className="w-full rounded-xl bg-[#25D366] text-white text-xs font-semibold h-10 shadow-xs pointer-events-none">
                        <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
                      </Button>
                    )}
                    {previewCommunity.phone && (
                      <Button variant="outline" className="w-full rounded-xl border-slate-200 text-xs font-semibold h-10 text-[#071B49] pointer-events-none">
                        <Phone className="h-3.5 w-3.5 mr-1 text-[#0866C5]" /> Call Store
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-xs text-center border border-slate-100">
                    Direct store line setup in progress. Contact central care at +91 98666 35661.
                  </div>
                )}
              </div>
            </Card>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
