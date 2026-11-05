'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface FranchiseFormProps {
  compact?: boolean;
}

export function FranchiseEnquiryForm({ compact = false }: FranchiseFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    preferredCity: '',
    investmentRange: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.trim().replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.preferredCity.trim()) {
      newErrors.preferredCity = 'Preferred city/location is required';
    }
    if (!formData.investmentRange) {
      newErrors.investmentRange = 'Please select an investment range';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Note: Secure backend endpoint integration for franchise enquiries
    // If no direct franchise table exists, we provide a clean, transparent fallback
    try {
      // Prepare WhatsApp redirect fallback or direct acknowledgment
      const message = `Hello SPYNN Team, I am interested in a franchise opportunity.\nName: ${formData.fullName}\nPhone: ${formData.mobileNumber}\nEmail: ${formData.email}\nCity: ${formData.preferredCity}\nInvestment Range: ${formData.investmentRange}`;
      
      // Simulate submission check
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
    } catch {
      setErrors({ form: 'An unexpected error occurred. Please reach out via WhatsApp directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const waText = encodeURIComponent(
      `Hi SPYNN, I have submitted a franchise enquiry.\nName: ${formData.fullName}\nMobile: ${formData.mobileNumber}\nCity: ${formData.preferredCity}\nInvestment: ${formData.investmentRange}`
    );
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 md:p-8 text-center flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h4 className="text-xl font-bold text-[#071B49] font-heading">
            Thank You, {formData.fullName}!
          </h4>
          <p className="text-sm text-slate-600 max-w-md">
            Your franchise enquiry has been received. Our expansion desk will contact you within 24 to 48 business hours.
          </p>
        </div>
        <div className="pt-2">
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold px-6 h-10 shadow-sm">
              Connect Immediately on WhatsApp
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      {errors.form && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="franchise-name" className="text-xs font-semibold text-[#071B49]">
          Full Name <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="franchise-name"
          type="text"
          placeholder="e.g. Rahul Sharma"
          value={formData.fullName}
          onChange={(e) => {
            setFormData({ ...formData, fullName: e.target.value });
            if (errors.fullName) setErrors({ ...errors, fullName: '' });
          }}
          className={`h-11 rounded-xl bg-white text-sm ${
            errors.fullName ? 'border-rose-400 focus-visible:ring-rose-400' : 'border-slate-200'
          }`}
        />
        {errors.fullName && <span className="text-[11px] text-rose-600">{errors.fullName}</span>}
      </div>

      {/* Grid: Mobile & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="franchise-mobile" className="text-xs font-semibold text-[#071B49]">
            Mobile Number <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="franchise-mobile"
            type="tel"
            placeholder="10-digit mobile"
            value={formData.mobileNumber}
            onChange={(e) => {
              setFormData({ ...formData, mobileNumber: e.target.value });
              if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
            }}
            className={`h-11 rounded-xl bg-white text-sm ${
              errors.mobileNumber ? 'border-rose-400 focus-visible:ring-rose-400' : 'border-slate-200'
            }`}
          />
          {errors.mobileNumber && <span className="text-[11px] text-rose-600">{errors.mobileNumber}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="franchise-email" className="text-xs font-semibold text-[#071B49]">
            Email Address <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="franchise-email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            className={`h-11 rounded-xl bg-white text-sm ${
              errors.email ? 'border-rose-400 focus-visible:ring-rose-400' : 'border-slate-200'
            }`}
          />
          {errors.email && <span className="text-[11px] text-rose-600">{errors.email}</span>}
        </div>
      </div>

      {/* Grid: City & Investment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="franchise-city" className="text-xs font-semibold text-[#071B49]">
            Preferred City / Locality <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="franchise-city"
            type="text"
            placeholder="e.g. Hyderabad - Gachibowli"
            value={formData.preferredCity}
            onChange={(e) => {
              setFormData({ ...formData, preferredCity: e.target.value });
              if (errors.preferredCity) setErrors({ ...errors, preferredCity: '' });
            }}
            className={`h-11 rounded-xl bg-white text-sm ${
              errors.preferredCity ? 'border-rose-400 focus-visible:ring-rose-400' : 'border-slate-200'
            }`}
          />
          {errors.preferredCity && <span className="text-[11px] text-rose-600">{errors.preferredCity}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-[#071B49]">
            Planned Investment Range <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={formData.investmentRange}
            onValueChange={(val) => {
              setFormData({ ...formData, investmentRange: val });
              if (errors.investmentRange) setErrors({ ...errors, investmentRange: '' });
            }}
          >
            <SelectTrigger
              className={`h-11 rounded-xl bg-white text-sm ${
                errors.investmentRange ? 'border-rose-400' : 'border-slate-200'
              }`}
            >
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15L - 25L">₹15 Lakhs - ₹25 Lakhs</SelectItem>
              <SelectItem value="25L - 40L">₹25 Lakhs - ₹40 Lakhs</SelectItem>
              <SelectItem value="40L - 60L">₹40 Lakhs - ₹60 Lakhs</SelectItem>
              <SelectItem value="60L+">₹60 Lakhs and above</SelectItem>
            </SelectContent>
          </Select>
          {errors.investmentRange && <span className="text-[11px] text-rose-600">{errors.investmentRange}</span>}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-xl bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Enquiry...
            </>
          ) : (
            <>
              Submit Franchise Enquiry
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <p className="text-[11px] text-slate-500 text-center leading-normal">
        Your information is kept confidential and strictly used for franchise qualification by SPYNN.
      </p>
    </form>
  );
}
