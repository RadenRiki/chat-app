import React from 'react';

const FriendList = ({ friends, onSelect }) => {
  return (
    <div className="friend-list">
      <h3>Friends List</h3>
      {friends.map((friend) => (
        <div 
          key={friend.id} 
          className="friend-item"
          onClick={() => onSelect(friend)}
        >
          {friend.email}
        </div>
      ))}
    </div>
  );
};

export default FriendList;