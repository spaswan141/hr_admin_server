const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const passport=require("passport")
const requireAuth = passport.authenticate('jwt', {
  session: false
})
router.post('/', requireAuth, candidateController.createCandidate);
router.get('/', requireAuth, candidateController.getCandidates);
router.get("/resume/:id",candidateController.downloadResume)
router.get('/:id', requireAuth, candidateController.getCandidateById);
router.patch('/status', requireAuth, candidateController.updateCandidateStatus);
router.delete('/:id', requireAuth, candidateController.deleteCandidate);

module.exports = router;
