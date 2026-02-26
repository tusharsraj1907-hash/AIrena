import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Trophy,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Star,
  ArrowLeft,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Branding } from './Branding';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Card3D } from '../ui/Card3D';
import { Button3D } from '../ui/Button3D';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { HackathonDetailsModal } from './HackathonDetailsModal';
import { TeamRegistrationModal } from './TeamRegistrationModal';

interface ExploreHackathonsProps {
  onBack: () => void;
  onNavigateToAuth?: (returnUrl?: string, hackathonId?: string) => void; // Add navigation callback
}

export function ExploreHackathons({ onBack, onNavigateToAuth }: ExploreHackathonsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [registeredHackathons, setRegisteredHackathons] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track auth status
  const [isTeamRegistrationOpen, setIsTeamRegistrationOpen] = useState(false);
  const [selectedHackathonForRegistration, setSelectedHackathonForRegistration] = useState<any>(null);
  const [statusFilters, setStatusFilters] = useState([
    { id: 'all', label: 'All', count: 0 },
    { id: 'active', label: 'Active', count: 0 },
    { id: 'upcoming', label: 'Upcoming', count: 0 },
    { id: 'completed', label: 'Completed', count: 0 },
  ]);

  useEffect(() => {
    fetchHackathons();
    checkAuthentication(); // Check if user is logged in
  }, [selectedStatus, searchQuery]);

  // Handle hackathon query parameter to auto-open details modal
  useEffect(() => {
    const hackathonId = searchParams.get('hackathon');
    const forceRegistration = searchParams.get('forceRegistration');
    if (hackathonId && hackathons.length > 0) {
      // Check if the hackathon exists in our list
      const hackathon = hackathons.find(h => h.id === hackathonId);
      if (hackathon) {
        setSelectedHackathonId(hackathonId);
        setIsDetailsModalOpen(true);
        // If forceRegistration is true, we'll pass this to the modal
        if (forceRegistration === 'true') {
          // Store a flag to force registration flow
          sessionStorage.setItem('force_registration_flow', hackathonId);
        }
        // Clear the query parameters after opening
        setSearchParams({});
      }
    }
  }, [hackathons, searchParams, setSearchParams]);

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


  const fetchHackathons = async () => {
    setLoading(true);
    try {
      // Fetch real hackathons from API
      const response = await api.getHackathons();

      const allHackathons = response;

      // Filter for LIVE/PUBLISHED hackathons only
      let filteredHackathons = allHackathons.filter((h: any) =>
        h.status === 'LIVE' || h.status === 'PUBLISHED' || h.status === 'UPCOMING' || h.status === 'COMPLETED' || h.status === 'ENDED'
      );

      // Apply status filter
      if (selectedStatus !== 'all') {
        filteredHackathons = filteredHackathons.filter((h: any) => {
          if (selectedStatus === 'active') {
            return h.status === 'LIVE' || h.status === 'PUBLISHED' || h.status === 'REGISTRATION_OPEN' || h.status === 'IN_PROGRESS' || h.status === 'SUBMISSION_OPEN';
          } else if (selectedStatus === 'upcoming') {
            return h.status === 'UPCOMING';
          } else if (selectedStatus === 'completed') {
            return h.status === 'COMPLETED';
          }
          return true;
        });
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredHackathons = filteredHackathons.filter((h: any) =>
          h.title.toLowerCase().includes(query) ||
          (h.description && h.description.toLowerCase().includes(query)) ||
          (h.category && h.category.toLowerCase().includes(query))
        );
      }

      setHackathons(filteredHackathons);

      // Update status counts
      const statusCounts = {
        all: allHackathons.filter((h: any) => h.status === 'LIVE' || h.status === 'PUBLISHED' || h.status === 'UPCOMING' || h.status === 'COMPLETED').length,
        active: allHackathons.filter((h: any) => h.status === 'LIVE' || h.status === 'PUBLISHED' || h.status === 'REGISTRATION_OPEN' || h.status === 'IN_PROGRESS' || h.status === 'SUBMISSION_OPEN').length,
        upcoming: allHackathons.filter((h: any) => h.status === 'UPCOMING').length,
        completed: allHackathons.filter((h: any) => h.status === 'COMPLETED').length,
      };

      setStatusFilters(prev => prev.map(filter => ({
        ...filter,
        count: statusCounts[filter.id as keyof typeof statusCounts] || 0
      })));

      // Check which hackathons user is registered for
      try {
        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          // Get user's registered hackathons
          const myHackathons = await api.getMyHackathons();
          const registeredIds = new Set(myHackathons.map((h: any) => h.id));
          setRegisteredHackathons(registeredIds);
        }
      } catch (err) {
        console.log('Not logged in or error fetching user hackathons');
      }
    } catch (error: any) {
      console.error('Error fetching hackathons:', error);
      toast.error('Failed to load hackathons');
      setHackathons([]);
    } finally {
      setLoading(false);
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
      case 'REGISTRATION_CLOSED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'COMPLETED':
      case 'CANCELLED':
        return 'bg-slate-500/20 text-white border-slate-500/50';
      default:
        return 'bg-slate-500/20 text-white border-slate-500/50';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatPrize = (amount: number | null, currency: string = 'INR') => {
    if (!amount) return 'TBD';
    return `${currency === 'INR' ? '₹' : '$'}${amount.toLocaleString()}`;
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      'WEB_DEVELOPMENT': 'Web Development',
      'MOBILE_DEVELOPMENT': 'Mobile Development',
      'AI_ML': 'AI/ML',
      'BLOCKCHAIN': 'Blockchain',
      'GAME_DEVELOPMENT': 'Game Development',
      'IOT': 'IoT',
      'CYBERSECURITY': 'Cybersecurity',
      'DATA_SCIENCE': 'Data Science',
      'FINTECH': 'FinTech',
      'HEALTHCARE': 'Healthcare',
      'EDUCATION': 'Education',
      'SOCIAL_IMPACT': 'Social Impact',
      'OTHER': 'Other'
    };
    return categoryLabels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-between">
          <Branding size="lg" />
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button
            size="sm"
            onClick={onBack}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-white">Explore Hackathons</h1>
          <p className="text-white">Discover and join exciting competitions worldwide</p>
        </motion.div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            <Input
              placeholder="Search hackathons..."
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <motion.div
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                onClick={() => setSelectedStatus(filter.id)}
                className={`px-4 py-2 cursor-pointer transition-all whitespace-nowrap font-semibold ${selectedStatus === filter.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-600'
                  }`}
              >
                {filter.label} ({filter.count})
              </Badge>
            </motion.div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <span className="ml-3 text-white">Loading hackathons...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && hackathons.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-2xl font-bold text-white mb-2">No hackathons found</h3>
            <p className="text-white/90 mb-6">Be the first to create a hackathon!</p>
            <Button3D
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
              onClick={onBack}
            >
              Go Back
            </Button3D>
          </div>
        )}

        {/* Featured Section */}
        {!loading && hackathons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Featured Hackathons</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-6 perspective-3d">
              {hackathons
                .filter((h) => h.status === 'PUBLISHED' || h.status === 'REGISTRATION_OPEN' || h.status === 'COMPLETED')
                .slice(0, 2)
                .map((hackathon, index) => (
                  <Card3D key={hackathon.id} intensity={25} flipOnHover={false}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm hover:border-blue-500 hover:border-4 transition-all duration-300 h-full glass shadow-3d-lg hover:shadow-2xl hover:shadow-blue-400/50 hover:from-blue-800/40 hover:to-slate-800/90 hover:scale-[1.03] transform group hover:ring-4 hover:ring-blue-400/30 relative">
                        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                          {(hackathon.bannerImageUrl || hackathon.bannerUrl) && (
                            <img
                              src={hackathon.bannerImageUrl || hackathon.bannerUrl}
                              alt={hackathon.title}
                              className="w-full h-full object-cover"
                            />
                          )}

                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6">
                          {(hackathon.logoImageUrl || hackathon.logoUrl) && (
                            <div className="w-32 h-16 rounded-lg border-2 border-slate-700 bg-slate-800 shadow-lg overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                              <img
                                src={hackathon.logoImageUrl || hackathon.logoUrl}
                                alt={`${hackathon.title} logo`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.opacity = '0';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold mb-1 text-white group-hover:text-blue-400 transition-colors">{hackathon.title}</h3>
                              <p className="text-sm text-white">by {hackathon.organizer?.firstName || 'Organizer'}</p>
                            </div>
                            <Badge className={getStatusColor(hackathon.status)}>
                              {hackathon.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-white text-sm mb-4 line-clamp-2">{hackathon.description}</p>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-purple-400" />
                              <span className="text-white">Starts: </span>
                              <span className="font-semibold text-white">{formatDate(hackathon.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-green-400" />
                              <span className="text-white">End Date: </span>
                              <span className="font-semibold text-white">
                                {formatDate(hackathon.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-emerald-400" />
                              <span className="text-white">
                                {hackathon.registrationFee > 0 ? 'Registration: ' : 'Prize: '}
                              </span>
                              <span className="font-semibold text-white">
                                {hackathon.registrationFee > 0
                                  ? `${hackathon.prizeCurrency === 'INR' ? '₹' : '$'}${Number(hackathon.registrationFee).toLocaleString()}`
                                  : formatPrize(hackathon.prizeAmount, hackathon.prizeCurrency)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-blue-400" />
                              <span className="text-white">Category: </span>
                              <span className="font-semibold text-white">{getCategoryLabel(hackathon.category)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button3D
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                              onClick={() => {
                                setSelectedHackathonId(hackathon.id);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              View Details <ArrowRight className="w-4 h-4 ml-2" />
                            </Button3D>
                            {hackathon.status === 'COMPLETED' ? (
                              <Button3D
                                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white font-semibold"
                                onClick={() => {
                                  setSelectedHackathonId(hackathon.id);
                                  setIsDetailsModalOpen(true);
                                }}
                              >
                                View Results
                              </Button3D>
                            ) : ['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN'].includes(hackathon.status) && (
                              <Button3D
                                className={registeredHackathons.has(hackathon.id)
                                  ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white font-semibold cursor-not-allowed"
                                  : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                                }
                                disabled={registeredHackathons.has(hackathon.id)}
                                onClick={async () => {
                                  // CHECK AUTHENTICATION FIRST
                                  if (!isAuthenticated) {
                                    toast.info('Please login to register for this hackathon');
                                    // Save hackathon ID for auto-registration after login
                                    localStorage.setItem('pending_registration_hackathon', hackathon.id);
                                    // Navigate to auth page
                                    if (onNavigateToAuth) {
                                      onNavigateToAuth('/explore', hackathon.id);
                                    }
                                    return;
                                  }

                                  if (registeredHackathons.has(hackathon.id)) {
                                    toast.info('You are already registered for this hackathon!');
                                    return;
                                  }

                                  // Open team registration modal
                                  setSelectedHackathonForRegistration(hackathon);
                                  setIsTeamRegistrationOpen(true);
                                }}
                              >
                                {registeredHackathons.has(hackathon.id) ? 'Registered ✓' : 'Register'}
                              </Button3D>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </Card3D>
                ))}
            </div>
          </motion.div>
        )}

        {/* All Hackathons */}
        {!loading && hackathons.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-6 text-white">All Hackathons</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-3d">
              {hackathons.map((hackathon, index) => (
                <Card3D key={hackathon.id} intensity={20}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm hover:border-blue-500 hover:border-4 transition-all duration-300 h-full flex flex-col glass shadow-3d hover:shadow-2xl hover:shadow-blue-400/50 hover:from-blue-800/40 hover:to-slate-800/90 hover:scale-[1.03] transform group hover:ring-4 hover:ring-blue-400/30 relative">
                      <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600">
                        {(hackathon.bannerImageUrl || hackathon.bannerUrl) && (
                          <img
                            src={hackathon.bannerImageUrl || hackathon.bannerUrl}
                            alt={hackathon.title}
                            className="w-full h-full object-cover"
                            onLoad={() => console.log('✅ Banner loaded:', hackathon.bannerImageUrl || hackathon.bannerUrl)}
                            onError={(e) => {
                              console.error('❌ Banner failed to load:', hackathon.bannerImageUrl || hackathon.bannerUrl);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}

                        <div className="absolute top-3 right-3">
                          <Badge className={getStatusColor(hackathon.status)}>
                            {hackathon.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        {(hackathon.logoImageUrl || hackathon.logoUrl) && (
                          <div className="w-20 h-10 rounded-lg border border-slate-700 bg-slate-800 shadow-md overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center px-1">
                            <img
                              src={hackathon.logoImageUrl || hackathon.logoUrl}
                              alt={`${hackathon.title} logo`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '0';
                              }}
                            />
                          </div>
                        )}
                        <div className="mb-3">
                          <h3 className="font-bold mb-1 line-clamp-1 text-white group-hover:text-blue-400 transition-colors">{hackathon.title}</h3>
                          <p className="text-xs text-white">{hackathon.organizer?.firstName || 'Organizer'}</p>
                        </div>
                        <p className="text-sm text-white mb-4 line-clamp-2 flex-1">
                          {hackathon.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Starts
                            </span>
                            <span className="font-semibold text-white">{formatDate(hackathon.startDate)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              End Date
                            </span>
                            <span className="font-semibold text-white">
                              {formatDate(hackathon.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {hackathon.registrationFee > 0 ? 'Reg. Fee' : 'Prize'}
                            </span>
                            <span className="font-semibold text-yellow-400">
                              {hackathon.registrationFee > 0
                                ? `${hackathon.prizeCurrency === 'INR' ? '₹' : '$'}${Number(hackathon.registrationFee).toLocaleString()}`
                                : formatPrize(hackathon.prizeAmount, hackathon.prizeCurrency)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <Badge className="bg-slate-800 text-white" size="sm">
                            {getCategoryLabel(hackathon.category)}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button3D
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                            onClick={() => {
                              setSelectedHackathonId(hackathon.id);
                              setIsDetailsModalOpen(true);
                            }}
                          >
                            View Details <ArrowRight className="w-3 h-3 ml-2" />
                          </Button3D>
                          {hackathon.status === 'COMPLETED' ? (
                            <Button3D
                              size="sm"
                              className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white font-semibold"
                              onClick={() => {
                                setSelectedHackathonId(hackathon.id);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              Results
                            </Button3D>
                          ) : ['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN'].includes(hackathon.status) && (
                            <Button3D
                              size="sm"
                              className={registeredHackathons.has(hackathon.id)
                                ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white font-semibold cursor-not-allowed"
                                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                              }
                              disabled={registeredHackathons.has(hackathon.id)}
                              onClick={async () => {
                                // CHECK AUTHENTICATION FIRST
                                if (!isAuthenticated) {
                                  toast.info('Please login to register for this hackathon');
                                  // Save hackathon ID for auto-registration after login
                                  localStorage.setItem('pending_registration_hackathon', hackathon.id);
                                  // Navigate to auth page
                                  if (onNavigateToAuth) {
                                    onNavigateToAuth('/explore', hackathon.id);
                                  }
                                  return;
                                }

                                if (registeredHackathons.has(hackathon.id)) {
                                  toast.info('You are already registered for this hackathon!');
                                  return;
                                }

                                // Open team registration modal
                                setSelectedHackathonForRegistration(hackathon);
                                setIsTeamRegistrationOpen(true);
                              }}
                            >
                              {registeredHackathons.has(hackathon.id) ? 'Registered ✓' : 'Register'}
                            </Button3D>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Card3D>
              ))}
            </div>
          </div>
        )}

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
              setIsDetailsModalOpen(false);
              setSelectedHackathonId(null);
              fetchHackathons(); // Refresh list
            }}
            onNavigateToAuth={onNavigateToAuth} // Pass navigation callback
          />
        )}

        {/* Team Registration Modal */}
        {selectedHackathonForRegistration && (
          <TeamRegistrationModal
            hackathon={selectedHackathonForRegistration}
            isOpen={isTeamRegistrationOpen}
            onClose={() => {
              setIsTeamRegistrationOpen(false);
              setSelectedHackathonForRegistration(null);
            }}
            onSuccess={() => {
              setIsTeamRegistrationOpen(false);
              setSelectedHackathonForRegistration(null);
              fetchHackathons(); // Refresh to update registered status
            }}
          />
        )}
      </div>
    </div>
  );
}
