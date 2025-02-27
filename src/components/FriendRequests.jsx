import { useEffect, useState } from 'react';
import supabase from '../hooks/useSupabase';

export default function FriendRequests({ currentUser }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('friend_requests')
        .select('*, users!from_user(*)')
        .eq('to_user', currentUser.id)
        .eq('status', 'pending');

      setRequests(data || []);
    };

    fetchRequests();
  }, [currentUser]);

  const handleResponse = async (requestId, status) => {
    // Update status request
    await supabase
      .from('friend_requests')
      .update({ status })
      .eq('id', requestId);

    // Jika diterima, tambahkan ke friends
    if (status === 'accepted') {
      const request = requests.find(r => r.id === requestId);
      
      await supabase
        .from('friends')
        .insert([
          { user_id: currentUser.id, friend_id: request.from_user },
          { user_id: request.from_user, friend_id: currentUser.id }
        ]);
    }

    // Refresh list
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  return (
    <div className="friend-requests">
      <h3>Friend Requests</h3>
      {requests.map(request => (
        <div key={request.id} className="request-item">
          <span>{request.users.email}</span>
          <div className="actions">
            <button 
              onClick={() => handleResponse(request.id, 'accepted')}
              className="accept"
            >
              Accept
            </button>
            <button
              onClick={() => handleResponse(request.id, 'rejected')}
              className="reject"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}