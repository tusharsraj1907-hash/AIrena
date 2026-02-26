import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, XCircle, AlertCircle, Download, Eye, Loader2, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface MySubmissionsProps {
  onSelectSubmission?: (submission: any) => void;
}

export function MySubmissions({ onSelectSubmission }: MySubmissionsProps = {}) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissions();
      // Map API data to display format
      const mappedSubmissions = (data || []).map((sub: any) => ({
        id: sub.id,
        hackathonId: sub.hackathonId,
        projectName: sub.title,
        hackathon: sub.hackathon?.title || 'Unknown Hackathon',
        submittedDate: sub.submittedAt || sub.createdAt,
        status: sub.status?.toLowerCase().replace(/_/g, '-') || 'draft',
        aiScore: sub.aiMatchPercentage || null,
        statusSteps: getStatusSteps(sub.status),
        submission: sub, // Keep full submission object
      }));
      setSubmissions(mappedSubmissions);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (status: string) => {
    const statusMap: Record<string, any[]> = {
      'DRAFT': [
        { label: 'Draft', status: 'current' },
        { label: 'Offline Review', status: 'pending' },
        { label: 'Final Result', status: 'pending' },
      ],
      'SUBMITTED': [
        { label: 'Submitted', status: 'completed' },
        { label: 'Offline Review', status: 'current' },
        { label: 'Final Result', status: 'pending' },
      ],
      'AI_REVIEWED': [
        { label: 'Submitted', status: 'completed' },
        { label: 'Offline Review', status: 'current' },
        { label: 'Final Result', status: 'pending' },
      ],
      'APPROVED': [
        { label: 'Submitted', status: 'completed' },
        { label: 'Offline Review', status: 'completed' },
        { label: 'Final Result', status: 'completed' },
      ],
      'WINNER': [
        { label: 'Submitted', status: 'completed' },
        { label: 'Offline Review', status: 'completed' },
        { label: 'Winner!', status: 'completed' },
      ],
    };
    return statusMap[status] || statusMap['DRAFT'];
  };

  // Fallback sample data if API fails
  const sampleSubmissions = [
    {
      id: 1,
      hackathon: 'AI Innovation Challenge 2024',
      projectName: 'Smart Healthcare Assistant',
      submittedDate: '2024-12-20',
      status: 'ai-review',
      aiScore: 72,
      statusSteps: [
        { label: 'Submitted', status: 'completed' },
        { label: 'AI Review', status: 'current' },
        { label: 'Offline Review', status: 'pending' },
        { label: 'Final Result', status: 'pending' },
      ],
    },
    {
      id: 2,
      hackathon: 'Web3 Global Hackathon',
      projectName: 'DeFi Trading Platform',
      submittedDate: '2024-12-18',
      status: 'offline-review',
      aiScore: 85,
      statusSteps: [
        { label: 'Submitted', status: 'completed' },
        { label: 'AI Review', status: 'completed' },
        { label: 'Offline Review', status: 'current' },
        { label: 'Final Result', status: 'pending' },
      ],
    },
    {
      id: 3,
      hackathon: 'Green Tech Challenge',
      projectName: 'Solar Energy Optimizer',
      submittedDate: '2024-12-10',
      status: 'selected',
      aiScore: 91,
      statusSteps: [
        { label: 'Submitted', status: 'completed' },
        { label: 'AI Review', status: 'completed' },
        { label: 'Offline Review', status: 'completed' },
        { label: 'Final Result', status: 'completed' },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase().replace(/_/g, '-') || '';
    switch (normalizedStatus) {
      case 'ai-reviewed':
      case 'under-ai-review':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'passed-to-offline-review':
      case 'under-offline-review':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'approved':
      case 'winner':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-slate-500/20 text-white border-slate-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'current':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-white" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">My Submissions</h1>
        <p className="text-white">Track your project submissions and their status</p>
      </div>

      {/* Loading State - Enhanced */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-300 border-t-transparent animate-ping opacity-20 mx-auto"></div>
            </div>
            <span className="text-xl font-bold text-white">Loading your submissions...</span>
            <p className="text-slate-300 text-sm mt-2">Fetching your project data</p>
          </div>
        </div>
      )}

      {/* Empty State - Enhanced */}
      {!loading && submissions.length === 0 && (
        <Card className="p-12 bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-600 text-center backdrop-blur-sm shadow-2xl">
          <div className="relative mb-6">
            <FileText className="w-20 h-20 text-blue-400 mx-auto" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-400 rounded-full animate-pulse opacity-20 mx-auto"></div>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-white">No Submissions Yet</h3>
          <p className="text-white mb-8 max-w-md mx-auto leading-relaxed">
            Ready to showcase your skills? Start participating in hackathons and submit your innovative projects to get started!
          </p>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold px-8 py-3 shadow-lg"
            onClick={() => {
              if (onSelectSubmission) {
                // This will be handled by parent
                toast.info('Explore hackathons to get started!');
              }
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Hackathons
          </Button>
        </Card>
      )}

      {/* Submissions */}
      {!loading && submissions.length > 0 && (
        <div className="space-y-6">
          {submissions.map((submission, index) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-600 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-slate-500 hover:from-slate-700/95 hover:to-slate-800/95">
              {/* Header - Enhanced */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-white hover:text-blue-400 transition-colors">
                    {submission.projectName || submission.title}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-white text-base font-medium">{submission.hackathon}</p>
                    <p className="text-white text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {submission.submittedDate 
                        ? `Submitted: ${new Date(submission.submittedDate).toLocaleDateString()}`
                        : 'Draft - Not submitted yet'}
                    </p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(submission.status)} px-4 py-2 text-sm font-semibold`}>
                  {submission.status === 'ai-reviewed' && 'AI Reviewed'}
                  {submission.status === 'under-ai-review' && 'AI Review'}
                  {submission.status === 'passed-to-offline-review' && 'Offline Review'}
                  {submission.status === 'approved' && 'Approved ✓'}
                  {submission.status === 'winner' && 'Winner 🏆'}
                  {submission.status === 'draft' && 'Draft'}
                  {submission.status === 'submitted' && 'Submitted'}
                  {!['ai-reviewed', 'under-ai-review', 'passed-to-offline-review', 'approved', 'winner', 'draft', 'submitted'].includes(submission.status) && submission.status}
                </Badge>
              </div>

              {/* Remove AI Score section completely */}

              {/* Status Timeline - Enhanced */}
              <div className="mb-6">
                <p className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Submission Timeline
                </p>
                <div className="relative bg-slate-700/60 p-4 rounded-lg border border-slate-600">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />
                  
                  <div className="space-y-6">
                    {submission.statusSteps.map((step, stepIndex) => (
                      <div key={stepIndex} className="relative flex items-start gap-4">
                        {/* Icon - Enhanced */}
                        <div
                          className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                            step.status === 'completed'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : step.status === 'current'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                              : 'bg-slate-600'
                          }`}
                        >
                          {step.status === 'completed' && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                          {step.status === 'current' && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-3 h-3 bg-white rounded-full"
                            />
                          )}
                        </div>

                        {/* Content - Enhanced */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-3">
                            <p className={`font-bold text-base ${
                              step.status === 'pending' ? 'text-white' : 'text-white'
                            }`}>
                              {step.label}
                            </p>
                            {step.status === 'current' && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 text-xs animate-pulse">
                                In Progress
                              </Badge>
                            )}
                          </div>
                          {step.status === 'current' && (
                            <p className="text-sm text-white mt-2 font-medium">
                              Your submission is currently being reviewed
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions - Enhanced */}
              <div className="flex gap-3 pt-6 border-t border-slate-600">
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    if (onSelectSubmission && submission.submission) {
                      onSelectSubmission(submission.submission);
                    } else {
                      toast.info('Viewing submission details');
                    }
                  }}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  {submission.status === 'draft' ? 'Edit Submission' : 'View Details'}
                </Button>
              </div>
            </Card>
          </motion.div>
          ))}
        </div>
      )}

    </motion.div>
  );
}
