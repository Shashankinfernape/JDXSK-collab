import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { RiSparklingFill } from 'react-icons/ri';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// --- Animations ---

const wave = keyframes`
  0% { height: 10px; }
  50% { height: 30px; }
  100% { height: 10px; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const AssistantContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TriggerButton = styled.button`
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.icon};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
  }

  ${props => props.$isListening && css`
    color: ${props.theme.colors.primary};
    background-color: ${props.theme.colors.hoverBackground};
    box-shadow: 0 0 15px ${props.theme.colors.primary}40;
  `}

  .sparkle {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 0.7rem;
    color: ${props => props.theme.colors.primary};
  }
`;

const Overlay = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 300px;
  background: ${props => props.theme.colors.panelBackground};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -5px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
  animation: ${fadeIn} 0.3s ease-out;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const StatusText = styled.h2`
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-size: 1.5rem;
  text-align: center;
`;

const TranscriptText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 80%;
  text-align: center;
  font-style: italic;
  min-height: 1.5em; 
`;

const WaveContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  margin-bottom: 2rem;
`;

const WaveBar = styled.div`
  width: 6px;
  background: ${props => props.theme.colors.primary};
  border-radius: 3px;
  animation: ${wave} 1s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;

  ${props => props.primary ? css`
    background: ${props.theme.colors.primary};
    color: white;
  ` : css`
    background: ${props.theme.colors.inputBackground};
    color: ${props.theme.colors.textPrimary};
  `}

  &:hover {
    opacity: 0.9;
  }
