import { Router } from 'express';
import { db } from '../db.js';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const router = Router();

// Record Match Score
router.post('/record', async (req, res) => {
  const { teamId, round, opponentName, level } = req.body;

  if (!teamId || !round || !opponentName || !level) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (round < 1 || round > 3) {
    return res.status(400).json({ error: 'Round must be between 1 and 3' });
  }

  if (level < 2 || level > 14) {
    return res.status(400).json({ error: 'Level must be between 2 and 14' });
  }

  try {
    const team = await db.findTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const match = await db.createMatch({
      teamId,
      round,
      opponentName,
      level
    });

    const matches = await db.getMatchesByTeam(teamId);
    const totalScore = matches.reduce((sum, m) => sum + m.score, 0);

    res.json({
      success: true,
      score: match.score,
      totalScore
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const rankings = await db.getLeaderboard();
    res.json({ rankings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export Leaderboard to Excel
router.get('/leaderboard/export', async (req, res) => {
  console.log('Exporting leaderboard...');
  try {
    const rankings = await db.getLeaderboard();
    console.log(`Found ${rankings.length} teams to export`);
    
    // Transform data for Excel
    const data = rankings.map(item => {
      const row: any = {
        '排名': item.rank,
        '队伍名称': item.teamName,
        '参赛选手': item.members || '',
        '总分': item.totalScore
      };
      
      // Add rounds details
      item.rounds.forEach(round => {
        const roundKey = `第${round.round}轮`;
        const opponentScoreStr = round.opponentScore !== null ? `(${round.opponentScore})` : '';
        row[roundKey] = `${item.teamName}(${round.score}) VS ${round.opponent}${opponentScoreStr}`;
      });
      
      return row;
    });
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Adjust column widths
    const colWidths = [
      { wch: 8 },  // Rank
      { wch: 20 }, // Team Name
      { wch: 30 }, // Members
      { wch: 10 }, // Total Score
      { wch: 30 }, // Round 1
      { wch: 30 }, // Round 2
      { wch: 30 }  // Round 3
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, '排行榜');
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Send file
    const fileName = `leaderboard-${new Date().getTime()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.end(buffer);
    
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Team Matches
router.get('/team/:teamId', async (req, res) => {
  const { teamId } = req.params;
  try {
    const matches = await db.getMatchesByTeam(teamId);
    
    // Enrich matches with opponent score
    const enrichedMatches = await Promise.all(matches.map(async (match) => {
      // Find opponent team by name
      const opponentTeam = await db.findTeamByName(match.opponentName);
      let opponentScore = null;
      
      if (opponentTeam) {
        // Find match record for opponent in the same round
        const opponentMatches = await db.getMatchesByTeam(opponentTeam.teamId);
        const opponentMatch = opponentMatches.find(m => m.round === match.round);
        if (opponentMatch) {
          opponentScore = opponentMatch.score;
        }
      }
      
      return {
        ...match,
        opponentScore
      };
    }));

    res.json({ matches: enrichedMatches });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
