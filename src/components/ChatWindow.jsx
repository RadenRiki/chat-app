import { useState, useEffect } from 'react';
import supabase from '../hooks/useSupabase';

export default function ChatWindow({ currentUser, friend }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${friend.id}),` +
          `and(sender_id.eq.${friend.id},receiver_id.eq.${currentUser.id})`
        )
        .order('created_at', { ascending: true });

      setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
    .channel('realtime-messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(
          and(sender_id.eq.${currentUser.id},receiver_id.eq.${friend.id}),
          and(sender_id.eq.${friend.id},receiver_id.eq.${currentUser.id})
        )`
      },
      (payload) => {
        // Filter duplikat pesan
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === payload.new.id);
          return exists ? prev : [...prev, payload.new];
        });
      }
    )
    .subscribe();

    // Perbaikan posisi cleanup function
    return () => {
        supabase.removeChannel(channel);
    };
    }, [currentUser, friend]); // Pastikan dependency array benar

const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    // Buat pesan sementara
    const tempMessage = {
      id: Date.now(), // ID sementara
      sender_id: currentUser.id,
      receiver_id: friend.id,
      content: newMessage,
      created_at: new Date().toISOString()
    };
  
    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
  
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: currentUser.id,
          receiver_id: friend.id,
          content: newMessage
        }]);
  
      if (error) {
        // Rollback jika gagal
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        throw error;
      }
    } catch (error) {
      alert("Failed to send message: " + error.message);
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`message ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}