`;

const HintText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-top: 1rem;
  opacity: 0.8;
  animation: ${fadeIn} 0.5s ease-in;
`;

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Listening...');
  const [hintIndex, setHintIndex] = useState(0);

  const hints = [
      "Try: 'Ping Eshwar: Are you free?'",
      "Try: 'Open Alice'",
      "Try: 'Tell Bob I am driving'",
      "Try: 'Search Sunil'"
  ];

  useEffect(() => {
      if (isListening) {
          const interval = setInterval(() => {
              setHintIndex(prev => (prev + 1) % hints.length);
          }, 4000);
          return () => clearInterval(interval);
      }
  }, [isListening, hints.length]);

  const { chats, sendMessageToChat, addNewChat, selectChat } = useChat();
  const { user } = useAuth();
  
  const chatsRef = useRef(chats);
  const sendMessageRef = useRef(sendMessageToChat);
  const addNewChatRef = useRef(addNewChat);
  const selectChatRef = useRef(selectChat);
  const userRef = useRef(user);

  useEffect(() => {
      chatsRef.current = chats;
      sendMessageRef.current = sendMessageToChat;
      addNewChatRef.current = addNewChat;
      selectChatRef.current = selectChat;
      userRef.current = user;
  }, [chats, sendMessageToChat, addNewChat, selectChat, user]);
  
  const recognitionRef = useRef(null);
  const silenceTimer = useRef(null);

  // --- NEW SIMPLIFIED LOGIC ---

  // 1. Simple Word Normalizer
  const normalize = (text) => text.toLowerCase().replace(/[.,?!]/g, '').trim();

  // 2. Linear Processor
  const processCommand = useCallback(async (rawText) => {
      if (!rawText) { setIsListening(false); return; }
      
      setFeedback("Processing..."); // Immediate Feedback
      const text = normalize(rawText);
      console.log("Voice Command (Clean):", text);

      let targetName = null;
      let targetChat = null;
      let messageContent = "";
      let commandType = "message"; // "message" or "open"

      // A. Check for "Open/Search/Go To"
      if (text.startsWith("open") || text.startsWith("go to") || text.startsWith("search") || text.startsWith("show")) {
          commandType = "open";
          // Remove command word
          const words = text.split(' ');
          words.shift(); // Remove first word
          if (words[0] === "to") words.shift(); // Remove "to" if "go to"
          targetName = words.join(' '); // Remainder is name
      } 
      
      // B. Scan for Known Contacts (Longest Match First)
      if (!targetName) {
          const allContacts = [];
          chatsRef.current.forEach(c => {
              if (c.isGroup) {
                  allContacts.push({ name: c.groupName, chat: c });
              } else {
                  const p = c.participants.find(p => p._id !== userRef.current?._id);
                  if (p) allContacts.push({ name: p.name, chat: c });
              }
          });

          // Sort by name length desc (e.g. "John Doe" before "John")
          allContacts.sort((a, b) => b.name.length - a.name.length);

          for (const contact of allContacts) {
              const cName = normalize(contact.name);
              // Check if the command *contains* this name
              if (text.includes(cName)) {
                  targetName = contact.name;
                  targetChat = contact.chat;
                  
                  // Extract message: Remove name and command words
                  let temp = text.replace(cName, "").trim();
                  const fillers = ["say", "tell", "ask", "ping", "message", "text", "to", "that", "about", "msg", "send", "is", "are"];
                  let words = temp.split(' ');
                  
                  // Clean from start
                  while(words.length > 0 && fillers.includes(words[0])) words.shift();
                  // Clean from end
                  while(words.length > 0 && fillers.includes(words[words.length-1])) words.pop();
                  
                  messageContent = words.join(' ');
                  break; 
              }
          }
      }

      // C. Global Search Fallback (if name extracted but no local chat found)
      if (!targetChat && targetName && commandType === "open") {
           // We have a name from "Open X", try global search
           setFeedback(`Searching directory for "${targetName}"...`);
           try {
               const { data: users } = await api.get(`/users/search?q=${targetName}`);
               if (users && users.length > 0) {
                   const bestUser = users[0];
                   // Create chat
                   const { data: newChat } = await api.post('/chats', { recipientId: bestUser._id });
                   targetChat = newChat;
                   if (addNewChatRef.current) addNewChatRef.current(newChat);
               }
           } catch(e) { console.error(e); }
      }

      // D. Execute
      if (targetChat) {
          const partnerName = targetChat.isGroup 
              ? targetChat.groupName 
              : targetChat.participants.find(p => p._id !== userRef.current?._id)?.name;

          if (commandType === "open") {
              setFeedback(`Opening ${partnerName}`);
              if (selectChatRef.current) selectChatRef.current(targetChat);
              setTimeout(() => setIsListening(false), 1000);
          } else {
              // Message Mode
              if (!messageContent) messageContent = "👋"; // Default if empty?
              
              // Simple POV fix
              messageContent = messageContent
                  .replace(/\bhe\b/g, "you")
                  .replace(/\bshe\b/g, "you")
                  .replace(/\bhis\b/g, "your")
                  .replace(/\bher\b/g, "your");

              // Fix: Capitalize first letter
              messageContent = messageContent.charAt(0).toUpperCase() + messageContent.slice(1);

              setFeedback(`Sent to ${partnerName}: "${messageContent}"`);
              
              // Direct Send (Reliable)
              if (sendMessageRef.current) {
                  sendMessageRef.current(targetChat._id, messageContent);
              }
              setTimeout(() => setIsListening(false), 1500);
          }
      } else {
          setFeedback("Couldn't find that contact.");
          setTimeout(() => setIsListening(false), 2000);
      }
  }, []); // Dependencies are Refs, so array is empty

  const transcriptRef = useRef(''); // CRITICAL: Access text without state lag

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setFeedback('Listening...');
        setTranscript('');
        transcriptRef.current = ''; // Reset ref
        
        // Safety: Hard stop after 5 seconds of silence
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => {
            console.log("Safety timeout: Stopping...");
            if (recognitionRef.current) recognitionRef.current.stop();
        }, 5000);
      };

      recognitionRef.current.onspeechend = () => {
          console.log("Speech ended (Native)");
          if (recognitionRef.current) recognitionRef.current.stop();
      };

      recognitionRef.current.onresult = (event) => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
        transcriptRef.current = currentText; // Update ref immediately

        // Manual backup timer
        silenceTimer.current = setTimeout(() => {
            if (recognitionRef.current) recognitionRef.current.stop();
        }, 1000); 
      };

      recognitionRef.current.onend = () => {
          setIsListening(false);
          // DIRECT HANDOFF: Use ref to get text immediately
          const finalParam = transcriptRef.current;
          if (finalParam && finalParam.length > 1) {
              console.log("onend triggered. Processing:", finalParam);
              processCommand(finalParam);
          } else {
              console.log("onend triggered but empty transcript.");
          }
      };
      
      recognitionRef.current.onerror = (e) => {
          console.error(e);
          setIsListening(false);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Removed the flaky useEffect([isListening, transcript]) 

  const handleToggle = () => {
      if (isListening) {
          if (recognitionRef.current) recognitionRef.current.stop();
          setIsListening(false);
      } else {
          try {
            setTranscript('');
            transcriptRef.current = '';
            if (recognitionRef.current) recognitionRef.current.start();
          } catch(e) { console.error(e); }
      }
  };

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return null;

  return (
    <>
      <AssistantContainer>
        <TriggerButton onClick={handleToggle} $isListening={isListening}>
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            <RiSparklingFill className="sparkle" />
        </TriggerButton>
      </AssistantContainer>

      {isListening && ReactDOM.createPortal(
          <Overlay>
              <StatusText>{feedback}</StatusText>
              <WaveContainer>
                <WaveBar delay={0} />
                <WaveBar delay={0.2} />
                <WaveBar delay={0.4} />
                <WaveBar delay={0.1} />
                <WaveBar delay={0.3} />
              </WaveContainer>
              <TranscriptText>"{transcript}"</TranscriptText>
              <ActionButtons>
                  <ActionButton onClick={handleToggle}>Cancel</ActionButton>
              </ActionButtons>
              <HintText>{hints[hintIndex]}</HintText>
          </Overlay>,
          document.body
      )}
    </>
  );
};

export default VoiceAssistant;