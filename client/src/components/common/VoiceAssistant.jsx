import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { RiSparklingFill } from 'react-icons/ri';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// --- Animations ---

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 59, 48, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); }
`;

const wave = keyframes`
  0% { height: 10px; }
  50% { height: 30px; }
  100% { height: 10px; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const typing = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-5px); opacity: 1; }
`;

// --- Styled Components ---
const AssistantContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TriggerButton = styled.button`
  background: ${props => props.$isListening 
    ? `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.primary}dd)`
    : 'transparent'};
  border: none;
  width: 32px; /* Standard sidebar icon size (IconButton 1.5rem + minimal padding) */
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isListening ? '#FFFFFF' : props.theme.colors.icon};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  padding: 0; 

  &:hover {
    background: ${props => props.$isListening 
      ? `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.primary})`
      : props.theme.colors.hoverBackground};
    color: ${props => props.$isListening ? '#FFFFFF' : props.theme.colors.iconActive};
  }

  svg:first-child {
    font-size: 1.5rem; /* Matches Spotify/Apple icon size */
    filter: ${props => props.$isListening ? 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' : 'none'};
  }

  ${props => props.$isListening && css`
    animation: ${pulse} 2s infinite;
    box-shadow: 0 0 15px ${props.theme.colors.primary}60;
  `}

  .sparkle {
    position: absolute;
    top: -2px;
    right: -2px;
    font-size: 0.8rem;
    color: ${props => props.$isListening ? '#FFFFFF' : props.theme.colors.primary};
    filter: drop-shadow(0 0 2px rgba(0,0,0,0.1));
    opacity: ${props => props.$isListening ? 1 : 0.8};
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

const TypingIndicator = styled.div`
  display: flex;
  gap: 6px;
  height: 40px;
  align-items: center;
  margin-bottom: 2rem;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  background: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${typing} 1s infinite ease-in-out;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Listening...');
  const [hintIndex, setHintIndex] = useState(0);

  const hints = [
      "Try: 'Ping Eshwar: Are you free?'",
      "Try: 'Open Alice'",
      "Try: 'Tell Bob I am driving'",
      "Try: 'Search Sunil'"
  ];

  const transcriptRef = useRef('');

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

  // --- FUZZY & PHONETIC HELPERS ---

  const getLevenshteinDistance = (a, b) => {
      const matrix = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
              if (b.charAt(i - 1) === a.charAt(j - 1)) {
                  matrix[i][j] = matrix[i - 1][j - 1];
              } else {
                  matrix[i][j] = Math.min(
                      matrix[i - 1][j - 1] + 1,
                      Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                  );
              }
          }
      }
      return 1 - (matrix[b.length][a.length] / Math.max(a.length, b.length));
  };

  const getPhonetic = (str) => {
      let s = str.toLowerCase().trim();
      if (!s) return '';
      s = s.replace(/[^a-z]/g, '')
           .replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/th/g, 't')
           .replace(/ph/g, 'f').replace(/sh/g, 's').replace(/ch/g, 'k')
           .replace(/ck/g, 'k').replace(/[z]/g, 's').replace(/[v]/g, 'w')
           .replace(/(.)\1+/g, '$1');
      const first = s[0];
      const rest = s.slice(1).replace(/[aeiou]/g, '');
      return first + rest;
  };

  const normalize = (text) => text.toLowerCase().replace(/[.,?!]/g, '').trim();

  const transformContent = (rawText, isQuestion = false) => {
      let text = rawText.trim();
      if (!text) return "";
      const grammarRules = [
          { regex: /\bif (?:he|she|it) is\b/gi, replace: "are you" },
          { regex: /\bif (?:he|she|it) was\b/gi, replace: "were you" },
          { regex: /\bif (?:he|she|it) will be\b/gi, replace: "will you be" },
          { regex: /\bif (?:he|she|it) can\b/gi, replace: "can you" },
          { regex: /\bif (?:he|she|it) could\b/gi, replace: "could you" },
          { regex: /\bif (?:he|she|it) would\b/gi, replace: "would you" },
          { regex: /\bif (?:he|she|it) should\b/gi, replace: "should you" },
          { regex: /\bif (?:he|she|it) (likes|wants|needs|has|knows|thinks)\b/gi, replace: (_, v) => `do you ${v.slice(0, -1)}` },
          { regex: /\bif (?:he|she|it) (went|saw|did|took|made)\b/gi, replace: (_, v) => `did you ${v}` },
          { regex: /\bwhat (?:he|she|it) is\b/gi, replace: "what are you" },
          { regex: /\bwhere (?:he|she|it) is\b/gi, replace: "where are you" },
          { regex: /\bwho (?:he|she|it) is\b/gi, replace: "who are you" },
          { regex: /\bhow (?:he|she|it) is\b/gi, replace: "how are you" },
          { regex: /\bwhen (?:he|she|it) is\b/gi, replace: "when are you" },
          { regex: /\bwhy (?:he|she|it) is\b/gi, replace: "why are you" },
          { regex: /\b(what|where|when|how|why) (?:he|she|it) (will|can|could|should)\b/gi, replace: "$1 $2 you" },
          { regex: /^to\s+/i, replace: "" },
          { regex: /\bthat\s+/i, replace: "" },
      ];
      let transformed = text;
      for (const rule of grammarRules) {
          if (rule.regex.test(transformed)) transformed = transformed.replace(rule.regex, rule.replace);
      }
      transformed = transformed
          .replace(/\bhe\b/gi, "you").replace(/\bshe\b/gi, "you")
          .replace(/\bhim\b/gi, "you").replace(/\bher\b/gi, "you")
          .replace(/\bhis\b/gi, "your").replace(/\b(hers)\b/gi, "yours");
      transformed = transformed
          .replace(/\byou is\b/gi, "you are").replace(/\byou was\b/gi, "you were")
          .replace(/\byou has\b/gi, "you have").replace(/\byou likes\b/gi, "you like")
          .replace(/\byou wants\b/gi, "you want").replace(/\byou needs\b/gi, "you need");
      transformed = transformed.trim();
      transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
      const questionStarters = ["do", "are", "is", "can", "could", "would", "should", "will", "did", "have", "has", "what", "where", "when", "who", "why", "how"];
      const startsWithQuestion = questionStarters.some(q => transformed.toLowerCase().startsWith(q));
      if ((isQuestion || startsWithQuestion) && !transformed.endsWith('?')) transformed += '?';
      return transformed;
  };

  const processCommand = useCallback(async (rawText) => {
      if (!rawText) { setIsProcessing(false); setIsListening(false); return; }
      setIsProcessing(true);
      setFeedback("Processing...");
      const text = normalize(rawText);
      const textWords = text.split(' ');
      let targetName = null;
      let targetChat = null;
      let messageContent = "";
      let commandType = "message"; 
      let isQuestion = rawText.toLowerCase().startsWith("ask");

      if (text.startsWith("open") || text.startsWith("go to") || text.startsWith("search") || text.startsWith("show")) {
          commandType = "open";
          const words = text.split(' ');
          words.shift(); 
          if (words[0] === "to") words.shift(); 
          targetName = words.join(' '); 
      } 
      
      if (!targetName) {
          const allContacts = [];
          chatsRef.current.forEach(c => {
              if (c.isGroup) allContacts.push({ name: c.groupName, chat: c });
              else {
                  const p = c.participants.find(p => p._id !== userRef.current?._id);
                  if (p) allContacts.push({ name: p.name, chat: c });
              }
          });
          let bestMatch = null;
          let highestScore = 0;
          let matchedText = "";
          for (const contact of allContacts) {
              const contactTokens = normalize(contact.name).split(/\s+/);
              let matchedTokensCount = 0;
              let totalSimilarity = 0;
              let currentMatchText = [];
              for (const token of contactTokens) {
                  if (token.length < 2) continue;
                  const tokenPhonetic = getPhonetic(token);
                  let bestTokenScore = 0;
                  let bestWordMatch = "";
                  for (const word of textWords) {
                      const wordPhonetic = getPhonetic(word);
                      let pScore = (tokenPhonetic === wordPhonetic) ? 1.0 : 0;
                      const sScore = getLevenshteinDistance(token, word);
                      const score = Math.max(pScore, sScore);
                      if (score > bestTokenScore) { bestTokenScore = score; bestWordMatch = word; }
                  }
                  if (bestTokenScore > 0.75) { matchedTokensCount++; totalSimilarity += bestTokenScore; currentMatchText.push(bestWordMatch); }
              }
              if (matchedTokensCount > 0) {
                  const isFirstNameMatch = currentMatchText.includes(textWords.find(w => getLevenshteinDistance(w, contactTokens[0]) > 0.8));
                  let finalScore = totalSimilarity; 
                  if (isFirstNameMatch) finalScore += 0.5;
                  if (finalScore > highestScore) { highestScore = finalScore; bestMatch = contact; matchedText = currentMatchText.join(' '); }
              }
          }
          if (bestMatch && highestScore > 0.8) {
              targetName = bestMatch.name;
              targetChat = bestMatch.chat;
              const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\\]/g, '\\$&');
              let temp = text;
              const foundWords = matchedText.split(' ');
              for (const word of foundWords) temp = temp.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i'), "");
              temp = temp.trim();
              const fillers = ["say", "tell", "ask", "ping", "message", "text", "to", "that", "about", "msg", "send", "is", "are", "hi", "hey"];
              let words = temp.split(/\s+/);
              while(words.length > 0 && fillers.includes(words[0])) words.shift();
              while(words.length > 0 && fillers.includes(words[words.length-1])) words.pop();
              messageContent = words.join(' ');
          }
      }

      if (!targetChat && targetName && commandType === "open") {
           try {
               const { data: users } = await api.get(`/users/search?q=${targetName}`);
               if (users && users.length > 0) {
                   const bestUser = users[0];
                   const { data: newChat } = await api.post('/chats', { recipientId: bestUser._id });
                   targetChat = newChat;
                   if (addNewChatRef.current) addNewChatRef.current(newChat);
               }
           } catch(e) { console.error(e); }
      }

      if (targetChat) {
          const partnerName = targetChat.isGroup ? targetChat.groupName : targetChat.participants.find(p => p._id !== userRef.current?._id)?.name;
          if (commandType === "open") {
              setFeedback(`Opening ${partnerName}`);
              if (selectChatRef.current) selectChatRef.current(targetChat);
              setTimeout(() => { setIsProcessing(false); setIsListening(false); }, 1000);
          } else {
              if (!messageContent) messageContent = "👋"; 
              messageContent = transformContent(messageContent, isQuestion);
              setFeedback(`Sent to ${partnerName}: "${messageContent}"`);
              if (sendMessageRef.current) sendMessageRef.current(targetChat._id, messageContent).catch(err => console.error(err));
              setTimeout(() => { setIsProcessing(false); setIsListening(false); }, 1500);
          }
      } else {
          setFeedback("Couldn't find that contact.");
          setTimeout(() => { setIsProcessing(false); setIsListening(false); }, 2000);
      }
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
        setFeedback('Listening...');
        setTranscript('');
        transcriptRef.current = '';
      };

      recognitionRef.current.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) currentText += event.results[i][0].transcript;
        setTranscript(currentText);
        transcriptRef.current = currentText;
      };

      recognitionRef.current.onend = () => {
          if (!transcriptRef.current) {
              setIsListening(false);
              return;
          }
          setIsProcessing(true);
          processCommand(transcriptRef.current);
      };
      
      recognitionRef.current.onerror = (e) => {
          console.error(e);
          setIsListening(false);
          setIsProcessing(false);
      };
    }
  }, [processCommand]);

  const handleStart = (e) => {
      if (e) e.preventDefault();
      if (isListening || isProcessing) return;
      try {
        setTranscript('');
        transcriptRef.current = '';
        if (recognitionRef.current) recognitionRef.current.start();
      } catch(e) { console.error(e); }
  };

  const handleStop = (e) => {
      if (e) e.preventDefault();
      if (recognitionRef.current && isListening) recognitionRef.current.stop();
  };

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return null;

  return (
    <>
      <AssistantContainer>
        <TriggerButton 
            $isListening={isListening || isProcessing}
            onMouseDown={handleStart}
            onMouseUp={handleStop}
            onTouchStart={handleStart}
            onTouchEnd={handleStop}
            onContextMenu={(e) => e.preventDefault()}
        >
            {isListening || isProcessing ? <FaMicrophoneSlash /> : <FaMicrophone />}
            <RiSparklingFill className="sparkle" />
        </TriggerButton>
      </AssistantContainer>

      {(isListening || isProcessing) && ReactDOM.createPortal(
          <Overlay>
              <StatusText>{feedback}</StatusText>
              
              {isProcessing ? (
                  <TypingIndicator>
                      <Dot delay={0} />
                      <Dot delay={0.2} />
                      <Dot delay={0.4} />
                  </TypingIndicator>
              ) : (
                  <WaveContainer>
                    <WaveBar delay={0} />
                    <WaveBar delay={0.2} />
                    <WaveBar delay={0.4} />
                    <WaveBar delay={0.1} />
                    <WaveBar delay={0.3} />
                  </WaveContainer>
              )}

              <TranscriptText>"{transcript}"</TranscriptText>
              <ActionButtons>
                  <ActionButton onClick={() => { 
                      if (recognitionRef.current) recognitionRef.current.stop();
                      setIsListening(false); 
                      setIsProcessing(false);
                  }}>
                      Cancel
                  </ActionButton>
              </ActionButtons>
              {!isProcessing && <HintText>{hints[hintIndex]}</HintText>}
          </Overlay>,
          document.body
      )}
    </>
  );
};

export default VoiceAssistant;