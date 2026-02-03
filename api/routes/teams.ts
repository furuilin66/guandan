import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Get all teams
router.get('/', (req, res) => {
  try {
    const teams = db.getAllTeams();
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Team Login
router.post('/login', (req, res) => {
  const { teamName } = req.body;
  
  if (!teamName) {
    return res.status(400).json({ error: 'Team name is required' });
  }

  try {
    let team = db.findTeamByName(teamName);
    
    if (!team) {
      // Auto register if not found
      team = db.createTeam(teamName);
    }

    res.json({
      teamId: team.teamId,
      teamName: team.teamName,
      token: team.teamId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Team Name
router.put('/:teamId', (req, res) => {
  const { teamId } = req.params;
  const { teamName } = req.body;

  if (!teamName) {
    return res.status(400).json({ error: 'New team name is required' });
  }

  try {
    const updatedTeam = db.updateTeamName(teamId, teamName);
    res.json(updatedTeam);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
