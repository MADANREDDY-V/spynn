'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BookPickupPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    alternateMobile: "",
    email: "",
    communityName: "",
    tower: "",
    flatNumber: "",
    pickupDate: "",
    pickupTime: "",
    servicesRequired: "",
    approximateGarments: "",
    specialInstructions: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate a simple booking ID
      const newBookingId = `SPYNN-${Math.floor(100000 + Math.random() * 900000)}`;

      const { data, error } = await supabase
        .from('pickup_requests')
        .insert([
          {
            booking_id: newBookingId,
            full_name: formData.fullName,
            mobile_number: formData.mobileNumber,
            alternate_mobile: formData.alternateMobile,
            email: formData.email,
            tower: formData.tower,
            flat_number: formData.flatNumber,
            landmark: formData.communityName, // Storing community name as landmark if not linked to communities table for now
            pickup_date: formData.pickupDate,
            pickup_time: formData.pickupTime,
            services: [formData.servicesRequired], // Storing as JSON array
            approximate_garments: parseInt(formData.approximateGarments) || null,
            special_instructions: formData.specialInstructions,
            status: 'pending'
          }
        ]);

      if (error) {
        throw error;
      }

      setBookingId(newBookingId);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full border-accent/20 shadow-xl bg-white dark:bg-slate-950 text-center">
          <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-primary dark:text-white">Booking Confirmed!</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Your pickup request has been received. Our team will contact you shortly to confirm the pickup.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 w-full mb-4">
              <p className="text-sm text-slate-500 mb-1">Your Booking ID</p>
              <p className="text-2xl font-mono font-bold tracking-wider text-primary dark:text-white">{bookingId}</p>
            </div>
            <Link href="/" className="w-full">
              <Button className="w-full rounded-full" size="lg">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary dark:text-white mb-4">
          Book a Pickup
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Schedule a pickup from your community in less than a minute. Our premium service comes directly to your door.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-8 pt-8 px-6 md:px-10">
            <CardTitle className="text-2xl">Pickup Details</CardTitle>
            <CardDescription>Fill out the form below and we'll take care of the rest.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary dark:text-white border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number *</Label>
                    <Input id="mobileNumber" name="mobileNumber" type="tel" required value={formData.mobileNumber} onChange={handleChange} placeholder="9876543210" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternateMobile">Alternate Mobile (Optional)</Label>
                    <Input id="alternateMobile" name="alternateMobile" type="tel" value={formData.alternateMobile} onChange={handleChange} placeholder="9876543211" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary dark:text-white border-b pb-2">Address</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="communityName">Community / Society Name *</Label>
                    <Input id="communityName" name="communityName" required value={formData.communityName} onChange={handleChange} placeholder="e.g. Prestige Shantiniketan" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tower">Tower / Block *</Label>
                      <Input id="tower" name="tower" required value={formData.tower} onChange={handleChange} placeholder="e.g. Tower A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flatNumber">Flat / Villa Number *</Label>
                      <Input id="flatNumber" name="flatNumber" required value={formData.flatNumber} onChange={handleChange} placeholder="e.g. 1402" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary dark:text-white border-b pb-2">Pickup & Service</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">Preferred Pickup Date *</Label>
                    <Input id="pickupDate" name="pickupDate" type="date" required value={formData.pickupDate} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupTime">Preferred Time Slot *</Label>
                    <Select onValueChange={(val) => handleSelectChange("pickupTime", val)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                        <SelectItem value="evening">Evening (4 PM - 8 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servicesRequired">Primary Service Needed *</Label>
                    <Select onValueChange={(val) => handleSelectChange("servicesRequired", val)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dry Cleaning">Dry Cleaning</SelectItem>
                        <SelectItem value="Steam Ironing">Steam Ironing</SelectItem>
                        <SelectItem value="Premium Laundry">Premium Laundry</SelectItem>
                        <SelectItem value="Home Furnishing">Sofa / Carpet / Curtain</SelectItem>
                        <SelectItem value="Shoe Cleaning">Shoe Cleaning</SelectItem>
                        <SelectItem value="Multiple Services">Multiple Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approximateGarments">Approximate Number of Garments</Label>
                    <Input id="approximateGarments" name="approximateGarments" type="number" min="1" value={formData.approximateGarments} onChange={handleChange} placeholder="e.g. 5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                  <Textarea 
                    id="specialInstructions" 
                    name="specialInstructions" 
                    value={formData.specialInstructions} 
                    onChange={handleChange} 
                    placeholder="Any specific stains, delicate fabrics, or instructions for the pickup agent..." 
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" size="lg" className="w-full rounded-full h-14 text-lg bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Pickup Request"
                  )}
                </Button>
                <p className="text-center text-xs text-slate-500 mt-4">
                  By submitting this request, you agree to our Terms & Conditions and Privacy Policy.
                </p>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
