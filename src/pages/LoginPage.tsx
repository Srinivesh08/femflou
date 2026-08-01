import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ShieldCheck, Chrome } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAppStore, UserRole } from '@/store/useAppStore';

const ROLES: { id: UserRole; label: string }[] = [
  { id: 'patient', label: 'Patient' },
  { id: 'doctor', label: 'Doctor' },
  { id: 'researcher', label: 'Researcher' },
  { id: 'admin', label: 'Admin' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);

  // Form State
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole>('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // Validation / UI State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Timer for 2FA resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsLoading(true);
    
    // Mock network delay
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setCountdown(30);
    }, 800);
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    setError('');
    setIsLoading(true);

    // Mock network delay & login
    setTimeout(() => {
      setIsLoading(false);
      
      // Store mock user in Zustand
      setUser({
        id: Math.random().toString(36).substring(7),
        name: email.split('@')[0].replace('.', ' '),
        email,
        role,
      });

      // Redirect based on role
      if (role === 'admin') {
        navigate('/doctor-portal'); // Admin goes to doctor-portal in this mock, or could be /admin
      } else {
        navigate('/dashboard');
      }
    }, 800);
  };

  const resendCode = () => {
    setCountdown(30);
    // Mock sending code
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* ── Left/Background Panel ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden items-center justify-center p-12">
        {/* Soft gradient background matching landing hero */}
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(15,118,110,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(6,182,212,0.1) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 50% 80%, rgba(37,99,235,0.08) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,118,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-8 shadow-soft">
            <span className="text-white font-extrabold text-2xl tracking-tighter">FF</span>
          </div>
          <h1 className="text-[3rem] font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
            Intelligent <br />
            <span className="gradient-text">Screening</span>
          </h1>
          <p className="text-body-lg text-muted/80 leading-relaxed max-w-md">
            Sign in to access AI-powered maternal health diagnostics, track clinical workflows, and review patient insights.
          </p>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 bg-white/50 backdrop-blur-3xl md:bg-transparent md:backdrop-blur-none border-l border-border/30">
        
        {/* Mobile background (visible only on small screens) */}
        <div className="absolute inset-0 -z-10 md:hidden bg-background">
          <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-3xl" />
        </div>

        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-sm">FF</span>
            </div>
            <span className="text-xl font-bold tracking-tight">FEMFLOU</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-h2 text-foreground mb-2">Welcome back</h2>
                  <p className="text-body-sm text-muted">Please enter your details to sign in.</p>
                </div>

                {/* Role Selector Tabs */}
                <div className="flex p-1 bg-gray-100/80 rounded-xl mb-8 border border-border/50">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex-1 py-1.5 text-[0.8125rem] font-medium rounded-lg transition-all duration-200 ${
                        role === r.id
                          ? 'bg-white text-foreground shadow-sm'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Single Sign-On */}
                <Button
                  fullWidth
                  variant="outline"
                  type="button"
                  className="mb-6 h-11 bg-white hover:bg-gray-50 text-foreground border-border/60"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Sign in with Google
                </Button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white md:bg-background px-4 text-muted">Or continue with email</span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleCredentialsSubmit}>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="name@hospital.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    leftIcon={<Mail className="w-4 h-4" />}
                    error={error && !password ? error : undefined}
                  />
                  <div className="relative">
                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      leftIcon={<Lock className="w-4 h-4" />}
                      error={error && password ? error : undefined}
                    />
                    <Link
                      to="/forgot-password"
                      className="absolute right-0 top-0 text-[0.8125rem] font-medium text-primary hover:text-primary-600 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button fullWidth size="lg" type="submit" isLoading={isLoading} className="mt-2">
                    Sign In
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-h2 text-foreground mb-2">Two-Factor Auth</h2>
                  <p className="text-body-sm text-muted">
                    We've sent a 6-digit code to <br/><strong className="text-foreground">{email}</strong>
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handle2FASubmit}>
                  <Input
                    label="Security Code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                      setError('');
                    }}
                    error={error}
                    style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem', paddingLeft: '1.5em' }}
                  />

                  <Button fullWidth size="lg" type="submit" isLoading={isLoading}>
                    Verify & Continue
                  </Button>

                  <div className="text-center text-body-sm">
                    {countdown > 0 ? (
                      <span className="text-muted">Resend code in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={resendCode}
                        className="text-primary hover:text-primary-600 font-medium transition-colors"
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[0.8125rem] text-muted hover:text-foreground transition-colors"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted/60 mt-12 max-w-xs mx-auto leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            <br />
            For research and screening purposes only. Not a diagnostic device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
