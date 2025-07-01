import express from 'express';
import { FreelancerContractRepository } from '../../repository/freelancer/FcontractRepository';
import { FreelancerContractService } from '../../services/freelancer/FcontractService';
import { FreelancerContractController } from '../../controllers/freelancer/FcontractController';
import { authenticateToken, authorizeRoles } from '../../middlewares/authMiddleware';

const router = express.Router();

const contractRepository = new FreelancerContractRepository();
const contractService = new FreelancerContractService(contractRepository);
const contractController = new FreelancerContractController(contractService);

router.post(
    "/approve-contract/:contractId/:freelancerId",
    authenticateToken,
    authorizeRoles('freelancer'),
    contractController.approveContract.bind(contractController)
);

router.get(
    "/get-contracts/:freelancerId",
    contractController.getFreelancerContracts.bind(contractController)
);

router.get(
    "/view-contract/:contractId",
    contractController.viewContractDetails.bind(contractController)
);

router.put(
    "/update-status/:contractId",
    authenticateToken,
    authorizeRoles('freelancer'),
    contractController.updateContractStatus.bind(contractController)
);

router.get(
    "/completed-works/:freelancerId",
    contractController.getCompletedContracts.bind(contractController)
)

export default router;