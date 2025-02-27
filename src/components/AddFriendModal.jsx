import { useState } from 'react';
import supabase from '../hooks/useSupabase';

export default function AddFriendModal({ currentUser, onClose }) {
  const [friendId, setFriendId] = useState('');

  const handleAddFriend = async () => {
    const { error } = await supabase
      .from('friend_requests')
      .insert([{ 
        from_user: currentUser.id,
        to_user: friendId,
        status: 'pending'
      }]);

    if (!error) {
      alert('Friend request sent!');
      onClose();
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Friend</h2>
        <input
          type="text"
          placeholder="Friend's User ID"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
        />
        <div className="actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleAddFriend}>Send Request</button>
        </div>
      </div>
    </div>
  );
}