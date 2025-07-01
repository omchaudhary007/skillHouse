import { Messages } from "../../constants/messageConstants";
import { HttpStatus } from "../../constants/statusContstants";
import { UpdateQuery } from "mongoose";
import { IFreelancerContractService } from "../../interfaces/freelancer/contract/IFContractService";
import { IContract } from "../../models/client/contractModel";
import { createHttpError } from "../../utils/httpError";
import { IFreelancerContractRepository } from "../../interfaces/freelancer/contract/IFContractRepository";

function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
};

export class FreelancerContractService implements IFreelancerContractService {
    constructor(
        private _contractRepository: IFreelancerContractRepository
    ) {}

    async approveContract(contractId: string, freelancerId: string): Promise<IContract> {
        const contract = await this._contractRepository.getContractById(contractId);
        if (!contract) {
            throw createHttpError(HttpStatus.NOT_FOUND, Messages.CONTRACT_NOT_FOUND);
        }
    
        if (contract.freelancerId.toString() !== freelancerId) {
            throw createHttpError(HttpStatus.FORBIDDEN, Messages.ACCESS_DENIED);
        }
    
        const updatedContract = await this._contractRepository.updateContract(contractId, {
            isApproved: true,
        });
    
        if (!updatedContract) {
            throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, Messages.CONTRACT_STATUS_UPDATE_FAILED);
        }
        return updatedContract;
    };

    async updateContractStatus(
        contractId: string, 
        status: IContract["status"]
    ): Promise<IContract> {
    
        const contract = await this._contractRepository.getContractById(contractId);
    
        if (!contract) {
            throw createHttpError(HttpStatus.NOT_FOUND, Messages.CONTRACT_NOT_FOUND);
        }
    
        const validTransitions: Record<IContract["status"], IContract["status"][]> = {
            Pending: ["Started", "Canceled"],
            Started: ["Ongoing", "Canceled"],
            Ongoing: ["Completed", "Canceled"],
            Completed: [],
            Canceled: []
        };
    
        if (!validTransitions[contract.status].includes(status)) {
            throw createHttpError(HttpStatus.BAD_REQUEST, `Invalid status transition from ${contract.status} to ${status}`);
        }
    
        const updateData: UpdateQuery<IContract> = {
            status,
            $push: {
                statusHistory: {
                    status,
                    timestamp: formatDate(new Date())
                }
            }
        };

        console.log('UPDATED DATA', updateData);

        const updatedContract = await this._contractRepository.updateContract(contractId, updateData);

        console.log('UPDATED CONTRACT', updatedContract);
    
        if (!updatedContract) {
            throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, Messages.CONTRACT_STATUS_UPDATE_FAILED);
        }
    
        return updatedContract;
    }; 

    async getFreelancerContracts(freelancerId: string): Promise<IContract[]> {
        return await this._contractRepository.getContractsByFreelancer(freelancerId);
    };

    async getContractById(contractId: string): Promise<IContract | null> {
        const contract = await this._contractRepository.findOne({ 
            _id: contractId, 
            isDeleted: false 
        });
    
        if (!contract) return null;
    
        return await contract.populate([
            { path: "jobId", select: "title description rate" },
            { path: "clientId", select: "name email profilePic" },
            { path: "freelancerId", select: "name email profilePic" }
        ]);
    };     

    async getCompletedContracts(freelancerId: string): Promise<IContract[]> {
        return await this._contractRepository.getCompletedContractsByFreelancer(freelancerId);
    };    
}