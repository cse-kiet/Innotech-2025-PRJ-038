import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Save, X, Plus, Loader } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [contentMode, setContentMode] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);

  const allInterests = [
    // Computer Science
    "Machine Learning", "Deep Learning", "Computer Vision", "Natural Language Processing",
    "Reinforcement Learning", "Algorithms & Data Structures", "Distributed Systems", "Quantum Computing",
    // Physics & Mathematics
    "Quantum Physics", "Theoretical Physics", "Applied Mathematics", "Statistical Mechanics",
    "Topology", "Number Theory",
    // Biology & Medicine
    "Genomics", "Neuroscience", "Bioinformatics", "Drug Discovery", "Synthetic Biology", "Immunology",
    // Engineering
    "Robotics", "Materials Science", "Nanotechnology", "Aerospace Engineering",
    "Chemical Engineering", "Electrical Engineering",
    // Social Sciences
    "Economics", "Psychology Research", "Sociology", "Political Science", "Behavioral Science"
  ];

  const contentModes = [
    { id: 'researcher', label: 'Research Papers', emoji: '📚', description: 'Academic papers from ArXiv' },
    { id: 'hobbyist', label: 'Medium Articles', emoji: '📰', description: 'Stories and articles from Medium' }
  ];

  // Fetch user profile on component mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (user) {
          // Fetch user profile
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error loading profile:', error);
          } else {
            setProfile(data);
            setBio(data.bio || "");
            setContentMode(data.content_mode || 'researcher');
          }

          // Fetch user interests
          const { data: interestsData, error: interestsError } = await supabase
            .from('user_interests')
            .select('interest_name')
            .eq('user_id', user.id);
          
          if (!interestsError && interestsData) {
            setInterests(interestsData.map(i => i.interest_name));
          }
        }
      } catch (error) {
        console.error('Error:', error.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, []);

  // Update content mode
  const handleUpdateContentMode = async (newMode) => {
    if (!profile) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('users')
        .update({ content_mode: newMode })
        .eq('id', profile.id);
      
      if (!error) {
        setContentMode(newMode);
        setProfile({ ...profile, content_mode: newMode });
        console.log('✅ Content mode updated');
      }
    } catch (error) {
      console.error('Error updating content mode:', error);
      alert('Failed to update content mode');
    } finally {
      setSaving(false);
    }
  };

  // Update bio
  const handleUpdateBio = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('users')
        .update({ bio })
        .eq('id', profile.id);
      
      if (!error) {
        setEditingBio(false);
        console.log('✅ Bio updated');
      }
    } catch (error) {
      console.error('Error updating bio:', error);
      alert('Failed to update bio');
    } finally {
      setSaving(false);
    }
  };

  // Add interest
  const handleAddInterest = async (interest) => {
    if (interests.includes(interest) || !profile) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('user_interests')
        .insert({ 
          user_id: profile.id, 
          interest_name: interest 
        });
      
      if (!error) {
        setInterests([...interests, interest]);
        console.log('✅ Interest added');
      }
    } catch (error) {
      console.error('Error adding interest:', error);
      alert('Failed to add interest');
    } finally {
      setSaving(false);
    }
  };

  // Remove interest
  const handleRemoveInterest = async (interest) => {
    if (!profile) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', profile.id)
        .eq('interest_name', interest);
      
      if (!error) {
        setInterests(interests.filter(i => i !== interest));
        console.log('✅ Interest removed');
      }
    } catch (error) {
      console.error('Error removing interest:', error);
      alert('Failed to remove interest');
    } finally {
      setSaving(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
      alert('Error logging out');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F3E5D8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47] mx-auto mb-4"></div>
          <p className="text-[#4a3c28]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#F3E5D8] min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#4a3c28]">Error loading profile</div>
      </div>
    );
  }

  return (
    <div className="bg-[#F3E5D8] text-[#4a3c28] min-h-screen py-10">
      <main className="max-w-4xl mx-auto px-6 space-y-8">

        {/* Profile Header */}
        <section className="bg-white shadow-lg p-8 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={profile.avatar_url || "https://i.pravatar.cc/150?img=12"}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-[#C6B29A] object-cover"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-[#3b2f20]">
                {profile.full_name || 'User'} 👋
              </h2>
              <p className="text-[#4a3c28b3] mt-2">{profile.email}</p>
            </div>
          </div>
        </section>

        {/* Bio Section */}
        <section className="bg-white shadow-md p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">About You</h3>
            {!editingBio && (
              <button
                onClick={() => setEditingBio(true)}
                className="text-sm text-[#d18b2a] hover:underline"
              >
                ✏️ Edit
              </button>
            )}
          </div>
          
          {editingBio ? (
            <div className="space-y-4">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 border border-[#e5d3b3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d18b2a]"
                rows="3"
                placeholder="Tell us about yourself..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateBio}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#d18b2a] hover:bg-[#c17a1f] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
                >
                  {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingBio(false);
                    setBio(profile.bio || "");
                  }}
                  className="flex items-center gap-2 text-[#4a3c28] border border-[#e5d3b3] px-4 py-2 rounded-lg hover:bg-[#f8f1e4]"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[#4a3c28b3]">
              {bio || "No bio added yet. Click edit to add one!"}
            </p>
          )}
        </section>

        {/* Content Mode Selection */}
        <section className="bg-white shadow-md p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Content Mode</h3>
            <p className="text-sm text-[#4a3c28b3]">Choose what you want to see</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleUpdateContentMode(mode.id)}
                disabled={saving}
                className={`p-4 rounded-xl border-2 transition ${
                  contentMode === mode.id
                    ? 'border-[#d18b2a] bg-[#f8f1e4]'
                    : 'border-[#e5d3b3] bg-white hover:border-[#d18b2a]'
                }`}
              >
                <div className="text-2xl mb-2">{mode.emoji}</div>
                <div className="font-semibold text-left">{mode.label}</div>
                <div className="text-xs text-[#4a3c28b3] text-left mt-1">{mode.description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Interests Management */}
        <section className="bg-white shadow-md p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Your Interests</h3>
            {!editingInterests && (
              <button
                onClick={() => setEditingInterests(true)}
                className="text-sm text-[#d18b2a] hover:underline flex items-center gap-1"
              >
                <Plus size={16} />
                Add Interest
              </button>
            )}
          </div>
          
          {/* Selected Interests */}
          {interests.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-[#4a3c28b3] mb-3">Selected:</p>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <div
                    key={interest}
                    className="bg-[#d18b2a] text-white px-3 py-2 rounded-full flex items-center gap-2"
                  >
                    <span>{interest}</span>
                    <button
                      onClick={() => handleRemoveInterest(interest)}
                      disabled={saving}
                      className="hover:text-red-200 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Interests UI */}
          {editingInterests && (
            <div className="space-y-3 p-4 bg-[#f8f1e4] rounded-lg">
              <p className="text-sm text-[#4a3c28b3]">Choose interests to follow:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {allInterests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleAddInterest(interest)}
                    disabled={interests.includes(interest) || saving}
                    className={`p-2 rounded-lg text-sm transition ${
                      interests.includes(interest)
                        ? 'bg-[#d18b2a] text-white cursor-not-allowed'
                        : 'bg-white border border-[#e5d3b3] hover:border-[#d18b2a] text-[#4a3c28]'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setEditingInterests(false)}
                className="w-full bg-[#d18b2a] text-white px-4 py-2 rounded-lg hover:bg-[#c17a1f]"
              >
                Done
              </button>
            </div>
          )}
        </section>

        {/* Account Settings */}
        <section className="bg-white shadow-md p-6 rounded-2xl">
          <h3 className="font-semibold text-lg mb-4">Account Settings</h3>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition font-medium"
          >
            🚪 Logout
          </button>
        </section>

      </main>
    </div>
  );
};

export default Profile;