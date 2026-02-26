import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Star, Download, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';

export function Leaderboard() {
  const topWinners = [
    {
      rank: 1,
      name: 'Sarah Chen',
      project: 'AI Healthcare Assistant',
      score: 98,
      avatar: 'SC',
      badges: ['Winner', 'Innovation', 'Best Design'],
      prize: '$50,000',
    },
    {
      rank: 2,
      name: 'Marcus Johnson',
      project: 'Blockchain Supply Chain',
      score: 95,
      avatar: 'MJ',
      badges: ['Runner Up', 'Best Tech'],
      prize: '$25,000',
    },
    {
      rank: 3,
      name: 'Priya Sharma',
      project: 'Smart Education Platform',
      score: 92,
      avatar: 'PS',
      badges: ['3rd Place', 'Social Impact'],
      prize: '$10,000',
    },
  ];

  const participants = [
    { rank: 4, name: 'Alex Wong', project: 'Climate Tracker', score: 89, avatar: 'AW' },
    { rank: 5, name: 'Emma Davis', project: 'FinTech Solution', score: 87, avatar: 'ED' },
    { rank: 6, name: 'James Kim', project: 'IoT Smart Home', score: 85, avatar: 'JK' },
    { rank: 7, name: 'Sofia Rodriguez', project: 'AR Shopping App', score: 83, avatar: 'SR' },
    { rank: 8, name: 'Ryan Park', project: 'Crypto Wallet', score: 81, avatar: 'RP' },
    { rank: 9, name: 'Lisa Zhang', project: 'Food Delivery AI', score: 79, avatar: 'LZ' },
    { rank: 10, name: 'Tom Wilson', project: 'Social Network', score: 77, avatar: 'TW' },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500 to-orange-500';
      case 2:
        return 'from-slate-400 to-slate-500';
      case 3:
        return 'from-orange-600 to-orange-700';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-white" />;
      case 2:
        return <Medal className="w-8 h-8 text-white" />;
      case 3:
        return <Award className="w-8 h-8 text-white" />;
      default:
        return <span className="text-2xl font-bold text-white">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4">
            <Badge className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-white">
              <Trophy className="w-4 h-4 mr-2" />
              AI Innovation Challenge 2024
            </Badge>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-white">
            🏆 <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Winners & Leaderboard
            </span>
          </h1>
          <p className="text-xl text-white">Celebrating excellence in innovation</p>
        </motion.div>

        {/* Top 3 Winners Podium */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:order-1 order-2"
          >
            <Card className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/50 backdrop-blur-sm p-6 text-center mt-8">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-lg">
                  <Medal className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-8 mb-4">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                  {topWinners[1].avatar}
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">{topWinners[1].name}</h3>
                <p className="text-white text-sm mb-2">{topWinners[1].project}</p>
                <div className="text-3xl font-bold text-white mb-2">{topWinners[1].score}</div>
                <p className="text-yellow-400 font-semibold">{topWinners[1].prize}</p>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {topWinners[1].badges.map((badge) => (
                  <Badge key={badge} className="bg-slate-800 text-white text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:order-2 order-1"
          >
            <Card className="relative bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 backdrop-blur-sm p-6 text-center">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="mt-12 mb-4">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-yellow-500/50 text-white">
                  {topWinners[0].avatar}
                </div>
                <h3 className="text-2xl font-bold mb-1 text-white">{topWinners[0].name}</h3>
                <p className="text-white mb-2">{topWinners[0].project}</p>
                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                  {topWinners[0].score}
                </div>
                <p className="text-yellow-400 font-bold text-lg">{topWinners[0].prize}</p>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {topWinners[0].badges.map((badge) => (
                  <Badge key={badge} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                    <Star className="w-3 h-3 mr-1" />
                    {badge}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:order-3 order-3"
          >
            <Card className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/50 backdrop-blur-sm p-6 text-center mt-12">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-8 mb-4">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl font-bold text-white">
                  {topWinners[2].avatar}
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">{topWinners[2].name}</h3>
                <p className="text-white text-sm mb-2">{topWinners[2].project}</p>
                <div className="text-3xl font-bold text-orange-400 mb-2">{topWinners[2].score}</div>
                <p className="text-orange-400 font-semibold">{topWinners[2].prize}</p>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {topWinners[2].badges.map((badge) => (
                  <Badge key={badge} className="bg-slate-800 text-white text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Full Leaderboard */}
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1 text-white">Full Leaderboard</h2>
              <p className="text-white text-sm">All participants ranked by score</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="divide-y divide-slate-700">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-lg text-white">
                    #{participant.rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                    {participant.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold">{participant.name}</h3>
                    <p className="text-sm text-white">{participant.project}</p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{participant.score}</div>
                    <div className="text-xs text-white">Score</div>
                  </div>

                  {/* Action */}
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1 text-white">2,547</div>
            <div className="text-sm text-white">Total Participants</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1 text-white">1,892</div>
            <div className="text-sm text-white">Projects Submitted</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1 text-white">$100K</div>
            <div className="text-sm text-white">Total Prize Pool</div>
          </Card>
        </div>

        {/* Certificate CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8"
        >
          <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2 text-white">Download Your Certificate</h3>
            <p className="text-blue-50 mb-6">Blockchain-verified achievement certificate</p>
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold">
              <Download className="w-5 h-5 mr-2" />
              Get Certificate
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
