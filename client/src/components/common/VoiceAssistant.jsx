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
  const silenceTimer = useRef(null);

  // --- FUZZY & PHONETIC HELPERS ---

  // 1. Levenshtein Distance (Spelling Similarity)
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
                      matrix[i - 1][j - 1] + 1, // substitution
                      Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion/deletion
                  );
              }
          }
      }
      return 1 - (matrix[b.length][a.length] / Math.max(a.length, b.length));
  };

  // 2. Custom Phonetic Key (Optimized for Indian/English names)
  const getPhonetic = (str) => {
      let s = str.toLowerCase().trim();
      if (!s) return '';
      s = s.replace(/[^a-z]/g, '')
           .replace(/ee/g, 'i')
           .replace(/oo/g, 'u')
           .replace(/th/g, 't')
           .replace(/ph/g, 'f')
           .replace(/sh/g, 's')
           .replace(/ch/g, 'k')
           .replace(/ck/g, 'k')
           .replace(/[z]/g, 's')
           .replace(/[v]/g, 'w') // Indian v/w interchange
           .replace(/(.)\1+/g, '$1'); // Remove doubles
      // Remove vowels except start
      const first = s[0];
      const rest = s.slice(1).replace(/[aeiou]/g, '');
      return first + rest;
  };

  const normalize = (text) => text.toLowerCase().replace(/[.,?!]/g, '').trim();

  // --- ADVANCED POV TRANSFORMER (Natural Language Engine) ---
  const transformContent = (rawText, isQuestion = false) => {
      let text = rawText.trim();
      if (!text) return "";

      // 1. COMPLEX MAPPINGS (Specific Grammar Rules)
      const grammarRules = [
          // State of Being ("Ask if he is okay" -> "Are you okay?")
          { regex: /\bif (?:he|she|it) is\b/gi, replace: "are you" },
          { regex: /\bif (?:he|she|it) was\b/gi, replace: "were you" },
          { regex: /\bif (?:he|she|it) will be\b/gi, replace: "will you be" },
          
          // Availability/Action ("Ask if he can go" -> "Can you go?")
          { regex: /\bif (?:he|she|it) can\b/gi, replace: "can you" },
          { regex: /\bif (?:he|she|it) could\b/gi, replace: "could you" },
          { regex: /\bif (?:he|she|it) would\b/gi, replace: "would you" },
          { regex: /\bif (?:he|she|it) should\b/gi, replace: "should you" },
          
          // Do/Does ("Ask if he wants" -> "Do you want")
          { regex: /\bif (?:he|she|it) (likes|wants|needs|has|knows|thinks)\b/gi, replace: (_, v) => `do you ${v.slice(0, -1)}` }, // Remove 's'
          { regex: /\bif (?:he|she|it) (went|saw|did|took|made)\b/gi, replace: (_, v) => `did you ${v}` }, // Past tense logic is hard, generic fallback:
          
          // Wh- Questions ("Ask what he is doing" -> "What are you doing?")
          { regex: /\bwhat (?:he|she|it) is\b/gi, replace: "what are you" },
          { regex: /\bwhere (?:he|she|it) is\b/gi, replace: "where are you" },
          { regex: /\bwho (?:he|she|it) is\b/gi, replace: "who are you" },
          { regex: /\bhow (?:he|she|it) is\b/gi, replace: "how are you" },
          { regex: /\bwhen (?:he|she|it) is\b/gi, replace: "when are you" },
          { regex: /\bwhy (?:he|she|it) is\b/gi, replace: "why are you" },

          // Future/Continuous ("Ask where he is going" -> "Where are you going?")
          { regex: /\b(what|where|when|how|why) (?:he|she|it) (will|can|could|should)\b/gi, replace: "$1 $2 you" },
          
          // Tell/Imperative ("Tell him to call me" -> "Call me")
          { regex: /^to\s+/i, replace: "" }, // Remove leading "to"
          { regex: /\bthat\s+/i, replace: "" }, // Remove "that" connector ("Tell him that...")
      ];

      let transformed = text;
      let matchedRule = false;

      for (const rule of grammarRules) {
          if (rule.regex.test(transformed)) {
              transformed = transformed.replace(rule.regex, rule.replace);
              matchedRule = true;
          }
      }

      // 2. GENERAL PRONOUN SWAP (Fallback)
      // Only runs on words not already transformed to avoid double-processing if possible,
      // but simplistic replacement is usually safe after grammar rules.
      transformed = transformed
          .replace(/\bhe\b/gi, "you")
          .replace(/\bshe\b/gi, "you")
          .replace(/\bhim\b/gi, "you")
          .replace(/\bher\b/gi, "you") // Can be "her" object or "her" possessive... tricky. Context matters.
          .replace(/\bhis\b/gi, "your")
          // "her" -> "your" (Possessive) vs "her" -> "you" (Object).
          // "Call her" -> "Call you". "It is her car" -> "It is your car".
          // We'll favor "your" if followed by a noun? Too complex. Defaulting to "you" covers most interaction.
          .replace(/\b(hers)\b/gi, "yours");

      // 3. AUTO-CORRECT GRAMMAR (Post-Swap Cleanup)
      // "you is" -> "you are"
      transformed = transformed
          .replace(/\byou is\b/gi, "you are")
          .replace(/\byou was\b/gi, "you were")
          .replace(/\byou has\b/gi, "you have")
          .replace(/\byou likes\b/gi, "you like")
          .replace(/\byou wants\b/gi, "you want")
          .replace(/\byou needs\b/gi, "you need");

      // 4. CLEANUP & CAPITALIZATION
      transformed = transformed.trim();
      transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);

      // 5. QUESTION MARK INFERENCE
      // If it starts with typical question words or we knew it was an "Ask" command
      const questionStarters = ["do", "are", "is", "can", "could", "would", "should", "will", "did", "have", "has", "what", "where", "when", "who", "why", "how"];
      const startsWithQuestion = questionStarters.some(q => transformed.toLowerCase().startsWith(q));
      
      if ((isQuestion || startsWithQuestion) && !transformed.endsWith('?')) {
          transformed += '?';
      }

      return transformed;
  };

  // 3. Linear Processor with FUZZY MATCHING
  const processCommand = useCallback(async (rawText) => {
      if (!rawText) { setIsListening(false); return; }
      
      setFeedback("Processing...");
      const text = normalize(rawText);
      console.log("Voice Command (Clean):", text);
      const textWords = text.split(' ');

      let targetName = null;
      let targetChat = null;
      let messageContent = "";
      let commandType = "message"; 
      let isQuestion = rawText.toLowerCase().startsWith("ask"); // Infer intent

      // A. Check for "Open/Search/Go To"
      if (text.startsWith("open") || text.startsWith("go to") || text.startsWith("search") || text.startsWith("show")) {
          commandType = "open";
          const words = text.split(' ');
          words.shift(); 
          if (words[0] === "to") words.shift(); 
          targetName = words.join(' '); 
      } 
      
      // B. FUZZY SCAN for Known Contacts
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

          let bestMatch = null;
          let highestScore = 0;
          let matchedText = "";

          for (const contact of allContacts) {
              const contactTokens = normalize(contact.name).split(/\s+/);
              let matchedTokensCount = 0;
              let totalSimilarity = 0;
              let currentMatchText = [];

              // Check each part of the contact's name against the transcript words
              for (const token of contactTokens) {
                  if (token.length < 2) continue; // Skip initials like "J" to avoid noise

                  const tokenPhonetic = getPhonetic(token);
                  let bestTokenScore = 0;
                  let bestWordMatch = "";

                  for (const word of textWords) {
                      const wordPhonetic = getPhonetic(word);
                      
                      // 1. Phonetic Check
                      let pScore = (tokenPhonetic === wordPhonetic) ? 1.0 : 0;
                      
                      // 2. Spelling Check
                      const sScore = getLevenshteinDistance(token, word);
                      
                      // Combined Score
                      const score = Math.max(pScore, sScore);

                      if (score > bestTokenScore) {
                          bestTokenScore = score;
                          bestWordMatch = word;
                      }
                  }

                  // Threshold for a "word match"
                  if (bestTokenScore > 0.75) { // Strict enough to avoid "Hi" matching "He"
                      matchedTokensCount++;
                      totalSimilarity += bestTokenScore;
                      currentMatchText.push(bestWordMatch);
                  }
              }

              // Evaluate the contact match
              if (matchedTokensCount > 0) {
                  // Boost score if the FIRST name matches (common case)
                  const isFirstNameMatch = currentMatchText.includes(textWords.find(w => 
                      getLevenshteinDistance(w, contactTokens[0]) > 0.8
                  ));
                  
                  let finalScore = totalSimilarity; 
                  if (isFirstNameMatch) finalScore += 0.5; // Boost first name matches

                  if (finalScore > highestScore) {
                      highestScore = finalScore;
                      bestMatch = contact;
                      matchedText = currentMatchText.join(' ');
                  }
              }
          }

          if (bestMatch && highestScore > 0.8) { // Minimum quality threshold
              console.log(`Fuzzy Match: '${bestMatch.name}' (Score: ${highestScore.toFixed(2)})`);
              targetName = bestMatch.name;
              targetChat = bestMatch.chat;

              // Extract message: Remove the matched words from the original text
              const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\\]/g, '\\$&');
              
              let temp = text;
              const foundWords = matchedText.split(' ');
              for (const word of foundWords) {
                  temp = temp.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i'), "");
              }
              temp = temp.trim();

              const fillers = ["say", "tell", "ask", "ping", "message", "text", "to", "that", "about", "msg", "send", "is", "are", "hi", "hey"];
              let words = temp.split(/\s+/);
              while(words.length > 0 && fillers.includes(words[0])) words.shift();
              while(words.length > 0 && fillers.includes(words[words.length-1])) words.pop();
              
              messageContent = words.join(' ');
          }
      }

      // C. Global Search Fallback (if name extracted but no local chat found)
      if (!targetChat && targetName && commandType === "open") {
           setFeedback(`Searching directory for "${targetName}"...`);
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
              if (!messageContent) messageContent = "👋"; 
              
              // --- APPLY ADVANCED POV TRANSFORMER ---
              messageContent = transformContent(messageContent, isQuestion);

              setFeedback(`Sent to ${partnerName}: "${messageContent}"`);
              
              // Use REF to get the latest function instance
              if (sendMessageRef.current) {
                  // INSTANT SEND (Optimistic)
                  sendMessageRef.current(targetChat._id, messageContent).catch(err => {
                     console.error("VoiceAssistant: Background Send Failed", err);
                  });
              }
              setTimeout(() => setIsListening(false), 1500);
          }
      } else {
          setFeedback("Couldn't find that contact.");
          setTimeout(() => setIsListening(false), 2000);
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
        setFeedback('Listening...');
        setTranscript('');
        transcriptRef.current = '';
        
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
        transcriptRef.current = currentText;

        // Manual backup timer
        silenceTimer.current = setTimeout(() => {
            if (recognitionRef.current) recognitionRef.current.stop();
        }, 1000); 
      };

      recognitionRef.current.onend = () => {
          setIsListening(false);
          const finalParam = transcriptRef.current;
          if (finalParam && finalParam.length > 1) {
              console.log("onend triggered. Processing:", finalParam);
              processCommand(finalParam);
          }
      };
      
      recognitionRef.current.onerror = (e) => {
          console.error(e);
          setIsListening(false);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
