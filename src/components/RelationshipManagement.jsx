import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { FiPaperclip, FiSmile, FiSend, FiImage, FiFile } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

const RelationshipManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('communication');
  const [selectedSupplier, setSelectedSupplier] = useState(location.state?.selectedSupplier || null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const suppliers = [
    { 
      id: 1, 
      name: 'Tech Solutions Inc.', 
      status: 'Online', 
      lastActive: '2 mins ago', 
      avatar: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=0D8ABC&color=fff',
      contact: {
        email: 'contact@techsolutions.com',
        phone: '+1 (555) 123-4567',
        address: '123 Tech Street, Silicon Valley, CA'
      }
    },
    { 
      id: 2, 
      name: 'Office Pro Supplies', 
      status: 'Offline', 
      lastActive: '1 hour ago', 
      avatar: 'https://ui-avatars.com/api/?name=Office+Pro&background=7C3AED&color=fff',
      contact: {
        email: 'support@officepro.com',
        phone: '+1 (555) 987-6543',
        address: '456 Office Avenue, Business District, NY'
      }
    },
    { 
      id: 3, 
      name: 'Global IT Services', 
      status: 'Online', 
      lastActive: '5 mins ago', 
      avatar: 'https://ui-avatars.com/api/?name=Global+IT&background=059669&color=fff',
      contact: {
        email: 'info@globalit.com',
        phone: '+1 (555) 456-7890',
        address: '789 Global Plaza, Tech Hub, TX'
      }
    }
  ];

  // Initialize chat when supplier is selected
  useEffect(() => {
    if (selectedSupplier) {
      fetchChatHistory();
    }
  }, [selectedSupplier]);

  // Fetch chat history from Supabase
  const fetchChatHistory = async () => {
    if (!selectedSupplier) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('supplier_chats')
        .select('*')
        .eq('supplier_id', selectedSupplier.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatHistory(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!selectedSupplier) return;

    const channel = supabase
      .channel(`supplier_chats_${selectedSupplier.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'supplier_chats',
          filter: `supplier_id=eq.${selectedSupplier.id}`
        },
        (payload) => {
          setChatHistory(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSupplier]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;
    if (!selectedSupplier) return;

    try {
      const newMessage = {
        supplier_id: selectedSupplier.id,
        sender: 'user',
        text: message,
        attachments: attachments,
        created_at: new Date().toISOString(),
        status: 'sent'
      };

      const { error } = await supabase
        .from('supplier_chats')
        .insert([newMessage]);

      if (error) throw error;

      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [];

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${selectedSupplier.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        newAttachments.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: filePath
        });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleTyping = () => {
    setIsTyping(true);
    // Notify supplier that user is typing
    supabase
      .from('typing_status')
      .upsert({ 
        supplier_id: selectedSupplier.id,
        is_typing: true,
        last_typed: new Date().toISOString()
      });

    // Clear typing status after 3 seconds
    setTimeout(() => {
      setIsTyping(false);
      supabase
        .from('typing_status')
        .upsert({ 
          supplier_id: selectedSupplier.id,
          is_typing: false,
          last_typed: new Date().toISOString()
        });
    }, 3000);
  };

  const renderAttachment = (attachment) => {
    if (attachment.type.startsWith('image/')) {
      return (
        <div className="relative w-32 h-32">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            onClick={() => setAttachments(prev => prev.filter(a => a.url !== attachment.url))}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            ×
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
        <FiFile className="text-gray-500" />
        <span className="text-sm">{attachment.name}</span>
        <button
          onClick={() => setAttachments(prev => prev.filter(a => a.url !== attachment.url))}
          className="text-red-500"
        >
          ×
        </button>
      </div>
    );
  };

  const tabs = [
    { id: 'communication', label: 'Supplier Communication' },
    { id: 'performance', label: 'Performance Monitoring' },
    { id: 'compliance', label: 'Risk and Compliance' }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Relationship Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor your supplier relationships effectively</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 relative
              ${activeTab === tab.id 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'communication' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Supplier Communication</h2>
            <div className="grid grid-cols-12 gap-6 h-[600px]">
              {/* Supplier List */}
              <div className="col-span-3 bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-4">Suppliers</h3>
                <div className="space-y-4">
                  {suppliers.map(supplier => (
                    <div
                      key={supplier.id}
                      className={`w-full rounded-lg transition-colors ${
                        selectedSupplier?.id === supplier.id
                          ? 'bg-blue-100'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="p-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={supplier.avatar}
                            alt={supplier.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{supplier.name}</span>
                              <span className={`w-2 h-2 rounded-full ${
                                supplier.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                            <span className="text-sm text-gray-500">{supplier.lastActive}</span>
                          </div>
                        </div>
                        
                        {/* Contact Details */}
                        <div className="mt-3 pl-13 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{supplier.contact.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{supplier.contact.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{supplier.contact.address}</span>
                          </div>
                        </div>

                        {/* Chat Button */}
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => setSelectedSupplier(supplier)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Chat Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="col-span-9 flex flex-col bg-white border rounded-lg">
                {selectedSupplier ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b">
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedSupplier.avatar}
                          alt={selectedSupplier.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-medium text-gray-800">{selectedSupplier.name}</h3>
                          <span className="text-sm text-gray-500">
                            {selectedSupplier.status === 'Online' ? 'Online' : 'Last seen ' + selectedSupplier.lastActive}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        chatHistory.map(msg => (
                          <div
                            key={msg.id}
                            className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.sender === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p>{msg.text}</p>
                              {msg.attachments?.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {msg.attachments.map(attachment => renderAttachment(attachment))}
                                </div>
                              )}
                              <span className="text-xs opacity-70 mt-1 block">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                      {isTyping && (
                        <div className="flex justify-start mb-4">
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t">
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {attachments.map(attachment => renderAttachment(attachment))}
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <div className="flex-1 flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById('file-upload').click()}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FiPaperclip className="w-5 h-5" />
                          </button>
                          <input
                            type="file"
                            id="file-upload"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FiSmile className="w-5 h-5" />
                          </button>
                          <input
                            type="text"
                            value={message}
                            onChange={(e) => {
                              setMessage(e.target.value);
                              handleTyping();
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FiSend className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a supplier to start chatting
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Performance Monitoring</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Key Performance Indicators</h3>
                <p className="text-gray-600">Track and analyze supplier performance metrics</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Performance Reports</h3>
                <p className="text-gray-600">Generate and view detailed performance reports</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Risk and Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Risk Assessment</h3>
                <p className="text-gray-600">Evaluate and monitor supplier-related risks</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Compliance Tracking</h3>
                <p className="text-gray-600">Track supplier compliance with regulations and requirements</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipManagement; 