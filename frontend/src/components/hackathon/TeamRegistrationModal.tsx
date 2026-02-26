import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  Plus,
  Trash2,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { PaymentModal } from './PaymentModal';

interface TeamRegistrationModalProps {
  hackathon: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TeamMember {
  name: string;
  email: string;
  role: 'LEADER' | 'MEMBER';
}

export function TeamRegistrationModal({ hackathon, isOpen, onClose, onSuccess }: TeamRegistrationModalProps) {
  const [step, setStep] = useState<'type' | 'track' | 'details'>('type');
  const [registrationType, setRegistrationType] = useState<'individual' | 'team'>('team');
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [problemStatementTracks, setProblemStatementTracks] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [backendPaymentId, setBackendPaymentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    teamName: '',
    teamDescription: '',
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser();
      fetchProblemStatementTracks();
      resetForm();
      // Ensure payment modal is closed when opening registration modal
      setShowPaymentModal(false);
    }
  }, [isOpen]);

  // Sync user name when loaded or type changes
  useEffect(() => {
    if (currentUser && registrationType === 'individual') {
      setFormData(prev => ({
        ...prev,
        teamName: `${currentUser.firstName} ${currentUser.lastName}`
      }));
    }
  }, [currentUser, registrationType]);

  const fetchProblemStatementTracks = async () => {
    try {
      // Problem statements are included in hackathon details
      if (hackathon.problemStatements) {
        setProblemStatementTracks(hackathon.problemStatements);
      }
    } catch (error) {
      console.error('Error fetching problem statement tracks:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      // Pre-fill team name with user's name for individual registration
      if (registrationType === 'individual') {
        setFormData(prev => ({
          ...prev,
          teamName: `${user.firstName} ${user.lastName}`,
        }));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const resetForm = () => {
    setStep('type');
    setRegistrationType('team');
    setSelectedTrack(null);
    setFormData({
      teamName: '',
      teamDescription: '',
    });
    setTeamMembers([]);
  };

  const handleTypeSelection = (type: 'individual' | 'team') => {
    setRegistrationType(type);
    if (type === 'individual' && currentUser) {
      setFormData(prev => ({
        ...prev,
        teamName: `${currentUser.firstName} ${currentUser.lastName}`,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        teamName: '',
      }));
    }

    // If there are problem statement tracks, go to track selection, otherwise go to details
    if (problemStatementTracks && problemStatementTracks.length > 0) {
      setStep('track');
    } else {
      setStep('details');
    }
  };

  const handleTrackSelection = (trackNumber: number) => {
    setSelectedTrack(trackNumber);
    setStep('details');
  };

  const addTeamMember = () => {
    if (teamMembers.length >= (hackathon.maxTeamSize - 1)) {
      toast.error(`Maximum team size is ${hackathon.maxTeamSize} members`);
      return;
    }
    setTeamMembers([...teamMembers, { name: '', email: '', role: 'MEMBER' }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const validateForm = () => {
    if (!formData.teamName.trim()) {
      console.error('❌ Validation Failed: Team Name is empty');
      toast.error('Please enter a team name');
      return false;
    }

    // Validate track selection if tracks are available
    if (problemStatementTracks && problemStatementTracks.length > 0 && !selectedTrack) {
      toast.error('Please select a problem statement track');
      return false;
    }

    if (registrationType === 'team') {
      const totalMembers = teamMembers.length + 1; // +1 for current user

      if (totalMembers < hackathon.minTeamSize) {
        toast.error(`Minimum team size is ${hackathon.minTeamSize} members`);
        return false;
      }

      if (totalMembers > hackathon.maxTeamSize) {
        toast.error(`Maximum team size is ${hackathon.maxTeamSize} members`);
        return false;
      }

      // Validate all names and emails are filled
      for (let i = 0; i < teamMembers.length; i++) {
        if (!teamMembers[i].name.trim()) {
          toast.error(`Please enter name for team member ${i + 1}`);
          return false;
        }
        if (!teamMembers[i].email.trim()) {
          toast.error(`Please enter email for team member ${i + 1}`);
          return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(teamMembers[i].email)) {
          toast.error(`Invalid email for team member ${i + 1}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (hackathon.registrationFee > 0) {
        // Paid hackathon — create a real payment record in DB before showing modal
        console.log('💳 Creating participant payment order...');
        const order = await api.createParticipantPaymentOrder(hackathon.id);
        setBackendPaymentId(order.paymentId);
        console.log('✅ Payment order created:', order.paymentId);
        setLoading(false);
        setShowPaymentModal(true);
      } else {
        // Free hackathon — skip payment modal and register directly
        console.log('🎉 Free hackathon — registering directly...');
        await registerUser(null, null);
      }
    } catch (err: any) {
      console.error('❌ Failed to initiate registration:', err);
      toast.error(`Failed to initiate registration: ${err.message || 'Please try again'}`);
      setLoading(false);
    }
  };

  const registerUser = async (paymentId: string | null, providerPaymentId: string | null) => {
    try {
      if (registrationType === 'team') {
        const registrationData = {
          teamName: formData.teamName,
          teamDescription: formData.teamDescription,
          selectedTrack: selectedTrack || undefined,
          teamMembers: teamMembers.map(m => ({ name: m.name, email: m.email, role: m.role })),
          ...(paymentId && { paymentId, providerPaymentId: providerPaymentId ?? undefined }),
        };
        await api.registerForHackathon(hackathon.id, registrationData);
        toast.success(`Successfully registered team "${formData.teamName}" for ${hackathon.title}!`);
      } else {
        await api.registerForHackathon(hackathon.id, {
          selectedTrack: selectedTrack || undefined,
          ...(paymentId && { paymentId, providerPaymentId: providerPaymentId ?? undefined }),
        });
        toast.success(`Successfully registered for ${hackathon.title}!`);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      if (error.message?.includes('already registered')) {
        toast.info('You are already registered for this hackathon!');
        onClose();
      } else {
        toast.error(error.message || 'Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentDetails: { paymentId: string; providerPaymentId: string }) => {
    setShowPaymentModal(false);
    setLoading(true);
    try {
      // Use real backend paymentId if we pre-created an order, otherwise use from modal
      const realPaymentId = backendPaymentId || paymentDetails.paymentId;

      if (registrationType === 'team') {
        const registrationData = {
          teamName: formData.teamName,
          teamDescription: formData.teamDescription,
          selectedTrack: selectedTrack || undefined,
          teamMembers: teamMembers.map(m => ({ name: m.name, email: m.email, role: m.role })),
          paymentId: realPaymentId,
          providerPaymentId: paymentDetails.providerPaymentId,
        };
        console.log('🔄 Sending team registration:', registrationData);
        const result = await api.registerForHackathon(hackathon.id, registrationData);
        console.log('✅ Registration result:', result);
        toast.success(`Successfully registered team "${formData.teamName}" for ${hackathon.title}!`);
      } else {
        console.log('🔄 Sending individual registration');
        const result = await api.registerForHackathon(hackathon.id, {
          selectedTrack: selectedTrack || undefined,
          paymentId: realPaymentId,
          providerPaymentId: paymentDetails.providerPaymentId,
        });
        console.log('✅ Registration result:', result);
        toast.success(`Successfully registered for ${hackathon.title}!`);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      if (error.message?.includes('already registered')) {
        toast.info('You are already registered for this hackathon!');
        onClose();
      } else {
        toast.error(error.message || 'Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - FULL SCREEN for team registration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[10000]"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 10000
            }}
          />

          {/* Modal - CENTERED ON FULL SCREEN */}
          <div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 10001
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-purple-600 p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Register for Hackathon
                      </h2>
                      <p className="text-white/90">{hackathon.title}</p>
                    </div>
                    <Button
                      size="icon"
                      onClick={onClose}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {step === 'type' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          How would you like to participate?
                        </h3>
                        <p className="text-white font-medium">
                          Choose whether you want to participate individually or as part of a team
                        </p>
                      </div>

                      {/* Registration Fee Banner */}
                      <div className={`flex items-center justify-between rounded-lg px-5 py-4 border ${hackathon.registrationFee > 0 ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-green-500/10 border-green-500/40'}`}>
                        <div>
                          <p className="text-white font-semibold text-sm uppercase tracking-wide">Registration Fee</p>
                          <p className={`text-2xl font-bold mt-0.5 ${hackathon.registrationFee > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {hackathon.registrationFee > 0
                              ? `${hackathon.prizeCurrency === 'INR' ? '₹' : '$'}${Number(hackathon.registrationFee).toLocaleString()}`
                              : 'FREE'}
                          </p>
                        </div>
                        <div className={`text-3xl ${hackathon.registrationFee > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {hackathon.registrationFee > 0 ? '💳' : '🎉'}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Individual Option */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTypeSelection('individual')}
                          className="cursor-pointer"
                        >
                          <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-all h-full">
                            <div className="flex flex-col items-center text-center space-y-4">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-white mb-2">
                                  Individual
                                </h4>
                                <p className="text-sm text-white font-medium">
                                  Participate on your own and showcase your individual skills
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>

                        {/* Team Option */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTypeSelection('team')}
                          className="cursor-pointer"
                        >
                          <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all h-full">
                            <div className="flex flex-col items-center text-center space-y-4">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Users className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-white mb-2">
                                  Team
                                </h4>
                                <p className="text-sm text-white font-medium">
                                  Collaborate with {hackathon.minTeamSize}-{hackathon.maxTeamSize} members and build together
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {step === 'track' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Back Button */}
                      <Button
                        size="sm"
                        onClick={() => setStep('type')}
                        className="bg-slate-800 hover:bg-slate-700 text-white"
                      >
                        ← Back
                      </Button>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          Select Problem Statement Track
                        </h3>
                        <p className="text-white font-medium">
                          Choose the problem statement track you want to work on
                        </p>
                      </div>

                      <div className="space-y-3">
                        {problemStatementTracks.map((track) => (
                          <motion.div
                            key={track.trackNumber}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTrackSelection(track.trackNumber)}
                            className="cursor-pointer"
                          >
                            <Card className={`p-4 border transition-all ${selectedTrack === track.trackNumber
                              ? 'bg-blue-500/20 border-blue-500'
                              : 'bg-slate-800/50 border-slate-700 hover:border-blue-400'
                              }`}>
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${selectedTrack === track.trackNumber
                                  ? 'bg-blue-500'
                                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
                                  }`}>
                                  {track.trackNumber}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-bold text-white mb-1">
                                    {track.trackTitle}
                                  </h4>
                                  {track.description && (
                                    <p className="text-sm text-white/80 mb-2">
                                      {track.description}
                                    </p>
                                  )}
                                  <a
                                    href={track.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View Problem Statement →
                                  </a>
                                </div>
                                {selectedTrack === track.trackNumber && (
                                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>

                      {selectedTrack && (
                        <Button
                          onClick={() => setStep('details')}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold py-3"
                        >
                          Continue with Track {selectedTrack}
                        </Button>
                      )}
                    </motion.div>
                  )}

                  {step === 'details' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Back Button */}
                      <Button
                        size="sm"
                        onClick={() => setStep(problemStatementTracks.length > 0 ? 'track' : 'type')}
                        className="bg-slate-800 hover:bg-slate-700 text-white"
                      >
                        ← Back
                      </Button>

                      {/* Team Name */}
                      <div>
                        <Label htmlFor="teamName" className="text-white font-semibold">
                          {registrationType === 'individual' ? 'Your Name' : 'Team Name'} *
                        </Label>
                        <Input
                          id="teamName"
                          value={formData.teamName}
                          onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                          className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder-white/60"
                          placeholder={registrationType === 'individual' ? 'Your name' : 'Enter team name'}
                          disabled={registrationType === 'individual'}
                        />
                      </div>

                      {/* Team Description */}
                      <div>
                        <Label htmlFor="teamDescription" className="text-white font-semibold">
                          {registrationType === 'individual' ? 'About You' : 'Team Description'} (Optional)
                        </Label>
                        <Textarea
                          id="teamDescription"
                          value={formData.teamDescription}
                          onChange={(e) => setFormData({ ...formData, teamDescription: e.target.value })}
                          className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder-white/60"
                          placeholder={registrationType === 'individual'
                            ? 'Tell us about your skills and experience...'
                            : 'Describe your team and what you hope to achieve...'
                          }
                          rows={3}
                        />
                      </div>

                      {/* Team Members (only for team registration) */}
                      {registrationType === 'team' && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-white font-semibold">
                              Team Members ({teamMembers.length + 1}/{hackathon.maxTeamSize})
                            </Label>
                            <Button
                              size="sm"
                              onClick={addTeamMember}
                              disabled={teamMembers.length >= (hackathon.maxTeamSize - 1)}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Member
                            </Button>
                          </div>

                          {/* Current User (Team Leader) */}
                          <Card className="p-4 bg-slate-800/30 border-slate-700 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-semibold">
                                  {currentUser?.firstName} {currentUser?.lastName} (You)
                                </p>
                                <p className="text-sm text-white/80">{currentUser?.email}</p>
                              </div>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                Team Leader
                              </Badge>
                            </div>
                          </Card>

                          {/* Team Members List */}
                          <div className="space-y-3">
                            {teamMembers.map((member, index) => (
                              <Card key={index} className="p-4 bg-slate-800/30 border-slate-700">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <Input
                                      value={member.name}
                                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                      className="flex-1 bg-slate-900/50 border-slate-600 text-white placeholder-white/60"
                                      placeholder="Team member name"
                                    />
                                    <Button
                                      size="icon"
                                      onClick={() => removeTeamMember(index)}
                                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <Input
                                      value={member.email}
                                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                                      className="flex-1 bg-slate-900/50 border-slate-600 text-white placeholder-white/60"
                                      placeholder="teammate@email.com"
                                      type="email"
                                    />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>

                          <p className="text-sm text-white/80 mt-3">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            Team members will receive an invitation email to join your team
                          </p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold py-6 text-lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Complete Registration
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
            hackathonTitle={hackathon.title}
            amount={hackathon.registrationFee ?? 0}
          />
        </>
      )}
    </AnimatePresence>
  );
}
