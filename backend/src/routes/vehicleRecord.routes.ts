import { Router } from 'express';
import { VehicleRecordController } from '../controllers/vehicleRecord.controller';

const router = Router();

router.post('/', VehicleRecordController.create);
router.get('/stats', VehicleRecordController.getStats);
router.get('/', VehicleRecordController.getAll);
router.get('/:id', VehicleRecordController.getById);
router.put('/:id', VehicleRecordController.update);
router.delete('/:id', VehicleRecordController.delete);

export default router;
