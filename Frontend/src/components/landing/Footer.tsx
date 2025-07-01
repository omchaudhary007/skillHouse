import { motion } from "framer-motion";
import { FaLinkedin, FaXTwitter, FaGlobe } from "react-icons/fa6";

const Footer = () => {
    return (
        <motion.footer
            className="bg-gray-100 dark:bg-gray-900 py-10 mt-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }}
        >
            {/* Footer Content */}
            <div className="w-[90%] lg:w-[80%] mx-auto flex flex-col md:flex-row justify-between items-center md:items-start space-y-6 md:space-y-0 md:space-x-10 text-gray-900 dark:text-white">
                
                {/* Left Section */}
                <div className="text-center md:text-left">
                    <h3 className="text-md font-semibold mt-4">Follow me</h3>
                    <div className="flex justify-center md:justify-start space-x-4 mt-2">
                        <a href="https://www.linkedin.com/in/omchaudhary07/" target="_blank" rel="noopener noreferrer">
                            <FaLinkedin className="w-6 h-6 cursor-pointer hover:text-blue-700 transition" />
                        </a>
                        <a href="https://twitter.com/omchaudhary_07" target="_blank" rel="noopener noreferrer">
                            <FaXTwitter className="w-6 h-6 cursor-pointer hover:text-blue-400 transition" />
                        </a>
                        <a href="https://omchaudhary.vercel.app/" target="_blank" rel="noopener noreferrer">
                            <FaGlobe className="w-6 h-6 cursor-pointer hover:text-green-500 transition" />
                        </a>
                    </div>
                </div>

                {/* Middle Section */}
                <div className="text-center">
                    <h3 className="text-md font-semibold">About me</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:underline">Feedback</p>
                </div>

                {/* Right Section */}
                <div className="text-center md:text-right">
                    <h3 className="text-md font-semibold">Contact me</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">omchaudhary0730@gmail.com</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">+91 123456789</p>
                </div>
            </div>

            {/* Horizontal Line */}
            <hr className="w-[90%] lg:w-[80%] mx-auto my-6 border-gray-300 dark:border-gray-700" />

            {/* Copyright Section */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                © 2025 Skillhouse. All rights reserved.
            </p>
        </motion.footer>
    );
};

export default Footer;