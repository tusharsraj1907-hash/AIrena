import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Branding } from './Branding';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';

interface EmailVerificationProps {
  onAuthSuccess?: (user: any) => void;
}

export function EmailVerification({ onAuthSuccess }: EmailVerificationProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Route state (REQUIRED)
  const { email, tempToken, isHost, isLogin } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimeLeft, setResendTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ------------------------------------------------------------------ */
  /* 🔒 HARD GUARD – cannot access verify page without proper context */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!email) {
      navigate('/auth', { replace: true });
    }
  }, [email, navigate]);

  /* ------------------------------------------------------------------ */
  /* Resend countdown */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (resendTimeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (resendTimeLeft === 0) setCanResend(true);
  }, [resendTimeLeft, canResend]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  /* ------------------------------------------------------------------ */
  /* OTP INPUT HANDLERS */
  /* ------------------------------------------------------------------ */
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');
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

  /* ------------------------------------------------------------------ */
  /* ✅ VERIFIED & LOCKED OTP FLOW */
  /* ------------------------------------------------------------------ */
  const handleVerify = async () => {
    if (isLoading) return; // 🔒 one-line guard

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // HANDLE LOGIN OTP VERIFICATION
      if (isLogin) {
        // user needs to verify login OTP (Admin/Host login flow)
        // Note: verifyLoginOtp returns { accessToken, user }
        const response = await api.verifyLoginOtp(email, otpString);

        // Set token FIRST
        api.setToken(response.accessToken);

        const user = response.user;
        const userData = {
          ...user,
          role: user.role.toLowerCase(),
        };

        // Store user data in localStorage
        localStorage.setItem('user_data', JSON.stringify(userData));

        setIsVerified(true);
        toast.success('Login successful!');

        // Small delay to ensure state is saved
        setTimeout(() => {
          // Reload the page to ensure HackathonApp picks up the auth state
          window.location.href = '/dashboard';
        }, 500);
        return;
      }

      // HOST users use public endpoint (no JWT required)
      if (isHost) {
        const response = await api.verifyEmailPublic(email, otpString);

        setIsVerified(true);
        toast.success(response.message || 'Email verified! Waiting for admin approval.');

        setTimeout(() => {
          // Redirect to login page with message
          navigate('/organizer-auth', {
            replace: true,
            state: {
              message: 'Email verified. Your host request is pending admin approval. You will receive an email once approved.'
            }
          });
        }, 2000);
        return;
      }

      // Regular users with JWT token
      // TEMP TOKEN ONLY FOR OTP VERIFICATION
      api.setToken(tempToken);

      // ✅ BACKEND RETURNS EITHER MESSAGE OR TOKEN + USER
      const response = await api.verifyEmail(otpString);

      // Handle different response formats
      if ('accessToken' in response && 'user' in response) {
        // HOST user response with token and user data
        const { accessToken, user } = response;

        // ✅ SET FINAL AUTH STATE (ONCE)
        api.setToken(accessToken);
        const userData = {
          ...user,
          role: user.role.toLowerCase(),
        };
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Call parent callback to update React state immediately (prevents stale /dashboard redirect)
        onAuthSuccess?.(userData);

        setIsVerified(true);
        toast.success('Email verified successfully!');

        setTimeout(() => {
          if (user.role === 'HOST') {
            if (user.hostApproved) {
              navigate('/dashboard', { replace: true });
            } else {
              toast.success(
                'Email verified! Your host request is pending admin approval.'
              );
            }
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 800);
      } else {
        // Regular user — message-only response; fetch updated user to populate dashboard
        const token = localStorage.getItem('auth_token') || tempToken;
        if (token) {
          try {
            api.setToken(token);
            const freshUser = await api.getCurrentUser();
            const storedRaw = localStorage.getItem('user_data');
            const stored = storedRaw ? JSON.parse(storedRaw) : {};
            const merged = { ...stored, ...freshUser, role: (freshUser.role || stored.role || 'participant').toLowerCase(), emailVerified: true };
            localStorage.setItem('user_data', JSON.stringify(merged));
            onAuthSuccess?.(merged);
          } catch {/* ignore — re-init useEffect will handle it */ }
        }

        setIsVerified(true);
        toast.success('Email verified successfully!');

        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 800);
      }
    } catch (err: any) {
      if (err?.message?.includes('expired')) {
        setError('Verification code has expired. Please request a new one.');
        setCanResend(true);
        setResendTimeLeft(0);
      } else if (err?.message?.includes('Invalid')) {
        setError('Invalid verification code. Please try again.');
      } else {
        setError('Verification failed. Please try again.');
      }
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* RESEND OTP */
  /* ------------------------------------------------------------------ */
  const handleResend = async () => {
    if (isResending) return;

    try {
      setIsResending(true);
      api.setToken(tempToken);
      await api.sendOtp();
      setOtp(['', '', '', '', '', '']);
      setResendTimeLeft(60);
      setCanResend(false);
      toast.success('New verification code sent!');
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* VERIFIED STATE (UI UNCHANGED) */
  /* ------------------------------------------------------------------ */
  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
          <h2 className="text-2xl font-bold text-green-400">Email Verified</h2>
          <p className="text-slate-300 mt-2">You can safely close this page.</p>
        </motion.div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* ORIGINAL UI – UNCHANGED */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/auth')} className="mb-6 flex items-center gap-2 text-slate-300">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Logo */}
        <div className="text-center mb-8 flex justify-center">
          <Branding size="xl" />
        </div>

        <Card className="p-8 bg-slate-900 border-slate-800">
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                maxLength={1}
                className="w-14 h-14 text-center text-xl"
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 text-red-400 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <Button
            onClick={handleVerify}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full mb-4"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>

          <div className="text-center text-sm text-slate-400">
            {canResend ? (
              <button onClick={handleResend} className="text-blue-400">
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
            ) : (
              <>Resend in {resendTimeLeft}s</>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
