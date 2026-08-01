import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <section className="bg-amber-50/80 border-t border-b border-amber-200/50 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <p className="text-sm text-amber-900/80 leading-relaxed">
            <span className="font-semibold text-amber-900">Medical Disclaimer:</span>{' '}
            FEMFLOU is an AI-assisted maternal health screening platform intended for
            preliminary screening and health monitoring. It does not diagnose medical
            conditions and should not be used as a substitute for professional medical
            evaluation, diagnosis, or treatment. Always consult a qualified healthcare
            provider for clinical decisions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DisclaimerBanner;
