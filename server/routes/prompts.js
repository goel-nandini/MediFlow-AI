const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/auth');

const PROMPTS_PATH = path.join(__dirname, '../prompts/prompts.json');

// GET all prompts
router.get('/', protect, (req, res) => {
  const prompts = JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8'));
  res.json({ success: true, data: prompts });
});

// PUT update a prompt
router.put('/:id', protect, (req, res) => {
  const prompts = JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8'));
  const index = prompts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Prompt not found' });
  
  prompts[index].content = req.body.content;
  fs.writeFileSync(PROMPTS_PATH, JSON.stringify(prompts, null, 2));
  res.json({ success: true, message: 'Prompt updated', data: prompts[index] });
});

module.exports = router;