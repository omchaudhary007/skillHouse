import express from 'express'
import { ProfileRepository } from '../../repository/freelancer/profileRepository'
import { ProfileService } from '../../services/freelancer/profileService'
import { ProfileController } from '../../controllers/freelancer/profileController'
import upload from '../../config/multer'
import { authenticateToken, authorizeRoles } from '../../middlewares/authMiddleware'

const router = express.Router()

const profileRepository = new ProfileRepository()
const profileService = new ProfileService(profileRepository)
const profileController = new ProfileController(profileService)

router.get(
    "/get-profile/:id",
    profileController.getProfile.bind(profileController)
);

router.put(
    "/update-profile/:id",
    authenticateToken,
    authorizeRoles('freelancer'),
    profileController.updateProfile.bind(profileController)
);

router.post(
    "/upload-image/:id",
    authenticateToken,
    authorizeRoles('freelancer'),
    upload.single("profilePic"),
    profileController.uploadProfileImage.bind(profileController)
);

export default router