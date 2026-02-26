import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Briefcase, Award, Mail, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Branding } from './Branding';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { HostRequestModal } from './HostRequestModal';

interface OrganizerAuthProps {
  onAuthSuccess: (data: any) => void;
  onBack: () => void;
}

export function OrganizerAuth({ onAuthSuccess, onBack }: OrganizerAuthProps) {
  console.log('🔄 OrganizerAuth: Component rendering');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin'); // Tab state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHostRequestModal, setShowHostRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
  });

  // OTP State
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [tempEmail, setTempEmail] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...otp];
      if (otp[index]) {
        next[index] = '';
      } else if (index > 0) {
        next[index - 1] = '';
        inputRefs.current[index - 1]?.focus();
      }
      setOtp(next);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((c, i) => (next[i] = c));
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerifyLoginOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await api.verifyLoginOtp(tempEmail, otpString);
      api.setToken(response.accessToken);

      onAuthSuccess({
        id: response.user.id,
        name: `${response.user.firstName} ${response.user.lastName}`,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
        role: response.user.role.toLowerCase(),
        status: response.user.status,
        emailVerified: true,
        hostApproved: response.user.hostApproved,
        isNewUser: false,
      });
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Redirect to landing if already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, []);

  // Check for pending host request data and pre-fill form (optional now)
  useEffect(() => {
    const pendingRequest = localStorage.getItem('pending_host_request');
    if (pendingRequest) {
      try {
        const requestData = JSON.parse(pendingRequest);
        console.log('🔄 Found pending host request:', requestData);

        // Pre-fill form with request data
        setFormData(prev => ({
          ...prev,
          organizationName: requestData.formData?.organizationName || '',
          email: requestData.formData?.contactEmail || '',
          firstName: requestData.formData?.firstName || '',
          lastName: requestData.formData?.lastName || '',
        }));

        // Set to signup tab since they're creating a new account
        setActiveTab('signup');

        console.log('✅ Host request details loaded and form pre-filled');
      } catch (error) {
        console.error('Error parsing pending request:', error);
      }
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'signin') {
        // Login existing organizer
        const response = await api.login(formData.email, formData.password);

        // Handle OTP requirement
        if ((response as any).requiresOtp) {
          setTempEmail((response as any).email);
          setShowOtp(true);
          setLoading(false);
          toast.success('Please enter the OTP sent to your email');
          return;
        }

        api.setToken(response.accessToken);

        // Check if user is organizer or admin
        const role = response.user.role.toLowerCase();
        if (role !== 'organizer' && role !== 'host' && role !== 'admin') {
          toast.error('This login is for organizers only. Please use the regular login for participants.');
          setLoading(false);
          return;
        }

        // Check if user needs email verification
        if (!response.user.emailVerified) {
          console.log('🔄 OrganizerAuth: User needs verification, navigating to /verify-email');
          const userData = {
            id: response.user.id,
            name: `${response.user.firstName} ${response.user.lastName}`,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            role: response.user.role.toLowerCase(),
            status: response.user.status,
            emailVerified: response.user.emailVerified,
            hostApproved: response.user.hostApproved,
            isNewUser: false,
          };

          // Store user data for verification page
          localStorage.setItem('user_data', JSON.stringify(userData));

          navigate('/verify-email', {
            replace: true,
            state: {
              email: userData.email,
              userId: userData.id,
              tempToken: response.accessToken, // Pass the access token for API calls
              fromOrganizer: true // Flag to indicate this came from organizer auth
            }
          });
          toast.success('Please verify your email to continue.');
          return;
        }

        onAuthSuccess({
          id: response.user.id,
          name: `${response.user.firstName} ${response.user.lastName}`,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          role: response.user.role.toLowerCase(),
          status: response.user.status,
          emailVerified: response.user.emailVerified, // Use actual email verification status
          hostApproved: response.user.hostApproved, // Include host approval status
          isNewUser: false,
        });
        toast.success('Welcome back!');
      } else {
        // Register new organizer
        const response = await api.register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'HOST', // Register as HOST
        });

        // Check if this is a HOST registration (no access token returned)
        if (!response.accessToken) {
          // HOST user - no token, must verify email and wait for admin approval
          console.log('✅ OrganizerAuth: HOST registered, navigating to /verify-email');

          const userData = {
            id: response.user.id,
            name: `${response.user.firstName} ${response.user.lastName}`,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            role: 'host',
            status: response.user.status,
            emailVerified: response.user.emailVerified,
            hostApproved: response.user.hostApproved,
            isNewUser: true,
            organizationName: formData.organizationName,
          };

          // Store user data for verification page
          localStorage.setItem('user_data', JSON.stringify(userData));

          // Generate a temporary token for OTP verification
          // We'll use the user ID as a simple identifier
          const tempToken = btoa(response.user.id); // Base64 encode user ID

          navigate('/verify-email', {
            replace: true,
            state: {
              email: userData.email,
              userId: userData.id,
              tempToken: tempToken,
              fromOrganizer: true,
              isHost: true, // Flag to indicate this is a host
            }
          });

          toast.success('Account created! Please verify your email to continue.');
          setLoading(false);
          return;
        }

        // Regular user flow (has access token)
        api.setToken(response.accessToken);

        // Automatically set role to organizer
        try {
          await api.updateProfile({ role: 'ORGANIZER' });
          console.log('✅ Role updated to ORGANIZER');

          // Clear any pending request
          localStorage.removeItem('pending_host_request');

          // Check if user needs email verification
          if (!response.user.emailVerified) {
            console.log('✅ OrganizerAuth: Signup successful, navigating to /verify-email');
            const userData = {
              id: response.user.id,
              name: `${response.user.firstName} ${response.user.lastName}`,
              firstName: response.user.firstName,
              lastName: response.user.lastName,
              email: response.user.email,
              role: 'organizer', // Set to lowercase organizer
              status: response.user.status,
              emailVerified: response.user.emailVerified,
              hostApproved: response.user.hostApproved,
              isNewUser: true,
              organizationName: formData.organizationName,
            };

            // Store user data for verification page
            localStorage.setItem('user_data', JSON.stringify(userData));

            navigate('/verify-email', {
              replace: true,
              state: {
                email: userData.email,
                userId: userData.id,
                tempToken: response.accessToken, // Pass the access token for API calls
                fromOrganizer: true // Flag to indicate this came from organizer auth
              }
            });
            toast.success('Account created! Please verify your email to continue.');
            return;
          }

          toast.success('Account created! You can now create hackathons.');

          onAuthSuccess({
            id: response.user.id,
            name: `${response.user.firstName} ${response.user.lastName}`,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            role: 'organizer', // Set to lowercase organizer
            status: response.user.status,
            emailVerified: response.user.emailVerified, // Use actual email verification status
            hostApproved: response.user.hostApproved, // Include host approval status
            isNewUser: true,
            organizationName: formData.organizationName,
          });
        } catch (error) {
          console.error('❌ Error updating role:', error);
          // Even if role update fails, still proceed with the original role

          // Check if user needs email verification
          if (!response.user.emailVerified) {
            console.log('✅ OrganizerAuth: Signup successful (fallback), navigating to /verify-email');
            const userData = {
              id: response.user.id,
              name: `${response.user.firstName} ${response.user.lastName}`,
              firstName: response.user.firstName,
              lastName: response.user.lastName,
              email: response.user.email,
              role: response.user.role.toLowerCase(), // Use original role from registration
              status: response.user.status,
              emailVerified: response.user.emailVerified,
              hostApproved: response.user.hostApproved,
              isNewUser: true,
              organizationName: formData.organizationName,
            };

            // Store user data for verification page
            localStorage.setItem('user_data', JSON.stringify(userData));

            navigate('/verify-email', {
              replace: true,
              state: {
                email: userData.email,
                userId: userData.id,
                tempToken: response.accessToken, // Pass the access token for API calls
                fromOrganizer: true // Flag to indicate this came from organizer auth
              }
            });
            toast.success('Account created! Please verify your email to continue.');
            return;
          }

          onAuthSuccess({
            id: response.user.id,
            name: `${response.user.firstName} ${response.user.lastName}`,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            role: response.user.role.toLowerCase(), // Use original role from registration
            status: response.user.status,
            emailVerified: response.user.emailVerified, // Use actual email verification status
            hostApproved: response.user.hostApproved, // Include host approval status
            isNewUser: true,
            organizationName: formData.organizationName,
          });
          toast.success('Account created! You can now create hackathons.');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
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
          className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            size="sm"
            onClick={showOtp ? () => setShowOtp(false) : onBack}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="text-center mb-8">
          <button onClick={onBack} className="inline-flex items-center hover:opacity-80 transition-opacity">
            <Branding size="md" />
          </button>
        </div>

        <Card className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-700/50 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {showOtp ? (
                <Mail className="w-8 h-8 text-white" />
              ) : activeTab === 'signin' ? (
                <Briefcase className="w-8 h-8 text-white" />
              ) : (
                <Award className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              {showOtp ? 'Verify OTP' : activeTab === 'signin' ? 'Organizer Login' : 'Join as Organizer'}
            </h1>
            <p className="text-white">
              {showOtp
                ? 'Enter the 6-digit code sent to your email.'
                : activeTab === 'signin'
                  ? 'Welcome back! Sign in to manage your hackathons.'
                  : 'Create your account to start hosting hackathons.'
              }
            </p>

            {/* Pending Request Indicator */}
            {activeTab === 'signup' && !showOtp && typeof window !== 'undefined' && localStorage.getItem('pending_host_request') && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-white">
                  ✅ <strong>Host request details loaded!</strong> Your form has been pre-filled with your request information.
                </p>
              </div>
            )}
          </div>

          {showOtp ? (
            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    maxLength={1}
                    className="w-12 h-12 text-center text-xl bg-slate-800/50 border-slate-600 text-white"
                  />
                ))}
              </div>
              <Button
                onClick={handleVerifyLoginOtp}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-3"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${activeTab === 'signin'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${activeTab === 'signup'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-white font-semibold">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-white font-semibold">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="organizationName" className="text-white font-semibold">Organization Name</Label>
                      <Input
                        id="organizationName"
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange('organizationName', e.target.value)}
                        className="mt-2 bg-slate-800/50 border-slate-600 text-white"
                        placeholder="Your Company or Organization"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email" className="text-white font-semibold">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-white font-semibold">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      {activeTab === 'signin' ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                    </>
                  )}
                </Button>
              </form>

              {/* Note */}
              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-white">
                  <strong>Note:</strong> This is the organizer portal. If you're a participant looking to join hackathons,
                  please use the regular login from the main page.
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div >
  );
}