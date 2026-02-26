import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Briefcase, Award, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface HostDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userData: any;
}

export function HostDetailsModal({ isOpen, onClose, onSuccess, userData }: HostDetailsModalProps) {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactEmail: '',
    phoneNumber: '',
    experience: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        contactEmail: userData.email || '',
        organizationName: userData.organizationName || '',
        phoneNumber: userData.phoneNumber || '',
        experience: userData.experienceLevel || '',
        description: userData.bio || '',
      }));
    }
  }, [userData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitDetails = async () => {
    setLoading(true);
    try {
      await api.updateProfile({
        organizationName: formData.organizationName,
        phoneNumber: formData.phoneNumber,
        experienceLevel: formData.experience,
        bio: formData.description,
        hostOnboarded: true,
      });

      toast.success('Host details saved successfully! Welcome to AIrena.');
      onSuccess();
    } catch (error: any) {
      console.error('Error saving host details:', error);
      toast.error(error.message || 'Failed to save details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950 z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Host Details</h2>
                <p className="text-slate-400 mt-1">Please provide your information to access the dashboard</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="orgName" className="text-white font-semibold">Organization Name *</Label>
                <Input
                  id="orgName"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white h-11 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="Your company or organization"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-semibold">Contact Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white h-11 opacity-70 cursor-not-allowed"
                  placeholder="your@email.com"
                  readOnly
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white font-semibold">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white h-11 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-white font-semibold">Experience Level *</Label>
                <select
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-white h-11 focus:border-blue-500 focus:ring-blue-500/20 outline-none"
                  required
                >
                  <option value="">Select experience</option>
                  <option value="beginner">First time organizing</option>
                  <option value="intermediate">1-3 hackathons organized</option>
                  <option value="advanced">4+ hackathons organized</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white font-semibold">
                Why do you want to host hackathons? *
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white min-h-[120px] focus:border-blue-500 focus:ring-blue-500/20 outline-none resize-none"
                placeholder="Tell us about your goals, target audience, and why you want to organize hackathons..."
                required
              />
            </div>

            <Button
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
              onClick={handleSubmitDetails}
              disabled={loading || !formData.organizationName || !formData.phoneNumber || !formData.experience || !formData.description}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Saving Details...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  <span>Complete Onboarding</span>
                </div>
              )}
            </Button>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-200 leading-relaxed text-center">
                All fields are required. Providing accurate information helps us prepare your workspace and ensures you have the best experience hosting your hackathon.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}