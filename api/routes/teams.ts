import { Router } from 'express';
import { db } from '../db';

const router = Router();

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await db.getAllTeams();
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Team Login
router.post('/login', async (req, res) => {
  const { teamName } = req.body;
  
  if (!teamName) {
    return res.status(400).json({ error: 'Team name is required' });
  }

  try {
    let team = await db.findTeamByName(teamName);
    
    if (!team) {
      // Auto register if not found
      team = await db.createTeam(teamName);
    }

    res.json({
      teamId: team.teamId,
      teamName: team.teamName,
      members: team.members,
      token: team.teamId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Team (Name or Members)
router.put('/:teamId', async (req, res) => {
  const { teamId } = req.params;
  const { teamName, members } = req.body;

  if (!teamName && members === undefined) {
    return res.status(400).json({ error: 'No updates provided' });
  }

  try {
    const updatedTeam = await db.updateTeam(teamId, { teamName, members });
    res.json(updatedTeam);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
