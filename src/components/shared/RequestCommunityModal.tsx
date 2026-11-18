'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, Loader2, Building2 } from 'lucide-react';

export function RequestCommunityModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    communityName: '',
    area: '',
    numberOfFlats: '',
    contactPerson: '',
    phone: '',
    email: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/community-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while submitting.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSuccess(false);
      setFormData({
        communityName: '',
        area: '',
        numberOfFlats: '',
        contactPerson: '',
        phone: '',
        email: '',
        notes: '',
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {React.isValidElement(trigger) ? (
        <DialogTrigger render={trigger} />
      ) : trigger ? (
        <DialogTrigger>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button>Request Your Community</Button>} />
      )}
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        {!success ? (
          <div className="p-8 animate-in fade-in duration-200">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" /> Request SPYNN
              </DialogTitle>
              <DialogDescription>
                Enter your community details. Our partnerships team will reach out to your association.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="communityName">Community Name *</Label>
                  <Input id="communityName" name="communityName" required value={formData.communityName} onChange={handleChange} placeholder="e.g. Prestige Heights" className="h-12 bg-white dark:bg-slate-900 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area / Location *</Label>
                  <Input id="area" name="area" required value={formData.area} onChange={handleChange} placeholder="e.g. Gachibowli" className="h-12 bg-white dark:bg-slate-900 border-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Your Name *</Label>
                  <Input id="contactPerson" name="contactPerson" required value={formData.contactPerson} onChange={handleChange} placeholder="John Doe" className="h-12 bg-white dark:bg-slate-900 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfFlats">No. of Flats (Opt)</Label>
                  <Input id="numberOfFlats" name="numberOfFlats" type="number" value={formData.numberOfFlats} onChange={handleChange} placeholder="e.g. 200" className="h-12 bg-white dark:bg-slate-900 border-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="9876543210" className="h-12 bg-white dark:bg-slate-900 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" className="h-12 bg-white dark:bg-slate-900 border-slate-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Any specific requirements or association contact details..." className="resize-none h-24 bg-white dark:bg-slate-900 border-slate-200" />
              </div>

              <Button type="submit" className="w-full h-14 text-lg rounded-full shadow-md hover:shadow-lg transition-all mt-4" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-primary dark:text-white mb-4">Thank you!</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-xs">
              We&apos;ve received your request. Our team will contact your apartment association shortly.
            </p>
            <Button onClick={resetAndClose} variant="outline" className="h-12 px-8 rounded-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
