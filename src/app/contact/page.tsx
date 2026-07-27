import { siteConfig } from "@/config/site";
import { Phone, MessageCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 min-h-[70vh] flex flex-col justify-center">
      
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary dark:text-white mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          We're here to help. Reach out to our dedicated support team for any inquiries regarding your premium garment care.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
        
        {/* Phone Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-950 hover:shadow-xl transition-all">
          <CardContent className="p-10 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Phone className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">Call Us</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Speak directly with our customer care team.</p>
              <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`} className="w-full block">
                <Button className="w-full h-14 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-md">
                  Call Now
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-950 hover:shadow-xl transition-all">
          <CardContent className="p-10 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">WhatsApp</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Chat with us for quick responses and booking.</p>
              <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-full block">
                <Button className="w-full h-14 text-lg rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md flex items-center justify-center gap-2">
                  Chat Now <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

