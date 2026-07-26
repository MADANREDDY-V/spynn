'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    // In a real app with RLS, we'd check if user is authenticated and is admin
    const { data, error } = await supabase
      .from('pickup_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching requests:", error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => 
    req.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.mobile_number.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>;
      case 'confirmed': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Confirmed</Badge>;
      case 'picked_up': return <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">Picked Up</Badge>;
      case 'delivered': return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Delivered</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportCSV = () => {
    const headers = "Booking ID,Name,Phone,Community,Date,Time,Status\n";
    const csvData = filteredRequests.map(r => 
      `${r.booking_id},${r.full_name},${r.mobile_number},${r.landmark},${r.pickup_date},${r.pickup_time},${r.status}`
    ).join("\n");
    
    const blob = new Blob([headers + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spynn_requests_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage pickup requests and operations.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={fetchRequests} disabled={loading}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-4 md:p-6 border-b bg-slate-50 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg">Recent Pickup Requests</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                type="text" 
                placeholder="Search by ID, Name, Phone..." 
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Pickup Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-sm font-medium">{req.booking_id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-primary">{req.full_name}</div>
                      <div className="text-xs text-slate-500">{req.mobile_number}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{req.tower}, {req.flat_number}</div>
                      <div className="text-xs text-slate-500">{req.landmark}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{new Date(req.pickup_date).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500 capitalize">{req.pickup_time}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(req.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    No requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
