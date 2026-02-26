import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Branding } from './Branding';
import {
  Home,
  Trophy,
  FileText,
  Bell,
  User,
  LogOut,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  ChevronRight,
  ArrowLeft,
  Plus,
  Users,
  BarChart3,
  Settings,
  Brain,
  Briefcase,
  Gavel,
  CheckSquare,
  Loader2,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  MessageSquare,
  Upload,
  X,
  CreditCard,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Card3D } from '../ui/Card3D';
import { Button3D } from '../ui/Button3D';
import { MyHackathons } from './MyHackathons';
import { MySubmissions } from './MySubmissions';
import { Leaderboard } from './Leaderboard';
import { ProjectSubmission } from './ProjectSubmission';
import { ExploreHackathons } from './ExploreHackathons';
import { HackathonDetailsModal } from './HackathonDetailsModal';
import { SubmissionDetailsModal } from './SubmissionDetailsModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api } from '../../utils/api';
import { SimpleParticipantsPage } from './SimpleParticipantsPage';
import { CreateHackathonForm } from './OrganizerDashboard';
import { PaymentHistory } from './PaymentHistory';
import { toast } from 'sonner';

// ParticipantHackathons Component - Shows registered hackathons first, then available ones
function ParticipantHackathons({
  userId,
  onStartProject
}: {
  userId?: string;
  onStartProject?: (hackathonId: string, submissionId?: string) => void;
}) {
  const [registeredHackathons, setRegisteredHackathons] = useState<any[]>([]);
  const [availableHackathons, setAvailableHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHackathons();
  }, [userId]);

  const fetchHackathons = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching hackathons for user:', userId);

      // Fetch registered hackathons
      const myHackathons = await api.getMyHackathons();
      console.log('✅ My hackathons:', myHackathons);
      setRegisteredHackathons(myHackathons);

      // Fetch all available hackathons
      const allHackathons = await api.getHackathons();
      console.log('✅ All hackathons:', allHackathons);

      // Filter out already registered hackathons
      const registeredIds = new Set(myHackathons.map((h: any) => h.id));
      const available = allHackathons.filter((h: any) => !registeredIds.has(h.id));
      setAvailableHackathons(available);

      console.log('📊 Hackathons loaded:', {
        registered: myHackathons.length,
        available: available.length
      });
    } catch (error: any) {
      console.error('❌ Error fetching hackathons:', error);
      setError(error.message || 'Failed to load hackathons');
      toast.error('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistered = registeredHackathons.filter((h: any) =>
    h.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailable = availableHackathons.filter((h: any) =>
    h.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (hackathonId: string) => {
    setSelectedHackathonId(hackathonId);
    setIsDetailsModalOpen(true);
  };

  const renderHackathonCard = (hackathon: any, isRegistered: boolean = false) => (
    <motion.div
      key={hackathon.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600/80 hover:border-blue-400 hover:border-4 transition-all duration-300 overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-blue-400/50 hover:from-blue-800/40 hover:to-slate-800/90 hover:scale-[1.03] transform hover:bg-blue-900/20 relative hover:ring-4 hover:ring-blue-400/30">
        <div className="p-6 bg-slate-800/80 backdrop-blur-sm group-hover:bg-blue-800/30 transition-all duration-300 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {hackathon.title}
                  </h3>
                  {isRegistered && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1 shadow-lg">
                      ✓ Registered
                    </Badge>
                  )}
                </div>
                <p className="text-white text-sm mb-4 line-clamp-2 leading-relaxed">
                  {hackathon.description}
                </p>
              </div>
              <Badge className={`ml-4 px-3 py-1 font-semibold ${hackathon.status === 'LIVE' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0' :
                hackathon.status === 'UPCOMING' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0' :
                  'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0'
                }`}>
                {hackathon.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-white bg-slate-700/60 p-3 rounded-lg border border-slate-600/50">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">
                  {new Date(hackathon.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white bg-slate-700/60 p-3 rounded-lg border border-slate-600/50">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">
                  {hackathon.minTeamSize}-{hackathon.maxTeamSize} members
                </span>
              </div>
              <div className="flex items-center gap-2 text-white bg-slate-700/60 p-3 rounded-lg border border-slate-600/50">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  {hackathon.prizePool || 'TBD'}
                </span>
              </div>
              {!hackathon.title.toLowerCase().includes('agentmax') && (
                <div className="flex items-center gap-2 text-white bg-slate-700/60 p-3 rounded-lg border border-slate-600/50">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">
                    {Math.ceil((new Date(hackathon.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                console.log("START PROJECT CLICKED", hackathon.id);
                // Check if user has submissions for this hackathon
                const userSubmission = registeredHackathons.find(h => h.id === hackathon.id)?.submissions?.[0];

                if (isRegistered && onStartProject) {
                  // If registered, start/continue project
                  onStartProject(hackathon.id, userSubmission?.id);
                } else {
                  // If not registered, show registration modal
                  handleViewDetails(hackathon.id);
                }
              }}
              className={`w-full font-semibold ${isRegistered
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400'
                } text-white`}
            >
              {isRegistered ? (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {/* Check if user has submitted */}
                  {(() => {
                    const userSubmission = registeredHackathons.find(h => h.id === hackathon.id)?.submissions?.[0];

                    // Check if submission exists and is actually submitted (not just a draft)
                    if (userSubmission && (userSubmission.submittedAt || userSubmission.status === 'SUBMITTED' || userSubmission.isFinal)) {
                      return 'Edit Submission';
                    } else if (userSubmission && (userSubmission.isDraft || userSubmission.status === 'DRAFT')) {
                      return 'Continue Project';
                    } else {
                      return 'Start Project';
                    }
                  })()}
                </>
              ) : (
                <>
                  View Details
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-blue-300 border-t-transparent animate-ping opacity-20 mx-auto"></div>
          </div>
          <span className="text-lg font-semibold text-white">Loading hackathons...</span>
          <p className="text-slate-300 text-sm mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <AlertCircle className="w-20 h-20 text-red-400 mx-auto" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-red-400 rounded-full animate-pulse opacity-20 mx-auto"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Oops! Something went wrong</h3>
          <p className="text-white mb-6 leading-relaxed">{error}</p>
          <Button
            onClick={fetchHackathons}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold px-8 py-3 shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Hackathons</h1>
        <p className="text-white/90">Your registered hackathons and available opportunities</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <Input
            placeholder="Search hackathons..."
            className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-white/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Registered Hackathons Section */}
      {filteredRegistered.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">My Registered Hackathons</h2>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              {filteredRegistered.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRegistered.map((hackathon) => renderHackathonCard(hackathon, true))}
          </div>
        </div>
      )}

      {/* Available Hackathons Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Available Hackathons</h2>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            {filteredAvailable.length}
          </Badge>
        </div>

        {filteredAvailable.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-2xl font-bold text-white mb-2">No available hackathons</h3>
            <p className="text-white/90">Check back later for new opportunities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAvailable.map((hackathon) => renderHackathonCard(hackathon, false))}
          </div>
        )}
      </div>

      {/* Hackathon Details Modal */}
      {selectedHackathonId && (
        <HackathonDetailsModal
          hackathonId={selectedHackathonId}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedHackathonId(null);
          }}
          onJoin={() => {
            // Refresh hackathons after registration
            fetchHackathons();
          }}
        />
      )}
    </motion.div>
  );
}

interface ParticipantDashboardProps {
  userData: any;
  onLogout: () => void;
  onBack: () => void;
  initialTab?: string;
}

// Helper function to parse and filter files from submission
// CRITICAL: Backend returns downloadUrl (SAS URL) for organizers/judges
function parseSubmissionFiles(files: any): Array<{ name: string; url: string; size?: number; type?: string }> {
  if (!files) return [];

  try {
    // Parse if string
    const filesArray = typeof files === 'string' ? JSON.parse(files) : files;

    if (!Array.isArray(filesArray) || filesArray.length === 0) {
      console.log('📁 No files in array');
      return [];
    }

    console.log('📦 Raw files array:', filesArray);

    const parsedFiles = filesArray
      .map((file: any, index: number) => {
        try {
          let fileData;

          // Handle different file formats
          if (typeof file === 'string') {
            // Could be JSON string or plain URL string
            if (file.startsWith('{')) {
              // JSON string - parse it
              fileData = JSON.parse(file);
            } else if (file.startsWith('http://') || file.startsWith('https://')) {
              // Plain URL string - create object
              fileData = {
                url: file,
                name: file.split('/').pop() || 'File',
                size: 0
              };
            } else {
              // Unknown string format - skip
              console.warn(`⚠️ File ${index}: Unknown string format:`, file.substring(0, 50));
              return null;
            }
          } else if (typeof file === 'object' && file !== null) {
            // Already an object
            fileData = file;
          } else {
            // Invalid format
            console.warn(`⚠️ File ${index}: Invalid format:`, typeof file, file);
            return null;
          }

          // CRITICAL FIX: Prefer downloadUrl (SAS URL) over url
          const fileUrl = fileData.downloadUrl || fileData.url;

          if (!fileUrl) {
            console.warn(`⚠️ File ${index}: Missing URL (checked both downloadUrl and url):`, fileData);
            return null;
          }

          // Ensure name exists
          if (!fileData.name) {
            fileData.name = fileUrl.split('/').pop() || 'File';
          }

          // Validate URL format - reject file://, accept http/https
          const url = String(fileUrl);
          const isOldFileProtocol = url.startsWith('file://');
          const isValidUrl = url.startsWith('http://') || url.startsWith('https://');

          if (!isValidUrl || isOldFileProtocol) {
            console.warn(`⚠️ File ${index}: Invalid URL format:`, url);
            return null;
          }

          console.log(`✅ File ${index} parsed:`, {
            name: fileData.name,
            url: url.substring(0, 50) + '...',
            hasDownloadUrl: !!fileData.downloadUrl,
            hasUrl: !!fileData.url
          });

          // Return normalized file object
          return {
            name: fileData.name,
            url: fileUrl, // Use downloadUrl if available (SAS), otherwise url
            size: fileData.size || 0,
            type: fileData.type || fileData.mimeType,
          } as { name: string; url: string; size?: number; type?: string };
        } catch (parseError) {
          console.error(`❌ Error parsing file ${index}:`, parseError, file);
          return null;
        }
      })
      .filter((file): file is { name: string; url: string; size?: number; type?: string } => file !== null);

    console.log(`✅ Parsed ${parsedFiles.length} valid files from ${filesArray.length} total`);
    return parsedFiles;
  } catch (error) {
    console.error('❌ Error parsing files:', error, files);
    return [];
  }
}

export function ParticipantDashboard({ userData, onLogout, onBack, initialTab = 'hackathons' }: ParticipantDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [registeredHackathons, setRegisteredHackathons] = useState<Set<string>>(new Set());
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState('');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const userRole = userData?.role?.toLowerCase() || 'participant';

  // Filter submissions based on search and status
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission: any) => {
      const submitter = submission.submitter || {};
      const matchesSearch = submissionSearchQuery === '' ||
        submission.title?.toLowerCase().includes(submissionSearchQuery.toLowerCase()) ||
        `${submitter.firstName || ''} ${submitter.lastName || ''}`.toLowerCase().includes(submissionSearchQuery.toLowerCase()) ||
        submitter.email?.toLowerCase().includes(submissionSearchQuery.toLowerCase());

      const matchesStatus = submissionStatusFilter === 'all' ||
        submission.status === submissionStatusFilter ||
        (submissionStatusFilter === 'SUBMITTED' && (submission.status === 'SUBMITTED' || submission.submittedAt)) ||
        (submissionStatusFilter === 'DRAFT' && (submission.status === 'DRAFT' || !submission.submittedAt));

      return matchesSearch && matchesStatus;
    });
  }, [submissions, submissionSearchQuery, submissionStatusFilter]);

  // Update active tab when initialTab changes (for URL navigation)
  useEffect(() => {
    // Set default tab based on user role - only if no initialTab provided
    if (!initialTab || initialTab === 'hackathons') {
      if (userRole === 'organizer') {
        setActiveTab('dashboard'); // Organizers should see dashboard by default
      } else if (userRole === 'judge') {
        setActiveTab('dashboard'); // Judges should see dashboard by default
      } else {
        // For participants, show hackathons list by default
        setActiveTab('hackathons');
      }
    } else {
      // Use provided initialTab
      setActiveTab(initialTab);
    }
  }, [userRole, initialTab]);

  // Fetch data based on role
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { userRole, userId: userData?.id, activeTab });

    // Ensure token is loaded and user is active before fetching data
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token found');
        toast.error('Authentication required. Please login again.');
        return;
      }

      if (!userData?.id) {
        console.warn('No user ID available');
        return;
      }

      // Check if user is active
      if (userData?.status && userData.status !== 'ACTIVE') {
        toast.warning(`Account status: ${userData.status}. Some features may be limited.`);
      }

      console.log('✅ Calling fetchDashboardData...');
      fetchDashboardData();
    }
  }, [userRole, userData?.id]);

  // Auto-refresh when participants tab is opened
  useEffect(() => {
    if (activeTab === 'participants' && userRole === 'organizer' && userData?.id) {
      console.log('🔄 Participants tab opened - refreshing data...');
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userRole]);

  const fetchDashboardData = async () => {
    console.log('🔄 fetchDashboardData called:', { userRole, userId: userData?.id });

    if (!userData?.id) {
      console.warn('No user ID available');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (userRole === 'organizer') {
        console.log('🔄 Fetching data for organizer...');
        // Fetch ALL hackathons first
        const allHackathons = await api.getHackathons();

        // Filter to ONLY organizer's hackathons
        const myHackathons = allHackathons.filter((h: any) => h.organizerId === userData?.id) || [];
        setHackathons(myHackathons);

        console.log('🔍 All hackathons fetched:', allHackathons.length);
        console.log('🔍 My hackathons (filtered by organizerId):', myHackathons.length);
        console.log('🔍 My hackathons IDs:', myHackathons.map((h: any) => ({ id: h.id, title: h.title, teamsCount: h.teams?.length || 0 })));

        // Fetch ALL submissions - NO filters to get everything
        const allSubmissions = await api.getSubmissions(); // Gets ALL submissions without any filters
        console.log('🔍 All submissions fetched from API:', allSubmissions.length);
        console.log('🔍 All submissions data:', allSubmissions);

        // Filter to organizer's hackathons ONLY
        const organizerSubmissions = allSubmissions.filter((s: any) =>
          myHackathons.some((h: any) => h.id === s.hackathonId)
        );
        console.log('🔍 Organizer submissions (filtered by hackathons):', organizerSubmissions.length);
        console.log('🔍 Organizer submissions data:', organizerSubmissions);

        setSubmissions(organizerSubmissions);

        // CRITICAL FIX: Use dedicated participants API for each hackathon
        // This ensures we get ALL participants from both teams AND submissions
        const allParticipantsMap = new Map();

        console.log('🔍 Fetching participants for organizer hackathons:', myHackathons.length);

        // Fetch participants for each hackathon using the dedicated endpoint
        for (const hackathon of myHackathons) {
          try {
            console.log(`🔄 Fetching participants for hackathon: ${hackathon.title} (${hackathon.id})`);
            const hackathonParticipants = await api.getHackathonParticipants(hackathon.id);
            console.log(`✅ Fetched ${hackathonParticipants.length} participants for hackathon: ${hackathon.title} (${hackathon.id})`);
            console.log(`📋 Participants data:`, hackathonParticipants.map((p: any) => ({
              id: p.id,
              email: p.email,
              name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
              registeredAt: p.registeredAt,
              hasSubmission: p.hasSubmission
            })));

            hackathonParticipants.forEach((participant: any) => {
              // Use backend API as single source of truth - NO DERIVATION
              const participantKey = `${participant.id}-${hackathon.id}`; // Use composite key to handle same user in multiple hackathons
              if (!allParticipantsMap.has(participantKey)) {
                allParticipantsMap.set(participantKey, {
                  id: participant.id,
                  name: `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || 'Unknown',
                  email: participant.email || '',
                  firstName: participant.firstName || '',
                  lastName: participant.lastName || '',
                  submissions: organizerSubmissions.filter((sub: any) => sub.submitterId === participant.id && sub.hackathonId === hackathon.id),
                  registeredAt: participant.registeredAt || new Date().toISOString(),
                  hackathon: hackathon.title || 'Unknown',
                  hackathonId: hackathon.id,
                  hasSubmission: participant.hasSubmission || false,
                  submissionId: participant.submissionId || null,
                });
              } else {
                // Update existing participant with additional info
                const existing = allParticipantsMap.get(participantKey);
                if (participant.hasSubmission && !existing.hasSubmission) {
                  existing.hasSubmission = true;
                  existing.submissionId = participant.submissionId;
                }
                existing.submissions = organizerSubmissions.filter((sub: any) => sub.submitterId === participant.id && sub.hackathonId === hackathon.id);
              }
            });
          } catch (error) {
            console.error(`❌ Error fetching participants for hackathon ${hackathon.id}:`, error);
            // DO NOT use fallback - backend API is single source of truth
            // If API fails, log error but don't derive participants from other sources
          }
        }

        const participantsList = Array.from(allParticipantsMap.values());
        setParticipants(participantsList);

        console.log('✅ Organizer - Total submissions:', organizerSubmissions.length);
        console.log('✅ Organizer - Total unique participants:', participantsList.length);
        console.log('✅ Participants list:', participantsList.map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          registeredAt: p.registeredAt,
          hasSubmission: p.hasSubmission,
          submissions: p.submissions.length
        })));
        console.log('✅ Full participants data:', participantsList);

        // Calculate stats - ensure we count all unique participants
        setStats({
          activeHackathons: myHackathons.filter((h: any) =>
            ['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN', 'LIVE'].includes(h.status)
          ).length,
          totalParticipants: participantsList.length, // Count ALL participants
          totalSubmissions: organizerSubmissions.length,
        });
      } else if (userRole === 'judge') {
        // Fetch hackathons assigned to judge (show all statuses for testing)
        const assignedHackathons = await api.getHackathons();
        setHackathons(assignedHackathons);

        // Fetch ALL submissions to see all participants and their projects
        const allSubmissions = await api.getSubmissions();
        console.log('🔍 Judge - All submissions fetched:', allSubmissions.length);
        console.log('🔍 Judge - Submissions:', allSubmissions.map((s: any) => ({
          id: s.id,
          submitterId: s.submitterId,
          submitterEmail: s.submitter?.email,
          title: s.title,
          isDraft: s.isDraft,
          isFinal: s.isFinal
        })));

        // Show ALL submissions (including drafts) so judges can see everything
        setSubmissions(allSubmissions);

        // Calculate stats - count unique participants
        const uniqueParticipantIds = new Set(allSubmissions.map((s: any) => s.submitterId).filter(Boolean));
        setStats({
          assignedHackathons: assignedHackathons.length,
          pendingReviews: allSubmissions.length,
          reviewed: 0, // Calculate from reviews
          avgScore: 0, // Calculate from reviews
          totalParticipants: uniqueParticipantIds.size,
        });
      } else {
        // Participant: fetch hackathons they've joined (have submissions for)
        const allHackathons = await api.getHackathons();
        const activeStatuses = ['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN', 'DRAFT'];

        // Only fetch submissions if user ID is available and user is active
        try {
          // Check user status before making API call
          if (userData?.status && userData.status !== 'ACTIVE') {
            console.warn('User is not active, skipping submissions fetch');
            setSubmissions([]);
            setHackathons([]);
            setStats({
              activeHackathons: 0,
              submissions: 0,
              successRate: 0,
              achievements: 0,
            });
          } else {
            const mySubmissions = await api.getSubmissions({ userId: userData?.id });
            setSubmissions(mySubmissions);

            // CRITICAL FIX: Check registrations, submissions, AND team membership
            const joinedHackathonIds = new Set<string>();
            const registeredHackathonIds = new Set<string>();

            // Check registrations for each hackathon
            for (const hackathon of allHackathons) {
              try {
                const hackathonParticipants = await api.getHackathonParticipants(hackathon.id);
                const isRegistered = hackathonParticipants.some((p: any) => p.id === userData?.id);
                if (isRegistered) {
                  registeredHackathonIds.add(hackathon.id);
                  joinedHackathonIds.add(hackathon.id);
                }
              } catch (error) {
                console.error(`Error checking registration for hackathon ${hackathon.id}:`, error);
              }
            }

            // Add hackathons where user has submissions
            mySubmissions.forEach((s: any) => {
              joinedHackathonIds.add(s.hackathonId);
            });

            // Also check if user is in any teams for these hackathons
            allHackathons.forEach((hackathon: any) => {
              if (hackathon.teams && Array.isArray(hackathon.teams)) {
                const userInTeam = hackathon.teams.some((team: any) =>
                  team.members?.some((member: any) => member.user?.id === userData?.id)
                );
                if (userInTeam) {
                  joinedHackathonIds.add(hackathon.id);
                }
              }
            });

            setRegisteredHackathons(registeredHackathonIds);

            const myJoinedHackathons = allHackathons.filter((h: any) =>
              joinedHackathonIds.has(h.id) || activeStatuses.includes(h.status)
            );
            setHackathons(myJoinedHackathons);

            setStats({
              activeHackathons: myJoinedHackathons.length,
              submissions: mySubmissions.length,
              successRate: mySubmissions.filter((s: any) =>
                ['APPROVED', 'WINNER'].includes(s.status)
              ).length,
              achievements: 0,
            });
          }
        } catch (submissionError: any) {
          console.error('Error fetching submissions:', submissionError);
          // Don't fail the whole dashboard if submissions fail
          setSubmissions([]);
          setHackathons([]);
          setStats({
            activeHackathons: 0,
            submissions: 0,
            successRate: 0,
            achievements: 0,
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      // If it's an auth error, suggest re-login
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast.error('Authentication expired. Please login again.');
        onLogout();
      } else {
        toast.error(error.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Role-based sidebar items
  const getSidebarItems = () => {
    if (userRole === 'organizer') {
      return [
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'create-hackathon', icon: Plus, label: 'Create Hackathon' },
        { id: 'my-hackathons', icon: Briefcase, label: 'My Hackathons' },
        { id: 'participants', icon: Users, label: 'Participants' },
        { id: 'submissions-review', icon: CheckSquare, label: 'Review Submissions' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'notifications', icon: Bell, label: 'Notifications', badge: 5 },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ];
    } else if (userRole === 'judge') {
      return [
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'assigned-hackathons', icon: Trophy, label: 'Assigned Hackathons' },
        { id: 'review-submissions', icon: Gavel, label: 'Review Submissions' },
        { id: 'score-projects', icon: CheckSquare, label: 'Score Projects' },
        { id: 'leaderboard', icon: Award, label: 'Leaderboard' },
        { id: 'notifications', icon: Bell, label: 'Notifications', badge: 2 },
        { id: 'profile', icon: User, label: 'Profile' },
      ];
    } else {
      // Participant (default)
      return [
        { id: 'hackathons', icon: Trophy, label: 'Hackathons' },
        { id: 'submissions', icon: FileText, label: 'My Submissions' },
        { id: 'payments', icon: CreditCard, label: 'Payment History' },
        { id: 'notifications', icon: Bell, label: 'Notifications', badge: 3 },
        { id: 'profile', icon: User, label: 'Profile' },
      ];
    }
  };

  const sidebarItems = getSidebarItems();

  // Calculate upcoming deadlines from hackathons
  const upcomingDeadlines = hackathons
    .filter((h: any) => {
      const deadline = new Date(h.submissionDeadline || h.endDate);
      return deadline > new Date();
    })
    .map((h: any) => ({
      title: h.title,
      task: 'Final Submission',
      date: h.submissionDeadline || h.endDate,
      priority: new Date(h.submissionDeadline || h.endDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 ? 'high' : 'medium',
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Suggestions for participants (based on submissions)
  const suggestions = submissions
    .filter((s: any) => s.status === 'NEEDS_IMPROVEMENT' || s.status === 'REJECTED')
    .map((s: any) => ({
      type: 'warning' as const,
      message: 'Your submission needs improvement',
      action: 'Review feedback',
      submissionId: s.id,
    }))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white dashboard-container">


      {/* Sidebar - Always Visible */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="sidebar-isolated bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '16rem',
          maxWidth: '16rem',
          minWidth: '16rem',
          height: '100vh',
          zIndex: 9999,
          overflow: 'hidden auto'
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center">
            <Branding size="md" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto min-h-0" data-scrollable>
          {sidebarItems.map((item) => {
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 5 }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-2 transition-all font-semibold ${activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white'
                  : 'hover:bg-slate-800 text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-white'}`} />
                  <span className={activeTab === item.id ? 'text-white' : 'text-white'}>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge className="bg-red-500 text-white">{item.badge}</Badge>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User */}
        <div className="mt-auto p-4 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {(userData.firstName || userData.name || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-white">{userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.name || 'User'}</p>
              <p className="text-xs text-white truncate">{userData.email}</p>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content - Responsive */}
      <main
        className="main-content-offset overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition-all duration-300"
        data-scrollable
        style={{
          WebkitOverflowScrolling: 'touch',
          marginLeft: '16rem',
          width: 'calc(100% - 16rem)',
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-white">
                  Welcome back, {userData.name}! 👋
                </h1>
                <p className="text-white">
                  {userRole === 'organizer'
                    ? "Manage your hackathons and track participant engagement"
                    : userRole === 'judge'
                      ? "Review submissions and evaluate participant projects"
                      : "Here's what's happening with your hackathons"}
                </p>
              </div>

              {/* Stats - Role-based */}
              {loading ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${userRole === 'organizer' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 sm:gap-6 mb-6 sm:mb-8`}>
                  {[1, 2, 3, ...(userRole === 'organizer' ? [] : [4])].map((i) => (
                    <Card key={i} className="p-6 bg-slate-800/50 animate-pulse">
                      <div className="h-12 w-12 bg-slate-700 rounded-xl mb-4" />
                      <div className="h-8 w-20 bg-slate-700 rounded mb-2" />
                      <div className="h-4 w-24 bg-slate-700 rounded" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${userRole === 'organizer' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 sm:gap-6 mb-6 sm:mb-8 perspective-3d`}>
                  {(userRole === 'organizer'
                    ? [
                      { label: 'Active Hackathons', value: stats.activeHackathons || 0, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
                      { label: 'Total Participants', value: stats.totalParticipants || 0, icon: Users, color: 'from-purple-500 to-pink-500' },
                      { label: 'Submissions', value: stats.totalSubmissions || 0, icon: FileText, color: 'from-green-500 to-emerald-500' },
                    ]
                    : userRole === 'judge'
                      ? [
                        { label: 'Assigned Hackathons', value: stats.assignedHackathons || 0, icon: Trophy, color: 'from-blue-500 to-cyan-500' },
                        { label: 'Pending Reviews', value: stats.pendingReviews || 0, icon: CheckSquare, color: 'from-purple-500 to-pink-500' },
                        { label: 'Reviewed', value: stats.reviewed || 0, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
                        { label: 'Avg. Score', value: stats.avgScore || 0, icon: Award, color: 'from-orange-500 to-red-500' },
                      ]
                      : [
                        { label: 'Active Hackathons', value: stats.activeHackathons || 0, icon: Trophy, color: 'from-blue-500 to-cyan-500' },
                        { label: 'Submissions', value: stats.submissions || 0, icon: FileText, color: 'from-purple-500 to-pink-500' },
                        { label: 'Success Rate', value: stats.successRate ? `${Math.round((stats.successRate / (stats.submissions || 1)) * 100)}%` : '0%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
                        { label: 'Achievements', value: stats.achievements || 0, icon: Award, color: 'from-orange-500 to-red-500' },
                      ]
                  ).map((stat, index) => (
                    <Card3D key={stat.label} intensity={15}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-6 bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-600/50 backdrop-blur-sm glass shadow-3d h-full hover:from-slate-700/95 hover:to-slate-800/95 transition-all duration-300">
                          <div className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-3xl font-bold mb-1 text-white">{stat.value}</div>
                          <div className="text-sm text-white">{stat.label}</div>
                        </Card>
                      </motion.div>
                    </Card3D>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Content - Role-based */}
                <div className="lg:col-span-2 space-y-6">
                  {userRole === 'organizer' ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">My Hackathons</h2>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                          onClick={() => navigate('/create-hackathon')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create New
                        </Button>
                      </div>
                      {hackathons.length === 0 ? (
                        <Card3D intensity={20}>
                          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                            <div className="text-center py-8">
                              <Briefcase className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                              <h3 className="text-xl font-bold mb-2 text-white">Create Your First Hackathon</h3>
                              <p className="text-white mb-6">Set up a new hackathon and start inviting participants</p>
                              <Button
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                                onClick={() => navigate('/create-hackathon')}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Hackathon
                              </Button>
                            </div>
                          </Card>
                        </Card3D>
                      ) : (
                        <div className="space-y-4">
                          {hackathons.map((hackathon: any) => (
                            <Card3D key={hackathon.id} intensity={15}>
                              <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2 text-white">{hackathon.title}</h3>
                                    <p className="text-sm text-white mb-3 line-clamp-2">{hackathon.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-white">
                                      <Badge className={`${hackathon.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                                        hackathon.status === 'DRAFT' ? 'bg-gray-500/20 text-gray-400 border-gray-500/50' :
                                          'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                        }`}>
                                        {hackathon.status}
                                      </Badge>
                                      <span className="flex items-center gap-1 text-slate-300">
                                        <Users className="w-4 h-4" />
                                        {hackathon._count?.participants || 0} registered
                                      </span>
                                      <span className="flex items-center gap-1 text-slate-300">
                                        <FileText className="w-4 h-4" />
                                        {hackathon._count?.submissions || 0} submissions
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  {hackathon.status === 'DRAFT' ? (
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                                      onClick={async () => {
                                        try {
                                          await api.updateHackathonStatus(hackathon.id, 'LIVE');

                                          // Trigger stats refresh after publishing hackathon
                                          api.triggerStatsRefresh();

                                          toast.success('Hackathon published successfully!');
                                          fetchDashboardData();
                                        } catch (error: any) {
                                          toast.error(error.message || 'Failed to publish hackathon');
                                        }
                                      }}
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Publish
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                                      onClick={() => {
                                        setSelectedHackathonId(hackathon.id);
                                        setIsDetailsModalOpen(true);
                                      }}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            </Card3D>
                          ))}
                        </div>
                      )}
                    </>
                  ) : userRole === 'judge' ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Assigned Hackathons</h2>
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">View All</Button>
                      </div>
                      <Card3D intensity={20}>
                        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold mb-1 text-white">AI Innovation Challenge 2024</h3>
                              <p className="text-sm text-white">Tech Corp</p>
                            </div>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                              23 Pending
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white">Submissions to Review</span>
                              <span className="font-semibold text-white">23</span>
                            </div>
                            <Progress value={65} className="h-2" />
                            <div className="flex gap-3 mt-4">
                              <Button3D size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">
                                <Gavel className="w-4 h-4 mr-2" />
                                Start Reviewing
                              </Button3D>
                            </div>
                          </div>
                        </Card>
                      </Card3D>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Active Hackathons</h2>
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">View All</Button>
                      </div>
                    </>
                  )}

                  {userRole === 'participant' && hackathons.map((hackathon) => {
                    // CRITICAL FIX: Check registration, submission, AND team membership
                    const userSubmission = submissions.find((s: any) => s.hackathonId === hackathon.id);
                    const userInTeam = hackathon.teams?.some((team: any) =>
                      team.members?.some((member: any) => member.user?.id === userData?.id)
                    ) || false;
                    const isRegistered = registeredHackathons.has(hackathon.id);
                    const hasJoined = isRegistered || !!userSubmission || userInTeam;

                    // Calculate progress based on submission status
                    let progress = 0;
                    if (userSubmission) {
                      if (userSubmission.submittedAt) {
                        progress = 100; // Fully submitted
                      } else if (userSubmission.isDraft === false) {
                        progress = 80; // Ready to submit
                      } else {
                        progress = 50; // Draft in progress
                      }
                    }

                    // Determine button text based on registration and submission status
                    const now = new Date();
                    const submissionStart = new Date(hackathon.startDate);
                    const submissionEnd = new Date(hackathon.submissionDeadline);
                    const isSubmissionWindowOpen = now >= submissionStart && now <= submissionEnd;
                    const isSubmissionLocked = now > submissionEnd;

                    let buttonText = 'Register First';
                    let buttonDisabled = false;

                    if (!isRegistered) {
                      buttonText = 'Register for Hackathon';
                      buttonDisabled = false;
                    } else if (isRegistered && !isSubmissionWindowOpen && now < submissionStart) {
                      buttonText = 'Submission Opens Soon';
                      buttonDisabled = true;
                    } else if (isRegistered && isSubmissionWindowOpen && !userSubmission) {
                      buttonText = 'Submit Project';
                      buttonDisabled = false;
                    } else if (userSubmission && userSubmission.submittedAt && !isSubmissionLocked) {
                      buttonText = 'View Submission';
                      buttonDisabled = false;
                    } else if (userSubmission && userSubmission.submittedAt && isSubmissionLocked) {
                      buttonText = 'View Submission';
                      buttonDisabled = false;
                    } else if (userSubmission && !userSubmission.submittedAt && !isSubmissionLocked) {
                      buttonText = 'Continue Project';
                      buttonDisabled = false;
                    } else if (userSubmission && !userSubmission.submittedAt && isSubmissionLocked) {
                      buttonText = 'View Draft';
                      buttonDisabled = false;
                    } else if (hasJoined) {
                      buttonText = 'Continue Project';
                      buttonDisabled = false;
                    }
                    return (
                      <Card3D key={hackathon.id} intensity={20}>
                        <Card
                          className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/80 backdrop-blur-sm glass shadow-3d hover:border-blue-400 hover:border-4 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/50 hover:from-blue-800/40 hover:to-slate-800/90 hover:scale-[1.03] transform group hover:ring-4 hover:ring-blue-400/30 relative"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold mb-1 text-white group-hover:text-blue-400 transition-colors">{hackathon.title}</h3>
                              <p className="text-sm text-white">{hackathon.organizer?.firstName} {hackathon.organizer?.lastName}</p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                              {hackathon.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white">Project Progress</span>
                              <span className="font-semibold text-white">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />

                            <div className="flex items-center gap-4 pt-2">
                              <div className="flex items-center gap-2 text-sm text-white">
                                <Calendar className="w-4 h-4 text-white" />
                                Deadline: {new Date(hackathon.submissionDeadline || hackathon.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-4">
                            <Button3D
                              size="sm"
                              className={buttonDisabled
                                ? "flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white font-semibold cursor-not-allowed"
                                : "flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                              }
                              disabled={buttonDisabled}
                              onClick={async () => {
                                console.log("SUBMIT PROJECT CLICKED", hackathon.id);
                                if (!isRegistered) {
                                  // Need to register first
                                  try {
                                    await api.registerForHackathon(hackathon.id);

                                    // Trigger stats refresh after registration
                                    api.triggerStatsRefresh();

                                    toast.success(`Successfully registered for ${hackathon.title}!`);
                                    // Refresh dashboard to update registration status
                                    fetchDashboardData();
                                  } catch (error: any) {
                                    if (error.message?.includes('already')) {
                                      toast.info('You are already registered for this hackathon!');
                                      fetchDashboardData();
                                    } else {
                                      toast.error(error.message || 'Failed to register for hackathon');
                                    }
                                  }
                                } else if (userSubmission && userSubmission.submittedAt) {
                                  // View submitted project
                                  setSelectedSubmissionId(userSubmission.id);
                                  setSelectedHackathonId(null); // Clear hackathon ID to show submission modal
                                  setIsDetailsModalOpen(true);
                                } else {
                                  // Proceed to submission (start/continue project)
                                  console.log('Navigating to submission page for hackathonId:', hackathon.id);
                                  navigate(`/submit/${hackathon.id}`);
                                }
                              }}
                            >
                              {buttonText} <ChevronRight className="w-4 h-4 ml-2" />
                            </Button3D>
                            <Button3D
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                              onClick={() => {
                                // For participants, go directly to project submission instead of details
                                if (isRegistered) {
                                  // If registered, start/continue project or view submission
                                  if (userSubmission && userSubmission.submittedAt) {
                                    // View submitted project
                                    setSelectedSubmissionId(userSubmission.id);
                                    setSelectedHackathonId(null); // Clear hackathon ID to show submission modal
                                    setIsDetailsModalOpen(true);
                                  } else if (userSubmission) {
                                    // Continue project
                                    console.log('Navigating to submission page for hackathonId:', hackathon.id);
                                    navigate(`/submit/${hackathon.id}`);
                                  } else {
                                    // Start new project
                                    console.log('Navigating to submission page for hackathonId:', hackathon.id);
                                    navigate(`/submit/${hackathon.id}`);
                                  }
                                } else {
                                  // If not registered, show registration modal first
                                  setSelectedHackathonId(hackathon.id);
                                  setIsDetailsModalOpen(true);
                                }
                              }}
                            >
                              {isRegistered ? (
                                <>
                                  <Plus className="w-4 h-4 mr-1" />
                                  {(() => {
                                    if (userSubmission && (userSubmission.submittedAt || userSubmission.status === 'SUBMITTED' || userSubmission.isFinal)) {
                                      return 'Edit Submission';
                                    } else if (userSubmission && (userSubmission.isDraft || userSubmission.status === 'DRAFT')) {
                                      return 'Continue Project';
                                    } else {
                                      return 'Start Project';
                                    }
                                  })()}
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </>
                              )}
                            </Button3D>
                          </div>
                        </Card>
                      </Card3D>
                    );
                  })}

                  {/* AI Suggestions - Only for Participants */}
                  {userRole === 'participant' && (
                    <Card3D intensity={15}>
                      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 glass shadow-3d">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">AI Suggestions</h3>
                            <p className="text-sm text-white">Powered by advanced AI analysis</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg"
                            >
                              {suggestion.type === 'warning' ? (
                                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                              ) : (
                                <Target className="w-5 h-5 text-blue-400 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm text-white mb-1">{suggestion.message}</p>
                                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">
                                  {suggestion.action} →
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Card3D>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Upcoming Deadlines */}
                  <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                      <Clock className="w-5 h-5 text-blue-400" />
                      Upcoming Deadlines
                    </h3>
                    <div className="space-y-3">
                      {upcomingDeadlines.map((deadline, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${deadline.priority === 'high'
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-blue-500/10 border-blue-500/30'
                            }`}
                        >
                          <div className="text-sm font-semibold text-white mb-1">{deadline.title}</div>
                          <div className="text-xs text-white mb-2">{deadline.task}</div>
                          <div className="flex items-center gap-1 text-xs text-white">
                            <Calendar className="w-3 h-3 text-white" />
                            {new Date(deadline.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Quick Actions - Role-based */}
                  <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                    <h3 className="font-bold mb-4 text-white">Quick Actions</h3>
                    <div className="space-y-2">
                      {userRole === 'organizer' ? (
                        <>
                          <Button3D
                            className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                            onClick={() => navigate('/create-hackathon')}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Hackathon
                          </Button3D>
                          <Button3D
                            className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                            onClick={() => navigate('/submissions-review')}
                          >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Review Submissions
                          </Button3D>
                          <Button3D
                            className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                            onClick={() => navigate('/analytics')}
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                          </Button3D>
                        </>
                      ) : userRole === 'judge' ? (
                        <>
                          <Button3D
                            className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                            onClick={() => navigate('/submissions-review')}
                          >
                            <Gavel className="w-4 h-4 mr-2" />
                            Review Submissions
                          </Button3D>
                          <Button3D
                            className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                            onClick={() => navigate('/analytics')}
                          >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Score Projects
                          </Button3D>
                          <Button3D
                            className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                            onClick={() => navigate('/analytics')}
                          >
                            <Award className="w-4 h-4 mr-2" />
                            View Leaderboard
                          </Button3D>
                        </>
                      ) : (
                        <>
                          <Button3D
                            className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                            onClick={() => navigate('/submissions')}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            My Submissions
                          </Button3D>
                          <Button3D
                            className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                            onClick={() => navigate('/explore')}
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Explore & Join Hackathons
                          </Button3D>
                        </>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hackathons' && userRole === 'participant' && (
            <motion.div key="hackathons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ParticipantHackathons
                userId={userData?.id}
                onStartProject={(hackathonId: string, submissionId?: string) => {
                  console.log('Navigating to submission page for hackathonId:', hackathonId);
                  navigate(`/submit/${hackathonId}`);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'my-hackathons' && userRole === 'organizer' && (
            <motion.div key="my-hackathons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <MyHackathons userId={userData?.id} userRole={userRole} />
            </motion.div>
          )}

          {activeTab === 'my-hackathons' && userRole === 'participant' && (
            <motion.div key="my-hackathons-participant" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ParticipantHackathons
                userId={userData?.id}
                onStartProject={(hackathonId: string, submissionId?: string) => {
                  console.log('Navigating to submission page for hackathonId:', hackathonId);
                  navigate(`/submit/${hackathonId}`);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'assigned-hackathons' && userRole === 'judge' && (
            <motion.div key="assigned-hackathons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <MyHackathons userId={userData?.id} />
            </motion.div>
          )}

          {activeTab === 'submissions' && userRole === 'participant' && (
            <motion.div key="submissions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <MySubmissions onSelectSubmission={(submission: any) => {
                // Open submission details modal instead of going to project submission
                setSelectedSubmissionId(submission.id);
                setSelectedHackathonId(null); // Clear hackathon ID to show submission modal
                setIsDetailsModalOpen(true);
              }} />
            </motion.div>
          )}

          {activeTab === 'project-submission' && selectedHackathonId && (
            <motion.div key={`project-submission-${selectedHackathonId}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div key="project-submission-wrapper">
                <ProjectSubmission
                  hackathonId={selectedHackathonId}
                  submissionId={selectedSubmissionId || undefined}
                  onComplete={() => {
                    navigate('/dashboard');
                    setSelectedHackathonId(null);
                    setSelectedSubmissionId(null);
                    fetchDashboardData();
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Hackathon Details Modal */}
          {selectedHackathonId && !selectedSubmissionId && (
            <HackathonDetailsModal
              hackathonId={selectedHackathonId}
              isOpen={isDetailsModalOpen}
              onClose={() => {
                setIsDetailsModalOpen(false);
                setSelectedHackathonId(null);
              }}
            />
          )}

          {/* Organizer-specific tabs */}
          {activeTab === 'create-hackathon' && userRole === 'organizer' && (
            <motion.div
              key="create-hackathon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-3xl font-bold mb-6 text-white">Create New Hackathon</h1>
              <Card3D intensity={15}>
                <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                  <CreateHackathonForm
                    onSuccess={() => {
                      // Refresh hackathons and go back to dashboard
                      navigate('/dashboard');
                    }}
                    onCancel={() => {
                      navigate('/dashboard');
                    }}
                  />
                </Card>
              </Card3D>
            </motion.div>
          )}

          {/* Simple Participants Page */}
          {activeTab === 'participants' && userRole === 'organizer' && (
            <SimpleParticipantsPage userData={userData} />
          )}

          {activeTab === 'submissions-review' && userRole === 'organizer' && (
            <motion.div
              key="submissions-review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Review Submissions</h1>
                <div className="flex gap-3">
                  <Input
                    placeholder="Search submissions..."
                    className="w-64 bg-slate-800/50 border-slate-600 text-white placeholder:text-white/70"
                    value={submissionSearchQuery}
                    onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                  />
                  <Select value={submissionStatusFilter} onValueChange={setSubmissionStatusFilter}>
                    <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="all" className="text-white hover:bg-slate-800">All Submissions</SelectItem>
                      <SelectItem value="SUBMITTED" className="text-white hover:bg-slate-800">Submitted</SelectItem>
                      <SelectItem value="DRAFT" className="text-white hover:bg-slate-800">Draft</SelectItem>
                      <SelectItem value="APPROVED" className="text-white hover:bg-slate-800">Approved</SelectItem>
                      <SelectItem value="REJECTED" className="text-white hover:bg-slate-800">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="grid gap-6">
                  {submissions.length === 0 ? (
                    <Card className="p-8 text-center bg-slate-800/50">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-white">No submissions to review</p>
                    </Card>
                  ) : filteredSubmissions.length === 0 ? (
                    <Card className="p-8 text-center bg-slate-800/50">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-white">No submissions match your search criteria</p>
                    </Card>
                  ) : (
                    filteredSubmissions.map((submission: any) => {
                      const submitter = submission.submitter || {};
                      const hackathon = hackathons.find((h: any) => h.id === submission.hackathonId);
                      const statusMap: Record<string, string> = {
                        'PASSED_TO_OFFLINE_REVIEW': 'Pending Review',
                        'UNDER_OFFLINE_REVIEW': 'Under Review',
                        'APPROVED': 'Approved',
                        'REJECTED': 'Rejected',
                      };
                      return (
                        <Card3D key={submission.id} intensity={15}>
                          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold mb-1 text-white">{submission.title}</h3>
                                <div className="text-sm text-white">
                                  <p>by {submitter.firstName || 'Unknown'} {submitter.lastName || 'User'}</p>
                                  {submission.type === 'TEAM' && submission.teamInfo ? (
                                    <p className="text-xs text-blue-300 mt-1">
                                      Team: {submission.teamInfo.name} ({submission.teamInfo.members?.length || 0} members)
                                    </p>
                                  ) : (
                                    <p className="text-xs text-green-300 mt-1">Individual Participant</p>
                                  )}
                                </div>
                                <p className="text-xs text-white mt-1">{hackathon?.title || 'Unknown Hackathon'}</p>
                              </div>
                              <Badge className={
                                submission.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                                  submission.status === 'UNDER_OFFLINE_REVIEW' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                                    'bg-blue-500/20 text-blue-400 border-blue-500/50'
                              }>
                                {statusMap[submission.status] || submission.status}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-white mb-1">Submitted</p>
                                <p className="text-sm text-white">{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Not submitted'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-white mb-1">Actions</p>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                                    onClick={() => {
                                      // Open submission details modal
                                      setSelectedSubmissionId(submission.id);
                                      setSelectedHackathonId(null); // Clear hackathon ID to show submission modal
                                      setIsDetailsModalOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Project
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Card3D>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && userRole === 'organizer' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-3xl font-bold mb-6 text-white">Analytics Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Participants', value: '1,247', change: '+12%', icon: Users, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Submissions', value: '342', change: '+8%', icon: FileText, color: 'from-purple-500 to-pink-500' },
                  { label: 'Completion Rate', value: '78%', change: '+5%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
                  { label: 'Avg. Score', value: '82', change: '+3', icon: Award, color: 'from-orange-500 to-red-500' },
                ].map((stat, index) => (
                  <Card3D key={stat.label} intensity={15}>
                    <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                      <div className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold mb-1 text-white">{stat.value}</div>
                      <div className="text-sm text-white mb-1">{stat.label}</div>
                      <div className="text-xs text-green-400">{stat.change} from last month</div>
                    </Card>
                  </Card3D>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'review-submissions' && userRole === 'judge' && (
            <motion.div
              key="review-submissions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Review Submissions</h1>
                <div className="flex gap-3">
                  <Input
                    placeholder="Search submissions..."
                    className="w-64 bg-slate-800/50 border-slate-600 text-white placeholder:text-white/70"
                    value={submissionSearchQuery}
                    onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                  />
                  <Select value={submissionStatusFilter} onValueChange={setSubmissionStatusFilter}>
                    <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="all" className="text-white hover:bg-slate-800">All Submissions</SelectItem>
                      <SelectItem value="SUBMITTED" className="text-white hover:bg-slate-800">Submitted</SelectItem>
                      <SelectItem value="DRAFT" className="text-white hover:bg-slate-800">Draft</SelectItem>
                      <SelectItem value="APPROVED" className="text-white hover:bg-slate-800">Approved</SelectItem>
                      <SelectItem value="REJECTED" className="text-white hover:bg-slate-800">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                    {submissions.length} Pending Reviews
                  </Badge>
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="grid gap-6">
                  {submissions.length === 0 ? (
                    <Card className="p-8 text-center bg-slate-800/50">
                      <Gavel className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-white">No submissions assigned for review</p>
                    </Card>
                  ) : (
                    (() => {
                      // Filter submissions based on search query and status
                      const filteredSubmissions = submissions.filter((submission: any) => {
                        const submitter = submission.submitter || {};
                        const matchesSearch = submissionSearchQuery === '' ||
                          submission.title?.toLowerCase().includes(submissionSearchQuery.toLowerCase()) ||
                          `${submitter.firstName || ''} ${submitter.lastName || ''}`.toLowerCase().includes(submissionSearchQuery.toLowerCase()) ||
                          submitter.email?.toLowerCase().includes(submissionSearchQuery.toLowerCase());

                        const matchesStatus = submissionStatusFilter === 'all' ||
                          submission.status === submissionStatusFilter ||
                          (submissionStatusFilter === 'SUBMITTED' && (submission.status === 'SUBMITTED' || submission.submittedAt)) ||
                          (submissionStatusFilter === 'DRAFT' && (submission.status === 'DRAFT' || !submission.submittedAt));

                        return matchesSearch && matchesStatus;
                      });

                      if (filteredSubmissions.length === 0) {
                        return (
                          <Card className="p-8 text-center bg-slate-800/50">
                            <Gavel className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <p className="text-white">No submissions match your search criteria</p>
                          </Card>
                        );
                      }

                      return filteredSubmissions.map((submission: any) => {
                        const submitter = submission.submitter || {};
                        const hackathon = hackathons.find((h: any) => h.id === submission.hackathonId);
                        return (
                          <Card3D key={submission.id} intensity={15}>
                            <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-xl font-bold mb-1 text-white">{submission.title}</h3>
                                  <div className="text-sm text-white">
                                    <p>by {submitter.firstName || 'Unknown'} {submitter.lastName || 'User'}</p>
                                    {submission.type === 'TEAM' && submission.teamInfo ? (
                                      <p className="text-xs text-blue-300 mt-1">
                                        Team: {submission.teamInfo.name} ({submission.teamInfo.members?.length || 0} members)
                                      </p>
                                    ) : (
                                      <p className="text-xs text-green-300 mt-1">Individual Participant</p>
                                    )}
                                  </div>
                                  <p className="text-xs text-white mt-1">{hackathon?.title || 'Unknown Hackathon'}</p>
                                </div>
                                <Badge className={
                                  submission.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                                    submission.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                                      'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                }>
                                  {submission.status || 'DRAFT'}
                                </Badge>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-white mb-1">Submitted</p>
                                  <p className="text-sm text-white">{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Not submitted'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-white mb-1">Actions</p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                                      onClick={() => {
                                        // Open submission details modal
                                        setSelectedSubmissionId(submission.id);
                                        setSelectedHackathonId(null); // Clear hackathon ID to show submission modal
                                        setIsDetailsModalOpen(true);
                                      }}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View Project
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                                      onClick={() => setActiveTab('score-projects')}
                                    >
                                      <Gavel className="w-4 h-4 mr-1" />
                                      Review
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </Card3D>
                        );
                      });
                    })()
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'score-projects' && userRole === 'judge' && (
            <motion.div
              key="score-projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-3xl font-bold mb-6 text-white">Score Projects</h1>
              <Card3D intensity={15}>
                <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2 text-white">Smart Healthcare Assistant</h2>
                    <p className="text-white">by Sarah Chen | AI Innovation Challenge 2024</p>
                  </div>
                  <div className="space-y-6">
                    {[
                      { criterion: 'Innovation & Creativity', currentScore: 85, maxScore: 100 },
                      { criterion: 'Technical Implementation', currentScore: 78, maxScore: 100 },
                      { criterion: 'Problem Solving', currentScore: 90, maxScore: 100 },
                      { criterion: 'Presentation & Documentation', currentScore: 72, maxScore: 100 },
                      { criterion: 'Overall Impact', currentScore: 88, maxScore: 100 },
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-white font-semibold">{item.criterion}</Label>
                          <span className="text-white">{item.currentScore}/{item.maxScore}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min="0"
                            max={item.maxScore}
                            defaultValue={item.currentScore}
                            className="w-24 bg-slate-800/50 border-slate-600 text-white"
                          />
                          <div className="flex-1">
                            <Progress value={item.currentScore} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold text-white">Total Score</span>
                        <span className="text-3xl font-bold text-white">413/500</span>
                      </div>
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Submit Score
                        </Button>
                        <Button
                          type="button"
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                        >
                          Save Draft
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Card3D>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && userRole === 'judge' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Leaderboard />
            </motion.div>
          )}

          {activeTab === 'settings' && userRole === 'organizer' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-3xl font-bold mb-6 text-white">Settings</h1>
              <Card3D intensity={15}>
                <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-white">Account Settings</h2>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="orgName" className="text-white font-semibold">Organization Name</Label>
                          <Input
                            id="orgName"
                            defaultValue={userData.name}
                            className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="orgEmail" className="text-white font-semibold">Email</Label>
                          <Input
                            id="orgEmail"
                            type="email"
                            defaultValue={userData.email}
                            className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </Card3D>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PaymentHistory />
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-3xl font-bold mb-6 text-white">Notifications</h1>
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-white">No new notifications</p>
              </Card>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-3xl font-bold mb-6 text-white">Profile Settings</h1>
              <Card3D intensity={15}>
                <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm glass shadow-3d">
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {(userData.firstName || userData.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                        <p className="text-white">{userData.email}</p>
                        <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/50">
                          {userRole === 'organizer' ? 'Organizer' : userRole === 'judge' ? 'Judge' : 'Participant'}
                        </Badge>
                      </div>
                    </div>

                    {/* Profile Form - Only Name and Email */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="profileName" className="text-white font-semibold">Full Name</Label>
                        <Input
                          id="profileName"
                          defaultValue={userData.name}
                          className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profileEmail" className="text-white font-semibold">Email</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="profileEmail"
                            type="email"
                            defaultValue={userData.email}
                            className="bg-slate-800/50 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </Card3D>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      {selectedHackathonId && (
        <HackathonDetailsModal
          hackathonId={selectedHackathonId}
          isOpen={isDetailsModalOpen && !selectedSubmissionId}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedHackathonId(null);
          }}
          onJoin={() => {
            // Refresh data after joining
            fetchDashboardData();
          }}
        />
      )}

      {selectedSubmissionId && (
        <SubmissionDetailsModal
          submissionId={selectedSubmissionId}
          isOpen={isDetailsModalOpen && !!selectedSubmissionId}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedSubmissionId(null);
            setSelectedHackathonId(null);
          }}
        />
      )}
    </div>
  );
}

