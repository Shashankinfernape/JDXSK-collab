import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import { FaMicrophone, FaMicrophoneSlash, FaTimes, FaRedo, FaCheck } from 'react-icons/fa';
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

  /* Active State */
  ${props => props.$isListening && css`
    color: ${props.theme.colors.primary};
    background-color: ${props.theme.colors.hoverBackground};
    box-shadow: 0 0 15px ${props.theme.colors.primary}40;
  `}

  /* Sparkle Icon absolute positioning */
  .sparkle {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 0.7rem;
    color: ${props => props.theme.colors.primary};
  }
`;

// Overlay for "Listening" state (Google Assistant style)
const Overlay = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 300px; /* Partial height like a drawer */
  background: ${props => props.theme.colors.panelBackground};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -5px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000; /* Increased to ensure it covers message bar */
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
  const [pendingCommand, setPendingCommand] = useState(null);
  
  // Hint Rotation
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const { chats, sendMessageToChat, addNewChat, selectChat } = useChat();
  const { user } = useAuth();
  
  // Use Refs for dependencies to avoid re-initializing SpeechRecognition
  const chatsRef = useRef(chats);
  const sendMessageRef = useRef(sendMessageToChat);
  const addNewChatRef = useRef(addNewChat);
  const selectChatRef = useRef(selectChat);
  const userRef = useRef(user);

  useEffect(() => {
      // console.log("VoiceAssistant: Refs Updated", { chatsLen: chats.length, user: !!user, sendFn: !!sendMessageToChat });
      chatsRef.current = chats;
      sendMessageRef.current = sendMessageToChat;
      addNewChatRef.current = addNewChat;
      selectChatRef.current = selectChat;
      userRef.current = user;
  }, [chats, sendMessageToChat, addNewChat, selectChat, user]);
  
  const recognitionRef = useRef(null);
  const silenceTimer = useRef(null);
  const noSpeechTimer = useRef(null); // Safety timeout

  // --- ADVANCED NAME MATCHING (Jaro-Winkler + Recency + Phonetic) ---
  
  // 1. Jaro-Winkler Distance (0.0 = no match, 1.0 = perfect match)
  const getJaroWinkler = (s1, s2) => {
    if (s1.length === 0 || s2.length === 0) return 0;
    
    // Simple Jaro implementation
    const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
    const matches1 = new Array(s1.length).fill(false);
    const matches2 = new Array(s2.length).fill(false);
    let mCount = 0;
    
    for (let i = 0; i < s1.length; i++) {
        const start = Math.max(0, i - matchWindow);
        const end = Math.min(i + matchWindow + 1, s2.length);
        for (let j = start; j < end; j++) {
            if (!matches2[j] && s1[i] === s2[j]) {
                matches1[i] = true;
                matches2[j] = true;
                mCount++;
                break;
            }
        }
    }
    
    if (mCount === 0) return 0;
    
    let tCount = 0;
    let k = 0;
    for (let i = 0; i < s1.length; i++) {
        if (matches1[i]) {
            while (!matches2[k]) k++;
            if (s1[i] !== s2[k]) tCount++;
            k++;
        }
    }
    const t = tCount / 2;
    const jaro = (mCount / s1.length + mCount / s2.length + (mCount - t) / mCount) / 3;
    
    // Winkler Boost (Prefix bonus)
    let prefix = 0;
    for (let i = 0; i < Math.min(4, Math.min(s1.length, s2.length)); i++) {
        if (s1[i] === s2[i]) prefix++;
        else break;
    }
    
    return jaro + prefix * 0.1 * (1 - jaro);
  };

  // 2. Simple Phonetic Key (remove vowels, double letters)
  const getPhonetic = (str) => {
      return str.toLowerCase()
          .replace(/[^a-z]/g, '')
          .replace(/[aeiouy]/g, '') // remove vowels
          .replace(/(.)\1+/g, '$1'); // remove doubles
  };

  const findBestMatch = (rawName) => {
    if (!rawName) return null;
    const normalize = (s) => s.toLowerCase().trim();
    const target = normalize(rawName);
    const targetPhonetic = getPhonetic(target);
    
    let bestMatch = null;
    let bestScore = 0;

    // Use REF here
    chatsRef.current.forEach(chat => {
        const currentUser = userRef.current;
        if (!currentUser) return;

        let nameToCheck = '';
        if (chat.isGroup) {
            nameToCheck = chat.groupName;
        } else {
            const partner = chat.participants.find(p => p._id !== currentUser._id);
            nameToCheck = partner?.name;
        }

        if (!nameToCheck) return;
        
        const fullName = normalize(nameToCheck);
        const firstName = fullName.split(' ')[0];
        
        // --- SCORING SYSTEM ---
        let score = 0;

        // A. Jaro-Winkler Score (Base)
        // Check both full name and first name
        const scoreFull = getJaroWinkler(target, fullName);
        const scoreFirst = getJaroWinkler(target, firstName);
        score = Math.max(scoreFull, scoreFirst);

        // B. Phonetic Bonus
        const pFull = getPhonetic(fullName);
        const pFirst = getPhonetic(firstName);
        if (targetPhonetic === pFull || targetPhonetic === pFirst) {
            score += 0.15; // Significant boost for "sounding" the same
        }

        // C. Recency Boost (Context Awareness)
        if (chat.lastMessage && chat.lastMessage.createdAt) {
            const lastMsgTime = new Date(chat.lastMessage.createdAt).getTime();
            const now = Date.now();
            const hoursSince = (now - lastMsgTime) / (1000 * 60 * 60);
            
            if (hoursSince < 24) score += 0.1;       // Super active (today)
            else if (hoursSince < 72) score += 0.05; // Recent (3 days)
        }

        // Update Winner
        // Threshold: 0.85 (Jaro-Winkler is usually high, so we set a high bar)
        // console.log(`Matching '${target}' vs '${fullName}': Score=${score.toFixed(2)}`);
        
        if (score > bestScore && score > 0.65) { 
            bestScore = score;
            bestMatch = chat;
        }
    });

    return bestMatch;
  };

  // --- POV Transformer (3rd Person -> 1st Person) ---
  const transformContent = (rawText, isQuestion = false) => {
      let text = rawText.trim();
      
      // 1. "Ask [Name] IF HE IS free" -> "Are you free?"
      const indirectMap = [
          { regex: /^if\s+(?:he|she)\s+is\b/i, replace: "Are you" },
          { regex: /^if\s+(?:he|she)\s+are\b/i, replace: "Are you" },
          { regex: /^if\s+(?:he|she)\s+was\b/i, replace: "Were you" },
          { regex: /^if\s+(?:he|she)\s+were\b/i, replace: "Were you" },
          { regex: /^if\s+(?:he|she)\s+will\b/i, replace: "Will you" },
          { regex: /^if\s+(?:he|she)\s+can\b/i, replace: "Can you" },
          { regex: /^if\s+(?:he|she)\s+could\b/i, replace: "Could you" },
          { regex: /^if\s+(?:he|she)\s+should\b/i, replace: "Should you" },
          { regex: /^if\s+(?:he|she)\s+has\b/i, replace: "Have you" },
          { regex: /^if\s+(?:he|she)\s+needs\b/i, replace: "Do you need" },
          { regex: /^if\s+(?:he|she)\s+wants\b/i, replace: "Do you want" },
          { regex: /^if\s+(?:he|she)\s+likes\b/i, replace: "Do you like" },
          // New: "how he is" -> "how are you"
          { regex: /^how\s+(?:he|she)\s+is\b/i, replace: "How are you" },
          { regex: /^how\s+is\s+(?:he|she)\b/i, replace: "How are you" },
          { regex: /^where\s+(?:he|she)\s+is\b/i, replace: "Where are you" },
      ];

      for (let rule of indirectMap) {
          if (rule.regex.test(text)) {
              let transformed = text.replace(rule.regex, rule.replace);
              if (!transformed.endsWith('?')) transformed += '?';
              return transformed;
          }
      }

      // 2. "Tell [Name] TO call me" -> "Call me" (Imperative)
      if (/^to\s+\w+/i.test(text)) {
          let clean = text.replace(/^to\s+/i, "");
          text = clean.charAt(0).toUpperCase() + clean.slice(1);
      }

      // 3. "Tell [Name] THAT I am here" -> "I am here" (Declarative connector)
      else if (/^that\s+/i.test(text)) {
          text = text.replace(/^that\s+/i, "");
      }
      
      // 4. "Ask [Name] ABOUT the meeting" -> "What about the meeting?"
      else if (/^about\s+/i.test(text)) {
           text = "What " + text;
      }

      // Final Polish
      let result = text.charAt(0).toUpperCase() + text.slice(1);
      
      // Ensure question mark for Ask commands
      if (isQuestion && !result.endsWith('?')) {
          result += '?';
      }

      return result;
  };

  // --- Logic ---
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Better for Indian names & Tanglish

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setFeedback('Listening...');
        setTranscript('');
        setPendingCommand(null);
        
        // Safety: If no speech for 8 seconds, stop.
        if (noSpeechTimer.current) clearTimeout(noSpeechTimer.current);
        noSpeechTimer.current = setTimeout(() => {
            if (!transcript) { // If still empty
                setFeedback("I didn't hear anything.");
                setTimeout(() => setIsListening(false), 2000);
                if (recognitionRef.current) recognitionRef.current.stop();
            }
        }, 8000);
      };

      recognitionRef.current.onend = () => {
        if (noSpeechTimer.current) clearTimeout(noSpeechTimer.current);
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        
        // If we are still "listening" in state but the API stopped (e.g. silence),
        // we usually want to stop UI too unless we have auto-restart logic.
        // For now, let's sync state.
        if (!pendingCommand) {
             setIsListening(false);
        }
      };

      recognitionRef.current.onresult = (event) => {
        // Clear safety timer as soon as we hear something
        if (noSpeechTimer.current) clearTimeout(noSpeechTimer.current);

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentText = (finalTranscript || interimTranscript).trim();
        setTranscript(currentText);

        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        
        if (currentText.length > 3) {
             silenceTimer.current = setTimeout(() => {
                 recognitionRef.current.stop(); 
                 processCommand(currentText);   
             }, 2000); 
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech error", event.error);
        if (noSpeechTimer.current) clearTimeout(noSpeechTimer.current);
        if (event.error !== 'no-speech') {
             setFeedback('Error: ' + event.error);
             setTimeout(() => setIsListening(false), 2000);
        }
      };
    }
    return () => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        if (noSpeechTimer.current) clearTimeout(noSpeechTimer.current);
        // CRITICAL FIX: Abort the recognition instance on unmount/update to prevent phantom listeners
        if (recognitionRef.current) recognitionRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCommand]); // Clean dependency: only restart if UI state changes

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      processCommand(transcript);
    } else {
      try {
        if (recognitionRef.current) recognitionRef.current.start();
      } catch (e) {
        console.error("Start error", e);
      }
    }
  };

  const processCommand = async (text) => {
    if (!text) {
        setIsListening(false);
        return;
    }

    const lowerText = text.toLowerCase().trim();
    console.log("Processing Voice Command:", lowerText);
    
    let rawName = '';
    let content = '';
    let commandType = 'message'; // message, open, search
    const isQuestion = lowerText.startsWith('ask');

    // --- DEBUGGING ---
    console.log("Voice Command:", lowerText);
    // const localNames = chatsRef.current.map(c => 
    //    c.participants.find(p => p._id !== userRef.current?._id)?.name
    // );
    // console.log("Available Local Contacts:", localNames);

    // --- Manual Pattern Matching for Precision ---
    
    // 0. "Open/Go to [Name]"
    let pOpen = /^(?:open|go\s+to|show)\s+(.+)$/i.exec(lowerText);
    if (pOpen && !content) {
        rawName = pOpen[1];
        commandType = 'open';
    }

    // 1. Special Case: "Ask how [Name] is [doing/etc]" (Split structure)
    if (!rawName) {
        let pSpecial = /^ask\s+how\s+(.+?)\s+is\s+(.+)$/i.exec(lowerText);
        if (pSpecial) {
            rawName = pSpecial[1];
            content = "How are you " + pSpecial[2] + "?";
        }
    }

    // 2. "Say [Message] to [Name]"
    if (!rawName) {
        let p1 = /^(?:say|send)\s+(.+)\s+to\s+(.+)$/i.exec(lowerText);
        if (p1) { content = p1[1]; rawName = p1[2]; }
    }
    
    // 3. "Tell/Ping/Message [Name] [Message]"
    if (!rawName) {
        let p2 = /^(?:tell|ask|ping|message|text|let)\s+(.+?)(?:\s+know)?\s+(?:that|saying|:)?\s*(.+)$/i.exec(lowerText);
        if (p2) { rawName = p2[1]; content = p2[2]; }
    }

    // 4. Tanglish: "[Name] ku [Message] sollu"
    if (!rawName) {
        let p3 = /^(.+?)\s+(?:ku|kitta)\s+(.+)$/i.exec(lowerText);
        if (p3) { 
            rawName = p3[1]; 
            content = p3[2].replace(/\s+(?:sollu|anuppu|podu|kalu|nu|nnu)$/i, ''); 
        }
    }
    
    // 5. "Call [Name]"
    if (!rawName) {
        let p4 = /^call\s+(.+)$/i.exec(lowerText);
        if (p4) {
            rawName = p4[1];
            content = "📞 Call me";
        }
    }

    // 6. "Search [Name]"
    if (!rawName) {
        let pSearch = /^search\s+(.+)$/i.exec(lowerText);
        if (pSearch) {
            rawName = pSearch[1];
            commandType = 'open'; // Implies searching then opening
        }
    }

    if (rawName) {
        // CLEANUP: Remove punctuation like '?' or '.' from name
        const cleanName = rawName.trim().replace(/[?.!]+$/, "");
        console.log(`Cleaned Name: '${cleanName}'`);

        // 1. Try Local Match
        let targetChat = findBestMatch(cleanName);
        let partnerName = "";

        // 2. If No Local Match, Try Global Search
        if (!targetChat) {
            setFeedback(`Searching directory for "${cleanName}"...`);
            try {
                const { data: users } = await api.get(`/users/search?q=${cleanName}`);
                if (users && users.length > 0) {
                    const bestUser = users[0]; // Take first result
                    console.log("Global search found:", bestUser.name);
                    
                    // Check if we already have a chat with this user that was somehow missed locally
                    // (e.g. strict name match vs fuzzy match issue, or stale state)
                    targetChat = chatsRef.current.find(c => 
                        !c.isGroup && c.participants.some(p => p._id === bestUser._id)
                    );

                    if (!targetChat) {
                        console.log("Creating new chat with:", bestUser.name);
                        // Create new chat
                        const { data: newChat } = await api.post('/chats', { recipientId: bestUser._id });
                        if (newChat) {
                            targetChat = newChat;
                            if (addNewChatRef.current) addNewChatRef.current(newChat);
                        }
                    }
                }
            } catch (err) {
                console.error("Global search failed", err);
            }
        }

        if (targetChat) {
             const currentUser = userRef.current;
             if (targetChat.isGroup) {
                 partnerName = targetChat.groupName;
             } else {
                 partnerName = targetChat.participants.find(p => p._id !== currentUser._id)?.name;
             }
            
            // --- ACTION: OPEN CHAT ---
            if (commandType === 'open') {
                setFeedback(`Opening chat with ${partnerName}...`);
                if (selectChatRef.current) selectChatRef.current(targetChat);
                setTimeout(() => setIsListening(false), 1000);
                return;
            }

            // --- ACTION: SEND MESSAGE ---
            if (content) {
                // --- APPLY POV TRANSFORMATION ---
                const finalMessage = transformContent(content, isQuestion);

                setFeedback(`Confirm: Send to ${partnerName}?`);
                setPendingCommand({ targetChat, content: finalMessage }); 
                
                // Auto-send 
                const autoSendSetting = localStorage.getItem('voice_auto_send');
                const shouldAutoSend = autoSendSetting === null || autoSendSetting === 'true';
                
                if (shouldAutoSend) {
                    setTimeout(() => {
                        handleSend(targetChat._id, finalMessage);
                    }, 100);
                }
            } else {
                 setFeedback(`What should I say to ${partnerName}?`);
                 // Maybe keep listening here? For now just stop.
                 setTimeout(() => setIsListening(false), 2000);
            }

        } else {
            setFeedback(`Found no contact for "${cleanName}"`);
            setTimeout(() => setIsListening(false), 3000);
        }
    } else {
        setFeedback("Didn't catch that. Try 'Ping [Name] [Message]'");
        setTimeout(() => setIsListening(false), 3000);
    }
  };

  const handleSend = (chatId, content) => {
      // Use REF to get the latest function instance
      if (sendMessageRef.current && userRef.current) {
          console.log("VoiceAssistant: Sending message to", chatId);
          setFeedback("Sending..."); 
          
          try {
            // INSTANT SEND - Fire and forget for UI speed
            sendMessageRef.current(chatId, content);
            
            // FAST FEEDBACK
            setFeedback("Sent!");
            setPendingCommand(null);
            setTimeout(() => setIsListening(false), 800); 
          } catch (e) {
            console.error("VoiceAssistant: Send Failed", e);
            setFeedback("Error: Failed to send");
          }
      } else {
          console.error("VoiceAssistant: sendMessage function or User missing", { 
              fn: !!sendMessageRef.current, 
              user: !!userRef.current 
          });
          setFeedback("Error: Not Connected");
      }
  };

  const handleConfirm = () => {
      if (pendingCommand) {
          handleSend(pendingCommand.targetChat._id, pendingCommand.content);
      }
  };

  const handleCancel = () => {
      setIsListening(false);
      setPendingCommand(null);
  };

  const handleRetry = () => {
      setPendingCommand(null);
      setTranscript('');
      setFeedback('Listening...');
      setIsListening(true);
      if (recognitionRef.current) {
          try {
              recognitionRef.current.start();
          } catch(e) { console.error(e); }
      }
  };

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      return null; // Or render nothing if not supported
  }

  return (
    <>
      <AssistantContainer>
        <TriggerButton 
            onClick={toggleListening} 
            title="AI Voice Assistant" 
            $isListening={isListening}
            onContextMenu={(e) => e.preventDefault()}
        >
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            <RiSparklingFill className="sparkle" />
        </TriggerButton>
      </AssistantContainer>

      {isListening && ReactDOM.createPortal(
          <Overlay>
              <StatusText>{feedback}</StatusText>
              
              {!pendingCommand && (
                  <WaveContainer>
                    <WaveBar delay={0} />
                    <WaveBar delay={0.2} />
                    <WaveBar delay={0.4} />
                    <WaveBar delay={0.1} />
                    <WaveBar delay={0.3} />
                  </WaveContainer>
              )}

              {transcript && !pendingCommand && (
                  <TranscriptText>"{transcript}"</TranscriptText>
              )}

              {pendingCommand && (
                  <>
                    <TranscriptText>"{pendingCommand.content}"</TranscriptText>
                    <ActionButtons>
                        <ActionButton onClick={handleCancel} title="Cancel">
                            <FaTimes />
                        </ActionButton>
                        <ActionButton onClick={handleRetry} title="Retry">
                            <FaRedo />
                        </ActionButton>
                        <ActionButton primary onClick={handleConfirm} title="Send">
                            <FaCheck />
                        </ActionButton>
                    </ActionButtons>
                  </>
              )}
              
              {!pendingCommand && (
                <>
                    <ActionButtons>
                        <ActionButton onClick={toggleListening}>
                            Stop Listening
                        </ActionButton>
                    </ActionButtons>
                    <HintText>{hints[hintIndex]}</HintText>
                </>
              )}
          </Overlay>,
          document.body
      )}
    </>
  );
};

export default VoiceAssistant;