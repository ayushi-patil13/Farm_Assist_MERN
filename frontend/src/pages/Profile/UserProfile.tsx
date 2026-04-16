import React, { useState, useEffect } from "react";
import { useIonRouter } from "@ionic/react";
import axios from "axios";
import "./UserProfile.css";
import Footer from "../../components/Footer";
import API from "../../services/api";

interface UserProfile {
  name: string;
  phone: string;
  state: string;
  district: string;
  farmArea: string;
  activeCrops: number;
  forumPosts: number;
  consultations: number;
  languagePreference: string;
  memberSince: string;
}

interface Crop {
  _id: string;
  cropName: string;
  status: string;
}

const Profile: React.FC = () => {
  const router = useIonRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCrops, setActiveCrops] = useState<Crop[]>([]);

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    phone: "",
    state: "",
    district: "",
    farmArea: "",
    activeCrops: 0,
    forumPosts: 0,
    consultations: 0,
    languagePreference: "English",
    memberSince: "",
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);


  interface ProfileResponse {
  user: {
    name: string;
    phone: string;
    createdAt: string;
  };
  profile: {
    state: string;
    district: string;
    farmArea: string;
    activeCrops: number;
    forumPosts: number;
    consultations: number;
    languagePreference: string;
  } | null;
}

  // ✅ FETCH PROFILE FROM BACKEND
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

const res = await axios.get<ProfileResponse>(
  "http://localhost:5000/api/profile",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);          

        const { user, profile } = res.data;

        // 🔥 Fetch Active Crops
        interface Crop {
          _id: string;
          cropName: string;
          status: string;
        }

        const cropsRes = await axios.get<Crop[]>(
          "http://localhost:5000/api/crops/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const activeCropsCount = cropsRes.data.filter(
          (crop: any) => crop.status === "Active"
        ).length;

        const formattedProfile: UserProfile = {
          name: user.name || "",
          phone: user.phone || "",
          state: profile?.state || "",
          district: profile?.district || "",
          farmArea: profile?.farmArea || "",
          activeCrops: activeCropsCount,
          forumPosts: profile?.forumPosts || 0,
          consultations: profile?.consultations || 0,
          languagePreference: profile?.languagePreference || "English",
          memberSince: new Date(user.createdAt).toLocaleDateString(),
        };

        setProfile(formattedProfile);
        console.log("ayushi",formattedProfile);
        setEditedProfile(formattedProfile);
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = async () => {
  if (isEditing) {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/profile",
        {
          farmArea: editedProfile.farmArea,
          languagePreference: editedProfile.languagePreference,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(editedProfile);
      setIsEditing(false);
      alert("Profile updated successfully");

    } catch (error) {
      console.error("Error saving profile", error);
      alert("Failed to save profile");
    }

  } else {
    setEditedProfile(profile);
    setIsEditing(true);
  }
};

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login", "root");
  };

  const settingsItems = [
    { icon: "🌐", title: "Language Preference", subtitle: profile.languagePreference },
    { icon: "🔔", title: "Notification Settings", subtitle: "Manage alerts and reminders" },
    { icon: "🔒", title: "Privacy & Security", subtitle: "Manage your privacy settings" },
  ];

  const helpItems = [
    { title: "Terms & Conditions" },
    { title: "Privacy Policy" },
    { title: "Help Center" },
    { title: "About FarmAssist" },
  ];

  if (loading) {
    return <div className="appContainer">Loading...</div>;
  }

  return (
    <div className="appContainer">
      <div className="pageWrapper">
        <header className="profileHeader">
          <div className="profileHeaderContent">
            <h1 className="profileTitle">My Profile</h1>
            <button
              className={`editButton ${isEditing ? "editing" : ""}`}
              onClick={handleEdit}
            >
              {isEditing ? "✓" : "✏"}
            </button>
          </div>
        </header>

        <main className="mainContent">
          <div className="contentWrapper">
            {/* Avatar Section */}
            <div className="profileCard">
              <div className="avatarSection">
                <div className="avatar">
                  <span className="avatarIcon">👤</span>
                </div>
                <div className="profileName">
                  {isEditing ? editedProfile.name : profile.name}
                </div>
                <div className="profileSince">
                  Farmer since {profile.memberSince}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="infoCard">
              <div className="cardHeader">
                <span className="cardIcon">👤</span>
                <h2 className="cardTitle">Personal Information</h2>
              </div>

              <div className="formGroup">
                <label className="formLabel">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="formInput editable"
                    value={editedProfile.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                ) : (
                  <div className="formValue">{profile.name}</div>
                )}
              </div>

              <div className="formGroup">
                <label className="formLabel">Mobile Number</label>
                <div className="formValue readonly">
                  📞 {profile.phone}
                </div>
                <div className="fieldNote">Cannot be changed</div>
              </div>
            </div>

            {/* Location */}
            <div className="infoCard">
              <div className="cardHeader">
                <span className="cardIcon">📍</span>
                <h2 className="cardTitle">Location Details</h2>
              </div>

              <div className="formGroup">
                <label className="formLabel">State</label>
                <div className="formValue">{profile.state}</div>
              </div>

              <div className="formGroup">
                <label className="formLabel">District</label>
                <div className="formValue">{profile.district}</div>
              </div>
            </div>

            {/* Farm Info */}
            <div className="infoCard">
              <div className="cardHeader">
                <span className="cardIcon">🌾</span>
                <h2 className="cardTitle">Farm Information</h2>
              </div>

              <div className="formGroup">
                <label className="formLabel">Total Farm Area</label>
                {isEditing ? (
                  <div className="inputWithUnit">
                    <input
                      type="number"
                      className="formInput editable"
                      value={editedProfile.farmArea}
                      onChange={(e) =>
                        handleChange("farmArea", e.target.value)
                      }
                    />
                    <span className="inputUnit">acres</span>
                  </div>
                ) : (
                  <div className="formValue">
                    {profile.farmArea} acres
                  </div>
                )}
              </div>
            </div>

            {/* Activity */}
            <div className="activityCard">
              <div className="cardHeader">
                <span className="cardIcon">📊</span>
                <h2 className="cardTitle">Your Activity</h2>
              </div>

              <div className="activityStats">
                <div className="statItem">
                  <div className="statValue">{profile.activeCrops}</div>
                  <div className="statLabel">Active Crops</div>
                </div>
                <div className="statItem">
                  <div className="statValue">{profile.forumPosts}</div>
                  <div className="statLabel">Forum Posts</div>
                </div>
                <div className="statItem">
                  <div className="statValue">{profile.consultations}</div>
                  <div className="statLabel">Consultations</div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button className="logoutButton" onClick={handleLogout}>
              🚪 Logout
            </button>

            {isEditing && (
              <button className="cancelButton" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Profile;