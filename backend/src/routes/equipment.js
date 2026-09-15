const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipmentController');

// GET /api/equipment        – public, supports query filters
router.get('/', getEquipment);

// GET /api/equipment/:id    – public
router.get('/:id', getEquipmentById);

// POST /api/equipment       – auth required (provider creates equipment)
router.post('/', authMiddleware, createEquipment);

// PUT /api/equipment/:id    – auth required (owner only)
router.put('/:id', authMiddleware, updateEquipment);

// DELETE /api/equipment/:id – auth required (owner only)
router.delete('/:id', authMiddleware, deleteEquipment);

module.exports = router;
