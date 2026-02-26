import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, Clock, Target, ChevronRight, Search, Loader2, Edit, X, Plus, Upload, Image as ImageIcon, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { HackathonDetailsModal } from './HackathonDetailsModal';

interface MyHackathonsProps {
  userId?: string;
  userRole?: string;
}

export function MyHackathons({ userId, userRole }: MyHackathonsProps) {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, [userId, filter]);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      let myHackathons: any[] = [];

      if (userRole === 'organizer') {
        // For organizers: show hackathons they created
        const allHackathons = await api.getHackathons();
        const currentUser = await api.getCurrentUser().catch(() => null);
        console.log('🔍 Organizer fetching hackathons:', {
          currentUserId: currentUser?.id,
          totalHackathons: allHackathons.length
        });

        if (currentUser) {
          myHackathons = allHackathons.filter((h: any) => {
            const isOwner = h.organizerId === currentUser.id;
            console.log(`📋 Hackathon "${h.title}": organizerId=${h.organizerId}, currentUserId=${currentUser.id}, isOwner=${isOwner}`);
            return isOwner;
          });
          console.log('✅ Filtered organizer hackathons:', myHackathons.length);
        }
      } else {
        // For participants: use the dedicated API endpoint
        try {
          myHackathons = await api.getMyHackathons();
          console.log('✅ Fetched participant hackathons:', myHackathons.length);
        } catch (err) {
          console.error('Error fetching my hackathons:', err);
          myHackathons = [];
        }
      }

      // Apply status filter
      const filtered = myHackathons.filter((h: any) => {
        if (filter === 'active') {
          return ['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN', 'LIVE'].includes(h.status);
        } else if (filter === 'completed') {
          return h.status === 'COMPLETED';
        }
        return true;
      });

      console.log('📊 Final hackathons to display:', filtered.length);
      setHackathons(filtered);
    } catch (error: any) {
      console.error('Error fetching hackathons:', error);
      toast.error('Failed to load hackathons');
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">My Hackathons</h1>
        <p className="text-white">Track your active and completed hackathons</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
          <Input
            placeholder="Search hackathons..."
            className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            className={filter === 'all' ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold' : 'bg-slate-800 text-white'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            className={filter === 'active' ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold' : 'bg-slate-800 text-white'}
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            className={filter === 'completed' ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold' : 'bg-slate-800 text-white'}
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </div>
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
          <p className="text-white/90">Try adjusting your filters or explore available hackathons.</p>
        </div>
      )}

      {/* Hackathons Grid */}
      {!loading && (
        <div className="space-y-6">
          {hackathons
            .filter((h) => !searchQuery || h.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((hackathon, index) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm hover:border-blue-500 hover:border-4 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/50 hover:from-blue-800/40 hover:to-slate-800/90 hover:scale-[1.02] transform group hover:ring-4 hover:ring-blue-400/30 relative">
                  <div className="md:flex">
                    {/* Image */}
                    <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                      {hackathon.bannerImageUrl ? (
                        <img
                          src={hackathon.bannerImageUrl}
                          alt={hackathon.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Trophy className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{hackathon.title}</h3>
                            <Badge
                              className={`${['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN'].includes(hackathon.status)
                                  ? 'bg-green-500/20 text-green-300 border-green-500/50'
                                  : 'bg-slate-500/20 text-white border-slate-500/50'
                                }`}
                            >
                              {hackathon.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-white text-sm mb-2">by {hackathon.organizer?.firstName || 'Organizer'}</p>
                          <p className="text-white mb-4 line-clamp-2">{hackathon.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <div>
                            <p className="text-xs text-white">Prize</p>
                            <p className="font-semibold text-sm text-white">
                              {hackathon.prizeAmount ? `$${hackathon.prizeAmount.toLocaleString()}` : 'TBD'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-400" />
                          <div>
                            <p className="text-xs text-white">Deadline</p>
                            <p className="font-semibold text-sm text-white">
                              {hackathon.submissionDeadline
                                ? new Date(hackathon.submissionDeadline).toLocaleDateString()
                                : 'TBD'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-400" />
                          <div>
                            <p className="text-xs text-white">Category</p>
                            <p className="font-semibold text-sm text-white">{hackathon.category?.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <div>
                            <p className="text-xs text-white">Starts</p>
                            <p className="font-semibold text-sm text-white">
                              {hackathon.startDate
                                ? new Date(hackathon.startDate).toLocaleDateString()
                                : 'TBD'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN'].includes(hackathon.status) && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-white">Status</span>
                            <span className="font-semibold text-white">{hackathon.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {userRole === 'organizer' && (
                          <>
                            {/* Status Management Buttons */}
                            {hackathon.status === 'DRAFT' && (
                              <Button
                                type="button"
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                                onClick={async () => {
                                  try {
                                    await api.updateHackathonStatus(hackathon.id, 'LIVE');
                                    toast.success('Hackathon is now live!');
                                    fetchHackathons();
                                  } catch (error: any) {
                                    toast.error(error.message || 'Failed to make hackathon live');
                                  }
                                }}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Go Live
                              </Button>
                            )}

                            {['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN', 'LIVE'].includes(hackathon.status) && (
                              <Button
                                type="button"
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-semibold"
                                onClick={async () => {
                                  try {
                                    await api.updateHackathonStatus(hackathon.id, 'COMPLETED');
                                    toast.success('Hackathon has been stopped');
                                    fetchHackathons();
                                  } catch (error: any) {
                                    toast.error(error.message || 'Failed to stop hackathon');
                                  }
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Stop
                              </Button>
                            )}

                            {/* Edit Button */}
                            <Button
                              type="button"
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                              onClick={() => {
                                setEditingHackathon(hackathon);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>

                            {/* Delete Button */}
                            <Button
                              type="button"
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold"
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete "${hackathon.title}"? This action cannot be undone.`)) {
                                  try {
                                    await api.deleteHackathon(hackathon.id);
                                    toast.success('Hackathon deleted successfully');
                                    fetchHackathons();
                                  } catch (error: any) {
                                    toast.error(error.message || 'Failed to delete hackathon');
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}

                        {/* View Details Button */}
                        <Button
                          type="button"
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                          onClick={() => {
                            setSelectedHackathonId(hackathon.id);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          {['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'SUBMISSION_OPEN', 'LIVE'].includes(hackathon.status) ? 'View Details' : 'View Results'}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
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
        />
      )}

      {/* Edit Hackathon Modal */}
      {editingHackathon && (
        <EditHackathonModal
          hackathon={editingHackathon}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingHackathon(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setEditingHackathon(null);
            fetchHackathons();
          }}
        />
      )}
    </motion.div>
  );
}

// Helper function to parse requirements safely
function parseRequirements(req: any) {
  if (!req) return { description: '', technologies: [], deliverables: [] };
  if (typeof req === 'string') {
    try {
      const parsed = JSON.parse(req);
      return {
        description: parsed.description || '',
        technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [],
        deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
      };
    } catch {
      return { description: req, technologies: [], deliverables: [] };
    }
  }
  return {
    description: req.description || '',
    technologies: Array.isArray(req.technologies) ? req.technologies : [],
    deliverables: Array.isArray(req.deliverables) ? req.deliverables : [],
  };
}

// Edit Hackathon Modal Component
function EditHackathonModal({ hackathon, isOpen, onClose, onSuccess }: { hackathon: any; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setUploadingBanner(true);
    try {
      toast.loading('Uploading banner image...', { id: 'banner-upload' });
      const result = await api.uploadFile(file, 'hackathons/banners');
      setFormData({ ...formData, bannerImageUrl: result.file.url });
      toast.success('Banner image uploaded successfully!', { id: 'banner-upload' });
    } catch (error: any) {
      toast.error(`Failed to upload banner: ${error.message}`, { id: 'banner-upload' });
      console.error('Banner upload error:', error);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo size must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      toast.loading('Uploading logo...', { id: 'logo-upload' });
      const result = await api.uploadFile(file, 'hackathons/logos');
      setFormData({ ...formData, logoImageUrl: result.file.url });
      toast.success('Logo uploaded successfully!', { id: 'logo-upload' });
    } catch (error: any) {
      toast.error(`Failed to upload logo: ${error.message}`, { id: 'logo-upload' });
      console.error('Logo upload error:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const [formData, setFormData] = useState({
    title: hackathon.title || '',
    description: hackathon.description || '',
    category: hackathon.category || 'WEB_DEVELOPMENT',
    registrationStart: hackathon.registrationStart ? new Date(hackathon.registrationStart).toISOString().slice(0, 16) : '',
    registrationEnd: hackathon.registrationEnd ? new Date(hackathon.registrationEnd).toISOString().slice(0, 16) : '',
    startDate: hackathon.startDate ? new Date(hackathon.startDate).toISOString().slice(0, 16) : '',
    endDate: hackathon.endDate ? new Date(hackathon.endDate).toISOString().slice(0, 16) : '',
    submissionDeadline: hackathon.submissionDeadline ? new Date(hackathon.submissionDeadline).toISOString().slice(0, 16) : '',
    prizeAmount: hackathon.prizeAmount?.toString() || '',
    prizeCurrency: hackathon.prizeCurrency || 'INR',
    registrationFee: hackathon.registrationFee?.toString() || '',
    requirements: parseRequirements(hackathon.requirements),
    rules: hackathon.rules || '',
    guidelines: hackathon.guidelines || '',
    bannerImageUrl: hackathon.bannerImageUrl || '',
    logoImageUrl: hackathon.logoImageUrl || '',
    minTeamSize: hackathon.minTeamSize || 1,
    maxTeamSize: hackathon.maxTeamSize || 5,
    allowIndividual: hackathon.allowIndividual !== false,
  });

  useEffect(() => {
    if (isOpen && hackathon) {
      setFormData({
        title: hackathon.title || '',
        description: hackathon.description || '',
        category: hackathon.category || 'WEB_DEVELOPMENT',
        registrationStart: hackathon.registrationStart ? new Date(hackathon.registrationStart).toISOString().slice(0, 16) : '',
        registrationEnd: hackathon.registrationEnd ? new Date(hackathon.registrationEnd).toISOString().slice(0, 16) : '',
        startDate: hackathon.startDate ? new Date(hackathon.startDate).toISOString().slice(0, 16) : '',
        endDate: hackathon.endDate ? new Date(hackathon.endDate).toISOString().slice(0, 16) : '',
        submissionDeadline: hackathon.submissionDeadline ? new Date(hackathon.submissionDeadline).toISOString().slice(0, 16) : '',
        prizeAmount: hackathon.prizeAmount?.toString() || '',
        prizeCurrency: hackathon.prizeCurrency || 'INR',
        registrationFee: hackathon.registrationFee?.toString() || '',
        requirements: parseRequirements(hackathon.requirements),
        rules: hackathon.rules || '',
        guidelines: hackathon.guidelines || '',
        bannerImageUrl: hackathon.bannerImageUrl || '',
        logoImageUrl: hackathon.logoImageUrl || '',
        minTeamSize: hackathon.minTeamSize || 1,
        maxTeamSize: hackathon.maxTeamSize || 5,
        allowIndividual: hackathon.allowIndividual !== false,
      });
    }
  }, [isOpen, hackathon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert datetime-local to ISO string format
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString();
      };

      const hackathonData = {
        ...formData,
        registrationStart: formatDate(formData.registrationStart),
        registrationEnd: formatDate(formData.registrationEnd),
        startDate: formatDate(formData.startDate),
        endDate: formatDate(formData.endDate),
        submissionDeadline: formatDate(formData.submissionDeadline),
        prizeAmount: formData.prizeAmount ? parseFloat(formData.prizeAmount) : undefined,
        registrationFee: formData.registrationFee ? parseFloat(formData.registrationFee) : undefined,
        minTeamSize: formData.minTeamSize || 1,
        maxTeamSize: formData.maxTeamSize || 5,
        // Send requirements as object, not string - backend expects object for validation
        // Ensure requirements has required description field
        requirements: {
          description: formData.requirements?.description || '',
          technologies: Array.isArray(formData.requirements?.technologies) ? formData.requirements.technologies : [],
          deliverables: Array.isArray(formData.requirements?.deliverables) ? formData.requirements.deliverables : [],
        },
      };

      await api.updateHackathon(hackathon.id, hackathonData);
      toast.success('Hackathon updated successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hackathon');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 rounded-lg shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Edit Hackathon</h2>
          <Button
            className="text-white hover:bg-slate-800"
            size="sm"
            onClick={onClose}
            type="button"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div
          className="overflow-y-auto flex-1 min-h-0"
          data-scrollable
          style={{ maxHeight: 'calc(90vh - 100px)', WebkitOverflowScrolling: 'touch' }}
        >
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="edit-title" className="text-white font-semibold">Hackathon Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., AI Innovation Challenge 2024"
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category" className="text-white font-semibold">Category *</Label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  required
                >
                  <option value="WEB_DEVELOPMENT">Web Development</option>
                  <option value="MOBILE_DEVELOPMENT">Mobile Development</option>
                  <option value="AI_ML">AI/ML</option>
                  <option value="DATA_SCIENCE">Data Science</option>
                  <option value="CYBERSECURITY">Cybersecurity</option>
                  <option value="GAME_DEVELOPMENT">Game Development</option>
                  <option value="BLOCKCHAIN">Blockchain</option>
                  <option value="IOT">IoT</option>
                  <option value="OPEN_INNOVATION">Open Innovation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-white font-semibold">Description *</Label>
              <textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe your hackathon, goals, and what participants will build..."
                className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="edit-registrationStart" className="text-white font-semibold">Registration Start *</Label>
                <Input
                  id="edit-registrationStart"
                  type="datetime-local"
                  value={formData.registrationStart}
                  onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-registrationEnd" className="text-white font-semibold">Registration End *</Label>
                <Input
                  id="edit-registrationEnd"
                  type="datetime-local"
                  value={formData.registrationEnd}
                  onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-startDate" className="text-white font-semibold">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-endDate" className="text-white font-semibold">End Date *</Label>
                <Input
                  id="edit-endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-submissionDeadline" className="text-white font-semibold">Submission Deadline *</Label>
                <Input
                  id="edit-submissionDeadline"
                  type="datetime-local"
                  value={formData.submissionDeadline}
                  onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-prizeAmount" className="text-white font-semibold">Prize Amount</Label>
                <Input
                  id="edit-prizeAmount"
                  type="number"
                  value={formData.prizeAmount}
                  onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                  placeholder="e.g., 50000"
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="edit-prizeCurrency" className="text-white font-semibold">Prize Currency</Label>
                <select
                  id="edit-prizeCurrency"
                  value={formData.prizeCurrency}
                  onChange={(e) => setFormData({ ...formData, prizeCurrency: e.target.value })}
                  className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-registrationFee" className="text-white font-semibold">Registration Fee</Label>
                <Input
                  id="edit-registrationFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.registrationFee}
                  onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
                  placeholder="e.g., 10.00"
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-rules" className="text-white font-semibold">Rules *</Label>
              <textarea
                id="edit-rules"
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                rows={3}
                placeholder="List key rules and guidelines..."
                className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-guidelines" className="text-white font-semibold">Guidelines *</Label>
              <textarea
                id="edit-guidelines"
                value={formData.guidelines}
                onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                rows={3}
                placeholder="Provide guidelines for participants..."
                className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                required
              />
            </div>

            <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/30">
              <Label className="text-white font-semibold mb-3 block">Requirements</Label>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-requirements-description" className="text-white/80 text-sm">Description</Label>
                  <textarea
                    id="edit-requirements-description"
                    value={formData.requirements.description || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, description: e.target.value }
                    })}
                    rows={2}
                    placeholder="Describe the project requirements..."
                    className="mt-1 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-requirements-technologies" className="text-white/80 text-sm">Technologies (comma-separated)</Label>
                  <Input
                    id="edit-requirements-technologies"
                    value={Array.isArray(formData.requirements.technologies) ? formData.requirements.technologies.join(', ') : (formData.requirements.technologies || '')}
                    onChange={(e) => {
                      const techs = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                      setFormData({
                        ...formData,
                        requirements: { ...formData.requirements, technologies: techs }
                      });
                    }}
                    placeholder="React, Node.js, Python..."
                    className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-requirements-deliverables" className="text-white/80 text-sm">Deliverables (comma-separated)</Label>
                  <Input
                    id="edit-requirements-deliverables"
                    value={Array.isArray(formData.requirements.deliverables) ? formData.requirements.deliverables.join(', ') : (formData.requirements.deliverables || '')}
                    onChange={(e) => {
                      const deliverables = e.target.value.split(',').map(d => d.trim()).filter(d => d);
                      setFormData({
                        ...formData,
                        requirements: { ...formData.requirements, deliverables: deliverables }
                      });
                    }}
                    placeholder="Source code, Demo video, Documentation..."
                    className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="edit-bannerImage" className="text-white font-semibold">Banner Image</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <label
                      htmlFor="edit-bannerImage"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md hover:border-blue-500 transition-colors">
                        {uploadingBanner ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                            <span className="text-white text-sm">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-blue-400" />
                            <span className="text-white text-sm">Upload Banner Image</span>
                          </>
                        )}
                      </div>
                      <input
                        id="edit-bannerImage"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                        disabled={uploadingBanner}
                      />
                    </label>
                  </div>
                  {formData.bannerImageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.bannerImageUrl}
                        alt="Banner preview"
                        className="w-full h-32 object-cover rounded-md border border-slate-600"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <Button
                        type="button"
                        className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                        size="sm"
                        onClick={() => setFormData({ ...formData, bannerImageUrl: '' })}
                      >
                        Remove Banner
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-white/60">Or enter URL below</p>
                  <Input
                    id="edit-bannerImageUrl"
                    type="url"
                    value={formData.bannerImageUrl}
                    onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                    placeholder="https://example.com/banner.jpg"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-logoImage" className="text-white font-semibold">Logo Image</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <label
                      htmlFor="edit-logoImage"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md hover:border-blue-500 transition-colors">
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                            <span className="text-white text-sm">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-blue-400" />
                            <span className="text-white text-sm">Upload Logo</span>
                          </>
                        )}
                      </div>
                      <input
                        id="edit-logoImage"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                    </label>
                  </div>
                  {formData.logoImageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.logoImageUrl}
                        alt="Logo preview"
                        className="w-24 h-24 object-contain rounded-md border border-slate-600"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <Button
                        type="button"
                        className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                        size="sm"
                        onClick={() => setFormData({ ...formData, logoImageUrl: '' })}
                      >
                        Remove Logo
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-white/60">Or enter URL below</p>
                  <Input
                    id="edit-logoImageUrl"
                    type="url"
                    value={formData.logoImageUrl}
                    onChange={(e) => setFormData({ ...formData, logoImageUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 border border-slate-700 rounded-lg p-4 bg-slate-800/30">
              <div>
                <Label htmlFor="edit-minTeamSize" className="text-white font-semibold">Min Team Size</Label>
                <Input
                  id="edit-minTeamSize"
                  type="number"
                  min="1"
                  value={formData.minTeamSize}
                  onChange={(e) => setFormData({ ...formData, minTeamSize: parseInt(e.target.value) || 1 })}
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-maxTeamSize" className="text-white font-semibold">Max Team Size</Label>
                <Input
                  id="edit-maxTeamSize"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxTeamSize}
                  onChange={(e) => setFormData({ ...formData, maxTeamSize: parseInt(e.target.value) || 5 })}
                  className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-allowIndividual"
                    checked={formData.allowIndividual}
                    onChange={(e) => setFormData({ ...formData, allowIndividual: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500"
                  />
                  <Label htmlFor="edit-allowIndividual" className="text-white font-semibold cursor-pointer">
                    Allow Individual Participation
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Hackathon
                  </>
                )}
              </Button>
              <Button
                type="button"
                className="border-2 border-slate-600 hover:bg-slate-800 text-white"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
