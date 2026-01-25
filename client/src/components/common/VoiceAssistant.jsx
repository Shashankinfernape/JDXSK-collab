import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaMicrophone, FaMicrophoneSlash, FaTimes, FaRedo, FaCheck } from 'react-icons/fa';
import { RiSparklingFill } from 'react-icons/ri';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
  }

  /* Sparkle Icon absolute positioning */
  .sparkle {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 0.7rem;
    color: #ffd700;
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
  z-index: 2000;
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
      "Try: 'Alice ku hi anuppu' (Tanglish)",
      "Try: 'Let Bob know I'm driving'",
      "Try: 'Shoot a msg to John: Call me'"
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

  const { chats, sendMessageToChat } = useChat();
  const { user } = useAuth();
  
  const recognitionRef = useRef(null);

  // --- Fuzzy Match Helper ---
  const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const findBestMatch = (rawName) => {
    if (!rawName) return null;
    const normalize = (s) => s.toLowerCase().trim();
    const target = normalize(rawName);
    
    let bestMatch = null;
    let minDistance = Infinity;

    // Helper to check distance and update best match
    const checkMatch = (candidateName, chat) => {
        const dist = levenshteinDistance(target, candidateName);
        // Dynamic threshold: 
        // Allow more errors for longer names.
        // Min threshold 1.5 ensures "Bo" (2) matches "Jo" (2) (dist 1 < 1.5).
        // "Eshwar" (6) -> Threshold 2.4. "Ishwar" (dist 1) matches.
        const threshold = Math.max(1.5, candidateName.length * 0.4); 

        if (dist < minDistance && dist <= threshold) {
            minDistance = dist;
            bestMatch = chat;
        }
    };

    chats.forEach(chat => {
        const partner = chat.participants.find(p => p._id !== user._id);
        if (!partner?.name) return;
        
        const fullName = normalize(partner.name);
        const firstName = fullName.split(' ')[0]; // Check first name separately

        // 1. Direct Search Priority
        if (fullName === target || firstName === target || fullName.startsWith(target)) {
            minDistance = 0;
            bestMatch = chat;
            return;
        }
        
        // 2. Fuzzy Search against Full Name AND First Name
        checkMatch(fullName, chat);
        if (firstName !== fullName) {
            checkMatch(firstName, chat);
        }
    });

    return bestMatch;
  };

  // --- Logic ---
  const silenceTimer = useRef(null);

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
      };

      recognitionRef.current.onend = () => {
        if (isListening && !pendingCommand) {
             // Keep alive logic handled by user interaction or silence timer
        } else {
             setIsListening(false);
        }
      };

      recognitionRef.current.onresult = (event) => {
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
        if (event.error !== 'no-speech') {
             setFeedback('Error: ' + event.error);
             setIsListening(false);
        }
      };
    }
    return () => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, pendingCommand]); 

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

  // --- POV Transformer (3rd Person -> 1st Person) ---
  const transformContent = (rawText) => {
      let text = rawText.trim();
      
      // 1. "Ask [Name] IF HE IS free" -> "Are you free?"
      // Patterns: if he/she + is/are/will/can/could/should
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
      ];

      for (let rule of indirectMap) {
          if (rule.regex.test(text)) {
              // Replace start, append '?' if missing
              let transformed = text.replace(rule.regex, rule.replace);
              if (!transformed.endsWith('?')) transformed += '?';
              return transformed;
          }
      }

      // 2. "Tell [Name] TO call me" -> "Call me" (Imperative)
      if (/^to\s+\w+/i.test(text)) {
          let clean = text.replace(/^to\s+/i, "");
          // Capitalize first letter
          return clean.charAt(0).toUpperCase() + clean.slice(1);
      }

      // 3. "Tell [Name] THAT I am here" -> "I am here" (Declarative connector)
      if (/^that\s+/i.test(text)) {
          return text.replace(/^that\s+/i, "");
      }
      
      // 4. "Ask [Name] ABOUT the meeting" -> "What about the meeting?"
      if (/^about\s+/i.test(text)) {
           return "What " + text + "?";
      }

      return text;
  };

  const processCommand = (text) => {
    if (!text) {
        setIsListening(false);
        return;
    }

    const lowerText = text.toLowerCase().trim();
    console.log("Processing Voice Command:", lowerText);
    
    // --- FLEXIBLE COMMAND PATTERNS ---
    const patterns = [
        // --- ENGLISH (Casual & Formal) ---
        // "Say hello to Eshwar"
        /^(?:say|send|drop|shoot)\s+(?:a\s+)?(?:message|text|note|msg)?\s*(?:to\s+)?(.+?)\s+(?:saying|that|:)?\s*(.+)$/i,
        
        // "Tell Eshwar I am late" / "Ask Eshwar where are you" / "Ping Eshwar hi"
        /^(?:tell|ask|ping|message|text|inform|notify)\s+(.+?)\s+(?:that|saying|:)?\s*(.+)$/i,
        
        // "Let Eshwar know that I am coming"
        /^let\s+(.+?)\s+know\s+(?:that\s+)?(.+)$/i,

        // --- TANGLISH (Tamil Syntax) ---
        // "Eshwar ku hi sollu" (To Eshwar, say hi)
        // "Eshwar kitta I am coming nu sollu" (Tell Eshwar that I am coming)
        // Regex: [Name] (ku/kitta) [Message] (sollu/anuppu/kalu)
        /^(.+?)\s+(?:ku|kitta|kitta)\s+(.+?)(?:\s+(?:nu|nnu))?\s*(?:sollu|anuppu|podu|kalu)?$/i
    ];

    let match = null;
    let rawName = '';
    let content = '';

    // Check patterns
    for (const regex of patterns) {
        match = lowerText.match(regex);
        if (match) {
             // We rely on manual extraction logic below for precision 
             // because regex groups can be tricky with lazy/greedy matching
            break; 
        }
    }

    // --- Manual Pattern Matching for Precision ---
    
    // 1. "Say [Message] to [Name]"
    let p1 = /^(?:say|send)\s+(.+)\s+to\s+(.+)$/i.exec(lowerText);
    if (p1) { content = p1[1]; rawName = p1[2]; }
    
    // 2. "Tell/Ping/Message [Name] [Message]"
    if (!rawName) {
        let p2 = /^(?:tell|ask|ping|message|text|let)\s+(.+?)(?:\s+know)?\s+(?:that|saying|:)?\s*(.+)$/i.exec(lowerText);
        if (p2) { rawName = p2[1]; content = p2[2]; }
    }

    // 3. Tanglish: "[Name] ku [Message] sollu"
    if (!rawName) {
        let p3 = /^(.+?)\s+(?:ku|kitta)\s+(.+)$/i.exec(lowerText);
        if (p3) { 
            rawName = p3[1]; 
            // Remove trailing verbs like 'sollu', 'anuppu' from content
            content = p3[2].replace(/\s+(?:sollu|anuppu|podu|kalu|nu|nnu)$/i, ''); 
        }
    }

    if (rawName && content) {
        const targetChat = findBestMatch(rawName.trim());
        
        if (targetChat) {
            const partnerName = targetChat.participants.find(p => p._id !== user._id)?.name;
            
            // --- APPLY POV TRANSFORMATION ---
            const finalMessage = transformContent(content);

            setFeedback(`Confirm: Send to ${partnerName}?`);
            setPendingCommand({ targetChat, content: finalMessage }); // Use transformed message
            
            const autoSend = localStorage.getItem('voice_auto_send') === 'true';
            if (autoSend) {
                handleSend(targetChat._id, finalMessage);
            }
        } else {
            setFeedback(`Found no contact close to "${rawName}"`);
            setTimeout(() => setIsListening(false), 3000);
        }
    } else {
        setFeedback("Didn't catch that. Try 'Ping [Name] [Message]'");
        setTimeout(() => setIsListening(false), 3000);
    }
  };

  const handleSend = (chatId, content) => {
      sendMessageToChat(chatId, content);
      setFeedback("Sent!");
      setPendingCommand(null);
      setTimeout(() => setIsListening(false), 1500);
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
        <TriggerButton onClick={toggleListening} title="AI Voice Assistant">
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            <RiSparklingFill className="sparkle" />
        </TriggerButton>
      </AssistantContainer>

      {isListening && (
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
          </Overlay>
      )}
    </>
  );
};

export default VoiceAssistant;
