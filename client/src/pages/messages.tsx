import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { getMessagesForUser, sendMessage } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import LoginModal from "@/components/auth/login-modal";
import SignupModal from "@/components/auth/signup-modal";
import { format } from "date-fns";
import { MessageSquare, Send, User } from "lucide-react";

export default function Messages() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Fetch user's messages
  const { data: messages, isLoading: isMessagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ["messages", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      return await getMessagesForUser(user.uid);
    },
    enabled: !!user,
  });

  // Group messages into conversations
  useEffect(() => {
    if (messages) {
      const conversationMap = new Map();
      
      messages.forEach((message: any) => {
        const otherUserId = message.senderId === user?.uid ? message.receiverId : message.senderId;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            messages: [],
            lastMessage: null,
            unreadCount: 0,
            displayName: message.senderName || message.receiverName || "User",
            photoURL: message.senderPhotoURL || message.receiverPhotoURL,
          });
        }
        
        const conversation = conversationMap.get(otherUserId);
        conversation.messages.push(message);
        
        // Update last message
        if (!conversation.lastMessage || new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = message;
        }
        
        // Count unread messages
        if (message.senderId !== user?.uid && !message.isRead) {
          conversation.unreadCount++;
        }
      });
      
      // Sort conversations by last message time
      const sortedConversations = Array.from(conversationMap.values()).sort((a, b) => {
        return new Date(b.lastMessage?.createdAt).getTime() - new Date(a.lastMessage?.createdAt).getTime();
      });
      
      setConversations(sortedConversations);
      
      // Select first conversation if none selected
      if (sortedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(sortedConversations[0].userId);
      }
    }
  }, [messages, user]);

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      await sendMessage(user.uid, selectedConversation, newMessage);
      setNewMessage("");
      await refetchMessages();
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Get current conversation
  const currentConversation = conversations.find(
    (conversation) => conversation.userId === selectedConversation
  );

  // If not logged in, show login prompt
  if (!isAuthLoading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign in to UniMarket</CardTitle>
            <CardDescription>
              You need to be logged in to view and send messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                className="flex-1" 
                onClick={() => setIsLoginModalOpen(true)}
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsSignupModalOpen(true)}
              >
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>

        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          openSignup={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
          }}
        />
        <SignupModal 
          isOpen={isSignupModalOpen} 
          onClose={() => setIsSignupModalOpen(false)} 
          openLogin={() => {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      </div>
    );
  }

  if (isAuthLoading || isMessagesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="flex h-[600px] border rounded-lg overflow-hidden">
          <div className="w-1/3 border-r">
            <div className="p-4 border-b">
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-2 flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-1/3" />
            </div>
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                  <Skeleton className={`h-10 w-2/3 rounded-lg`} />
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="flex h-[600px] border rounded-lg overflow-hidden">
        {/* Conversations sidebar */}
        <div className="w-1/3 border-r">
          <div className="p-4 border-b">
            <Input placeholder="Search messages..." />
          </div>
          <div className="overflow-y-auto h-[calc(600px-65px)]">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 
                    ${selectedConversation === conversation.userId ? 'bg-gray-100' : ''}`}
                  onClick={() => setSelectedConversation(conversation.userId)}
                >
                  <Avatar>
                    <AvatarImage src={conversation.photoURL} />
                    <AvatarFallback>
                      {conversation.displayName?.charAt(0) || <User className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{conversation.displayName}</h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(conversation.lastMessage.createdAt), 'h:mm a')}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <Badge className="ml-2">{conversation.unreadCount}</Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No messages yet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Conversation content */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && currentConversation ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={currentConversation.photoURL} />
                    <AvatarFallback>
                      {currentConversation.displayName?.charAt(0) || <User className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="font-medium">{currentConversation.displayName}</h2>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentConversation.messages.length > 0 ? (
                  currentConversation.messages
                    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((message: any) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] px-4 py-2 rounded-lg ${
                            message.senderId === user?.uid 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.uid ? 'text-primary-foreground/70' : 'text-gray-500'
                          }`}>
                            {format(new Date(message.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No messages in this conversation yet</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No conversation selected</h3>
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
