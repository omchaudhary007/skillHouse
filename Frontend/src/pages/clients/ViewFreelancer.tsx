import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "@/api/freelancer/profileApi";
import { IContract, IFreelancer, Review } from "@/types/Types";
import { IoLocationOutline } from "react-icons/io5";
import { SiGithub } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import { LuGlobe } from "react-icons/lu";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { getCompletedWorks } from "@/api/freelancer/contractApi";
import { getFreelancerReviews } from "@/api/client/reviewApi";
import { Star } from "lucide-react";

const ViewFreelancer = () => {
  const { freelancerId } = useParams();
  const [profile, setProfile] = useState<IFreelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedWorks, setCompletedWorks] = useState<IContract[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const descriptionLimit = 50;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!freelancerId) return;
      try {
        const response = await getProfile(freelancerId);
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching freelancer profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [freelancerId]);

  useEffect(() => {
    const fetchCompletedWorks = async () => {
      if (!freelancerId) return;
      try {
        const response = await getCompletedWorks(freelancerId);
        setCompletedWorks(response.contracts || []);
      } catch (error) {
        console.error("Error fetching completed works:", error);
      }
    };

    fetchCompletedWorks();
  }, [freelancerId]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!freelancerId) return;
      try {
        const response = await getFreelancerReviews(freelancerId);
        setReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      }
    };

    fetchReviews();
  }, [freelancerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-center text-gray-600 mt-40">
        Freelancer profile not found.
      </p>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-950 flex justify-center p-6 mt-5">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-950 rounded-xl border border-gray-300 dark:border-gray-800 p-8 mt-16">
        {/* Profile Header */}
        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start">
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={profile.profilePic || "/default-profile.png"}
                alt="Profile"
                className="w-28 aspect-square rounded-full border border-gray-300 dark:border-gray-700 object-cover"
              />
            </div>

            {/* Name & Location */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:bg-gradient-to-r dark:from-emerald-400 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent">
                {profile.firstName}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-2">
                <IoLocationOutline className="text-xl" />{" "}
                {profile.city || "No city provided"}
              </p>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-900" />

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-[0.8fr_auto_1.6fr] gap-6">
          {/* Left Side - Personal Info */}
          <div className="space-y-7 text-black dark:text-white">
            <div>
              <h3 className="font-semibold font-sans">Experience Level</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {profile.experienceLevel || "No experience provided"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold font-sans">Languages</h3>
              {profile.language && profile.language.length > 0 ? (
                profile.language.map((lang, index) => (
                  <p key={index} className="text-gray-600 dark:text-gray-400">
                    {lang}
                  </p>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No languages specified
                </p>
              )}
            </div>
            <div>
              <h3 className="font-semibold font-sans">Linked Accounts</h3>
              <div className="flex flex-col gap-3 mt-2">
                {profile.linkedAccounts?.github && (
                  <Button
                    variant="outline"
                    className="w-48 flex items-center justify-center gap-2"
                    onClick={() =>
                      window.open(profile.linkedAccounts.github, "_blank")
                    }
                  >
                    <SiGithub className="w-6 h-6" />
                    GitHub
                  </Button>
                )}

                {profile.linkedAccounts?.linkedIn && (
                  <Button
                    variant="outline"
                    className="w-48 flex items-center justify-center gap-2"
                    onClick={() =>
                      window.open(profile.linkedAccounts.linkedIn, "_blank")
                    }
                  >
                    <FaLinkedin className="w-6 h-6" />
                    LinkedIn
                  </Button>
                )}

                {profile.linkedAccounts?.website && (
                  <Button
                    variant="outline"
                    className="w-48 flex items-center justify-center gap-2"
                    onClick={() =>
                      window.open(profile.linkedAccounts.website, "_blank")
                    }
                  >
                    <LuGlobe className="w-6 h-6" />
                    Website
                  </Button>
                )}

                {!profile.linkedAccounts?.github &&
                  !profile.linkedAccounts?.linkedIn &&
                  !profile.linkedAccounts?.website && (
                    <p className="text-gray-600 dark:text-gray-400">
                      No social links provided
                    </p>
                  )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold font-sans">Work Experience</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {profile?.employmentHistory &&
                profile.employmentHistory.length > 0 ? (
                  profile.employmentHistory.map((job, index) => (
                    <div key={job._id || index}>
                      <div>
                        <h3 className="font-semibold font-sans">
                          {job.company}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {job.position}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {job.duration}
                        </p>
                      </div>
                      {index < profile.employmentHistory.length - 1 && (
                        <hr className="border-gray-300 dark:border-gray-900 mt-6" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No employment history provided
                  </p>
                )}
              </p>
            </div>
          </div>

          <div className="w-px bg-gray-300 dark:bg-gray-900"></div>

          {/* Right Side - Summary, Skills */}
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              {profile.title || "No title provided"}
            </h2>
            <p className="mt-8 text-gray-600 dark:text-gray-400">
              {profile.bio || "No bio provided"}
            </p>
            <hr className="my-6 border-gray-300 dark:border-gray-900" />
            <h2 className="text-xl font-bold text-black dark:text-white mt-6">
              Skills
            </h2>
            <div className="flex flex-wrap gap-4 mt-3">
              {profile.skills.map((skill) => (
                <div
                  key={skill._id}
                  className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-3xl text-black dark:text-white font-semibold text-sm"
                >
                  {skill.name}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">
            Completed Works ({completedWorks.length})
          </h2>
          {completedWorks.length === 0 ? (
            <p className="text-gray-500">No completed works yet.</p>
          ) : (
            <div className="space-y-4">
              {completedWorks.map((contract) => (
                <div
                  key={contract._id}
                  className="p-4 border rounded-md shadow-sm bg-gray-200 dark:bg-gray-900"
                >
                  <h3 className="text-lg font-semibold text-primary">
                    {contract.jobId.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {expanded === contract._id
                      ? contract.jobId.description
                      : `${contract.jobId.description.slice(
                          0,
                          descriptionLimit
                        )}${
                          contract.jobId.description.length > descriptionLimit
                            ? "..."
                            : ""
                        }`}
                    {contract.jobId.description.length > descriptionLimit && (
                      <span
                        onClick={() =>
                          setExpanded(
                            expanded === contract._id ? null : contract._id
                          )
                        }
                        className="ml-2 text-blue-500 cursor-pointer hover:underline text-xs"
                      >
                        {expanded === contract._id ? "View Less" : "View More"}
                      </span>
                    )}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Client : </span>{" "}
                    {contract.clientId.name} ({contract.clientId.email})
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Budget : </span> &#8377;
                    {contract.jobId.rate}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Work status : </span>
                    {contract.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Client Reviews</h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={
                        review.clientId.profilePic ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(review.clientId.name)
                      }
                      alt={review.clientId.name}
                      className="w-8 h-8 rounded-full"
                    />

                    <span className="font-medium">{review.clientId.name}</span>
                  </div>

                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(review.rating)
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                        fill={
                          i < Math.floor(review.rating) ? "#facc15" : "none"
                        }
                      />
                    ))}
                    {review.rating % 1 !== 0 && (
                      <Star
                        className="w-4 h-4 text-yellow-400"
                        fill="url(#half)"
                      />
                    )}
                  </div>

                  <p className="text-sm dark:text-gray-300 text-gray-700">
                    {review.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFreelancer;
