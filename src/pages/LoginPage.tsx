import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { Button, Input } from '@/components/ui';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8 shadow-elevated border border-white/40">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-soft">
              <span className="text-white font-bold text-lg">FF</span>
            </div>
            <h2 className="text-h2 text-foreground">Welcome back</h2>
            <p className="text-body-sm text-muted mt-1">
              Sign in to your FEMFLOU account
            </p>
          </div>

          {/* Form */}
          <form
            className="space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              label="Email"
              type="email"
              placeholder="doctor@hospital.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <div className="flex items-center justify-between text-body-sm">
              <label className="flex items-center gap-2 text-muted cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                Remember me
              </label>
              <a href="#" className="text-primary hover:text-primary-600 font-medium transition-colors">
                Forgot password?
              </a>
            </div>
            <Button fullWidth size="lg" type="submit">
              Sign In
            </Button>
          </form>

          <p className="text-center text-body-sm text-muted mt-6">
            Don't have an account?{' '}
            <a href="#" className="text-primary hover:text-primary-600 font-medium transition-colors">
              Request access
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
