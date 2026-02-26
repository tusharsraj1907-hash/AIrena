import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Branding } from './Branding';
import {
  Home,
  Plus,
  Upload,
  Loader2,
  Award,
  X,
  MapPin,
  Calendar,
  Target,
  Scale,
  User,
  Trophy,
  AlertCircle,
  Users,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  Download,
  ExternalLink,
  Github,
  CreditCard,
  ReceiptText,
  CheckCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { PaymentModal } from './PaymentModal';
import { HostDetailsModal } from './HostRequestModal';
import { PaymentHistory } from './PaymentHistory';
import * as XLSX from 'xlsx';

// Create Hackathon Form Component
export function CreateHackathonForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProblemStatement, setUploadingProblemStatement] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    problemStatementUrl: '',
    whyParticipate: '',
    category: 'WEB_DEVELOPMENT',

    // Problem Statement Tracks (up to 5)
    problemStatementTracks: [] as Array<{
      trackNumber: number;
      trackTitle: string;
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      description?: string;
    }>,
    numberOfTracks: 1, // New field to control how many tracks to show

    // Timeline & Dates
    registrationStart: '',
    registrationEnd: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',

    // Financial & Team Details
    registrationFee: '',
    prizeCurrency: 'INR',
    prizeAmount: '',
    minTeamSize: 1,
    maxTeamSize: 5,
    allowIndividual: true,

    // Venue & Location
    venue: '',
    isVirtual: false,



    // Outcomes & Judging
    expectedOutcome: '',
    judgingCriteria: [] as Array<{
      criterion: string;
      description: string;
      weight: number;
    }>,

    // Legal & Contact
    termsAndConditions: '',
    contactEmail: '',
    contactPhone: '',
    contactPerson: '',

    // Required Data Excel File
    dataExcelFile: null as { fileName: string; fileUrl: string; fileSize: number } | null,

    // Technical Details (keeping existing)
    requirements: { description: '', technologies: [], deliverables: [] },
    rules: '',
    guidelines: '',
    bannerImageUrl: '',
    logoImageUrl: '',

    // Judges (keeping existing)
    judges: [] as Array<{
      name: string;
      email: string;
      bio: string;
      expertise: string;
      linkedinUrl?: string;
      profileImageUrl?: string;
    }>,
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingHackathonData, setPendingHackathonData] = useState<any>(null);
  const [creationFee, setCreationFee] = useState<number>(0);
  const [backendPaymentId, setBackendPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        const config = await api.getSystemConfig('creation_fee');
        if (config && config.value) {
          setCreationFee(parseFloat(config.value));
        }
      } catch (error) {
        console.error('Failed to fetch system config:', error);
      }
    };
    fetchSystemConfig();
  }, []);

  const handlePaymentSuccess = async (paymentDetails: { paymentId: string; providerPaymentId: string }) => {
    setShowPaymentModal(false);
    setLoading(true);

    try {
      // Use the real backend paymentId (stored when createPaymentOrder was called)
      // The providerPaymentId from the modal starts with 'test_provider_' which backend accepts
      const realPaymentId = backendPaymentId || paymentDetails.paymentId;

      const result = await api.createHackathon({
        ...pendingHackathonData,
        paymentId: realPaymentId,
        providerPaymentId: paymentDetails.providerPaymentId
      });

      toast.success('Hackathon created successfully! 🎉');
      setBackendPaymentId(null);
      onSuccess();
    } catch (error: any) {
      console.error('❌ Hackathon creation error:', error);
      const errorMessage = error.message || 'Failed to create hackathon';
      toast.error(`Failed to create hackathon: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

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
      toast.error(`Failed to upload banner: ${error.message} `, { id: 'banner-upload' });
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
      toast.error(`Failed to upload logo: ${error.message} `, { id: 'logo-upload' });
      console.error('Logo upload error:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProblemStatementUpload = async (e: React.ChangeEvent<HTMLInputElement>, trackNumber: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid document file (PPT, Word, Excel, or PDF)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Document size must be less than 10MB');
      return;
    }

    setUploadingProblemStatement(true);
    try {
      toast.loading(`Uploading problem statement for Track ${trackNumber}...`, { id: `problem - statement - upload - ${trackNumber} ` });
      const result = await api.uploadFile(file, 'hackathons/problem-statements');

      // Update the specific track
      const updatedTracks = [...formData.problemStatementTracks];
      const existingTrackIndex = updatedTracks.findIndex(t => t.trackNumber === trackNumber);

      const trackData = {
        trackNumber,
        trackTitle: `Track ${trackNumber} `,
        fileName: file.name,
        fileUrl: result.file.url,
        fileType: file.type,
        fileSize: file.size,
        description: '',
      };

      if (existingTrackIndex >= 0) {
        updatedTracks[existingTrackIndex] = trackData;
      } else {
        updatedTracks.push(trackData);
      }

      setFormData({ ...formData, problemStatementTracks: updatedTracks });
      toast.success(`Problem statement for Track ${trackNumber} uploaded successfully!`, { id: `problem - statement - upload - ${trackNumber} ` });
    } catch (error: any) {
      toast.error(`Failed to upload Track ${trackNumber}: ${error.message} `, { id: `problem - statement - upload - ${trackNumber} ` });
      console.error('Problem statement upload error:', error);
    } finally {
      setUploadingProblemStatement(false);
    }
  };

  const updateTrackTitle = (trackNumber: number, title: string) => {
    const updatedTracks = [...formData.problemStatementTracks];
    const trackIndex = updatedTracks.findIndex(t => t.trackNumber === trackNumber);

    if (trackIndex >= 0) {
      updatedTracks[trackIndex].trackTitle = title;
      setFormData({ ...formData, problemStatementTracks: updatedTracks });
    }
  };

  const updateTrackDescription = (trackNumber: number, description: string) => {
    const updatedTracks = [...formData.problemStatementTracks];
    const trackIndex = updatedTracks.findIndex(t => t.trackNumber === trackNumber);

    if (trackIndex >= 0) {
      updatedTracks[trackIndex].description = description;
      setFormData({ ...formData, problemStatementTracks: updatedTracks });
    }
  };

  const removeTrack = (trackNumber: number) => {
    const updatedTracks = formData.problemStatementTracks.filter(t => t.trackNumber !== trackNumber);
    setFormData({ ...formData, problemStatementTracks: updatedTracks });
  };

  const handleDataExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - Excel or CSV
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    const allowedExtensions = ['.xlsx', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error('Please select a valid Excel (.xlsx) or CSV (.csv) file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingBanner(true);
    try {
      toast.loading('Uploading data Excel file...', { id: 'data-excel-upload' });
      const result = await api.uploadFile(file, 'hackathons/data');

      setFormData({
        ...formData,
        dataExcelFile: {
          fileName: file.name,
          fileUrl: result.file.url,
          fileSize: file.size
        }
      });
      toast.success('Data Excel file uploaded successfully!', { id: 'data-excel-upload' });
    } catch (error: any) {
      toast.error(`Failed to upload: ${error.message}`, { id: 'data-excel-upload' });
      console.error('Data Excel upload error:', error);
    } finally {
      setUploadingBanner(false);
    }
  };

  const addJudge = () => {
    setFormData({
      ...formData,
      judges: [
        ...formData.judges,
        {
          name: '',
          email: '',
          bio: '',
          expertise: '',
          linkedinUrl: '',
          profileImageUrl: '',
        },
      ],
    });
  };

  const removeJudge = (index: number) => {
    setFormData({
      ...formData,
      judges: formData.judges.filter((_, i) => i !== index),
    });
  };

  const updateJudge = (index: number, field: string, value: string) => {
    const updatedJudges = [...formData.judges];
    updatedJudges[index] = { ...updatedJudges[index], [field]: value };
    setFormData({ ...formData, judges: updatedJudges });
  };



  const addJudgingCriterion = () => {
    setFormData({
      ...formData,
      judgingCriteria: [
        ...formData.judgingCriteria,
        {
          criterion: '',
          description: '',
          weight: 0,
        },
      ],
    });
  };

  const removeJudgingCriterion = (index: number) => {
    setFormData({
      ...formData,
      judgingCriteria: formData.judgingCriteria.filter((_, i) => i !== index),
    });
  };

  const updateJudgingCriterion = (index: number, field: string, value: string | number) => {
    const updatedCriteria = [...formData.judgingCriteria];
    updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
    setFormData({ ...formData, judgingCriteria: updatedCriteria });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🚀 Starting hackathon creation...');

      // Skip role validation entirely - we're already in organizer dashboard
      console.log('✅ Skipping role validation - already in organizer dashboard');

      // Validate required fields with detailed logging
      const requiredFields = [
        { field: 'title', name: 'Hackathon Name' },
        { field: 'whyParticipate', name: 'Why Participate' },
        { field: 'registrationStart', name: 'Registration Start' },
        { field: 'registrationEnd', name: 'Registration End' },
        { field: 'startDate', name: 'Hackathon Start' },
        { field: 'endDate', name: 'Hackathon End' },
        { field: 'submissionDeadline', name: 'Submission Deadline' },
        { field: 'venue', name: 'Venue' },
        { field: 'expectedOutcome', name: 'Expected Outcome' },
        { field: 'termsAndConditions', name: 'Terms and Conditions' },
        { field: 'contactPerson', name: 'Contact Person' },
        { field: 'contactEmail', name: 'Contact Email' },
        { field: 'rules', name: 'Rules & Guidelines' },
        { field: 'bannerImageUrl', name: 'Banner Image' },
        { field: 'logoImageUrl', name: 'Logo Image' },
        { field: 'registrationFee', name: 'Registration Fee (enter 0 if free)' },
      ];

      console.log('🔍 Validating required fields...');
      for (const { field, name } of requiredFields) {
        const value = (formData as any)[field];
        console.log(`   ${name} (${field}): `, value ? `"${value.toString().substring(0, 50)}..."` : 'EMPTY');

        if (!value || value.toString().trim() === '') {
          console.error(`❌ Missing required field: ${name} `);
          toast.error(`${name} is required`);
          setLoading(false);
          return;
        }
      }

      console.log('✅ All required fields validated');

      // Validate required data Excel file
      if (!formData.dataExcelFile) {
        toast.error('Please upload the required Data Excel file.');
        setLoading(false);
        return;
      }

      // Validate required problem statement tracks
      if (!formData.problemStatementTracks || formData.problemStatementTracks.length === 0) {
        toast.error('Please upload at least one problem statement track.');
        setLoading(false);
        return;
      }

      // Validate that all selected tracks have been uploaded
      const uploadedTracks = formData.problemStatementTracks.length;
      if (uploadedTracks < formData.numberOfTracks) {
        toast.error(`Please upload all ${formData.numberOfTracks} problem statement tracks.`);
        setLoading(false);
        return;
      }

      console.log('✅ Problem statement tracks validated');

      // Convert datetime-local to ISO string format
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        // datetime-local format is YYYY-MM-DDTHH:mm, convert to ISO
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
      };

      // Remove numberOfTracks and dataExcelFile as they're not needed by the backend
      const { numberOfTracks, dataExcelFile, ...hackathonDataForAPI } = hackathonData;

      console.log('📤 Sending hackathon data to API...');
      console.log('📤 Data being sent:', JSON.stringify(hackathonDataForAPI, null, 2));
      console.log('📤 Image URLs in data:', {
        bannerImageUrl: hackathonDataForAPI.bannerImageUrl,
        logoImageUrl: hackathonDataForAPI.logoImageUrl
      });

      // TESTING MODE: Bypass payment and create hackathon directly
      // console.log('🧪 TESTING MODE: Creating hackathon without payment');

      // Add dummy payment data for testing
      // const hackathonDataWithPayment = {
      //   ...hackathonDataForAPI,
      //   paymentId: 'test_payment_' + Date.now(),
      //   providerPaymentId: 'test_provider_' + Date.now(),
      // };

      // const result = await api.createHackathon(hackathonDataWithPayment);

      // toast.success('Hackathon created successfully! 🎉');
      // onSuccess();
      // setLoading(false);

      // PRODUCTION MODE: Create a real payment order in the backend first,
      // then show the payment modal. This ensures the paymentId exists in the DB.
      setPendingHackathonData(hackathonDataForAPI);
      setLoading(true);

      try {
        const paymentOrder = await api.createPaymentOrder();
        setBackendPaymentId(paymentOrder.paymentId);
        setCreationFee(paymentOrder.amount);
        setShowPaymentModal(true);
      } catch (paymentError: any) {
        console.error('❌ Failed to create payment order:', paymentError);
        toast.error(`Failed to initiate payment: ${paymentError.message}`);
      } finally {
        setLoading(false);
      }

    } catch (error: any) {
      console.error('❌ Hackathon creation error:', error);
      toast.error(`Error: ${error.message} `);
      setLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* 1. Name of the Hackathon */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-blue-400" />
            Hackathon Details
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="text-white font-semibold">Hackathon Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., AI Innovation Challenge 2024"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-white font-semibold">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white focus:border-blue-400 focus:outline-none [&>option]:text-white [&>option]:bg-slate-800"
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
        </div>

        {/* 2. About the Hackathon - Problem Statement Tracks */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Problem Statement Tracks</h3>
          <p className="text-white mb-4">Upload problem statement tracks for participants to choose from.</p>

          {/* Number of Tracks Selector */}
          <div className="mb-6">
            <Label className="text-white font-semibold mb-2 block">Number of Tracks</Label>
            <select
              value={formData.numberOfTracks}
              onChange={(e) => {
                const newNumber = parseInt(e.target.value);
                // Remove tracks that exceed the new number
                const filteredTracks = formData.problemStatementTracks.filter(t => t.trackNumber <= newNumber);
                setFormData({
                  ...formData,
                  numberOfTracks: newNumber,
                  problemStatementTracks: filteredTracks
                });
              }}
              className="bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white focus:border-blue-400 focus:outline-none [&>option]:text-white [&>option]:bg-slate-800"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>
                  {num} Track{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Select how many problem statement tracks you want to create</p>
          </div>

          <div className="space-y-4">
            {Array.from({ length: formData.numberOfTracks }, (_, index) => {
              const trackNumber = index + 1;
              const existingTrack = formData.problemStatementTracks.find(t => t.trackNumber === trackNumber);

              return (
                <div key={trackNumber} className="border border-slate-600 rounded-lg p-4 bg-slate-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">Track {trackNumber}</h4>
                    {existingTrack && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => removeTrack(trackNumber)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {existingTrack ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-white font-semibold">Track Title</Label>
                        <Input
                          value={existingTrack.trackTitle}
                          onChange={(e) => updateTrackTitle(trackNumber, e.target.value)}
                          placeholder={`Track ${trackNumber} Title`}
                          className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                        />
                      </div>

                      <div>
                        <Label className="text-white font-semibold">Description (Optional)</Label>
                        <Input
                          value={existingTrack.description || ''}
                          onChange={(e) => updateTrackDescription(trackNumber, e.target.value)}
                          placeholder="Brief description of this track..."
                          className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                        />
                      </div>

                      <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                        <p className="text-sm text-green-400 mb-1">✓ Document uploaded successfully</p>
                        <p className="text-xs text-white/80 mb-2">{existingTrack.fileName}</p>
                        <a
                          href={existingTrack.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          View uploaded document
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor={`problemStatement - ${trackNumber} `}
                        className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center py-3">
                          <Upload className="w-5 h-5 mb-1 text-white/80" />
                          <p className="text-sm text-slate-300">
                            <span className="font-semibold text-white">Upload</span> Track {trackNumber}
                          </p>
                          <p className="text-xs text-slate-400">PPT, Word, Excel, PDF (MAX. 10MB)</p>
                        </div>
                        <input
                          id={`problemStatement - ${trackNumber} `}
                          type="file"
                          className="hidden"
                          accept=".ppt,.pptx,.doc,.docx,.xls,.xlsx,.pdf"
                          onChange={(e) => handleProblemStatementUpload(e, trackNumber)}
                          disabled={uploadingProblemStatement}
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 mt-3">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Participants will select one track during registration. At least one track is required.
          </p>
        </div>

        {/* 2.5 Required Data Excel Upload */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Hackathon Data Excel *</h3>
          <div>
            <Label className="text-white font-semibold">Upload Excel Data File (Required)</Label>
            <p className="text-xs text-slate-400 mt-1 mb-3">Upload hackathon data in .xlsx or .csv format</p>

            {!formData.dataExcelFile ? (
              <label
                htmlFor="dataExcelUpload"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-red-500 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="w-6 h-6 mb-2 text-red-400" />
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-white">Upload Required Excel File</span>
                  </p>
                  <p className="text-xs text-slate-400">Excel (.xlsx) or CSV (.csv) - MAX. 10MB</p>
                </div>
                <input
                  id="dataExcelUpload"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.csv"
                  onChange={handleDataExcelUpload}
                  disabled={uploadingBanner}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-green-500 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{formData.dataExcelFile.fileName}</p>
                    <p className="text-xs text-slate-400">{(formData.dataExcelFile.fileSize / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                  onClick={() => setFormData({ ...formData, dataExcelFile: null })}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Why Participate */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Why Participate</h3>
          <div>
            <Label htmlFor="whyParticipate" className="text-white font-semibold">Benefits & Motivation *</Label>
            <textarea
              id="whyParticipate"
              value={formData.whyParticipate}
              onChange={(e) => setFormData({ ...formData, whyParticipate: e.target.value })}
              rows={4}
              placeholder="Explain the benefits, learning opportunities, networking, prizes, and career advantages..."
              className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* 4. Registration Fees & 5. Team Size */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Registration & Team Details</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="registrationFee" className="text-white font-semibold">Registration Fee <span className="text-red-400">*</span> <span className="text-slate-400 text-xs font-normal">(enter 0 if free)</span></Label>
              <Input
                id="registrationFee"
                type="number"
                min="0"
                step="1"
                required
                value={formData.registrationFee}
                onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
                placeholder="e.g., 999 (enter 0 if free)"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="minTeamSize" className="text-white font-semibold">Min Team Size *</Label>
              <Input
                id="minTeamSize"
                type="number"
                min="1"
                value={formData.minTeamSize}
                onChange={(e) => setFormData({ ...formData, minTeamSize: parseInt(e.target.value) || 1 })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="maxTeamSize" className="text-white font-semibold">Max Team Size *</Label>
              <Input
                id="maxTeamSize"
                type="number"
                min="1"
                value={formData.maxTeamSize}
                onChange={(e) => setFormData({ ...formData, maxTeamSize: parseInt(e.target.value) || 5 })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={formData.allowIndividual}
                onChange={(e) => setFormData({ ...formData, allowIndividual: e.target.checked })}
                className="rounded border-slate-600 bg-slate-800"
              />
              Allow individual participation
            </label>
          </div>
        </div>

        {/* 6. Venue */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            Venue
          </h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-slate-300 mb-4">
                <input
                  type="checkbox"
                  checked={formData.isVirtual}
                  onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-800"
                />
                Virtual Event
              </label>
            </div>
            <div>
              <Label htmlFor="venue" className="text-white font-semibold">
                {formData.isVirtual ? 'Platform/Link *' : 'Venue Address *'}
              </Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder={formData.isVirtual ? "e.g., Zoom, Discord, or platform link" : "e.g., Tech Hub, 123 Innovation Street, City"}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>
          </div>
        </div>

        {/* 7. Timeline (Dates) */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            Timeline & Important Dates
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="registrationStart" className="text-white font-semibold">Registration Start *</Label>
              <Input
                id="registrationStart"
                type="datetime-local"
                value={formData.registrationStart}
                onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="registrationEnd" className="text-white font-semibold">Registration End *</Label>
              <Input
                id="registrationEnd"
                type="datetime-local"
                value={formData.registrationEnd}
                onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="startDate" className="text-white font-semibold">Hackathon Start *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="submissionDeadline" className="text-white font-semibold">Submission Deadline *</Label>
              <Input
                id="submissionDeadline"
                type="datetime-local"
                value={formData.submissionDeadline}
                onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-white font-semibold">Hackathon End *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="prizeAmount" className="text-white font-semibold">Prize Amount</Label>
              <Input
                id="prizeAmount"
                type="number"
                value={formData.prizeAmount}
                onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                placeholder="e.g., 50000"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>



        {/* 8. Expected Outcome */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-400" />
            Expected Outcome
          </h3>
          <div>
            <Label htmlFor="expectedOutcome" className="text-white font-semibold">What should participants achieve? *</Label>
            <textarea
              id="expectedOutcome"
              value={formData.expectedOutcome}
              onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
              rows={4}
              placeholder="Describe the expected deliverables, prototypes, solutions, or innovations participants should create..."
              className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* 9. Judging Criteria */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-400" />
              Judging Criteria
            </h3>
            <Button
              type="button"
              onClick={addJudgingCriterion}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Criterion
            </Button>
          </div>

          {formData.judgingCriteria.length === 0 ? (
            <div className="text-center py-8 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600">
              <Scale className="w-12 h-12 mx-auto mb-3 text-white/60" />
              <p className="text-white mb-2">No judging criteria added yet</p>
              <p className="text-slate-400 text-sm">Add criteria like "Innovation", "Technical Implementation", "User Experience", etc.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.judgingCriteria.map((criterion, index) => (
                <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-white font-semibold">Criterion {index + 1}</h5>
                    <Button
                      type="button"
                      onClick={() => removeJudgingCriterion(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white font-medium">Criterion Name *</Label>
                      <Input
                        value={criterion.criterion}
                        onChange={(e) => updateJudgingCriterion(index, 'criterion', e.target.value)}
                        placeholder="e.g., Innovation, Technical Quality"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Weight (%) *</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={criterion.weight}
                        onChange={(e) => updateJudgingCriterion(index, 'weight', parseInt(e.target.value) || 0)}
                        placeholder="e.g., 25"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Description *</Label>
                      <Input
                        value={criterion.description}
                        onChange={(e) => updateJudgingCriterion(index, 'description', e.target.value)}
                        placeholder="What will be evaluated"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Judges Section (keeping existing) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-400" />
              Judges
            </h3>
            <Button
              type="button"
              onClick={addJudge}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Judge
            </Button>
          </div>

          {formData.judges.length === 0 ? (
            <div className="text-center py-8 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600">
              <Award className="w-12 h-12 mx-auto mb-3 text-white/60" />
              <p className="text-white mb-2">No judges added yet</p>
              <p className="text-slate-400 text-sm">Add judges who will evaluate the submissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.judges.map((judge, index) => (
                <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">Judge {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeJudge(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white font-medium">Name *</Label>
                      <Input
                        value={judge.name}
                        onChange={(e) => updateJudge(index, 'name', e.target.value)}
                        placeholder="Judge's full name"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Email *</Label>
                      <Input
                        type="email"
                        value={judge.email}
                        onChange={(e) => updateJudge(index, 'email', e.target.value)}
                        placeholder="judge@example.com"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label className="text-white font-medium">Expertise *</Label>
                    <Input
                      value={judge.expertise}
                      onChange={(e) => updateJudge(index, 'expertise', e.target.value)}
                      placeholder="e.g., AI/ML, Web Development, Product Management"
                      className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <Label className="text-white font-medium">Bio *</Label>
                    <textarea
                      value={judge.bio}
                      onChange={(e) => updateJudge(index, 'bio', e.target.value)}
                      rows={3}
                      placeholder="Brief bio about the judge's background and experience..."
                      className="mt-1 w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-white font-medium">LinkedIn URL</Label>
                      <Input
                        type="url"
                        value={judge.linkedinUrl}
                        onChange={(e) => updateJudge(index, 'linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Profile Image URL</Label>
                      <Input
                        type="url"
                        value={judge.profileImageUrl}
                        onChange={(e) => updateJudge(index, 'profileImageUrl', e.target.value)}
                        placeholder="https://example.com/profile.jpg"
                        className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 10. Terms and Conditions */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Terms and Conditions</h3>
          <div>
            <Label htmlFor="termsAndConditions" className="text-white font-semibold">Terms & Conditions *</Label>
            <textarea
              id="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              rows={6}
              placeholder="Enter the terms and conditions, rules, intellectual property rights, code of conduct, etc..."
              className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* 11. Contact Information */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            Contact Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="contactPerson" className="text-white font-semibold">Contact Person *</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Full name of contact person"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="contactEmail" className="text-white font-semibold">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@organization.com"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="contactPhone" className="text-white font-semibold">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Additional Details</h3>
          <div className="space-y-6">
            <div>
              <Label htmlFor="rules" className="text-white font-semibold">Rules & Guidelines *</Label>
              <textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                rows={3}
                placeholder="List key rules, submission guidelines, and participation requirements..."
                className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <Label htmlFor="guidelines" className="text-white font-semibold">Technical Guidelines</Label>
              <textarea
                id="guidelines"
                value={formData.guidelines}
                onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                rows={3}
                placeholder="Technical requirements, allowed technologies, submission format, etc..."
                className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="bannerImage" className="text-white font-semibold">Banner Image *</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <label
                  htmlFor="bannerImage"
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
                    id="bannerImage"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    disabled={uploadingBanner}
                  />
                </label>
              </div>
              {formData.bannerImageUrl && (
                <div className="mt-2 text-center">
                  <img
                    src={formData.bannerImageUrl}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-md border border-slate-600 mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setFormData({ ...formData, bannerImageUrl: '' })}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                  >
                    <X className="w-4 h-4 mr-2" /> Remove Banner
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="logoImage" className="text-white font-semibold">Logo Image *</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <label
                  htmlFor="logoImage"
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
                    id="logoImage"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
              {formData.logoImageUrl && (
                <div className="mt-2 flex flex-col items-center">
                  <img
                    src={formData.logoImageUrl}
                    alt="Logo preview"
                    className="w-24 h-24 object-contain rounded-md border border-slate-600 mb-2 bg-slate-800/50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setFormData({ ...formData, logoImageUrl: '' })}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                  >
                    <X className="w-4 h-4 mr-2" /> Remove Logo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Hackathon
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border-2 border-slate-600 hover:bg-slate-800 text-white"
          >
            Cancel
          </Button>
        </div>
      </form>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        hackathonTitle={formData.title || 'Your Hackathon'}
        amount={creationFee || 10000}
      />
    </>
  );
}

// Main Organizer Dashboard Component - Proper dashboard with sidebar navigation
export function OrganizerDashboard({ userData, onLogout, onBack }: {
  userData: any;
  onLogout: () => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [myHackathons, setMyHackathons] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditDetailsForm, setShowEditDetailsForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasShownOnboardingModal, setHasShownOnboardingModal] = useState(false); // Track if modal was already shown this session

  useEffect(() => {
    // Moved logic to fetchOrganizerData to rely on hackathon count
  }, [userData]);

  const handleOnboardingSuccess = async () => {
    console.log('✅ Host onboarding completed successfully');
    setShowOnboardingModal(false);
    setHasCompletedOnboarding(true); // Mark as completed to prevent reopening

    // Fetch fresh user data to update the userData prop
    try {
      const freshUserData = await api.getCurrentUser();
      console.log('🔄 Refreshed user data:', freshUserData);

      // Update parent component's userData if there's a callback
      // For now, we'll just refresh organizer data
      await fetchOrganizerData();
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Edit Details Form state
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    whyParticipate: '',
    category: 'WEB_DEVELOPMENT',
    registrationStart: '',
    registrationEnd: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
    registrationFee: '',
    prizeCurrency: 'INR',
    prizeAmount: '',
    minTeamSize: 1,
    maxTeamSize: 5,
    allowIndividual: true,
    venue: '',
    isVirtual: false,
    expectedOutcome: '',
    judgingCriteria: [] as any[],
    judges: [] as any[],
    termsAndConditions: '',
    contactEmail: '',
    contactPhone: '',
    contactPerson: '',
    rules: '',
    guidelines: '',
    bannerImageUrl: '',
    logoImageUrl: '',
  });

  useEffect(() => {
    if (selectedHackathon && showEditModal) {
      console.log('🔄 Prefilling Edit Form with:', selectedHackathon);
      setEditFormData({
        title: selectedHackathon.title || '',
        description: selectedHackathon.description || '',
        whyParticipate: selectedHackathon.whyParticipate || '',
        category: selectedHackathon.category || 'WEB_DEVELOPMENT',
        registrationStart: selectedHackathon.registrationStart ? new Date(selectedHackathon.registrationStart).toISOString().slice(0, 16) : '',
        registrationEnd: (selectedHackathon.registrationEnd || selectedHackathon.registrationDeadline) ? new Date(selectedHackathon.registrationEnd || selectedHackathon.registrationDeadline).toISOString().slice(0, 16) : '',
        startDate: selectedHackathon.startDate ? new Date(selectedHackathon.startDate).toISOString().slice(0, 16) : '',
        endDate: selectedHackathon.endDate ? new Date(selectedHackathon.endDate).toISOString().slice(0, 16) : '',
        submissionDeadline: selectedHackathon.submissionDeadline ? new Date(selectedHackathon.submissionDeadline).toISOString().slice(0, 16) : '',
        registrationFee: selectedHackathon.registrationFee || '',
        prizeCurrency: selectedHackathon.prizeCurrency || 'INR',
        prizeAmount: selectedHackathon.prizeAmount || '',
        minTeamSize: selectedHackathon.minTeamSize || 1,
        maxTeamSize: selectedHackathon.maxTeamSize || 5,
        allowIndividual: selectedHackathon.allowIndividual !== undefined ? selectedHackathon.allowIndividual : true,
        venue: selectedHackathon.location || selectedHackathon.venue || '',
        isVirtual: selectedHackathon.isVirtual || false,
        expectedOutcome: selectedHackathon.expectedOutcome || '',
        judgingCriteria: Array.isArray(selectedHackathon.judgingCriteria) ? selectedHackathon.judgingCriteria : [],
        judges: Array.isArray(selectedHackathon.judges) ? selectedHackathon.judges : [],
        termsAndConditions: selectedHackathon.termsAndConditions || '',
        contactEmail: selectedHackathon.contactEmail || '',
        contactPhone: selectedHackathon.contactPhone || '',
        contactPerson: selectedHackathon.contactPerson || '',
        rules: selectedHackathon.rules || '',
        guidelines: selectedHackathon.guidelines || '',
        bannerImageUrl: selectedHackathon.bannerImageUrl || selectedHackathon.bannerUrl || '',
        logoImageUrl: selectedHackathon.logoImageUrl || selectedHackathon.logoUrl || '',
      });
    }
  }, [selectedHackathon, showEditModal]);

  const [stats, setStats] = useState({
    totalHackathons: 0,
    activeHackathons: 0,
    totalParticipants: 0,
    totalSubmissions: 0,
  });

  // Modal states for submission review
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const exportToExcel = (data: any[], filename: string) => {
    if (!data.length) {
      toast.error('No data to export');
      return;
    }

    const exportData = data.map(p => {
      // Build team members string: "Name (Email), Name (Email)"
      const teamMembersStr = p.team?.members
        ?.map((m: any) => `${m.user?.firstName || ''} ${m.user?.lastName || ''} <${m.user?.email || ''}>`.trim())
        .join(', ') || 'N/A';

      return {
        // Existing columns (unchanged)
        'Full Name': `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim(),
        'Email': p.user?.email || '',
        'Phone Number': p.user?.phoneNumber || 'N/A',
        'Hackathon Name': p.hackathonTitle || p.hackathon?.title || '',
        'Team Name': p.team?.name || p.teamName || 'Individual',
        'Team Role': p.role || 'MEMBER',
        'Track': p.selectedTrack || 'N/A',
        'Registration Date': p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : (p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : ''),
        'Hackathon Start Date': p.hackathon?.startDate ? new Date(p.hackathon.startDate).toLocaleDateString() : '',
        'Hackathon End Date': p.hackathon?.endDate ? new Date(p.hackathon.endDate).toLocaleDateString() : '',
        'Submission Deadline': p.hackathon?.submissionDeadline ? new Date(p.hackathon.submissionDeadline).toLocaleDateString() : '',
        'Submission Status': p.hasSubmission ? 'Submitted' : 'Not Submitted',
        // Payment columns (NEW - Step 7)
        'Payment ID': p.payment?.id || 'N/A',
        'Payment Invoice': p.payment?.invoiceId || 'N/A',
        'Payment Amount (₹)': p.payment?.amount ?? 'Free',
        'Payment Status': p.payment?.status || 'N/A',
        'Payment Date': p.payment?.createdAt ? new Date(p.payment.createdAt).toLocaleDateString() : 'N/A',
        'Payment Method': p.payment?.paymentMethod || 'N/A',
        // Team members (NEW - Step 8)
        'Team Members': teamMembersStr,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  console.log('🔄 OrganizerDashboard: Component rendering with userData:', userData);

  // Add error boundary and validation
  if (!userData) {
    console.error('❌ OrganizerDashboard: No userData provided');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error: No User Data</h1>
          <p className="text-white mb-4">Unable to load organizer dashboard</p>
          <Button onClick={onBack} className="bg-slate-700 hover:bg-slate-600 text-white">
            ← Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Fetch organizer data
  const fetchOrganizerData = async () => {
    try {
      setLoading(true);

      // Fetch my hackathons
      const hackathons = await api.getMyHackathons();
      console.log('📊 Fetched hackathons:', hackathons.length);
      setMyHackathons(hackathons);

      // Calculate stats
      const activeHackathons = hackathons.filter(h => h.status === 'PUBLISHED').length;

      // Fetch participants and submissions for all hackathons
      let allParticipants: any[] = [];
      let allSubmissions: any[] = [];

      for (const hackathon of hackathons) {
        try {
          // Get participants for this hackathon
          const hackathonParticipants = await api.getHackathonParticipants(hackathon.id);
          const participantsWithHackathon = hackathonParticipants.map(p => ({
            ...p,
            hackathonTitle: hackathon.title,
            hackathonId: hackathon.id
          }));
          allParticipants = [...allParticipants, ...participantsWithHackathon];

          // Get submissions for this hackathon
          const hackathonSubmissions = await api.getSubmissions({ hackathonId: hackathon.id });
          const submissionsWithHackathon = hackathonSubmissions.map(s => ({
            ...s,
            hackathonTitle: hackathon.title,
            hackathonId: hackathon.id
          }));
          allSubmissions = [...allSubmissions, ...submissionsWithHackathon];

          console.log(`📊 Hackathon "${hackathon.title}": ${hackathonParticipants.length} participants, ${hackathonSubmissions.length} submissions`);
        } catch (error) {
          console.error(`Error fetching data for hackathon ${hackathon.id}: `, error);
        }
      }

      setParticipants(allParticipants);
      setSubmissions(allSubmissions);

      // Payment history is now handled by the PaymentHistory component

      // Update stats with real counts
      setStats({
        totalHackathons: hackathons.length,
        activeHackathons,
        totalParticipants: allParticipants.length,
        totalSubmissions: allSubmissions.length,
      });

      console.log('📊 Final stats:', {
        totalHackathons: hackathons.length,
        activeHackathons,
        totalParticipants: allParticipants.length,
        totalSubmissions: allSubmissions.length,
      });

      // Show onboarding only if user hasn't onboarded AND has no hackathons AND hasn't just completed onboarding
      // AND we haven't already shown it in this session
      // This handles the case where legacy users might have hostOnboarded=false but already have hackathons
      if (userData && !userData.hostOnboarded && hackathons.length === 0 && !hasCompletedOnboarding && !hasShownOnboardingModal) {
        console.log('📋 Showing Host Details modal for new host');
        setShowOnboardingModal(true);
        setHasShownOnboardingModal(true); // Mark as shown
      } else if (showOnboardingModal && (hackathons.length > 0 || hasCompletedOnboarding)) {
        // Safety check: close modal if we discover they have hackathons or just completed onboarding
        setShowOnboardingModal(false);
      }


    } catch (error: any) {
      console.error('Error fetching organizer data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  // Only refresh data when switching to dashboard or payments tab
  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'payments') {
      fetchOrganizerData();
    }
  }, [activeTab]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'create-hackathon', label: 'Create Hackathon', icon: Plus },
    { id: 'my-hackathons', label: 'My Hackathons', icon: Trophy },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'review-submissions', label: 'Review Submissions', icon: FileText },
    { id: 'payments', label: 'Payment History', icon: ReceiptText },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 1 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-white/70 mt-2">Welcome back, {userData.firstName}! Here's your hackathon overview.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm" style={{ color: 'white' }}>
          <div className="flex items-center gap-4" style={{ color: 'white' }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-400" />
            </div>
            <div style={{ color: 'white' }}>
              <p className="text-2xl font-bold text-white" style={{ color: 'white !important' }}>{stats.totalHackathons}</p>
              <p className="text-white text-sm" style={{ color: 'white !important' }}>Total Hackathons</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm" style={{ color: 'white' }}>
          <div className="flex items-center gap-4" style={{ color: 'white' }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-400" />
            </div>
            <div style={{ color: 'white' }}>
              <p className="text-2xl font-bold text-white" style={{ color: 'white !important' }}>{stats.activeHackathons}</p>
              <p className="text-white text-sm" style={{ color: 'white !important' }}>Active Hackathons</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm" style={{ color: 'white' }}>
          <div className="flex items-center gap-4" style={{ color: 'white' }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            <div style={{ color: 'white' }}>
              <p className="text-2xl font-bold text-white" style={{ color: 'white !important' }}>{stats.totalParticipants}</p>
              <p className="text-white text-sm" style={{ color: 'white !important' }}>Total Participants</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm" style={{ color: 'white' }}>
          <div className="flex items-center gap-4" style={{ color: 'white' }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div style={{ color: 'white' }}>
              <p className="text-2xl font-bold text-white" style={{ color: 'white !important' }}>{stats.totalSubmissions}</p>
              <p className="text-white text-sm" style={{ color: 'white !important' }}>Total Submissions</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm" style={{ color: 'white' }}>
          <h3 className="text-xl font-bold text-white mb-4" style={{ color: 'white !important' }}>Recent Hackathons</h3>
          {myHackathons.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'white' }}>
              <Trophy className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white" style={{ color: 'white !important' }}>No hackathons created yet</p>
              <Button
                onClick={() => setActiveTab('create-hackathon')}
                className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white"
              >
                Create Your First Hackathon
              </Button>
            </div>
          ) : (
            <div className="space-y-3" style={{ color: 'white' }}>
              {myHackathons.slice(0, 3).map((hackathon) => (
                <div key={hackathon.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg" style={{ color: 'white' }}>
                  <div className="flex items-center gap-3" style={{ color: 'white' }}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div style={{ color: 'white' }}>
                      <p className="text-white font-medium" style={{ color: 'white !important' }}>{hackathon.title}</p>
                      <p className="text-white text-sm" style={{ color: 'white !important' }}>{hackathon.category}</p>
                    </div>
                  </div>
                  <Badge className={`${hackathon.status === 'PUBLISHED'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    } `}>
                    {hackathon.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm" style={{ color: 'white' }}>
          <h3 className="text-xl font-bold text-white mb-4" style={{ color: 'white !important' }}>Recent Submissions</h3>
          {submissions.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'white' }}>
              <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white" style={{ color: 'white !important' }}>No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-3" style={{ color: 'white' }}>
              {submissions.slice(0, 3).map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg" style={{ color: 'white' }}>
                  <div className="flex items-center gap-3" style={{ color: 'white' }}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{submission.title}</p>
                      <p className="text-white/60 text-sm">{submission.hackathonTitle}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {submission.isDraft ? 'Draft' : 'Submitted'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  const renderHackathonDetailsModal = () => {
    if (!selectedHackathon) return null;

    const isPublished = selectedHackathon.status === 'PUBLISHED' || selectedHackathon.status === 'LIVE';
    const canPublish = selectedHackathon.status === 'UPCOMING' || selectedHackathon.status === 'DRAFT';

    const handlePublishHackathon = async () => {
      try {
        const updated = await api.updateHackathonStatus(selectedHackathon.id, 'PUBLISHED');
        const newStatus = updated?.status || 'LIVE';

        toast.success(`${selectedHackathon.title} is now live! Participants can register and submit projects.`);
        setMyHackathons(prev => prev.map(h =>
          h.id === selectedHackathon.id ? { ...h, status: newStatus } : h
        ));
        setSelectedHackathon({ ...selectedHackathon, status: newStatus });
        fetchOrganizerData();
      } catch (error) {
        console.error('Error publishing hackathon:', error);
        toast.error('Failed to publish hackathon. Please try again.');
      }
    };

    const handleUnpublishHackathon = async () => {
      try {
        const updated = await api.updateHackathonStatus(selectedHackathon.id, 'UPCOMING');
        const newStatus = updated?.status || 'UPCOMING';

        toast.success(`${selectedHackathon.title} has been removed from live status.`);
        setMyHackathons(prev => prev.map(h =>
          h.id === selectedHackathon.id ? { ...h, status: newStatus } : h
        ));
        setSelectedHackathon({ ...selectedHackathon, status: newStatus });
        fetchOrganizerData();
      } catch (error) {
        console.error('Error unpublishing hackathon:', error);
        toast.error('Failed to unpublish hackathon. Please try again.');
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedHackathon.title}</h2>
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedHackathon(null);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Banner Image */}
            {(selectedHackathon.bannerImageUrl || selectedHackathon.bannerUrl) && (
              <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                <img
                  src={selectedHackathon.bannerImageUrl || selectedHackathon.bannerUrl}
                  alt="Hackathon Banner"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                {(selectedHackathon.logoImageUrl || selectedHackathon.logoUrl) && (
                  <div className="w-12 h-12 rounded bg-white p-1 flex-shrink-0">
                    <img
                      src={selectedHackathon.logoImageUrl || selectedHackathon.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Status</h3>
                  <Badge className={`${(selectedHackathon.status === 'PUBLISHED' || selectedHackathon.status === 'LIVE')
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : selectedHackathon.status === 'UPCOMING'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    } `}>
                    {(selectedHackathon.status === 'PUBLISHED' || selectedHackathon.status === 'LIVE') ? 'LIVE' : selectedHackathon.status}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Category</h3>
                <p className="text-white">{selectedHackathon.category}</p>
              </div>
            </div>

            {selectedHackathon.description && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Description</h3>
                <p className="text-white text-sm line-clamp-3 overflow-y-auto max-h-24">{selectedHackathon.description}</p>
              </div>
            )}

            {selectedHackathon.whyParticipate && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Why Participate</h3>
                <p className="text-white text-sm line-clamp-3 overflow-y-auto max-h-24">{selectedHackathon.whyParticipate}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Start Date</h3>
                <p className="text-white">{new Date(selectedHackathon.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">End Date</h3>
                <p className="text-white">{new Date(selectedHackathon.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Location</h3>
              <p className="text-white">{selectedHackathon.isVirtual ? 'Virtual Event' : selectedHackathon.location || 'TBD'}</p>
            </div>

            {selectedHackathon.prizePool && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Prize Pool</h3>
                <p className="text-white">{selectedHackathon.prizePool}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-800 rounded-lg">
                <p className="text-lg font-bold text-blue-400">{participants.filter(p => p.hackathonId === selectedHackathon.id).length}</p>
                <p className="text-xs text-white">Participants</p>
              </div>
              <div className="text-center p-3 bg-slate-800 rounded-lg">
                <p className="text-lg font-bold text-purple-400">{submissions.filter(s => s.hackathonId === selectedHackathon.id).length}</p>
                <p className="text-xs text-white">Submissions</p>
              </div>
              <div className="text-center p-3 bg-slate-800 rounded-lg">
                <p className="text-lg font-bold text-green-400">{selectedHackathon.problemStatements?.length || 0}</p>
                <p className="text-xs text-white">Tracks</p>
              </div>
            </div>

            {selectedHackathon.problemStatements && selectedHackathon.problemStatements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Problem Statement Tracks</h3>
                <div className="space-y-4">
                  {selectedHackathon.problemStatements.map((track: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <h4 className="text-white font-medium">{track.trackTitle}</h4>
                      {track.description && (
                        <p className="text-white text-xs mt-1 text-slate-400">{track.description}</p>
                      )}
                      {track.fileUrl && (
                        <a
                          href={track.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          <FileText className="w-3 h-3 mr-1" /> View Track Doc
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {canPublish && (
                <Button
                  onClick={handlePublishHackathon}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold"
                >
                  🚀 Publish Hackathon
                </Button>
              )}

              {isPublished && (
                <Button
                  onClick={handleUnpublishHackathon}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-semibold"
                >
                  📴 Remove from Live
                </Button>
              )}

              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowEditDetailsForm(false);
                  setShowEditModal(true);
                }}
                className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
              >
                ✏️ Edit Hackathon
              </Button>

              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedHackathon(null);
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isHackathonPublished = selectedHackathon?.status === 'PUBLISHED' || selectedHackathon?.status === 'LIVE';

  const handleDeleteHackathon = async () => {
    if (!selectedHackathon) return;
    if (!confirm(`Are you sure you want to delete "${selectedHackathon.title}" ? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteHackathon(selectedHackathon.id);

      toast.success(`${selectedHackathon.title} has been deleted successfully.`);
      setMyHackathons(prev => prev.filter(h => h.id !== selectedHackathon.id));
      setShowEditModal(false);
      setShowEditDetailsForm(false);
      setSelectedHackathon(null);
      fetchOrganizerData();
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      toast.error('Failed to delete hackathon. Please try again.');
    }
  };

  const handleUnpublishFromEdit = async () => {
    if (!selectedHackathon) return;
    try {
      const updated = await api.updateHackathonStatus(selectedHackathon.id, 'UPCOMING');
      const newStatus = updated?.status || 'UPCOMING';

      toast.success(`${selectedHackathon.title} has been removed from live status.`);
      setMyHackathons((prev: any[]) => prev.map(h =>
        h.id === selectedHackathon!.id ? { ...h, status: newStatus } : h
      ));
      setSelectedHackathon({ ...selectedHackathon, status: newStatus });
      fetchOrganizerData();
    } catch (error) {
      console.error('Error unpublishing hackathon:', error);
      toast.error('Failed to unpublish hackathon. Please try again.');
    }
  };

  const EditDetailsForm = () => {
    const [saving, setSaving] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setUploadingBanner(true);
      try {
        toast.loading('Uploading banner...', { id: 'edit-banner' });
        const result = await api.uploadFile(file, 'hackathons/banners');
        setEditFormData(prev => ({ ...prev, bannerImageUrl: result.file.url }));
        toast.success('Banner uploaded!', { id: 'edit-banner' });
      } catch (err: any) {
        toast.error(err.message || 'Upload failed', { id: 'edit-banner' });
      } finally {
        setUploadingBanner(false);
      }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setUploadingLogo(true);
      try {
        toast.loading('Uploading logo...', { id: 'edit-logo' });
        const result = await api.uploadFile(file, 'hackathons/logos');
        setEditFormData(prev => ({ ...prev, logoImageUrl: result.file.url }));
        toast.success('Logo uploaded!', { id: 'edit-logo' });
      } catch (err: any) {
        toast.error(err.message || 'Upload failed', { id: 'edit-logo' });
      } finally {
        setUploadingLogo(false);
      }
    };

    const addJudgingCriterion = () => {
      setEditFormData((prev: any) => ({
        ...prev,
        judgingCriteria: [...prev.judgingCriteria, { criterion: '', weight: 0, description: '' }]
      }));
    };

    const removeJudgingCriterion = (index: number) => {
      setEditFormData((prev: any) => ({
        ...prev,
        judgingCriteria: prev.judgingCriteria.filter((_: any, i: number) => i !== index)
      }));
    };

    const updateJudgingCriterion = (index: number, field: string, value: any) => {
      setEditFormData((prev: any) => ({
        ...prev,
        judgingCriteria: prev.judgingCriteria.map((c: any, i: number) => i === index ? { ...c, [field]: value } : c)
      }));
    };

    const addJudge = () => {
      setEditFormData((prev: any) => ({
        ...prev,
        judges: [...prev.judges, { name: '', email: '', bio: '', expertise: '', linkedinUrl: '', profileImageUrl: '' }]
      }));
    };

    const removeJudge = (index: number) => {
      setEditFormData((prev: any) => ({
        ...prev,
        judges: prev.judges.filter((_: any, i: number) => i !== index)
      }));
    };

    const updateJudge = (index: number, field: string, value: string) => {
      setEditFormData((prev: any) => ({
        ...prev,
        judges: prev.judges.map((j: any, i: number) => i === index ? { ...j, [field]: value } : j)
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
        // Format dates for API
        const formatDate = (dateString: string) => {
          if (!dateString) return '';
          return new Date(dateString).toISOString();
        };

        const updatePayload = {
          title: editFormData.title,
          description: editFormData.description,
          whyParticipate: editFormData.whyParticipate,
          category: editFormData.category,
          registrationStart: formatDate(editFormData.registrationStart),
          registrationEnd: formatDate(editFormData.registrationEnd),
          startDate: formatDate(editFormData.startDate),
          endDate: formatDate(editFormData.endDate),
          submissionDeadline: formatDate(editFormData.submissionDeadline),
          registrationFee: editFormData.registrationFee ? parseFloat(editFormData.registrationFee.toString()) : 0,
          prizeAmount: editFormData.prizeAmount ? parseFloat(editFormData.prizeAmount.toString()) : 0,
          prizeCurrency: editFormData.prizeCurrency,
          minTeamSize: editFormData.minTeamSize,
          maxTeamSize: editFormData.maxTeamSize,
          allowIndividual: editFormData.allowIndividual,
          venue: editFormData.venue,
          isVirtual: editFormData.isVirtual,
          expectedOutcome: editFormData.expectedOutcome,
          termsAndConditions: editFormData.termsAndConditions,
          contactEmail: editFormData.contactEmail,
          contactPhone: editFormData.contactPhone,
          contactPerson: editFormData.contactPerson,
          rules: editFormData.rules,
          guidelines: editFormData.guidelines,
          bannerImageUrl: editFormData.bannerImageUrl || undefined,
          logoImageUrl: editFormData.logoImageUrl || undefined,
          judges: editFormData.judges,
          judgingCriteria: editFormData.judgingCriteria,
        };

        await api.updateHackathon(selectedHackathon.id, updatePayload);
        toast.success('Hackathon updated successfully!');

        // Update local state
        const updatedHackathon = {
          ...selectedHackathon,
          ...updatePayload,
          location: editFormData.venue,
          bannerUrl: editFormData.bannerImageUrl,
          logoUrl: editFormData.logoImageUrl,
          registrationDeadline: updatePayload.registrationEnd
        };

        setMyHackathons((prev: any[]) => prev.map(h =>
          h.id === selectedHackathon.id ? updatedHackathon : h
        ));
        setSelectedHackathon(updatedHackathon);
        setShowEditDetailsForm(false);
        fetchOrganizerData();
      } catch (err: any) {
        toast.error(err.message || 'Failed to update hackathon');
      } finally {
        setSaving(false);
      }
    };


    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="max-h-[calc(80vh-200px)] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800" data-native-scroll="true">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white font-semibold">Hackathon Name *</Label>
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold">Category *</Label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white focus:border-blue-400 focus:outline-none [&>option]:text-white [&>option]:bg-slate-800"
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
          </div>

          {/* Description */}
          <div>
            <Label className="text-white font-semibold">Hackathon Description *</Label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Briefly describe the hackathon, its purpose, and what it's all about..."
              className="mt-1 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Why Participate */}
          <div>
            <Label className="text-white font-semibold">Why Participate *</Label>
            <textarea
              value={editFormData.whyParticipate}
              onChange={(e) => setEditFormData(prev => ({ ...prev, whyParticipate: e.target.value }))}
              rows={3}
              placeholder="Explain the benefits, learning opportunities, networking, prizes, and career advantages..."
              className="mt-1 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Timeline & Dates */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Timeline & Important Dates</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-white font-semibold">Registration Start *</Label>
                <Input
                  type="datetime-local"
                  value={editFormData.registrationStart}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, registrationStart: e.target.value }))}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold">Registration End *</Label>
                <Input
                  type="datetime-local"
                  value={editFormData.registrationEnd}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, registrationEnd: e.target.value }))}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold">Hackathon Start *</Label>
                <Input
                  type="datetime-local"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold">Submission Deadline *</Label>
                <Input
                  type="datetime-local"
                  value={editFormData.submissionDeadline}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, submissionDeadline: e.target.value }))}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold">Hackathon End *</Label>
                <Input
                  type="datetime-local"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Registration & Team Details */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Registration & Team Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white font-semibold">Registration Fee</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.registrationFee}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, registrationFee: e.target.value }))}
                  placeholder="e.g., 10.00 (0 for free)"
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label className="text-white font-semibold">Min Team Size *</Label>
                <Input
                  type="number"
                  min="1"
                  value={editFormData.minTeamSize}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, minTeamSize: parseInt(e.target.value) || 1 }))}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold">Max Team Size *</Label>
                <Input
                  type="number"
                  min="1"
                  value={editFormData.maxTeamSize}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, maxTeamSize: parseInt(e.target.value) || 5 }))}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={editFormData.allowIndividual}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, allowIndividual: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-800"
                />
                Allow individual participation
              </label>
            </div>
          </div>

          {/* Venue */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Venue</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-slate-300 mb-4">
                  <input
                    type="checkbox"
                    checked={editFormData.isVirtual}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, isVirtual: e.target.checked }))}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  Virtual Event
                </label>
              </div>
              <div>
                <Label className="text-white font-semibold">
                  {editFormData.isVirtual ? 'Platform/Link *' : 'Venue Address *'}
                </Label>
                <Input
                  value={editFormData.venue}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder={editFormData.isVirtual ? "e.g., Zoom, Discord, or platform link" : "e.g., Tech Hub, 123 Innovation Street, City"}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Prize Information */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Prize Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white font-semibold">Prize Currency</Label>
                <select
                  value={editFormData.prizeCurrency}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, prizeCurrency: e.target.value }))}
                  className="mt-1 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white focus:border-blue-400 focus:outline-none [&>option]:text-white [&>option]:bg-slate-800"
                >
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <Label className="text-white font-semibold">Prize Amount</Label>
                <Input
                  type="number"
                  value={editFormData.prizeAmount}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, prizeAmount: e.target.value }))}
                  placeholder="e.g., 50000"
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Expected Outcome */}
          <div>
            <Label className="text-white font-semibold">Expected Outcome *</Label>
            <textarea
              value={editFormData.expectedOutcome}
              onChange={(e) => setEditFormData(prev => ({ ...prev, expectedOutcome: e.target.value }))}
              rows={3}
              placeholder="Describe the expected deliverables, prototypes, solutions, or innovations participants should create..."
              className="mt-1 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Terms and Conditions */}
          <div>
            <Label className="text-white font-semibold">Terms & Conditions *</Label>
            <textarea
              value={editFormData.termsAndConditions}
              onChange={(e) => setEditFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
              rows={4}
              placeholder="Enter the terms and conditions, rules, intellectual property rights, code of conduct, etc..."
              className="mt-1 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white font-semibold">Contact Person *</Label>
                <Input
                  value={editFormData.contactPerson}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Full name of contact person"
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold">Contact Email *</Label>
                <Input
                  type="email"
                  value={editFormData.contactEmail}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contact@organization.com"
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold">Contact Phone</Label>
                <Input
                  type="tel"
                  value={editFormData.contactPhone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Additional Details</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-white font-semibold">Rules & Guidelines *</Label>
                <textarea
                  value={editFormData.rules}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, rules: e.target.value }))}
                  rows={3}
                  placeholder="List key rules, submission guidelines, and participation requirements..."
                  className="mt-1 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <Label className="text-white font-semibold">Technical Guidelines</Label>
                <textarea
                  value={editFormData.guidelines}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, guidelines: e.target.value }))}
                  rows={3}
                  placeholder="Technical requirements, allowed technologies, submission format, etc..."
                  className="mt-1 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Judging Criteria */}
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" />
                Judging Criteria
              </h3>
              <Button
                type="button"
                onClick={addJudgingCriterion}
                className="bg-slate-800 hover:bg-slate-700 text-blue-400 btn-sm"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Criterion
              </Button>
            </div>

            {editFormData.judgingCriteria.length === 0 ? (
              <div className="text-center py-6 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-700">
                <p className="text-slate-400 text-sm">No judging criteria added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {editFormData.judgingCriteria.map((criterion: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white text-sm font-semibold">Criterion {index + 1}</span>
                      <Button
                        type="button"
                        onClick={() => removeJudgingCriterion(index)}
                        className="text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-white text-xs">Name *</Label>
                        <Input
                          value={criterion.criterion}
                          onChange={(e) => updateJudgingCriterion(index, 'criterion', e.target.value)}
                          className="mt-1 bg-slate-800/50 border-slate-600 text-white text-sm"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white text-xs">Weight (%) *</Label>
                        <Input
                          type="number"
                          value={criterion.weight}
                          onChange={(e) => updateJudgingCriterion(index, 'weight', parseInt(e.target.value) || 0)}
                          className="mt-1 bg-slate-800/50 border-slate-600 text-white text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white text-xs">Description *</Label>
                      <Input
                        value={criterion.description}
                        onChange={(e) => updateJudgingCriterion(index, 'description', e.target.value)}
                        className="mt-1 bg-slate-800/50 border-slate-600 text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Judges */}
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                Judges
              </h3>
              <Button
                type="button"
                onClick={addJudge}
                className="bg-slate-800 hover:bg-slate-700 text-blue-400 btn-sm"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Judge
              </Button>
            </div>

            {editFormData.judges.length === 0 ? (
              <div className="text-center py-6 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-700">
                <p className="text-slate-400 text-sm">No judges added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {editFormData.judges.map((judge: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white text-sm font-semibold">Judge {index + 1}</span>
                      <Button
                        type="button"
                        onClick={() => removeJudge(index)}
                        className="text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-white text-xs">Name *</Label>
                        <Input
                          value={judge.name}
                          onChange={(e) => updateJudge(index, 'name', e.target.value)}
                          className="mt-1 bg-slate-800/50 border-slate-600 text-white text-sm"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white text-xs">Email *</Label>
                        <Input
                          type="email"
                          value={judge.email}
                          onChange={(e) => updateJudge(index, 'email', e.target.value)}
                          className="mt-1 bg-slate-800/50 border-slate-600 text-white text-sm"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white text-xs">Expertise *</Label>
                        <Input
                          value={judge.expertise}
                          onChange={(e) => updateJudge(index, 'expertise', e.target.value)}
                          className="mt-1 bg-slate-800/50 border-slate-600 text-white text-sm"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white text-xs">Bio *</Label>
                        <Input
                          value={judge.bio}
                          onChange={(e) => updateJudge(index, 'bio', e.target.value)}
                          className="mt-1 bg-slate-800/50 border-slate-600 text-white text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Images</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white font-semibold">Banner Image *</Label>
                <div className="mt-2 space-y-2">
                  <label className="cursor-pointer block">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md hover:border-blue-500 transition-colors">
                      {uploadingBanner ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                          <span className="text-white text-sm">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-blue-400" />
                          <span className="text-white text-sm">Upload Banner</span>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploadingBanner} />
                  </label>
                  {editFormData.bannerImageUrl && (
                    <div className="mt-2 text-center">
                      <img
                        src={editFormData.bannerImageUrl}
                        alt="Banner"
                        className="w-full h-32 object-cover rounded-md border border-slate-600 mb-2"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setEditFormData(prev => ({ ...prev, bannerImageUrl: '' }))}
                        className="text-red-400 hover:bg-red-500/10 w-full"
                      >
                        <X className="w-4 h-4 mr-2" /> Remove Banner
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-white font-semibold">Logo Image *</Label>
                <div className="mt-2 space-y-2">
                  <label className="cursor-pointer block">
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
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                  </label>
                  {editFormData.logoImageUrl && (
                    <div className="mt-2 flex flex-col items-center">
                      <img
                        src={editFormData.logoImageUrl}
                        alt="Logo"
                        className="w-24 h-24 object-contain rounded-md border border-slate-600 mb-2 bg-slate-800/50"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setEditFormData(prev => ({ ...prev, logoImageUrl: '' }))}
                        className="text-red-400 hover:bg-red-500/10 w-full"
                      >
                        <X className="w-4 h-4 mr-2" /> Remove Logo
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex gap-3 pt-4 border-t border-slate-700 mt-6">
          <Button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              '💾 Save Changes'
            )}
          </Button>
          <Button type="button" onClick={() => setShowEditDetailsForm(false)} className="bg-slate-700 hover:bg-slate-600 text-white">
            Back
          </Button>
        </div>
      </form>
    );
  };

  const renderEditModal = () => {
    if (!selectedHackathon || !showEditModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-xl border border-slate-700 w-full mx-4 max-h-[90vh] overflow-y-auto max-w-4xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{showEditDetailsForm ? 'Edit Hackathon Details' : 'Edit Hackathon'}</h2>
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setShowEditDetailsForm(false);
                  setSelectedHackathon(null);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {showEditDetailsForm ? (
              <EditDetailsForm />
            ) : (
              <>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">{selectedHackathon.title}</h3>
                    <p className="text-white text-sm mb-3">Choose what you want to do with this hackathon:</p>

                    <div className="space-y-3">
                      <Button
                        onClick={() => setShowEditDetailsForm(true)}
                        className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                      >
                        ✏️ Edit Details
                      </Button>

                      {isHackathonPublished && (
                        <Button
                          onClick={handleUnpublishFromEdit}
                          className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30"
                        >
                          📴 Remove from Live
                        </Button>
                      )}


                      <Button
                        onClick={handleDeleteHackathon}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                      >
                        🗑️ Delete Hackathon
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowEditModal(false);
                      setShowEditDetailsForm(false);
                      setSelectedHackathon(null);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMyHackathons = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">My Hackathons</h2>
          <p className="text-white mt-2" style={{ color: 'white !important' }}>Manage your created hackathons</p>
        </div>
        <Button
          onClick={() => setActiveTab('create-hackathon')}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Hackathon
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : myHackathons.length === 0 ? (
        <Card className="p-12 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm text-center" style={{ color: 'white' }}>
          <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2" style={{ color: 'white !important' }}>No Hackathons Yet</h3>
          <p className="text-white mb-6" style={{ color: 'white !important' }}>Create your first hackathon to get started</p>
          <Button
            onClick={() => setActiveTab('create-hackathon')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Hackathon
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myHackathons.map((hackathon) => {
            // Calculate participants and submissions for this hackathon
            const hackathonParticipants = participants.filter(p => p.hackathonId === hackathon.id);
            const hackathonSubmissions = submissions.filter(s => s.hackathonId === hackathon.id);

            return (
              <Card key={hackathon.id} className="p-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-200 overflow-hidden" style={{ color: 'white' }}>
                {/* Banner Image */}
                <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-500">
                  {hackathon.bannerImageUrl || hackathon.bannerUrl ? (
                    <img
                      src={hackathon.bannerImageUrl || hackathon.bannerUrl}
                      alt={hackathon.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Logo overlay */}
                  {(hackathon.logoImageUrl || hackathon.logoUrl) && (
                    <div className="absolute top-2 left-2 w-24 h-12 bg-white/10 backdrop-blur-sm rounded-lg p-1 flex items-center justify-center">
                      <img
                        src={hackathon.logoImageUrl || hackathon.logoUrl}
                        alt={`${hackathon.title} logo`}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className={`text - xs ${hackathon.status === 'PUBLISHED'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : hackathon.status === 'UPCOMING'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      } `}>
                      {hackathon.status}
                    </Badge>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-1" style={{ color: 'white !important' }}>{hackathon.title}</h3>
                  <p className="text-white text-sm mb-3" style={{ color: 'white !important' }}>{hackathon.category}</p>

                  {/* Hackathon Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-white" style={{ color: 'white !important' }}>
                      <Calendar className="w-3 h-3" />
                      <span>Start: {new Date(hackathon.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white" style={{ color: 'white !important' }}>
                      <MapPin className="w-3 h-3" />
                      <span>{hackathon.isVirtual ? 'Virtual' : hackathon.location || 'TBD'}</span>
                    </div>
                    {hackathon.prizePool && (
                      <div className="flex items-center gap-2 text-xs text-white" style={{ color: 'white !important' }}>
                        <Award className="w-3 h-3" />
                        <span>Prize: {hackathon.prizePool}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center p-2 bg-slate-900/50 rounded">
                      <p className="text-sm font-bold text-blue-400">{hackathonParticipants.length}</p>
                      <p className="text-xs text-white" style={{ color: 'white !important' }}>Participants</p>
                    </div>
                    <div className="text-center p-2 bg-slate-900/50 rounded">
                      <p className="text-sm font-bold text-purple-400">{hackathonSubmissions.length}</p>
                      <p className="text-xs text-white" style={{ color: 'white !important' }}>Submissions</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-xs"
                      onClick={() => {
                        setSelectedHackathon(hackathon);
                        setShowDetailsModal(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 text-xs"
                      onClick={() => {
                        setSelectedHackathon(hackathon);
                        setShowEditDetailsForm(false);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderParticipants = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Participants</h2>
          <p className="text-white/70 mt-2">View all participants across your hackathons ({participants.length} total)</p>
        </div>
        <Button
          onClick={() => exportToExcel(participants, 'hackathon_participants')}
          className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : participants.length === 0 ? (
        <Card className="p-12 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm text-center">
          <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Participants Yet</h3>
          <p className="text-white/70">Participants will appear here once they register for your hackathons</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {participants.map((participant) => (
            <Card key={participant.id} className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{participant.user?.firstName} {participant.user?.lastName}</h3>
                    <p className="text-sm text-slate-300">{participant.user?.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                      <span>Hackathon: {participant.hackathonTitle}</span>
                      <Badge className={`${participant.teamName
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-green-500/20 text-green-400 border-green-500/30'
                        } `}>
                        {participant.teamName ? `Team: ${participant.teamName} ` : 'Individual'}
                      </Badge>
                      {participant.selectedTrack && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          Track {participant.selectedTrack}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Review Submissions</h2>
          <p className="text-white/70 mt-2">Review and evaluate participant submissions ({submissions.length} total)</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : submissions.length === 0 ? (
        <Card className="p-12 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm text-center">
          <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Submissions Yet</h3>
          <p className="text-white/70">Submissions will appear here once participants submit their projects</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{submission.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{submission.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                      <span>Hackathon: {submission.hackathonTitle}</span>
                      <span>By: {submission.submitter?.firstName || submission.user?.firstName} {submission.submitter?.lastName || submission.user?.lastName}</span>
                      <Badge className={`${submission.isDraft
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : 'bg-green-500/20 text-green-400 border-green-500/30'
                        } `}>
                        {submission.isDraft ? 'Draft' : 'Submitted'}
                      </Badge>
                    </div>
                    {/* Show submission files/links */}
                    {(submission.githubUrl || submission.liveUrl || submission.files?.length > 0) && (
                      <div className="flex items-center gap-2 mt-2">
                        {submission.githubUrl && (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                            GitHub
                          </Badge>
                        )}
                        {submission.liveUrl && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Live Demo
                          </Badge>
                        )}
                        {submission.files?.length > 0 && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {submission.files.length} Files
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                    onClick={() => {
                      setSelectedParticipant(submission.user || submission.submitter);
                      setShowParticipantModal(true);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
                    onClick={() => {
                      console.log('🔍 Opening submission review modal with data:', submission);
                      console.log('🔍 Submission files:', submission.files);
                      console.log('🔍 Submission repoUrl:', submission.repoUrl);
                      console.log('🔍 Submission repositoryUrl:', submission.repositoryUrl);
                      setSelectedSubmission(submission);
                      setShowReviewModal(true);
                    }}
                  >
                    Review
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );



  const renderPaymentsHistory = () => <PaymentHistory />;

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Notifications</h2>
          <p className="text-white/70 mt-2">Stay updated with your hackathon activities</p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Welcome to AIrena!</h3>
            <p className="text-white/70 text-sm">You're all set up as an organizer. Start creating amazing hackathons!</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Settings</h2>
          <p className="text-white/70 mt-2">Manage your account and preferences</p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white font-semibold">First Name</Label>
              <Input
                value={userData.firstName}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                readOnly
              />
            </div>
            <div>
              <Label className="text-white font-semibold">Last Name</Label>
              <Input
                value={userData.lastName}
                className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                readOnly
              />
            </div>
          </div>
          <div>
            <Label className="text-white font-semibold">Email</Label>
            <Input
              value={userData.email}
              className="mt-2 bg-slate-800/50 border-slate-600 text-white"
              readOnly
            />
          </div>
          <div>
            <Label className="text-white font-semibold">Role</Label>
            <Input
              value={userData.role.toUpperCase()}
              className="mt-2 bg-slate-800/50 border-slate-600 text-white"
              readOnly
            />
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white force-white-text"
      style={{
        color: 'white'
      } as React.CSSProperties}
    >
      {/* CRITICAL: Force all text to be white */}
      <style dangerouslySetInnerHTML={{
        __html: `
  .force - white - text * {
    color: white!important;
  }
    .force - white - text p {
  color: white!important;
}
          .force - white - text span {
  color: white!important;
}
          .force - white - text div {
  color: white!important;
}
          .force - white - text label {
  color: white!important;
}
          .force - white - text small {
  color: white!important;
}
          .force - white - text.text - white\\/70 {
color: white!important;
          }
          .force - white - text.text - white\\/60 {
color: white!important;
          }
          .force - white - text.text - slate - 400 {
  color: rgba(255, 255, 255, 0.9)!important;
}
          .force - white - text.text - slate - 300 {
  color: rgba(255, 255, 255, 0.95)!important;
}
`
      }} />
      <div className="flex" style={{ color: 'white' }}>
        {/* Left Sidebar - Fixed position, matching your original design */}
        <div className="w-64 border-r border-slate-800/50 min-h-screen bg-slate-950/30 fixed left-0 top-0 flex flex-col">
          {/* Logo/Brand Section */}
          <div className="p-6 border-b border-slate-800/50">
            <div className="flex items-center">
              <Branding size="sm" />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-6">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                    : 'text-white/70 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="ml-auto bg-red-500/20 text-red-400 border-red-500/30">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* User Profile & Logout at Bottom */}
          <div className="p-6 border-t border-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{userData.firstName} {userData.lastName}</p>
                <p className="text-xs text-white/60">Organizer</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-semibold"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content - Offset by sidebar width */}
        <div className="flex-1 ml-64 overflow-y-auto">
          {/* Top Navigation - Only Back button */}
          <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/50">
            <div className="px-6 py-4">
              <Button
                size="sm"
                onClick={onBack}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
              >
                ← Back
              </Button>
            </div>
          </nav>

          {/* Main Content Area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'create-hackathon' && (
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Create New Hackathon</h2>
                    <CreateHackathonForm
                      onSuccess={async () => {
                        console.log('✅ Hackathon created successfully, refreshing data...');
                        // CRITICAL FIX: Immediately refresh the organizer data to show the new hackathon
                        await fetchOrganizerData();
                        // Switch to My Hackathons tab to show the created hackathon
                        setActiveTab('my-hackathons');
                        // Success message is already shown in the form
                      }}
                      onCancel={() => setActiveTab('dashboard')}
                    />
                  </div>
                )}
                {activeTab === 'my-hackathons' && renderMyHackathons()}
                {activeTab === 'participants' && renderParticipants()}
                {activeTab === 'review-submissions' && renderSubmissions()}
                {activeTab === 'payments' && renderPaymentsHistory()}
                {activeTab === 'notifications' && renderNotifications()}
                {activeTab === 'settings' && renderSettings()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Participant Details Modal */}
      <AnimatePresence>
        {showParticipantModal && selectedParticipant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowParticipantModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Participant Details</h2>
                <button
                  onClick={() => setShowParticipantModal(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Section */}
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedParticipant.firstName} {selectedParticipant.lastName}
                    </h3>
                    <p className="text-white/70">{selectedParticipant.email}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <p className="text-white/60 text-sm mb-1">Role</p>
                    <p className="text-white font-semibold">{selectedParticipant.role || 'PARTICIPANT'}</p>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <p className="text-white/60 text-sm mb-1">Status</p>
                    <Badge className={`${selectedParticipant.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      } `}>
                      {selectedParticipant.status || 'ACTIVE'}
                    </Badge>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <p className="text-white/60 text-sm mb-1">Email Verified</p>
                    <Badge className={`${selectedParticipant.emailVerified
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      } `}>
                      {selectedParticipant.emailVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <p className="text-white/60 text-sm mb-1">User ID</p>
                    <p className="text-white font-mono text-xs">{selectedParticipant.id}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submission Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-4xl w-full border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Submission Review</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Participant Details Section */}
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Participant Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm mb-1">Name</p>
                      <p className="text-white font-semibold">
                        {selectedSubmission.submitter?.firstName || selectedSubmission.user?.firstName} {selectedSubmission.submitter?.lastName || selectedSubmission.user?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Email</p>
                      <p className="text-slate-300 font-medium">
                        {selectedSubmission.submitter?.email || selectedSubmission.user?.email}
                      </p>
                    </div>
                    {selectedSubmission.teamInfo && (
                      <div className="col-span-2">
                        <p className="text-white/60 text-sm mb-1">Team</p>
                        <p className="text-white font-semibold">{selectedSubmission.teamInfo.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Header */}
                <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedSubmission.title}</h3>
                  <p className="text-slate-300 mb-4 leading-relaxed">{selectedSubmission.description}</p>
                  <div className="flex items-center gap-4 text-sm text-white/60 flex-wrap">
                    <span>Hackathon: {selectedSubmission.hackathonTitle}</span>
                    <span>•</span>
                    <Badge className={`${selectedSubmission.isDraft
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      : 'bg-green-500/20 text-green-400 border-green-500/30'
                      } `}>
                      {selectedSubmission.isDraft ? 'Draft' : 'Submitted'}
                    </Badge>
                    {selectedSubmission.submittedAt && (
                      <>
                        <span>•</span>
                        <span>Submitted: {new Date(selectedSubmission.submittedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Track Selection */}
                {selectedSubmission.selectedTrack && (
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <p className="text-white/60 text-sm mb-1">Selected Track</p>
                    <p className="text-white font-semibold">Track {selectedSubmission.selectedTrack}</p>
                  </div>
                )}

                {/* GitHub Repository */}
                {(selectedSubmission.repositoryUrl || selectedSubmission.repoUrl || selectedSubmission.githubUrl) && (
                  <div className="p-5 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Github className="w-5 h-5 text-gray-400" />
                      GitHub Repository
                    </h4>
                    <p className="text-slate-300 font-mono text-sm break-all mb-4 bg-slate-900/50 p-3 rounded border border-slate-700">
                      {selectedSubmission.repositoryUrl || selectedSubmission.repoUrl || selectedSubmission.githubUrl}
                    </p>
                    <a
                      href={selectedSubmission.repositoryUrl || selectedSubmission.repoUrl || selectedSubmission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-colors border border-gray-500/30"
                    >
                      <Github className="w-4 h-4" />
                      <span>View on GitHub</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Live Demo URL */}
                {(selectedSubmission.demoUrl || selectedSubmission.liveUrl) && (
                  <div className="p-5 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-blue-400" />
                      Live Demo
                    </h4>
                    <p className="text-slate-300 font-mono text-sm break-all mb-4 bg-slate-900/50 p-3 rounded border border-slate-700">
                      {selectedSubmission.demoUrl || selectedSubmission.liveUrl}
                    </p>
                    <a
                      href={selectedSubmission.demoUrl || selectedSubmission.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors border border-blue-500/30"
                    >
                      <span>Visit Live Demo</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Uploaded Files */}
                {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                  <div className="p-5 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Uploaded Files ({selectedSubmission.files.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedSubmission.files.map((file: any, index: number) => {
                        // Determine file category based on name or type
                        const fileName = file.fileName || file.name || `File ${index + 1}`;
                        const fileType = file.fileType || file.type || 'application/octet-stream';
                        const fileSize = file.fileSize || file.size || 0;

                        // Detect if it's a presentation file
                        const isPresentation = fileName.toLowerCase().includes('presentation') ||
                          fileName.toLowerCase().includes('ppt') ||
                          fileType.includes('presentation') ||
                          fileType.includes('powerpoint') ||
                          fileName.match(/\.(ppt|pptx|pdf|key)$/i);

                        // Detect if it's a project/code file
                        const isProjectFile = fileName.toLowerCase().includes('project') ||
                          fileName.match(/\.(zip|rar|tar|gz|7z)$/i) ||
                          fileType.includes('zip') ||
                          fileType.includes('compressed');

                        let fileLabel = '';
                        let labelColor = 'bg-purple-500/20 text-purple-400 border-purple-500/30';

                        if (isPresentation) {
                          fileLabel = 'Presentation File';
                          labelColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                        } else if (isProjectFile) {
                          fileLabel = 'Project File';
                          labelColor = 'bg-green-500/20 text-green-400 border-green-500/30';
                        } else if (index === 0 && selectedSubmission.files.length === 2) {
                          // If we have exactly 2 files and can't detect, assume first is project
                          fileLabel = 'Project File';
                          labelColor = 'bg-green-500/20 text-green-400 border-green-500/30';
                        } else if (index === 1 && selectedSubmission.files.length === 2) {
                          // Second file is likely presentation
                          fileLabel = 'Presentation File';
                          labelColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                        }

                        return (
                          <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                  <FileText className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-white font-semibold break-all">{fileName}</p>
                                    {fileLabel && (
                                      <Badge className={`${labelColor} text-xs whitespace-nowrap`}>
                                        {fileLabel}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-slate-400 text-sm">
                                    {fileType} • {fileSize ? `${(fileSize / 1024).toFixed(2)} KB` : 'Unknown size'}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={file.fileUrl || file.url || file.downloadUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors border border-purple-500/30 whitespace-nowrap flex-shrink-0"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No files message */}
                {(!selectedSubmission.files || selectedSubmission.files.length === 0) &&
                  !selectedSubmission.repositoryUrl && !selectedSubmission.repoUrl && !selectedSubmission.githubUrl &&
                  !selectedSubmission.demoUrl && !selectedSubmission.liveUrl && (
                    <div className="p-8 bg-slate-800/30 rounded-lg border border-slate-700 text-center">
                      <FileText className="w-12 h-12 text-white/30 mx-auto mb-3" />
                      <p className="text-white/70">No files or links submitted yet</p>
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hackathon Details Modal */}
      {showDetailsModal && renderHackathonDetailsModal()}

      {/* Edit Modal */}
      {showEditModal && renderEditModal()}

      {/* Host Details Onboarding Modal (Mandatory) */}
      <HostDetailsModal
        isOpen={showOnboardingModal}
        onClose={() => { }} // Non-closable
        onSuccess={handleOnboardingSuccess}
        userData={userData}
      />
    </div>
  );
}