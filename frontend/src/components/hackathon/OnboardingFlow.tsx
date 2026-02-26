import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Award, Briefcase, Code, Database, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  userRole?: string; // Pass user role to skip skills for organizers
}

export function OnboardingFlow({ onComplete, onBack, userRole }: OnboardingFlowProps) {
  // Role selection for both new and existing users
  // Existing users will have their current role pre-selected
  // Skills selection will be shown later when searching/exploring hackathons
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(userRole || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const roles = [
    {
      id: 'participant',
      icon: User,
      title: 'Participant',
      description: 'Join hackathons and showcase your skills',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'organizer',
      icon: Briefcase,
      title: 'Organizer',
      description: 'Host and manage hackathons',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'judge',
      icon: Award,
      title: 'Judge',
      description: 'Evaluate and mentor participants',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const skills = [
    'Web Development', 'Mobile Development', 'AI/ML', 'Blockchain',
    'Cloud Computing', 'DevOps', 'UI/UX Design', 'Data Science',
    'Cybersecurity', 'IoT', 'AR/VR', 'Game Development'
  ];

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleComplete = async () => {
    try {
      // Update user role in backend if selected
      if (selectedRole) {
        // Map frontend role to backend enum format
        const roleMap: Record<string, string> = {
          'participant': 'PARTICIPANT',
          'organizer': 'ORGANIZER',
          'judge': 'JUDGE',
        };
        
        const backendRole = roleMap[selectedRole.toLowerCase()];
        if (backendRole) {
          await api.updateProfile({ role: backendRole });
          toast.success(`Role updated to ${selectedRole}!`);
        }
      }
      
      onComplete({
        role: selectedRole,
        skills: selectedSkills,
      });
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
      // Still proceed with onboarding even if role update fails
      onComplete({
        role: selectedRole,
        skills: selectedSkills,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
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

        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step >= 1
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 border-transparent'
                    : 'border-slate-600 bg-slate-800'
                }`}
              >
                {step > 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white">1</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-center text-white font-semibold">
            Choose your role
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">Welcome to AIrena! 👋</h2>
              <p className="text-xl text-white">Choose your role to get started</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-8 cursor-pointer transition-all ${
                      selectedRole === role.id
                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/25'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                      <role.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-center text-white">{role.title}</h3>
                    <p className="text-white text-center text-sm">{role.description}</p>
                    {selectedRole === role.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-4 flex justify-center"
                      >
                        <CheckCircle2 className="w-6 h-6 text-blue-400" />
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
              disabled={!selectedRole}
              onClick={() => {
                // Complete onboarding after role selection
                // Skills selection will be available when searching/exploring hackathons
                handleComplete();
              }}
            >
              Continue to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
