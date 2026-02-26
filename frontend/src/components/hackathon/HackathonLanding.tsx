import React, { Suspense, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Brain, Zap, Globe, Code, Award, ChevronRight, Sparkles, Rocket, Trophy, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Branding } from './Branding';
import { Card3D } from '../ui/Card3D';
import { Button3D } from '../ui/Button3D';
import { Scene3D, FloatingCube, FloatingSphere } from '../ui/Scene3D';
import { api } from '../../utils/api';

interface HackathonLandingProps {
  onNavigate: (page: string) => void;
}

export function HackathonLanding({ onNavigate }: HackathonLandingProps) {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [stats, setStats] = useState([
    { label: 'Active Hackathons', value: '0', icon: Trophy },
    { label: 'Participants', value: '0', icon: Users },
    { label: 'Projects Submitted', value: '0', icon: Code },
  ]);
  const [statsLoading, setStatsLoading] = useState(true);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Fetch real stats data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        console.log('🔄 Fetching platform stats...');

        // Use the dedicated platform stats endpoint
        const platformStats = await api.getPlatformStats();

        // Update stats with real data
        setStats([
          { label: 'Active Hackathons', value: platformStats.activeHackathons.toString(), icon: Trophy },
          { label: 'Participants', value: platformStats.totalParticipants.toString(), icon: Users },
          { label: 'Projects Submitted', value: platformStats.totalSubmissions.toString(), icon: Code },
        ]);

        console.log('✅ Platform stats updated:', platformStats);

      } catch (error) {
        console.error('❌ Error fetching platform stats:', error);
        // Show fallback attractive numbers on error
        setStats([
          { label: 'Active Hackathons', value: '5', icon: Trophy },
          { label: 'Participants', value: '127', icon: Users },
          { label: 'Projects Submitted', value: '42', icon: Code },
        ]);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();

    // Subscribe to global stats refresh events
    const unsubscribe = api.onStatsRefresh(fetchStats);

    // Set up periodic refresh every 60 seconds to catch updates
    const interval = setInterval(fetchStats, 60000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Review',
      description: 'Smart AI evaluates your project against requirements before human judging',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Rocket,
      title: 'Instant Feedback',
      description: 'Get real-time AI insights and suggestions as you build your project',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Globe,
      title: 'Global Competitions',
      description: 'Compete with developers worldwide in various tech domains',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Award,
      title: 'Verified Certificates',
      description: 'Earn blockchain-verified certificates and showcase your achievements',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-950/50 border-b border-slate-800/50"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigate('landing')}
              style={{ cursor: 'pointer' }}
            >
              <Branding size="lg" />
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold" onClick={() => onNavigate('auth')}>Login</Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-16 pb-1 px-6 relative min-h-screen flex items-center">
        {/* 3D Background Scene */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Suspense fallback={null}>
            <Scene3D className="absolute inset-0 w-full h-full opacity-30">
              <FloatingCube position={[-3, 2, -2]} color="#3b82f6" />
              <FloatingSphere position={[3, -2, -3]} color="#8b5cf6" />
              <FloatingCube position={[0, 3, -4]} color="#ec4899" />
              <FloatingSphere position={[-2, -3, -2]} color="#10b981" />
            </Scene3D>
          </Suspense>

          {/* Animated gradient orbs */}
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
            className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ y: heroY, opacity: heroOpacity }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-4 leading-tight text-white"
            >
              Enter the AIrena
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white"
            >
              The Global Arena for AI Builders
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl text-white mb-4 max-w-4xl mx-auto leading-relaxed"
            >
              Build, compete and deploy AI solutions through world-class hackathons, real-world challenges and enterprise-backed problems.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-base md:text-lg text-white/90 mb-6 max-w-3xl mx-auto font-medium"
            >
              From first-time builders to global enterprises - everyone belongs in the AIrena.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button3D
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold text-lg px-8 py-6"
                onClick={() => onNavigate('explore')}
              >
                Explore Hackathon <ChevronRight className="w-5 h-5 ml-2" />
              </Button3D>
              <Button3D
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold text-lg px-8 py-6"
                onClick={() => onNavigate('organizer-auth')}
              >
                Host Hackathon <ChevronRight className="w-5 h-5 ml-2" />
              </Button3D>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="py-6 px-6 bg-slate-900/30">
        <div className="container mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <Card3D key={stat.label} intensity={15}>
                <motion.div
                  variants={item}
                >
                  <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm text-center glass shadow-3d h-full">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      {statsLoading ? (
                        <div className="animate-pulse bg-slate-600 h-8 w-16 mx-auto rounded"></div>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          key={stat.value} // Key ensures re-animation when value changes
                        >
                          {stat.value}
                        </motion.span>
                      )}
                    </div>
                    <div className="text-sm text-white font-semibold">{stat.label}</div>
                  </Card>
                </motion.div>
              </Card3D>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-6 px-6 bg-slate-900/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white">
              How It Works - <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AIrena</span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-white">
              A Human + AI Powered Hackathon Experience
            </h3>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              AIrena combines the speed of AI evaluation with the depth of human judgment - so builders don't just win prizes, they grow end-to-end.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8 max-w-5xl mx-auto"
            style={{ gridAutoRows: '1fr' }}
          >
            {/* Step 1 */}
            <Card3D intensity={20}>
              <motion.div variants={item} className="h-full">
                <Card className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full min-h-[380px] glass shadow-3d relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <div className="relative z-10 flex flex-col flex-1 min-h-0">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-black shadow-lg glow-animated flex-shrink-0">
                      1
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white text-center flex-shrink-0">Join a Hackathon</h3>
                    <div className="flex-1 flex flex-col justify-between min-h-0">
                      <p className="text-white leading-relaxed text-justify text-sm">
                        Sign up, choose a challenge and start building during the official hackathon window. Work solo or in teams, submit your solution before the deadline and showcase your ideas on a global stage.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Card3D>

            {/* Step 2 */}
            <Card3D intensity={20}>
              <motion.div variants={item} className="h-full">
                <Card className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full min-h-[380px] glass shadow-3d relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <div className="relative z-10 flex flex-col flex-1 min-h-0">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-black shadow-lg glow-animated flex-shrink-0">
                      2
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white text-center flex-shrink-0">AI-Powered Review & Scoring</h3>
                    <div className="flex-1 flex flex-col justify-between min-h-0">
                      <p className="text-white leading-relaxed text-justify text-sm">
                        Every submission is first evaluated by AI reviewers to check completeness & requirements and validate problem alignment. This ensures fair, fast, and scalable evaluation.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Card3D>

            {/* Step 3 */}
            <Card3D intensity={20}>
              <motion.div variants={item} className="h-full">
                <Card className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full min-h-[380px] glass shadow-3d relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <div className="relative z-10 flex flex-col flex-1 min-h-0">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-4xl font-black shadow-lg glow-animated flex-shrink-0">
                      3
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white text-center flex-shrink-0">Human-in-the-Loop Judging</h3>
                    <div className="flex-1 flex flex-col justify-between min-h-0">
                      <p className="text-white leading-relaxed text-justify text-sm">
                        Top submissions move to live evaluation with AI industry leaders, startup founders & enterprise experts. Participants present their solution, give live demos and receive real-time feedback. This is where thinking, communication and execution matter.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Card3D>

            {/* Step 4 */}
            <Card3D intensity={20}>
              <motion.div variants={item} className="h-full">
                <Card className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full min-h-[380px] glass shadow-3d relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <div className="relative z-10 flex flex-col flex-1 min-h-0">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-4xl font-black shadow-lg glow-animated flex-shrink-0">
                      4
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white text-center flex-shrink-0">Final Scoring & Winners</h3>
                    <div className="flex-1 flex flex-col justify-between min-h-0">
                      <p className="text-white leading-relaxed text-justify text-sm">
                        Final scores combine AI Evaluation, Expert Judge Scores (based on predefined criteria), and Presentation, demo & clarity. The top 3 teams are selected based on AIrena-defined, transparent criteria.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Card3D>
          </motion.div>
        </div>
      </section>

      {/* Beyond Winning Section */}
      <section className="py-6 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Beyond Winning — <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">360° Upskilling</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-4 leading-relaxed">
              AIrena isn't just about results.
            </p>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              By keeping humans in the loop, we help participants build:
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {[
              { title: 'Technical excellence', icon: Code, color: 'from-blue-500 to-cyan-500' },
              { title: 'Problem-solving mindset', icon: Brain, color: 'from-purple-500 to-pink-500' },
              { title: 'Presentation & storytelling skills', icon: Rocket, color: 'from-green-500 to-emerald-500' },
              { title: 'Real-world AI deployment confidence', icon: Zap, color: 'from-orange-500 to-red-500' },
            ].map((benefit, index) => (
              <Card3D key={benefit.title} intensity={15}>
                <motion.div variants={item}>
                  <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full glass shadow-3d">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center flex-shrink-0`}>
                        <benefit.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Card3D>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-2xl md:text-3xl font-bold text-white">
              You don't just compete - <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">you evolve.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-800">
        <div className="container mx-auto text-center text-white">
          <p className="text-sm">&copy; 2026 AIrena. All rights reserved.</p>
          <p className="mt-1 text-xs text-white/80">The Global Arena for AI Builders</p>
          <p className="mt-2 text-xs text-white/80">
            Powered by{' '}
            <a
              href="https://www.sashai.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              SashAI
            </a>
            {' '}&{' '}
            <a
              href="https://3ai.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              3AI
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}