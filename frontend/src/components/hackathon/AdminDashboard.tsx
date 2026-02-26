import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Branding } from './Branding';
import {
  Users,
  Shield,
  Activity,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  UserCheck,
  Building,
  Mail,
  LogOut,
  LayoutDashboard,
  Settings,
  Database,
  Download,
  Trash2,
  DollarSign
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Label } from '../ui/label';
import * as XLSX from 'xlsx';

// Define interfaces
interface HostRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Participation {
  hackathonName: string;
  hackathonStartDate: string;
  hackathonEndDate: string;
  submissionDeadline: string;
  teamName: string;
  teamRole: string;
  teamMembers: string;
  submissionStatus: string;
  registrationDate: string;
  selectedTrack: string | number;
}

interface Hackathon {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  organizationName?: string; // For hosts
  joinedAt: string;
  hackathonsCreated?: number; // For hosts
  hackathons?: Hackathon[]; // For hosts
  hackathonsJoined?: number; // For participants
  participations?: Participation[]; // For participants
  onboarded?: boolean;
}

export function AdminDashboard({ userData, onLogout, onBack }: { userData: any; onLogout: () => void; onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [hostRequests, setHostRequests] = useState<HostRequest[]>([]);
  const [hosts, setHosts] = useState<UserData[]>([]);
  const [participants, setParticipants] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    pendingRequests: 0,
    activeHackathons: 0
  });

  // Platform Settings State
  const [creationFee, setCreationFee] = useState<string>('0');
  const [savingSettings, setSavingSettings] = useState(false);

  // User Details Modal State
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [requests, hostsData, participantsData, feeConfig] = await Promise.all([
        api.getAdminHostRequests(),
        api.getAdminHosts(),
        api.getAdminParticipants(),
        api.getSystemConfig('creation_fee')
      ]);

      setHostRequests(requests);
      setHosts(hostsData);
      setParticipants(participantsData);
      setCreationFee(feeConfig.value || '0');

      setStats({
        totalUsers: hostsData.length + participantsData.length,
        totalHosts: hostsData.length,
        pendingRequests: requests.length,
        activeHackathons: 0
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveHost = async (userId: string) => {
    try {
      await api.approveHost(userId);
      toast.success('Host approved successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve host');
    }
  };

  const handleRejectHost = async (userId: string) => {
    try {
      await api.rejectHost(userId);
      toast.success('Host request rejected');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to reject host');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await api.deleteUser(userId);
      toast.success('User deleted successfully');
      setShowUserModal(false);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await api.updateSystemConfig('creation_fee', creationFee, 'Fee charged for creating a new hackathon');
      toast.success('Platform settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Helper to export data to Excel with two sheets
  const exportToExcel = () => {
    if (!hosts.length && !participants.length) {
      toast.error('No data to export');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Sheet 1 - Hosts (with comprehensive data)
    const hostsExportData: any[] = [];

    hosts.forEach(host => {
      if (!host.hackathons || host.hackathons.length === 0) {
        hostsExportData.push({
          'ID': host.id,
          'Name': host.name,
          'Email': host.email,
          'Phone Number': host.phoneNumber || 'N/A',
          'Organization': host.organizationName || 'N/A',
          'Hackathon Name': 'N/A',
          'Hackathon Start Date': 'N/A',
          'Hackathon End Date': 'N/A',
          'Submission Deadline': 'N/A',
          'Hackathons Created': host.hackathonsCreated || 0,
          'Joined At': new Date(host.joinedAt).toLocaleDateString(),
          'Onboarded': host.onboarded ? 'Yes' : 'No'
        });
      } else {
        host.hackathons.forEach((hackathon: Hackathon) => {
          hostsExportData.push({
            'ID': host.id,
            'Name': host.name,
            'Email': host.email,
            'Phone Number': host.phoneNumber || 'N/A',
            'Organization': host.organizationName || 'N/A',
            'Hackathon Name': hackathon.title,
            'Hackathon Start Date': new Date(hackathon.startDate).toLocaleDateString(),
            'Hackathon End Date': new Date(hackathon.endDate).toLocaleDateString(),
            'Submission Deadline': hackathon.submissionDeadline ? new Date(hackathon.submissionDeadline).toLocaleDateString() : 'N/A',
            'Hackathons Created': host.hackathonsCreated || 0,
            'Joined At': new Date(host.joinedAt).toLocaleDateString(),
            'Onboarded': host.onboarded ? 'Yes' : 'No'
          });
        });
      }
    });

    const hostsSheet = XLSX.utils.json_to_sheet(hostsExportData);
    XLSX.utils.book_append_sheet(workbook, hostsSheet, 'Hosts');

    // Sheet 2 - Participants (with payment + team member details)
    const participantsExportData: any[] = [];

    participants.forEach(p => {
      if (!p.participations || p.participations.length === 0) {
        participantsExportData.push({
          'ID': p.id,
          'Name': p.name,
          'Email': p.email,
          'Phone Number': p.phoneNumber || 'N/A',
          'Hackathon Name': 'N/A',
          'Team Name': 'N/A',
          'Team Role': 'N/A',
          'Track': 'N/A',
          'Registration Date': 'N/A',
          'Hackathon Start Date': 'N/A',
          'Hackathon End Date': 'N/A',
          'Submission Deadline': 'N/A',
          'Submission Status': 'Not Submitted',
          'Joined At': new Date(p.joinedAt).toLocaleDateString(),
          // Payment columns
          'Payment ID': 'N/A',
          'Payment Invoice': 'N/A',
          'Payment Amount (₹)': 'N/A',
          'Payment Status': 'N/A',
          'Payment Date': 'N/A',
          'Payment Method': 'N/A',
          // Team member columns
          'Team Members': 'N/A',
        });
      } else {
        p.participations.forEach((part: Participation) => {
          participantsExportData.push({
            'ID': p.id,
            'Name': p.name,
            'Email': p.email,
            'Phone Number': p.phoneNumber || 'N/A',
            'Hackathon Name': part.hackathonName || 'N/A',
            'Team Name': part.teamName || 'Individual',
            'Team Role': part.teamRole || 'N/A',
            'Track': part.selectedTrack || 'N/A',
            'Registration Date': part.registrationDate ? new Date(part.registrationDate).toLocaleDateString() : 'N/A',
            'Hackathon Start Date': part.hackathonStartDate ? new Date(part.hackathonStartDate).toLocaleDateString() : 'N/A',
            'Hackathon End Date': part.hackathonEndDate ? new Date(part.hackathonEndDate).toLocaleDateString() : 'N/A',
            'Submission Deadline': part.submissionDeadline ? new Date(part.submissionDeadline).toLocaleDateString() : 'N/A',
            'Submission Status': part.submissionStatus || 'Not Submitted',
            'Joined At': new Date(p.joinedAt).toLocaleDateString(),
            // Payment columns (NEW)
            'Payment ID': (part as any).paymentId || 'N/A',
            'Payment Invoice': (part as any).paymentInvoiceId || 'N/A',
            'Payment Amount (₹)': (part as any).paymentAmount ?? 'N/A',
            'Payment Status': (part as any).paymentStatus || 'N/A',
            'Payment Date': (part as any).paymentDate ? new Date((part as any).paymentDate).toLocaleDateString() : 'N/A',
            'Payment Method': (part as any).paymentMethod || 'N/A',
            // Team member columns (NEW)
            'Team Members': part.teamMembers || 'N/A',
          });
        });
      }
    });

    const participantsSheet = XLSX.utils.json_to_sheet(participantsExportData);
    XLSX.utils.book_append_sheet(workbook, participantsSheet, 'Participants');

    XLSX.writeFile(workbook, `Admin_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file exported successfully with Hosts and Participants sheets');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <Branding size="sm" />
          <div className="mt-2 text-xs text-slate-500 uppercase tracking-wider font-semibold">Admin Console</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Button
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'overview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'hosts' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'hosts' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            onClick={() => setActiveTab('hosts')}
          >
            <Building className="w-4 h-4 mr-3" />
            Hosts
          </Button>
          <Button
            variant={activeTab === 'participants' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'participants' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            onClick={() => setActiveTab('participants')}
          >
            <Users className="w-4 h-4 mr-3" />
            Participants
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="w-4 h-4 mr-3" />
            Platform Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{userData.firstName}</p>
              <p className="text-xs text-slate-500 truncate">{userData.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-400 mt-2">Welcome back, Administrator. Here's what's happening today.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Total Users</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Pending Host Requests</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.pendingRequests}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Active Hosts</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.totalHosts}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Requests */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  Recent Host Requests
                </h2>
                {hostRequests.length === 0 ? (
                  <Card className="p-8 bg-slate-900 border-slate-800 text-center">
                    <CheckCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400">No pending requests</p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {hostRequests.map((request) => (
                      <Card key={request.id} className="p-6 bg-slate-900 border-slate-800 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{request.name}</h3>
                          <p className="text-sm text-slate-400">{request.email}</p>
                          <p className="text-xs text-slate-500 mt-1">Requested: {new Date(request.requestedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveHost(request.id)}
                            className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRejectHost(request.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'hosts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Host Directory</h1>
                  <p className="text-slate-400 mt-2">Manage all registered event organizers.</p>
                </div>
                <Button variant="outline" className="border-green-600 bg-green-600 text-white hover:bg-green-700 hover:border-green-700" onClick={exportToExcel}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>

              <div className="space-y-3 mt-6">
                {hosts.map((host) => (
                  <Card key={host.id} className="p-5 bg-slate-900 border-slate-800">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <h3 className="font-semibold text-white text-sm">{host.name}</h3>
                        {host.organizationName && (
                          <p className="text-xs text-blue-400 mt-1">{host.organizationName}</p>
                        )}
                      </div>
                      <div className="col-span-3">
                        <p className="text-sm text-slate-300">{host.email}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-sm font-medium text-slate-300">{host.hackathonsCreated || 0} Hackathons</p>
                        <p className="text-xs text-slate-500">Joined {new Date(host.joinedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="col-span-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-white hover:bg-slate-800"
                          onClick={() => {
                            setSelectedUser(host);
                            setShowUserModal(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Participant Directory</h1>
                  <p className="text-slate-400 mt-2">Manage registered hackathon participants.</p>
                </div>
                <Button variant="outline" className="border-green-600 bg-green-600 text-white hover:bg-green-700 hover:border-green-700" onClick={exportToExcel}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>

              <div className="space-y-3 mt-6">
                {participants.map((participant) => (
                  <Card key={participant.id} className="p-5 bg-slate-900 border-slate-800">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <h3 className="font-semibold text-white text-sm">{participant.name}</h3>
                      </div>
                      <div className="col-span-3">
                        <p className="text-sm text-slate-300">{participant.email}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-sm font-medium text-slate-300">{participant.hackathonsJoined || 0} Joined</p>
                        <p className="text-xs text-slate-500">Joined {new Date(participant.joinedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="col-span-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-white hover:bg-slate-800"
                          onClick={() => {
                            setSelectedUser(participant);
                            setShowUserModal(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Platform Settings</h1>
                <p className="text-slate-400 mt-2">Configure system-wide settings and fees.</p>
              </div>

              <Card className="p-8 bg-slate-900 border-slate-800 max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      Hackathon Creation Fee
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Set the fee charged to hosts when creating a new hackathon.
                    </p>
                  </div>

                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="creation_fee" className="text-slate-300 mb-2 block">Fee Amount (INR)</Label>
                      <Input
                        id="creation_fee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={creationFee}
                        onChange={(e) => setCreationFee(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {savingSettings ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">User Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowUserModal(false)}>
                  <XCircle className="w-6 h-6 text-slate-400" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500 text-xs uppercase tracking-wider">Full Name</Label>
                    <p className="text-white font-medium text-lg">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs uppercase tracking-wider">Role</Label>
                    <Badge variant="outline" className="mt-1 border-slate-700 text-blue-400">{selectedUser.role}</Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">Email Address</Label>
                  <p className="text-white font-medium">{selectedUser.email}</p>
                </div>

                <div>
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">User ID</Label>
                  <p className="text-slate-400 font-mono text-xs bg-slate-950 p-2 rounded border border-slate-800 mt-1 select-all">{selectedUser.id}</p>
                </div>

                {selectedUser.organizationName && (
                  <div>
                    <Label className="text-slate-500 text-xs uppercase tracking-wider">Organization</Label>
                    <p className="text-white font-medium">{selectedUser.organizationName}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Joined on {new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                      onClick={() => handleDeleteUser(selectedUser.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}