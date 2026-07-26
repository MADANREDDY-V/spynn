import { siteConfig } from "@/config/site";
import { MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary dark:text-white mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          We're here to help. Reach out to our dedicated support team for any inquiries regarding your premium garment care.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-20">
        
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">Get in Touch</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Whether you have a question about our services, need help with a booking, or want to partner with us for your society, our team is ready to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-none shadow-md bg-white dark:bg-slate-950">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary dark:text-white mb-1">Phone</h3>
                  <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`} className="text-slate-600 dark:text-slate-400 hover:text-accent transition-colors block">
                    {siteConfig.contact.phone}
                  </a>
                  {siteConfig.contact.emergencyContact && (
                    <a href={`tel:${siteConfig.contact.emergencyContact.replace(/\s+/g, '')}`} className="text-sm text-slate-500 hover:text-accent transition-colors block mt-1">
                      Emergency: {siteConfig.contact.emergencyContact}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white dark:bg-slate-950">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary dark:text-white mb-1">Email</h3>
                  <a href={`mailto:${siteConfig.contact.email}`} className="text-slate-600 dark:text-slate-400 hover:text-accent transition-colors">
                    {siteConfig.contact.email}
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white dark:bg-slate-950">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary dark:text-white mb-1">WhatsApp</h3>
                  <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-[#25D366] transition-colors flex items-center gap-1">
                    Chat with SPYNN <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white dark:bg-slate-950">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary dark:text-white mb-1">Working Hours</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {siteConfig.contact.workingHours}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Form */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950 rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="9866654304" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="How can we help you?" className="min-h-[120px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
              <Button type="button" className="w-full h-12 text-base rounded-full bg-primary hover:bg-primary/90">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>

      {/* Map Section */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-2 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-accent" />
              Our Studio
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {siteConfig.contact.address}
            </p>
          </div>
          <Button variant="outline" className="rounded-full">Get Directions</Button>
        </div>
        <div className="w-full h-[400px] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-inner">
          {/* Mock Google Maps Embed */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1139.7346369066667!2d77.6409!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzgnMjcuMiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy"
            title="SPYNN Studio Location"
          ></iframe>
        </div>
      </div>

    </div>
  );
}
