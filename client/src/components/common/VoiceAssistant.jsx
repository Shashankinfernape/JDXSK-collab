import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane, FaTimes } from 'react-icons/fa';
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

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Listening...');
  const [pendingCommand, setPendingCommand] = useState(null); // { targetChat, message }
  
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

    // 1. Direct Search (Exact or StartsWith)
    const directMatch = chats.find(c => {
        const p = c.participants.find(userP => userP._id !== user._id);
        const pName = normalize(p?.name || '');
        return pName === target || pName.startsWith(target) || target.startsWith(pName);
    });
    if (directMatch) return directMatch;

    // 2. Fuzzy Search
    chats.forEach(chat => {
        const partner = chat.participants.find(p => p._id !== user._id);
        if (!partner?.name) return;
        const pName = normalize(partner.name);
        
        // Calculate distance
        const dist = levenshteinDistance(target, pName);
        
        // Calculate score (lower distance relative to length is better)
        // threshold: allow ~30% error rate (e.g., "eshwar" vs "eshwa" is dist 1, len 6. 1/6 < 0.3)
        const threshold = Math.max(target.length, pName.length) * 0.4; 

        if (dist < minDistance && dist <= threshold) {
            minDistance = dist;
            bestMatch = chat;
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
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setFeedback('Listening...');
        setTranscript('');
        setPendingCommand(null);
      };

      recognitionRef.current.onend = () => {
        if (isListening && !pendingCommand) {
            // Restart if we simply stopped without a command (unless manually stopped)
             // setFeedback('Tap mic to stop.'); 
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

        // Reset silence timer on any speech
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        
        // Auto-process logic: if we have a decent length string, wait for 2 seconds of silence then process
        if (currentText.length > 5) {
             silenceTimer.current = setTimeout(() => {
                 recognitionRef.current.stop(); // Stop listening
                 processCommand(currentText);   // Process what we have
             }, 2000); // 2 seconds silence -> End of command
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
  }, [chats, pendingCommand]); // Add chats dependency for fresh list

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

  const processCommand = (text) => {
    if (!text) {
        setIsListening(false);
        return;
    }

    const lowerText = text.toLowerCase();
    console.log("Processing Voice Command:", lowerText);
    
    // Patterns covering:
    // 1. "Message [Name] [Content]"
    // 2. "Say [Content] to [Name]"
    // 3. "Tell [Name] [Content]"
    // 4. "Send [Content] to [Name]"
    
    const patterns = [
        // "Say hello to Eshwar" -> Name: Eshwar, Content: hello
        /^(?:say|send)\s+(.+?)\s+to\s+(.+)$/i, 
        
        // "Tell Eshwar (that) I am here"
        /^(?:tell|message|text)\s+(.+?)\s+(?:that|saying|:)\s+(.+)$/i,
        
        // "Message Eshwar I am here" (Implicit)
        /^(?:tell|message|text)\s+(\w+)\s+(.+)$/i 
    ];

    let match = null;
    let rawName = '';
    let content = '';

    // Try Pattern 1: "Say [Content] to [Name]"
    if ((match = lowerText.match(patterns[0]))) {
        content = match[1];
        rawName = match[2];
    } 
    // Try Pattern 2 & 3: "Tell [Name] [Content]"
    else if ((match = lowerText.match(patterns[1])) || (match = lowerText.match(patterns[2]))) {
        rawName = match[1];
        content = match[2];
    }

    if (rawName && content) {
        const targetChat = findBestMatch(rawName.trim());
        
        if (targetChat) {
            const partnerName = targetChat.participants.find(p => p._id !== user._id)?.name;
            setFeedback(`Confirm: Send to ${partnerName}?`);
            setPendingCommand({ targetChat, content: content.trim() });
            
            const autoSend = localStorage.getItem('voice_auto_send') === 'true';
            if (autoSend) {
                handleSend(targetChat._id, content.trim());
            }
        } else {
            setFeedback(`Found no contact close to "${rawName}"`);
            setTimeout(() => setIsListening(false), 3000);
        }
    } else {
        setFeedback("Didn't catch that. Try 'Say hi to [Name]'");
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
                        <ActionButton onClick={handleCancel}>
                            <FaTimes /> Cancel
                        </ActionButton>
                        <ActionButton primary onClick={handleConfirm}>
                            <FaPaperPlane /> Send
                        </ActionButton>
                    </ActionButtons>
                  </>
              )}
              
              {!pendingCommand && (
                <ActionButtons>
                    <ActionButton onClick={toggleListening}>
                         Stop Listening
                    </ActionButton>
                </ActionButtons>
              )}
          </Overlay>
      )}
    </>
  );
};

export default VoiceAssistant;
