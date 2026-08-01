import React from 'react';
import {
  HeroSection,
  StatsBar,
  WorkflowPipeline,
  TechnologyPreview,
  DisclaimerBanner,
  Footer,
} from '@/components/landing';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsBar />
      <WorkflowPipeline />
      <TechnologyPreview />
      <DisclaimerBanner />
      <Footer />
    </div>
  );
};

export default HomePage;
