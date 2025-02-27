import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../hooks/useSupabase';
import FriendList from '../components/FriendList';
import ChatWindow from '../components/ChatWindow';
import AddFriendModal from '../components/AddFriendModal';
import FriendRequests from '../components/FriendRequests'; // Pastikan import komponen ini

export default function Dashboard() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Perbaikan query friends
  useEffect(() => {
    const fetchFriends = async () => {
      const { data } = await supabase
        .from('friends')
        .select(`
          friend_id,
          users!friend_id(id, email)
        `)
        .eq('user_id', user.id);

      if (data) {
        const friends = data.map(f => f.users);
        setFriends(friends);
      }
    };

    if (user) fetchFriends(); // Pastikan memanggil fetchFriends bukan fetchRequests
  }, [user]);

  return (
    <div className="dashboard">
      <div className="header">
        <h2>User ID: {user?.id}</h2>
        <div className="controls">
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          <button onClick={() => setShowRequests(true)}>Friend Requests</button>
          <button onClick={() => setShowAddFriend(true)}>Add Friend</button>
        </div>
      </div>

      <div className="content">
        <FriendList 
          friends={friends}
          onSelect={setSelectedFriend}
        />
        
        {selectedFriend && (
          <ChatWindow 
            currentUser={user}
            friend={selectedFriend}
          />
        )}
      </div>

      {showAddFriend && (
        <AddFriendModal
          currentUser={user}
          onClose={() => setShowAddFriend(false)}
        />
      )}

      {showRequests && (
        <div className="requests-modal">
          <div className="modal-content">
            <button 
              className="close" 
              onClick={() => setShowRequests(false)}
            >
              &times;
            </button>
            <FriendRequests currentUser={user} />
          </div>
        </div>
      )}
    </div>
  );
}