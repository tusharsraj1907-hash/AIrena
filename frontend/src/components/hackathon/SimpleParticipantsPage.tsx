import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2, CheckCircle2, Clock, ChevronDown, Mail, User, UserCheck, Eye, Download, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { SubmissionDetailsModal } from './SubmissionDetailsModal';

interface SimpleParticipantsPageProps {
  userData: any;
}

export function SimpleParticipantsPage({ userData }: SimpleParticipantsPageProps) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Fetching fresh data for organizer:', userData?.id);
      
      // 1. Get all hackathons
      const allHackathons = await api.getHackathons();
      
      // 2. Filter to organizer's hackathons
      const myHackathons = allHackathons.filter((h: any) => h.organizerId === userData?.id);
      console.log('🎯 My hackathons:', myHackathons.length);
      setHackathons(myHackathons);
      
      // 3. Auto-select first hackathon if available
      if (myHackathons.length > 0 && !selectedHackathonId) {
        setSelectedHackathonId(myHackathons[0].id);
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching data:', error);
      toast.error(error.message || 'Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (hackathonId: string) => {
    if (!hackathonId) return;
    
    setLoading(true);
    try {
      console.log(`🔍 Fetching participants for hackathon: ${hackathonId}`);
      const hackathonParticipants = await api.getHackathonParticipants(hackathonId);
      console.log(`✅ Found ${hackathonParticipants.length} participants`);
      setParticipants(hackathonParticipants);
    } catch (error: any) {
      console.error('❌ Error fetching participants:', error);
      toast.error('Failed to load participants');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      fetchData();
    }
  }, [userData?.id]);

  useEffect(() => {
    if (selectedHackathonId) {
      fetchParticipants(selectedHackathonId);
    }
  }, [selectedHackathonId]);

  // Group participants by team
  const groupedParticipants = participants.reduce((acc: any, participant: any) => {
    if (participant.team) {
      // Team participant
      const teamId = participant.team.id;
      if (!acc.teams[teamId]) {
        acc.teams[teamId] = {
          id: teamId,
          name: participant.team.name,
          members: [],
          registeredAt: participant.registeredAt,
        };
      }
      acc.teams[teamId].members.push(participant);
    } else {
      // Individual participant
      acc.individuals.push(participant);
    }
    return acc;
  }, { teams: {}, individuals: [] });

  const teams = Object.values(groupedParticipants.teams);
  const individuals = groupedParticipants.individuals;
  const selectedHackathon = hackathons.find(h => h.id === selectedHackathonId);

  if (loading && hackathons.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-white">Loading...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Participants</h1>
          <p className="text-white mt-2">
            View and manage participants for your hackathons
          </p>
        </div>
      </div>

      {/* Hackathon Selector */}
      {hackathons.length > 0 ? (
        <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50">
          <label className="text-sm font-semibold text-white mb-2 block">
            Select Hackathon:
          </label>
          <Select value={selectedHackathonId} onValueChange={setSelectedHackathonId}>
            <SelectTrigger className="w-full bg-slate-900/50 border-slate-600 text-white">
              <SelectValue placeholder="Choose a hackathon" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {hackathons.map((hackathon) => (
                <SelectItem 
                  key={hackathon.id} 
                  value={hackathon.id}
                  className="text-white hover:bg-slate-800"
                >
                  {hackathon.title} ({hackathon.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      ) : (
        <Card className="p-8 text-center bg-slate-800/50">
          <h3 className="text-xl font-bold text-white mb-2">No Hackathons Yet</h3>
          <p className="text-white">Create a hackathon first to see participants.</p>
        </Card>
      )}

      {/* Summary Stats */}
      {selectedHackathonId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{participants.length}</div>
                <div className="text-sm text-white">Total Registered</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{teams.length}</div>
                <div className="text-sm text-white">Teams</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{individuals.length}</div>
                <div className="text-sm text-white">Individuals</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Participants List */}
      {selectedHackathonId && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <span className="ml-2 text-white">Loading participants...</span>
            </div>
          ) : participants.length === 0 ? (
            <Card className="p-8 text-center bg-slate-800/50">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-bold text-white mb-2">No Participants Yet</h3>
              <p className="text-white">Participants will appear here after they register for this hackathon.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Teams Section */}
              {teams.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Teams ({teams.length})
                  </h2>
                  <div className="space-y-4">
                    {teams.map((team: any) => (
                      <Card key={team.id} className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50">
                        <div className="space-y-4">
                          {/* Team Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white">{team.name}</h3>
                                <p className="text-sm text-white">
                                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-white">
                                Registered: {new Date(team.registeredAt).toLocaleDateString()}
                              </p>
                              <Badge className="mt-1 bg-blue-500/20 text-blue-400 border-blue-500/50">
                                Team
                              </Badge>
                            </div>
                          </div>

                          {/* Team Members */}
                          <div className="pl-4 border-l-2 border-slate-600 space-y-3">
                            {team.members.map((member: any) => (
                              <div key={member.id} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {member.user?.firstName?.[0]?.toUpperCase() || 'U'}
                                    {member.user?.lastName?.[0]?.toUpperCase() || ''}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-white">
                                        {member.user?.firstName} {member.user?.lastName}
                                      </p>
                                      {member.role === 'LEADER' && (
                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                                          Leader
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white">
                                      <Mail className="w-3 h-3" />
                                      {member.user?.email}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {member.hasSubmission && (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Submitted
                                    </Badge>
                                  )}
                                  {member.hasSubmission && member.submissionId && (
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                                      onClick={() => {
                                        setSelectedSubmissionId(member.submissionId);
                                        setIsDetailsModalOpen(true);
                                      }}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View Details
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Individuals Section */}
              {individuals.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Individuals ({individuals.length})
                  </h2>
                  <div className="space-y-4">
                    {individuals.map((participant: any) => (
                      <Card key={participant.id} className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {participant.user?.firstName?.[0]?.toUpperCase() || 'U'}
                              {participant.user?.lastName?.[0]?.toUpperCase() || ''}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">
                                {participant.user?.firstName} {participant.user?.lastName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-white">
                                <Mail className="w-3 h-3" />
                                {participant.user?.email}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-white">
                                Registered: {new Date(participant.registeredAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={
                                  participant.hasSubmission 
                                    ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                                    : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                }
                              >
                                {participant.hasSubmission ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Submitted
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Registered
                                  </>
                                )}
                              </Badge>
                              {participant.hasSubmission && participant.submissionId && (
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                                  onClick={() => {
                                    setSelectedSubmissionId(participant.submissionId);
                                    setIsDetailsModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Submission Details Modal */}
      {selectedSubmissionId && (
        <SubmissionDetailsModal
          submissionId={selectedSubmissionId}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedSubmissionId(null);
          }}
        />
      )}
    </motion.div>
  );
}