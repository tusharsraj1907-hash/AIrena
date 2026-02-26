import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { agentMaxDetails } from '../../data/agentMax';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Trophy,
  Calendar,
  Clock,
  Users,
  Target,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Github,
  ExternalLink,
  Edit,
  Eye,
  Info,
  BookOpen,
  Award,
  Briefcase,
  Mail,
  Phone,
  Globe,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { TeamRegistrationModal } from './TeamRegistrationModal';

interface HackathonDetailsModalProps {
  hackathonId: string;
  isOpen: boolean;
  onClose: () => void;
  onJoin?: (hackathonId: string, submissionId?: string) => void;
  onNavigateToAuth?: (returnUrl?: string, hackathonId?: string) => void; // Add navigation callback
}

export function HackathonDetailsModal({ hackathonId, isOpen, onClose, onJoin, onNavigateToAuth }: HackathonDetailsModalProps) {
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track auth status
  const [isTeamRegistrationOpen, setIsTeamRegistrationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'rules' | 'timeline'>('overview');
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  // Calculate team stats
  const teamStats = useMemo(() => {
    // Hardcode stats for AgentMax as requested
    if (hackathon?.title?.includes('AgentMax') || hackathon?.title?.includes('AgentMaX')) {
      return {
        teamCount: agentMaxDetails.stats.teamCount,
        avgMembers: agentMaxDetails.stats.avgTeamSize
      };
    }

    const uniqueTeams = new Set();
    let teamParticipantsCount = 0;

    participants.forEach(p => {
      if (p.team?.id) {
        uniqueTeams.add(p.team.id);
        teamParticipantsCount++;
      }
    });

    const teamCount = uniqueTeams.size;
    const avgMembers = teamCount > 0 ? Math.round(teamParticipantsCount / teamCount) : 0;

    return { teamCount, avgMembers };
  }, [participants]);

  useEffect(() => {
    if (isOpen && hackathonId) {
      fetchHackathonDetails();
      checkIfJoined();
      fetchUserRole();
      checkAuthentication(); // Check if user is logged in
    }
  }, [isOpen, hackathonId]);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await api.getCurrentUser();
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const user = await api.getCurrentUser();
      setUserRole(user.role?.toLowerCase() || '');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchHackathonDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getHackathon(hackathonId);

      // Check if this is AgentMax and override with static details
      if (data.title?.includes('AgentMax') || data.title?.includes('AgentMaX')) {
        console.log('Using static AgentMax details');
        setHackathon({ ...data, ...agentMaxDetails });
      } else {
        setHackathon(data);
      }

      // Fetch participants
      fetchParticipants();
    } catch (error: any) {
      toast.error('Failed to load hackathon details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    setParticipantsLoading(true);
    try {
      const data = await api.getHackathonParticipants(hackathonId);
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const checkIfJoined = async () => {
    try {
      // Check if we should force registration flow (post-login)
      const forceRegistrationFlow = sessionStorage.getItem('force_registration_flow');
      if (forceRegistrationFlow === hackathonId) {
        console.log('🔄 Forcing registration flow for hackathon:', hackathonId);
        sessionStorage.removeItem('force_registration_flow');
        setHasJoined(false);
        setUserSubmission(null);
        return;
      }

      const currentUser = await api.getCurrentUser();

      // CRITICAL FIX: Check if user is the organizer first
      if (hackathon && hackathon.organizerId === currentUser.id) {
        setHasJoined(true); // Organizers are always "joined" to their own hackathons
        setUserSubmission(null);
        return;
      }

      // Check registration status via participants API for non-organizers
      const participants = await api.getHackathonParticipants(hackathonId);
      const participant = participants.find((p: any) => p.user.id === currentUser.id);
      const isRegistered = !!participant;
      setHasJoined(isRegistered);

      console.log('🔍 Registration check:', {
        userId: currentUser.id,
        isRegistered,
        participantCount: participants.length
      });

      // Check if user has submission (only if registered)
      if (isRegistered) {
        try {
          const submissions = await api.getSubmissions({ hackathonId, userId: currentUser.id });
          setUserSubmission(submissions[0] || null);
        } catch (submissionError) {
          console.error('Error fetching user submissions:', submissionError);
          setUserSubmission(null);
        }
      } else {
        setUserSubmission(null);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      // If user is not authenticated, they haven't joined
      setHasJoined(false);
      setUserSubmission(null);
    }
  };

  const handleRegister = async () => {
    if (!hackathon) return;

    // CHECK AUTHENTICATION FIRST
    if (!isAuthenticated) {
      toast.info('Please login to register for this hackathon');
      // Save hackathon ID for auto-registration after login
      localStorage.setItem('pending_registration_hackathon', hackathon.id);
      // Navigate to auth page
      if (onNavigateToAuth) {
        onNavigateToAuth('/explore', hackathon.id);
      }
      onClose(); // Close modal
      return;
    }

    // Open team registration modal (don't close main modal)
    setIsTeamRegistrationOpen(true);
  };

  const handlePublish = async () => {
    if (!hackathon) return;
    try {
      await api.updateHackathonStatus(hackathon.id, 'LIVE');
      toast.success('Hackathon published successfully!');
      await fetchHackathonDetails(); // Refresh data
      onClose(); // Close modal after publishing
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish hackathon');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
      case 'REGISTRATION_OPEN':
      case 'IN_PROGRESS':
      case 'SUBMISSION_OPEN':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'DRAFT':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'COMPLETED':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      default:
        return 'bg-slate-500/20 text-white border-slate-500/50';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category?.replace(/_/g, ' ') || category;
  };

  if (!isOpen) return null;

  const mainModal = createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - ONLY COVERS RIGHT SIDE, LEAVES SIDEBAR VISIBLE */}
          <div
            className="fixed top-0 bottom-0 bg-black/70 backdrop-blur-sm z-[9998] left-0 w-full md:left-64 md:w-auto md:right-0"
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              zIndex: 9998
            }}
            onClick={(e) => {
              // Only close if team registration modal is not open
              if (!isTeamRegistrationOpen) {
                onClose();
              }
            }}
          />

          {/* Modal Container - MOVED TO RIGHT SIDE TO AVOID BLOCKING SIDEBAR */}
          <div
            className="fixed top-0 bottom-0 z-[9999] flex items-center justify-center p-4 left-0 w-full md:left-64 md:w-auto md:right-0"
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              margin: 0,
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              style={{
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 9999
              }}
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              <Card className="w-full h-full bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/80 shadow-2xl modal-content flex flex-col backdrop-blur-xl">
                {loading ? (
                  <div className="p-12 text-center flex-shrink-0">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white">Loading hackathon details...</p>
                  </div>
                ) : hackathon ? (
                  <>
                    {/* Header - Fixed */}
                    <div className="relative flex-shrink-0">
                      {/* Banner Image */}
                      <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-500 to-purple-600">
                        {(hackathon.bannerImageUrl || hackathon.bannerUrl) ? (
                          <img
                            src={hackathon.bannerImageUrl || hackathon.bannerUrl}
                            alt={hackathon.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Hide image if it fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                        {/* Close Button */}
                        <Button
                          type="button"
                          size="icon"
                          onClick={onClose}
                          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                        >
                          <X className="w-5 h-5" />
                        </Button>

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className={getStatusColor(hackathon.status)}>
                            {hackathon.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        {/* Title */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 line-clamp-2">{hackathon.title}</h2>
                          <p className="text-white text-sm sm:text-base">
                            by {hackathon.title.toLowerCase().includes('agentmax') ? 'AgentMaX Team' : `${hackathon.organizer?.firstName} ${hackathon.organizer?.lastName}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content - Scrollable with consistent height */}
                    <div className="flex-1 min-h-0 bg-gradient-to-br from-slate-800/95 to-slate-900/95 flex flex-col">
                      {/* Tabs */}
                      <div className="flex gap-1 sm:gap-2 p-3 sm:p-4 border-b border-slate-700 bg-slate-800/60 flex-shrink-0 overflow-x-auto">
                        <Button
                          size="sm"
                          onClick={() => setActiveTab('overview')}
                          className={`whitespace-nowrap ${activeTab === 'overview'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Overview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setActiveTab('details')}
                          className={`whitespace-nowrap ${activeTab === 'details'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setActiveTab('rules')}
                          className={`whitespace-nowrap ${activeTab === 'rules'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Rules
                        </Button>
                        {hackathon.timeline && hackathon.timeline.length > 0 && (
                          <Button
                            size="sm"
                            onClick={() => setActiveTab('timeline')}
                            className={`whitespace-nowrap ${activeTab === 'timeline'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                              : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Timeline
                          </Button>
                        )}
                      </div>

                      {/* Tab Content - Fixed height container */}
                      <div
                        className="modal-scroll-area flex-1 min-h-0 p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 overflow-y-auto"
                        style={{
                          minHeight: '400px',
                          maxHeight: 'calc(90vh - 300px)' // Consistent height across all tabs
                        }}
                        onWheel={(e) => {
                          // Handle wheel events within the scroll area
                          const element = e.currentTarget;
                          const { scrollTop, scrollHeight, clientHeight } = element;

                          // If we're at the top and scrolling up, or at bottom and scrolling down,
                          // prevent the event from bubbling up
                          if (
                            (scrollTop === 0 && e.deltaY < 0) ||
                            (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0)
                          ) {
                            e.preventDefault();
                          }

                          // Always stop propagation to prevent affecting background
                          e.stopPropagation();
                        }}
                      >
                        {/* Logo Display */}
                        {(hackathon.logoImageUrl || hackathon.logoUrl) && (
                          <div className="flex justify-center mb-6">
                            <div className="w-32 h-16 rounded-lg border-2 border-slate-700 bg-slate-800 shadow-lg overflow-hidden flex items-center justify-center px-2">
                              <img
                                src={hackathon.logoImageUrl || hackathon.logoUrl}
                                alt={`${hackathon.title} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            {/* Description */}
                            <div>
                              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                About This Hackathon
                              </h3>
                              <p className="text-white leading-relaxed">
                                {hackathon.description || 'Join this exciting hackathon and showcase your skills! Build innovative solutions, collaborate with talented developers, and compete for amazing prizes.'}
                              </p>
                            </div>

                            {/* Category and Theme */}
                            {hackathon.category && (
                              <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
                                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                  <Target className="w-5 h-5 text-blue-400" />
                                  Theme & Category
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                    {getCategoryLabel(hackathon.category)}
                                  </Badge>
                                </div>
                              </Card>
                            )}

                            {/* Key Information Grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <Card className="p-4 bg-slate-800/50 border-slate-700">
                                <div className="flex items-center gap-3 mb-2">
                                  {hackathon.title.toLowerCase().includes('agentmax') ? (
                                    <DollarSign className="w-5 h-5 text-emerald-400" />
                                  ) : (
                                    <Trophy className="w-5 h-5 text-yellow-400" />
                                  )}
                                  <span className="text-white font-semibold">
                                    {hackathon.title.toLowerCase().includes('agentmax') ? 'Registration Fee' : 'Prize'}
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                  {hackathon.title.toLowerCase().includes('agentmax')
                                    ? '₹29,999'
                                    : (hackathon.prizePool || (hackathon.prizeAmount
                                      ? `${hackathon.prizeCurrency === 'INR' ? '₹' : '$'}${hackathon.prizeAmount.toLocaleString()}`
                                      : 'TBD'))}
                                </p>
                              </Card>

                              <Card className="p-4 bg-slate-800/50 border-slate-700">
                                <div className="flex items-center gap-3 mb-2">
                                  <MapPin className="w-5 h-5 text-red-400" />
                                  <span className="text-white font-semibold">Venue</span>
                                </div>
                                <p className="text-sm font-bold text-white">
                                  {hackathon.location || hackathon.venue || 'TBD'}
                                  {hackathon.isVirtual && ' (Virtual)'}
                                </p>
                              </Card>

                              <Card className="p-4 bg-slate-800/50 border-slate-700">
                                <div className="flex items-center gap-3 mb-2">
                                  <Calendar className="w-5 h-5 text-green-400" />
                                  <span className="text-white font-semibold">Start Date</span>
                                </div>
                                <p className="text-sm text-white font-semibold">
                                  {formatDate(hackathon.startDate)}
                                </p>
                              </Card>

                              <Card className="p-4 bg-slate-800/50 border-slate-700">
                                <div className="flex items-center gap-3 mb-2">
                                  <Clock className="w-5 h-4 text-blue-400" />
                                  <span className="text-white font-semibold">End Date</span>
                                </div>
                                <p className="text-sm text-white font-semibold">
                                  {hackathon.title.toLowerCase().includes('agentmax') ? '30/10/2025' : formatDate(hackathon.endDate)}
                                </p>
                              </Card>

                              <Card className="p-4 bg-slate-800/50 border-slate-700">
                                <div className="flex items-center gap-3 mb-2">
                                  <FileText className="w-5 h-5 text-red-400" />
                                  <span className="text-white font-semibold">Registration Deadline</span>
                                </div>
                                <p className="text-sm text-white font-semibold">
                                  {formatDate(hackathon.registrationDeadline || hackathon.registrationEnd)}
                                </p>
                              </Card>

                              <Card className="p-4 bg-slate-800/50 border-slate-700">
                                <div className="flex items-center gap-3 mb-2">
                                  <Users className="w-5 h-5 text-cyan-400" />
                                  <span className="text-white font-semibold">Team Size</span>
                                </div>
                                <p className="text-sm text-white font-semibold">
                                  {hackathon.minTeamSize}-{hackathon.maxTeamSize} people
                                  {hackathon.allowIndividual && ' (Solo allowed)'}
                                </p>
                              </Card>

                              <Card className="p-4 bg-slate-800/50 border-slate-700">
                                <div className="flex items-center gap-3 mb-2">
                                  <Users className="w-5 h-5 text-indigo-400" />
                                  <span className="text-white font-semibold">Participants</span>
                                </div>
                                {participantsLoading ? (
                                  <div className="h-6 w-24 bg-slate-700/50 animate-pulse rounded"></div>
                                ) : (
                                  <div className="flex flex-col gap-1">
                                    {hackathon?.title?.includes('AgentMax') || hackathon?.title?.includes('AgentMaX') ? (
                                      <>
                                        <p className="text-xl font-bold text-white">
                                          {agentMaxDetails.stats.teamCount} Teams
                                        </p>
                                        <p className="text-xs text-white/70">
                                          and {agentMaxDetails.stats.avgTeamSize} members in each team
                                        </p>
                                      </>
                                    ) : teamStats.teamCount > 0 ? (
                                      <>
                                        <p className="text-xl font-bold text-white">
                                          {teamStats.teamCount} Teams
                                        </p>
                                        <p className="text-xs text-white/70">
                                          and {teamStats.avgMembers} members in each team
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-2xl font-bold text-white">
                                          {participants.length}
                                        </p>
                                        <p className="text-xs text-white/50">Registered Users</p>
                                      </>
                                    )}
                                  </div>
                                )}
                              </Card>

                              {/* Rules Card - Moved here to be next to Participants */}
                              {hackathon.rules && (
                                <Card className="p-4 bg-slate-800/50 border-slate-700">
                                  <div className="flex items-center gap-3 mb-2">
                                    <BookOpen className="w-5 h-5 text-indigo-400" />
                                    <span className="text-white font-semibold">Rules</span>
                                  </div>
                                  <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 pr-2">
                                    <p className="text-sm text-white/80 whitespace-pre-line">
                                      {hackathon.rules}
                                    </p>
                                  </div>
                                </Card>
                              )}
                            </div>

                            {/* Guidelines Only (if separate) */}
                            {hackathon.guidelines && (
                              <div className="mt-4">
                                <Card className="p-4 bg-slate-800/50 border-slate-700">
                                  <h4 className="text-lg font-bold text-white mb-2">Guidelines</h4>
                                  <p className="text-white text-sm whitespace-pre-line">{hackathon.guidelines}</p>
                                </Card>
                              </div>
                            )}

                            {/* Requirements */}
                            {hackathon.requirements && (
                              <Card className="p-4 bg-slate-800/50 border-slate-700">
                                <h4 className="text-lg font-bold text-white mb-3">Requirements</h4>
                                <div className="text-white/80 text-sm">
                                  {typeof hackathon.requirements === 'string' ? (
                                    (() => {
                                      try {
                                        const req = JSON.parse(hackathon.requirements);
                                        return (
                                          <div className="space-y-2">
                                            {req.description && <p className="text-slate-300">{req.description}</p>}
                                            {req.technologies && Array.isArray(req.technologies) && (
                                              <div>
                                                <p className="font-semibold mb-1 text-slate-200">Technologies:</p>
                                                <div className="flex flex-wrap gap-2">
                                                  {req.technologies.map((tech: string, i: number) => (
                                                    <Badge key={i} className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                                      {tech}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                            {req.deliverables && Array.isArray(req.deliverables) && (
                                              <div>
                                                <p className="font-semibold mb-1 text-slate-200">Deliverables:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                  {req.deliverables.map((del: string, i: number) => (
                                                    <li key={i}>{del}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      } catch {
                                        return <p className="text-slate-300">{hackathon.requirements}</p>;
                                      }
                                    })()
                                  ) : (
                                    <p className="text-slate-300">{JSON.stringify(hackathon.requirements)}</p>
                                  )}
                                </div>
                              </Card>
                            )}

                            {/* Why Participate */}
                            {hackathon.whyParticipate && (
                              <Card className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                  <Award className="w-5 h-5 text-green-400" />
                                  Why Participate?
                                </h4>
                                <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                                  {hackathon.whyParticipate}
                                </p>
                              </Card>
                            )}

                            {/* Expected Outcome */}
                            {hackathon.expectedOutcome && (
                              <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                  <Target className="w-5 h-5 text-blue-400" />
                                  Expected Outcome
                                </h4>
                                <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                                  {hackathon.expectedOutcome}
                                </p>
                              </Card>
                            )}
                          </motion.div>
                        )}

                        {/* Details Tab */}
                        {activeTab === 'details' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            {/* Hackathon Overview */}
                            <Card className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
                              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-400" />
                                Hackathon Overview
                              </h4>
                              <div className="space-y-3 text-sm text-white/90">
                                <div className="flex justify-between">
                                  <span className="text-white/70">Status:</span>
                                  <Badge className={getStatusColor(hackathon.status)}>
                                    {hackathon.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70">Category:</span>
                                  <span className="text-white">{getCategoryLabel(hackathon.category)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70">Registration Fee:</span>
                                  <span className="text-white font-semibold text-emerald-400">
                                    {hackathon.title.toLowerCase().includes('agentmax') ? '₹29,999' : (hackathon.registrationFee ? `${hackathon.prizeCurrency || 'INR'} ${hackathon.registrationFee}` : 'Free')}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70">Virtual Event:</span>
                                  <span className="text-white">{hackathon.isVirtual ? 'Yes' : 'No'}</span>
                                </div>
                              </div>
                            </Card>

                            {/* Requirements */}
                            <Card className="p-5 bg-slate-800/50 border-slate-700">
                              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-purple-400" />
                                Requirements & Expectations
                              </h4>
                              <div className="text-white/90 text-sm">
                                {hackathon.requirements ? (
                                  typeof hackathon.requirements === 'string' ? (
                                    (() => {
                                      try {
                                        const req = JSON.parse(hackathon.requirements);
                                        return (
                                          <div className="space-y-4">
                                            {req.description && (
                                              <p className="leading-relaxed text-slate-300">{req.description}</p>
                                            )}
                                            {req.technologies && Array.isArray(req.technologies) && (
                                              <div>
                                                <p className="font-semibold mb-2 text-white">Technologies:</p>
                                                <div className="flex flex-wrap gap-2">
                                                  {req.technologies.map((tech: string, i: number) => (
                                                    <Badge key={i} className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                                      {tech}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                            {req.deliverables && Array.isArray(req.deliverables) && (
                                              <div>
                                                <p className="font-semibold mb-2 text-white">Deliverables:</p>
                                                <ul className="list-disc list-inside space-y-2">
                                                  {req.deliverables.map((del: string, i: number) => (
                                                    <li key={i} className="leading-relaxed">{del}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      } catch {
                                        return <p className="leading-relaxed text-slate-300">{hackathon.requirements}</p>;
                                      }
                                    })()
                                  ) : (
                                    <p className="leading-relaxed text-slate-300">{JSON.stringify(hackathon.requirements)}</p>
                                  )
                                ) : (
                                  <div className="space-y-4">
                                    <p className="leading-relaxed text-slate-300">
                                      Participants are expected to build innovative solutions that demonstrate creativity, technical excellence, and practical impact.
                                    </p>
                                    <div>
                                      <p className="font-semibold mb-2 text-white">Expected Deliverables:</p>
                                      <ul className="list-disc list-inside space-y-2">
                                        <li>Working prototype or application</li>
                                        <li>Source code repository (GitHub recommended)</li>
                                        <li>Project documentation and README</li>
                                        <li>Demo video or presentation</li>
                                        <li>Technical architecture overview</li>
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>

                            {/* Judging Criteria */}
                            <Card className="p-5 bg-slate-800/50 border-slate-700">
                              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-400" />
                                Judging Criteria
                              </h4>
                              <div className="space-y-4">
                                {hackathon.judgingCriteria && hackathon.judgingCriteria.length > 0 ? (
                                  hackathon.judgingCriteria.map((criteria: any, index: number) => (
                                    <div key={index} className="flex items-start gap-4">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">{criteria.weight}%</span>
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-white mb-1">{criteria.criterion}</h5>
                                        <p className="text-sm text-white/80">{criteria.description}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  // Default judging criteria
                                  [
                                    { criterion: 'Innovation & Creativity', weight: 25, description: 'Originality of the solution and creative approach to problem-solving' },
                                    { criterion: 'Technical Implementation', weight: 30, description: 'Code quality, architecture, and technical excellence' },
                                    { criterion: 'Practical Impact', weight: 25, description: 'Real-world applicability and potential for impact' },
                                    { criterion: 'Presentation & Demo', weight: 20, description: 'Quality of presentation and demonstration of the solution' }
                                  ].map((criteria, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">{criteria.weight}%</span>
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-white mb-1">{criteria.criterion}</h5>
                                        <p className="text-sm text-white/80">{criteria.description}</p>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </Card>

                            {/* Judges */}
                            {hackathon.judges && hackathon.judges.length > 0 && (
                              <Card className="p-5 bg-slate-800/50 border-slate-700">
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Users className="w-5 h-5 text-cyan-400" />
                                  Judges
                                </h4>
                                <div className="space-y-4">
                                  {hackathon.judges.map((judge: any, index: number) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-lg">
                                          {judge.name.charAt(0)}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-white mb-1">{judge.name}</h5>
                                        <p className="text-xs text-blue-400 mb-2">{judge.expertise}</p>
                                        <p className="text-sm text-white/80 mb-2">{judge.bio}</p>
                                        <div className="flex items-center gap-3 text-xs text-white/90">
                                          <span className="flex items-center gap-1 text-slate-300">
                                            <Mail className="w-3 h-3" />
                                            {judge.email}
                                          </span>
                                          {judge.linkedinUrl && (
                                            <a
                                              href={judge.linkedinUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-1 hover:text-blue-400"
                                            >
                                              <Globe className="w-3 h-3" />
                                              LinkedIn
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            )}

                            {/* Challenge Tracks */}
                            {hackathon.tracks && hackathon.tracks.length > 0 && (
                              <Card className="p-5 bg-slate-800/50 border-slate-700">
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Target className="w-5 h-5 text-green-400" />
                                  Challenge Tracks
                                </h4>
                                <div className="space-y-4">
                                  {hackathon.tracks.map((track: any, index: number) => (
                                    <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                          <span className="text-white font-bold text-sm">{track.id}</span>
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-white mb-2">{track.title}</h5>
                                          <p className="text-sm text-white/80 leading-relaxed">{track.description}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            )}

                            {/* Awards */}
                            {hackathon.awards && hackathon.awards.length > 0 && (
                              <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Trophy className="w-5 h-5 text-yellow-400" />
                                  Awards & Recognition
                                </h4>
                                <div className="space-y-4">
                                  {hackathon.awards.map((award: any, index: number) => (
                                    <div key={index} className="p-4 bg-slate-900/30 rounded-lg border border-yellow-500/20">
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                          <Trophy className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-yellow-400 mb-2">{award.position}</h5>
                                          <p className="text-sm text-white/90 leading-relaxed">{award.description}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            )}

                            {/* Contact Information */}
                            <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-purple-400" />
                                Contact Information
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <Users className="w-4 h-4 text-white/90" />
                                  <span className="text-white">
                                    {hackathon.title.toLowerCase().includes('agentmax') ? 'AgentMaX Team' : (hackathon.contactPerson || 'Organizer')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Mail className="w-4 h-4 text-white/90" />
                                  <a href={`mailto:${hackathon.title.toLowerCase().includes('agentmax') ? 'hackathon@agentmax.in' : hackathon.contactEmail}`} className="text-blue-400 hover:text-blue-300">
                                    {hackathon.title.toLowerCase().includes('agentmax') ? 'hackathon@agentmax.in' : (hackathon.contactEmail || 'N/A')}
                                  </a>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Phone className="w-4 h-4 text-white/90" />
                                  <a href={`tel:${hackathon.title.toLowerCase().includes('agentmax') ? '+91-89512-80606' : hackathon.contactPhone}`} className="text-blue-400 hover:text-blue-300">
                                    {hackathon.title.toLowerCase().includes('agentmax') ? '+91-89512-80606' : (hackathon.contactPhone || 'N/A')}
                                  </a>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        )}

                        {/* Rules Tab */}
                        {activeTab === 'rules' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            {/* Rules */}
                            <Card className="p-5 bg-slate-800/50 border-slate-700">
                              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-red-400" />
                                Rules
                              </h4>
                              <p className="text-white text-sm whitespace-pre-line leading-relaxed">
                                {hackathon.rules || `• Teams must register before the deadline
• All team members must be registered participants
• Projects must be built during the hackathon period
• Use of existing code libraries is allowed but must be declared
• Submissions must include working code and documentation
• Follow fair play guidelines and respect intellectual property
• Judges' decisions are final
• By participating, you agree to the terms and conditions`}
                              </p>
                            </Card>

                            {/* Guidelines */}
                            <Card className="p-5 bg-slate-800/50 border-slate-700">
                              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-400" />
                                Guidelines
                              </h4>
                              <p className="text-white text-sm whitespace-pre-line leading-relaxed">
                                {hackathon.guidelines || `• Focus on innovation and creativity
• Build solutions that solve real-world problems
• Ensure your project is scalable and practical
• Provide clear documentation and demo videos
• Be prepared to present your solution to judges
• Collaborate effectively with your team members
• Make use of available mentorship and resources
• Have fun and learn something new!`}
                              </p>
                            </Card>

                            {/* Terms and Conditions */}
                            <Card className="p-5 bg-slate-800/50 border-slate-700">
                              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                                Terms & Conditions
                              </h4>
                              <p className="text-white text-sm whitespace-pre-line leading-relaxed">
                                {hackathon.title.toLowerCase().includes('agentmax') ?
                                  `• All payments made through the payment gateway are final and non-cancellable. Once a transaction is successfully processed, no cancellation requests will be entertained.
• Failure to attend, participate or utilise the services for which payment has been made (“no-show”) shall not entitle the user to a refund, either in full or in part.
• A paid registration may be transferred to another individual within the same organisation, provided that - The transfer request is submitted before the official commencement of the hackathon.
• Verified duplicate debits will be refunded as per banking/payment processor timelines(If Any).
• The organisers reserve the right, at their sole discretion, to cancel, postpone or reschedule the event. In such cases, participants will be notified, and the applicable refund or transfer policy will be communicated.
• The decision of the organisers regarding cancellations, refunds or transfers shall be final and binding.
• No refund or compensation shall be provided in the event of cancellation or disruption caused by circumstances beyond the control of the organisers, including but not limited to natural disasters, acts of government, network outages or other force majeure events.`
                                  : (hackathon.termsAndConditions || `• Participation is subject to registration and approval
• All submissions become part of the hackathon showcase
• Participants retain ownership of their intellectual property
• Organizers may use submissions for promotional purposes
• Code of conduct must be followed at all times
• Violation of rules may result in disqualification
• Prizes are awarded at the discretion of the judges
• By participating, you agree to these terms and conditions`)}
                              </p>
                            </Card>
                          </motion.div>
                        )}

                        {/* Timeline Tab */}
                        {activeTab === 'timeline' && hackathon.timeline && hackathon.timeline.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            <Card className="p-5 bg-slate-800/50 border-slate-700">
                              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-green-400" />
                                Event Timeline
                              </h4>
                              <div className="space-y-6">
                                {hackathon.timeline.map((phase: any, index: number) => (
                                  <div key={index} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">{index + 1}</span>
                                      </div>
                                      {index < hackathon.timeline.length - 1 && (
                                        <div className="w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-500 mt-2"></div>
                                      )}
                                    </div>
                                    <div className="flex-1 pb-6">
                                      <h5 className="font-semibold text-white mb-2">{phase.phase}</h5>
                                      <p className="text-sm text-white/80 mb-3">{phase.description}</p>
                                      <div className="flex items-center gap-4 text-xs text-white/90">
                                        <span className="flex items-center gap-1 text-slate-300">
                                          <Calendar className="w-3 h-3" />
                                          {formatDate(phase.startDate)}
                                        </span>
                                        <span className="text-slate-300">→</span>
                                        <span className="flex items-center gap-1 text-slate-300">
                                          <Clock className="w-3 h-3" />
                                          {formatDate(phase.endDate)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - Fixed at bottom with responsive layout */}
                    <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 pt-4 border-t border-slate-700 flex-shrink-0 bg-slate-900/50">
                      {/* Organizer buttons */}
                      {userRole === 'organizer' && hackathon && (() => {
                        const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
                        const isOwner = hackathon.organizerId === currentUser.id;

                        if (isOwner) {
                          // Owner of the hackathon
                          return (
                            <>
                              {(hackathon.status === 'DRAFT' || hackathon.status === 'UPCOMING') && (
                                <Button
                                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                                  onClick={handlePublish}
                                >
                                  <CheckCircle2 className="w-5 h-5 mr-2" />
                                  Publish Hackathon
                                </Button>
                              )}
                              <Button
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                                onClick={() => {
                                  // Navigate to participants page or analytics
                                  onClose();
                                }}
                              >
                                <Users className="w-5 h-5 mr-2" />
                                Manage Hackathon
                              </Button>
                            </>
                          );
                        } else {
                          // Organizer viewing someone else's hackathon - treat as participant
                          return null; // Will fall through to participant logic below
                        }
                      })()}

                      {/* Participant buttons - show for non-organizers OR organizers viewing other hackathons */}
                      {(userRole !== 'organizer' || (hackathon && hackathon.organizerId !== JSON.parse(localStorage.getItem('user_data') || '{}').id)) && hackathon && (() => {
                        const now = new Date();
                        const submissionStart = new Date(hackathon.startDate);
                        const submissionEnd = new Date(hackathon.submissionDeadline);
                        const isSubmissionWindowOpen = now >= submissionStart && now <= submissionEnd;
                        const isSubmissionLocked = now > submissionEnd;

                        if (!hasJoined && hackathon.status === 'LIVE' && !hackathon.title.toLowerCase().includes('agentmax')) {
                          // NOT REGISTERED - Show Register button (only if LIVE and NOT AgentMaX)
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                              onClick={handleRegister}
                              disabled={isJoining}
                            >
                              {isJoining ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                  Registering...
                                </>
                              ) : (
                                <>
                                  <Users className="w-5 h-5 mr-2" />
                                  Register
                                </>
                              )}
                            </Button>
                          );
                        } else if (hackathon.title.toLowerCase().includes('agentmax')) {
                          // AgentMaX specific: no register button (ended)
                          return null;
                        } else if (hackathon.status === 'COMPLETED') {
                          // COMPLETED HACKATHON - Show View Results button
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                              onClick={onClose}
                            >
                              <Trophy className="w-5 h-5 mr-2" />
                              View Results
                            </Button>
                          );
                        } else if (!isSubmissionWindowOpen && now < submissionStart) {
                          // REGISTERED BUT BEFORE SUBMISSION WINDOW
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                              disabled
                            >
                              <Clock className="w-5 h-5 mr-2" />
                              Submission Opens Soon
                            </Button>
                          );
                        } else if (isSubmissionWindowOpen && !userSubmission) {
                          // REGISTERED, SUBMISSION WINDOW OPEN, NO SUBMISSION
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                              onClick={() => {
                                console.log("SUBMIT PROJECT CLICKED", hackathon.id);
                                navigate(`/submit/${hackathon.id}`);
                              }}
                            >
                              <FileText className="w-5 h-5 mr-2" />
                              Submit Project
                            </Button>
                          );
                        } else if (userSubmission && !isSubmissionLocked) {
                          // HAS SUBMISSION, STILL EDITABLE
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                              onClick={() => {
                                if (onJoin) {
                                  onJoin(hackathon.id, userSubmission.id);
                                }
                                onClose();
                              }}
                            >
                              <Edit className="w-5 h-5 mr-2" />
                              Edit Submission
                            </Button>
                          );
                        } else if (userSubmission && isSubmissionLocked) {
                          // HAS SUBMISSION, LOCKED
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                              onClick={() => {
                                if (onJoin) {
                                  onJoin(hackathon.id, userSubmission.id);
                                }
                                onClose();
                              }}
                            >
                              <Eye className="w-5 h-5 mr-2" />
                              View Submission
                            </Button>
                          );
                        } else if (isSubmissionLocked) {
                          // REGISTERED, NO SUBMISSION, BUT DEADLINE PASSED
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold"
                              disabled
                            >
                              <AlertCircle className="w-5 h-5 mr-2" />
                              Submission Deadline Passed
                            </Button>
                          );
                        } else {
                          // REGISTERED, NO SUBMISSION, WITHIN DEADLINE (fallback)
                          return (
                            <Button
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                              onClick={() => {
                                console.log("SUBMIT PROJECT CLICKED", hackathon.id);
                                navigate(`/submit/${hackathon.id}`);
                              }}
                            >
                              <FileText className="w-5 h-5 mr-2" />
                              Submit Project
                            </Button>
                          );
                        }
                      })()}

                      <Button
                        type="button"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                        onClick={onClose}
                      >
                        Close
                      </Button>
                    </div>

                    {/* Status Messages */}
                    {hackathon.status === 'DRAFT' && userRole !== 'organizer' && (
                      <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <p className="text-sm text-yellow-400">
                          This hackathon is still in draft mode. You can join for testing purposes.
                        </p>
                      </div>
                    )}
                    {hackathon.status === 'DRAFT' && userRole === 'organizer' && (
                      <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-start gap-2 flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                        <p className="text-sm text-blue-400">
                          This hackathon is in draft mode. Publish it to make it available to participants.
                        </p>
                      </div>
                    )}
                    {hackathon.status === 'COMPLETED' && (
                      <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-start gap-2 flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                        <p className="text-sm text-blue-400">
                          This hackathon has been completed. Registration is closed.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-white">Failed to load hackathon details</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );

  // Render TeamRegistrationModal separately with its own portal
  const teamRegistrationModal = hackathon && isTeamRegistrationOpen && createPortal(
    <TeamRegistrationModal
      hackathon={hackathon}
      isOpen={isTeamRegistrationOpen}
      onClose={() => setIsTeamRegistrationOpen(false)}
      onSuccess={() => {
        setIsTeamRegistrationOpen(false);
        setHasJoined(true);
        checkIfJoined(); // Refresh status
        if (onJoin) {
          onJoin(hackathon.id, undefined);
        }
      }}
    />,
    document.body
  );

  return (
    <>
      {mainModal}
      {teamRegistrationModal}
    </>
  );
}

