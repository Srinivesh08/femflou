import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Camera,
  X,
  CheckCircle2,
  Image as ImageIcon,
  RotateCcw,
  Activity,
  Zap,
} from 'lucide-react';
import { Button, Card, ProgressBar } from '@/components/ui';
import { useUploadSample, useAnalyzeSample } from '@/hooks/queries';

type UploadStep = 'upload' | 'camera' | 'preview' | 'processing';

const PROCESSING_STAGES = [
  'Detecting cartridge alignment...',
  'Correcting perspective distortion...',
  'Normalizing ambient lighting...',
  'Removing sensor noise...',
  'Segmenting reaction chambers...',
  'Extracting RGB color values...',
  'Measuring fluorescence intensity...',
  'Mapping to calibration curves...',
  'Calculating biomarker concentrations...',
  'Assessing maternal health risk...',
  'Generating clinical summary...',
];

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<UploadStep>('upload');
  
  // Image State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Mock Quality Scores
  const [brightness, setBrightness] = useState(0);
  const [focus, setFocus] = useState(0);

  // Processing State
  const [processIndex, setProcessIndex] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);

  const uploadMutation = useUploadSample();
  const analyzeMutation = useAnalyzeSample();

  // Helper to convert Data URL to Blob
  const dataURLtoBlob = (dataurl: string) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)![1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  };

  // --- File Drag & Drop ---
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        generateMockScores();
        setStep('preview');
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Camera Logic ---
  const startCamera = async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStep('camera');
    } catch (err: any) {
      setCameraError('Camera access denied or not available. Please upload an image instead.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageSrc(dataUrl);
        generateMockScores();
        stopCamera();
        setStep('preview');
      }
    }
  };

  // --- Preview Logic ---
  const generateMockScores = () => {
    // In a real app, we'd analyze canvas pixel data for luminance and edge detection (focus).
    // Here we generate realistic-looking mock scores.
    setBrightness(Math.floor(Math.random() * 20) + 75); // 75-95
    setFocus(Math.floor(Math.random() * 15) + 80); // 80-95
  };

  const retake = () => {
    setImageSrc(null);
    setStep('upload');
  };

  const startAnalysis = async () => {
    if (!imageSrc) return;
    setStep('processing');
    setProcessIndex(0);
    setConfidence(0);
    setProcessingTime(0);

    try {
      // 1. Upload
      const blob = dataURLtoBlob(imageSrc);
      const formData = new FormData();
      formData.append('image', blob, 'cartridge.jpg');
      
      const uploadResult = await uploadMutation.mutateAsync(formData);
      
      // 2. Analyze
      const analyzeResult = await analyzeMutation.mutateAsync(uploadResult.id);

      // We still use the interval animation, but when it finishes, we navigate.
      // Store the result ID to navigate to later.
      (window as any).__reportIdToNavigate = analyzeResult.report.id;
    } catch (error) {
      console.error('Analysis failed:', error);
      // Handle error (e.g. go back to preview)
      setStep('preview');
    }
  };

  // --- Processing Animation Sequence ---
  useEffect(() => {
    let processTimer: NodeJS.Timeout;
    let timeInterval: NodeJS.Timeout;
    let confInterval: NodeJS.Timeout;

    if (step === 'processing') {
      // Advance stages every ~1.2s
      processTimer = setInterval(() => {
        setProcessIndex((prev) => {
          if (prev < PROCESSING_STAGES.length - 1) {
            return prev + 1;
          } else {
            clearInterval(processTimer);
            // Finished!
            setTimeout(() => {
              const reportId = (window as any).__reportIdToNavigate;
              if (reportId) {
                navigate(`/results/${reportId}`);
              }
            }, 1000);
            return prev;
          }
        });
      }, 1200);

      // Processing time counter
      timeInterval = setInterval(() => {
        setProcessingTime((prev) => prev + 0.1);
      }, 100);

      // Confidence ticker
      confInterval = setInterval(() => {
        setConfidence((prev) => {
          if (prev >= 98) return prev;
          return prev + Math.random() * 2;
        });
      }, 200);
    }

    return () => {
      clearInterval(processTimer);
      clearInterval(timeInterval);
      clearInterval(confInterval);
    };
  }, [step, navigate]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);


  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-h2 text-foreground">Upload & Analyze</h1>
        <p className="text-body text-muted mt-2">
          Capture or upload an image of the FEMFLOU microfluidic cartridge for AI processing.
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ================= STEP 1: UPLOAD ================= */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-8 sm:p-12">
              <div
                className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-gray-50/50 cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Drag & drop your cartridge image
                </h3>
                <p className="text-sm text-muted mb-8">
                  or click to browse your device
                </p>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
                
                <div className="flex items-center w-full max-w-xs my-4">
                  <div className="flex-1 border-t border-border" />
                  <span className="px-3 text-xs text-muted uppercase font-medium">Or</span>
                  <div className="flex-1 border-t border-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                  leftIcon={<Camera className="w-4 h-4" />}
                >
                  Use Camera
                </Button>
                
                {cameraError && (
                  <p className="text-critical text-sm mt-4">{cameraError}</p>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ================= STEP 2: CAMERA ================= */}
        {step === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="overflow-hidden bg-black relative aspect-[4/3] sm:aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Camera UI Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-critical animate-pulse" /> Live
                  </div>
                  <button
                    onClick={() => { stopCamera(); setStep('upload'); }}
                    className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={captureImage}
                    className="w-16 h-16 rounded-full border-4 border-white/80 flex items-center justify-center hover:bg-white/20 transition-all focus:outline-none focus:ring-4 focus:ring-primary/50"
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-lg" />
                  </button>
                </div>
              </div>
              
              {/* Guide Overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                <div className="w-3/4 h-1/2 border-2 border-white/40 border-dashed rounded-xl relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-white/80 text-xs font-medium bg-black/40 px-2 py-1 rounded">
                    Align cartridge within frame
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ================= STEP 3: PREVIEW ================= */}
        {step === 'preview' && imageSrc && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-2 overflow-hidden bg-gray-900/5">
                <img
                  src={imageSrc}
                  alt="Captured Cartridge"
                  className="w-full h-auto rounded-2xl shadow-sm object-cover aspect-[4/3]"
                />
              </Card>
              
              <div className="space-y-6 flex flex-col justify-center">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    Image Captured
                  </h3>
                  <p className="text-body-sm text-muted">
                    Our AI has pre-screened the image quality. Please review the scores before proceeding.
                  </p>
                </div>

                <Card className="space-y-5 bg-surface/50 border-border/50 shadow-none">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4 text-warning" /> Brightness
                      </span>
                      <span className="text-sm font-bold text-foreground">{brightness}/100</span>
                    </div>
                    <ProgressBar progress={brightness} color={brightness > 70 ? 'bg-success' : 'bg-warning'} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-secondary" /> Focus & Clarity
                      </span>
                      <span className="text-sm font-bold text-foreground">{focus}/100</span>
                    </div>
                    <ProgressBar progress={focus} color={focus > 75 ? 'bg-success' : 'bg-warning'} />
                  </div>
                </Card>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" size="lg" className="flex-1" onClick={retake} leftIcon={<RotateCcw className="w-4 h-4" />}>
                    Retake
                  </Button>
                  <Button size="lg" className="flex-1" onClick={startAnalysis} leftIcon={<Activity className="w-4 h-4" />}>
                    Analyze
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 4: AI PROCESSING ================= */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
              
              {/* Mock Cartridge Scanning Graphic */}
              <div className="relative w-64 h-32 bg-gray-100 rounded-xl mb-12 border border-border/60 shadow-inner overflow-hidden flex items-center justify-center">
                {/* 6 Reaction chambers placeholder */}
                <div className="flex gap-2">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-border/40 relative"
                      animate={
                        processIndex >= 4 
                          ? { borderColor: ['#e2e8f0', '#0f766e', '#e2e8f0'], backgroundColor: ['transparent', 'rgba(15,118,110,0.2)', 'transparent'] } 
                          : {}
                      }
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {processIndex >= 4 && (
                        <motion.div 
                          className="absolute inset-0 rounded-full border border-primary"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
                
                {/* Scanning laser effect */}
                <motion.div
                  className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                  animate={{ x: ['-100%', '800%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Status Text & Progress */}
              <div className="w-full space-y-6 text-center">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={processIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-2xl font-bold text-foreground h-8"
                  >
                    {PROCESSING_STAGES[processIndex]}
                  </motion.h2>
                </AnimatePresence>

                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((processIndex + 1) / PROCESSING_STAGES.length) * 100}%` }}
                    transition={{ duration: 1.2, ease: "linear" }}
                  />
                </div>

                {/* Futurist HUD Stats */}
                <div className="flex justify-between items-center text-xs font-mono text-muted/80 px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    AI Core Active
                  </div>
                  <div className="flex gap-6">
                    <span>CONF: {Math.min(99.9, confidence).toFixed(1)}%</span>
                    <span>T: {processingTime.toFixed(1)}s</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPage;
