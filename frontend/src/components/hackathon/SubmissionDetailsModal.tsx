import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Download,
  Github,
  User,
  Calendar,
  Target,
  Briefcase,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface SubmissionDetailsModalProps {
  submissionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SubmissionDetailsModal({
  submissionId,
  isOpen,
  onClose,
}: SubmissionDetailsModalProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && submissionId) {
      fetchSubmissionDetails();
    }
  }, [isOpen, submissionId]);

  const fetchSubmissionDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmission(submissionId);
      setSubmission(data);
    } catch (error) {
      toast.error('Failed to load submission details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const submitter = submission?.submitter || {};

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Fixed to allow scrolling */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Wrapper - Improved centering and scrolling */}
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto min-h-full flex items-center py-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full"
              >
                <Card className="w-full max-h-[90vh] bg-slate-900 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
                      <p className="text-white font-medium">Loading submission details…</p>
                    </div>
                  ) : submission ? (
                    <>
                      {/* Header - Fixed */}
                      <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800 flex-shrink-0">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-bold text-white mb-2 truncate">
                            {submission.title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-slate-300">
                            <span className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full text-slate-300">
                              <User className="w-4 h-4 text-blue-400" />
                              <span className="font-medium text-white">{submitter.firstName} {submitter.lastName}</span>
                              {submission.type === 'TEAM' && submission.teamInfo ? (
                                <span className="text-blue-300 ml-1 font-semibold">
                                  (Team: {submission.teamInfo.name})
                                </span>
                              ) : (
                                <span className="text-green-300 ml-1 font-semibold">(Individual)</span>
                              )}
                            </span>
                            <span className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full text-slate-300">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <span className="font-medium text-white">
                                {submission.submittedAt
                                  ? new Date(submission.submittedAt).toLocaleDateString()
                                  : 'Draft'}
                              </span>
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={onClose}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold ml-4 flex-shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Content - Enhanced scrolling */}
                      <div 
                        className="flex-1 overflow-y-auto p-6 bg-slate-900 modal-content scrollbar-thin" 
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#475569 #1e293b',
                          maxHeight: '70vh',
                          overflowY: 'scroll'
                        }}
                      >
                        <div className="space-y-6">
                          {/* Participant Details */}
                          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <User className="w-5 h-5 text-blue-400" />
                              Participant Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-slate-300 mb-1">Name</p>
                                <p className="text-white font-medium">{submitter.firstName} {submitter.lastName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-300 mb-1">Email</p>
                                <p className="text-white font-medium">{submitter.email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-300 mb-1">Submission Type</p>
                                <p className="text-white font-medium">
                                  {submission.type === 'TEAM' ? `Team Submission` : 'Individual Submission'}
                                </p>
                              </div>
                              {submission.type === 'TEAM' && submission.teamInfo && (
                                <div>
                                  <p className="text-xs text-slate-300 mb-1">Team Name</p>
                                  <p className="text-white font-medium">{submission.teamInfo.name}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Team Members */}
                            {submission.type === 'TEAM' && submission.teamInfo?.members && (
                              <div className="mt-4">
                                <p className="text-xs text-slate-300 mb-2">Team Members ({submission.teamInfo.members.length})</p>
                                <div className="space-y-2">
                                  {submission.teamInfo.members.map((member: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 bg-slate-700 rounded">
                                      <User className="w-4 h-4 text-blue-400" />
                                      <div>
                                        <p className="text-white text-sm font-medium">
                                          {member.user?.firstName} {member.user?.lastName}
                                        </p>
                                        <p className="text-slate-300 text-xs">{member.user?.email}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Project Description */}
                          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-400" />
                              Project Description
                            </h3>
                            <div className="text-white leading-relaxed whitespace-pre-wrap text-base">
                              {submission.description || 'No description provided'}
                            </div>
                          </div>

                          {/* Selected Track */}
                          {submission.selectedTrack && (
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-400" />
                                Selected Problem Statement Track
                              </h3>
                              <div className="bg-slate-700 p-4 rounded-lg">
                                <p className="text-blue-300 font-bold text-lg mb-2">
                                  Track {submission.selectedTrack}
                                </p>
                                {submission.hackathon?.tracks && submission.hackathon.tracks[submission.selectedTrack - 1] && (
                                  <p className="text-slate-200 text-base">
                                    {submission.hackathon.tracks[submission.selectedTrack - 1].title}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tech Stack */}
                          {submission.techStack && submission.techStack.trim() && (
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-green-400" />
                                Technology Stack
                              </h3>
                              <div className="flex flex-wrap gap-3">
                                {submission.techStack.split(',').map((tech: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-2 bg-green-600 text-white rounded-full text-sm font-semibold"
                                  >
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Repository Link */}
                          {((submission.repositoryUrl && submission.repositoryUrl.trim()) || (submission.repoUrl && submission.repoUrl.trim())) && (
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Github className="w-5 h-5 text-purple-400" />
                                Project Repository
                              </h3>
                              <a
                                href={submission.repositoryUrl || submission.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all duration-300 border border-slate-600"
                              >
                                <Github className="w-6 h-6 text-white" />
                                <div className="flex-1">
                                  <p className="text-white font-medium">View Source Code</p>
                                  <p className="text-slate-300 text-sm truncate">{submission.repositoryUrl || submission.repoUrl}</p>
                                </div>
                                <span className="text-slate-300 text-sm">↗</span>
                              </a>
                            </div>
                          )}

                          {/* Demo/Live URL */}
                          {(submission.demoUrl && submission.demoUrl.trim()) && (
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-green-400" />
                                Live Demo
                              </h3>
                              <a
                                href={submission.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all duration-300 border border-slate-600"
                              >
                                <Target className="w-6 h-6 text-white" />
                                <div className="flex-1">
                                  <p className="text-white font-medium">View Live Demo</p>
                                  <p className="text-slate-300 text-sm truncate">{submission.demoUrl}</p>
                                </div>
                                <span className="text-slate-300 text-sm">↗</span>
                              </a>
                            </div>
                          )}

                          {/* Uploaded Files - Enhanced */}
                          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-orange-400" />
                              Uploaded Files
                            </h3>

                            {submission.files && Array.isArray(submission.files) && submission.files.length > 0 ? (
                              <div className="space-y-4">
                                {(() => {
                                  // Parse and categorize files
                                  const projectFiles: any[] = [];
                                  const presentationFiles: any[] = [];
                                  
                                  submission.files.forEach((file: any, idx: number) => {
                                    // Handle both string and object file formats
                                    let fileName = 'Unknown File';
                                    let fileUrl = '';
                                    let fileSize = 0;
                                    let fileType = '';
                                    
                                    if (typeof file === 'string') {
                                      try {
                                        const parsed = JSON.parse(file);
                                        fileName = parsed.name || parsed.originalName || parsed.fileName || `File ${idx + 1}`;
                                        fileUrl = parsed.downloadUrl || parsed.url || parsed.fileUrl || file;
                                        fileSize = parsed.size || parsed.fileSize || 0;
                                        fileType = parsed.type || parsed.mimeType || parsed.fileType || '';
                                      } catch {
                                        // If it's a URL string, extract filename from URL
                                        if (file.includes('/')) {
                                          const urlParts = file.split('/');
                                          fileName = urlParts[urlParts.length - 1] || `File ${idx + 1}`;
                                          // Remove query parameters and decode
                                          fileName = decodeURIComponent(fileName.split('?')[0]);
                                        } else {
                                          fileName = file || `File ${idx + 1}`;
                                        }
                                        fileUrl = file;
                                        // Try to guess file type from extension
                                        const ext = fileName.split('.').pop()?.toLowerCase();
                                        if (ext) {
                                          if (['pdf'].includes(ext)) fileType = 'application/pdf';
                                          else if (['ppt', 'pptx'].includes(ext)) fileType = 'application/vnd.ms-powerpoint';
                                          else if (['doc', 'docx'].includes(ext)) fileType = 'application/msword';
                                          else if (['zip', 'rar'].includes(ext)) fileType = 'application/zip';
                                          else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) fileType = 'image/' + ext;
                                          else fileType = 'application/octet-stream';
                                        }
                                      }
                                    } else if (typeof file === 'object' && file !== null) {
                                      fileName = file.name || file.originalName || file.fileName || `File ${idx + 1}`;
                                      fileUrl = file.downloadUrl || file.url || file.fileUrl || '';
                                      fileSize = file.size || file.fileSize || 0;
                                      fileType = file.type || file.mimeType || file.fileType || '';
                                    }
                                    
                                    // CRITICAL FIX: Construct proper file URL for local storage
                                    // Files are stored in backend-core/uploads/submissions/{submissionId}/{filename}
                                    // And served via /uploads/ static prefix
                                    if (!fileUrl || fileUrl === '' || fileUrl === 'Unknown') {
                                      // Construct URL from submission ID and filename
                                      fileUrl = `http://localhost:3002/uploads/submissions/${submissionId}/${fileName}`;
                                    } else if (!fileUrl.startsWith('http')) {
                                      // If it's a relative path, make it absolute
                                      if (fileUrl.startsWith('/uploads/')) {
                                        fileUrl = `http://localhost:3002${fileUrl}`;
                                      } else if (fileUrl.startsWith('uploads/')) {
                                        fileUrl = `http://localhost:3002/${fileUrl}`;
                                      } else {
                                        // Assume it's just a filename and construct full path
                                        fileUrl = `http://localhost:3002/uploads/submissions/${submissionId}/${fileUrl}`;
                                      }
                                    }
                                    
                                    // Determine if it's a presentation file based on extension or type
                                    const isPresentationFile = fileName.match(/\.(pdf|ppt|pptx|key|odp)$/i) || 
                                                             fileType.includes('presentation') || 
                                                             fileType.includes('pdf') ||
                                                             fileType.includes('powerpoint');
                                    
                                    const processedFile = {
                                      name: fileName,
                                      url: fileUrl,
                                      type: fileType,
                                      size: fileSize,
                                      isPresentationFile
                                    };
                                    
                                    if (isPresentationFile) {
                                      presentationFiles.push(processedFile);
                                    } else {
                                      projectFiles.push(processedFile);
                                    }
                                  });
                                  
                                  return (
                                    <>
                                      {/* Project Files */}
                                      {projectFiles.length > 0 && (
                                        <div className="bg-slate-700 p-4 rounded-lg">
                                          <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-green-400" />
                                            Project Files ({projectFiles.length})
                                          </h4>
                                          <div className="space-y-3">
                                            {projectFiles.map((file, idx) => {
                                              // Determine file icon based on type or extension
                                              const getFileIcon = () => {
                                                if (file.type.includes('image') || file.name.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
                                                  return <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />;
                                                } else if (file.name.match(/\.(zip|rar|7z)$/i)) {
                                                  return <FileText className="w-5 h-5 text-yellow-400 flex-shrink-0" />;
                                                } else if (file.name.match(/\.(js|ts|jsx|tsx|html|css|py|java|cpp|c)$/i)) {
                                                  return <FileText className="w-5 h-5 text-purple-400 flex-shrink-0" />;
                                                } else {
                                                  return <FileText className="w-5 h-5 text-green-400 flex-shrink-0" />;
                                                }
                                              };
                                              
                                              return (
                                                <div
                                                  key={`project-${idx}`}
                                                  className="flex items-center gap-4 p-3 bg-slate-600 rounded-lg hover:bg-slate-500 transition-all duration-300"
                                                >
                                                  {getFileIcon()}
                                                  <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">
                                                      {file.name}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-slate-300 mt-1">
                                                      {file.size > 0 && (
                                                        <span>
                                                          {file.size > 1024 * 1024 
                                                            ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                                                            : `${(file.size / 1024).toFixed(2)} KB`
                                                          }
                                                        </span>
                                                      )}
                                                      {file.type && (
                                                        <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                                                          {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="flex gap-2">
                                                    <a
                                                      href={file.url || '#'}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm flex items-center gap-2 transition-all duration-300"
                                                      onClick={(e) => {
                                                        if (!file.url) {
                                                          e.preventDefault();
                                                          toast.error('File URL not available');
                                                        }
                                                      }}
                                                    >
                                                      <FileText className="w-4 h-4" />
                                                      View
                                                    </a>
                                                    <a
                                                      href={file.url || '#'}
                                                      download={file.name}
                                                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded text-sm flex items-center gap-2 transition-all duration-300"
                                                      onClick={(e) => {
                                                        if (!file.url) {
                                                          e.preventDefault();
                                                          toast.error('File URL not available');
                                                        }
                                                      }}
                                                    >
                                                      <Download className="w-4 h-4" />
                                                      Download
                                                    </a>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Presentation Files */}
                                      {presentationFiles.length > 0 && (
                                        <div className="bg-slate-700 p-4 rounded-lg">
                                          <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                            Presentation Files ({presentationFiles.length})
                                          </h4>
                                          <div className="space-y-3">
                                            {presentationFiles.map((file, idx) => {
                                              // Determine file icon for presentations
                                              const getFileIcon = () => {
                                                if (file.type.includes('pdf') || file.name.match(/\.pdf$/i)) {
                                                  return <FileText className="w-5 h-5 text-red-400 flex-shrink-0" />;
                                                } else if (file.name.match(/\.(ppt|pptx)$/i)) {
                                                  return <FileText className="w-5 h-5 text-orange-400 flex-shrink-0" />;
                                                } else if (file.name.match(/\.key$/i)) {
                                                  return <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />;
                                                } else {
                                                  return <FileText className="w-5 h-5 text-purple-400 flex-shrink-0" />;
                                                }
                                              };
                                              
                                              return (
                                                <div
                                                  key={`presentation-${idx}`}
                                                  className="flex items-center gap-4 p-3 bg-slate-600 rounded-lg hover:bg-slate-500 transition-all duration-300"
                                                >
                                                  {getFileIcon()}
                                                  <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">
                                                      {file.name}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-slate-300 mt-1">
                                                      {file.size > 0 && (
                                                        <span>
                                                          {file.size > 1024 * 1024 
                                                            ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                                                            : `${(file.size / 1024).toFixed(2)} KB`
                                                          }
                                                        </span>
                                                      )}
                                                      {file.type && (
                                                        <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                                                          {file.type.split('/')[1]?.toUpperCase() || 'PRESENTATION'}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="flex gap-2">
                                                    <a
                                                      href={file.url || '#'}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm flex items-center gap-2 transition-all duration-300"
                                                      onClick={(e) => {
                                                        if (!file.url) {
                                                          e.preventDefault();
                                                          toast.error('File URL not available');
                                                        }
                                                      }}
                                                    >
                                                      <FileText className="w-4 h-4" />
                                                      View
                                                    </a>
                                                    <a
                                                      href={file.url || '#'}
                                                      download={file.name}
                                                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded text-sm flex items-center gap-2 transition-all duration-300"
                                                      onClick={(e) => {
                                                        if (!file.url) {
                                                          e.preventDefault();
                                                          toast.error('File URL not available');
                                                        }
                                                      }}
                                                    >
                                                      <Download className="w-4 h-4" />
                                                      Download
                                                    </a>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Show message if no files in either category */}
                                      {projectFiles.length === 0 && presentationFiles.length === 0 && (
                                        <div className="bg-slate-700 p-4 rounded-lg">
                                          <p className="text-slate-300 text-center">
                                            Files are being processed. Please check the console for file data structure.
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-700 rounded-lg text-center">
                                <p className="text-slate-300 font-medium">
                                  No files uploaded for this submission.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-4 border-t border-slate-700 flex justify-end bg-slate-800 flex-shrink-0">
                        <Button
                          onClick={onClose}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
                        >
                          Close
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-white text-lg">Failed to load submission details</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
