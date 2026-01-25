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

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Keep listening until manual stop or silence logic
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setFeedback('Listening...');
        setTranscript('');
        setPendingCommand(null);
      };

      recognitionRef.current.onend = () => {
        // Only valid if we didn't manually process a command yet
        if (!pendingCommand) {
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
        
        const currentText = finalTranscript || interimTranscript;
        setTranscript(currentText);

        // Optional: Auto-process if silence/pause detected could go here, 
        // but for now we rely on the button toggle or user pause logic (if we added a timer)
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'no-speech') {
             setFeedback('Did not hear anything.');
        } else {
            setFeedback('Error occurred in recognition.');
            setIsListening(false);
        }
      };
    }
  }, [pendingCommand]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      processCommand(transcript); // Process on stop
    } else {
      try {
        recognitionRef.current.start();
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
    
    // Regex to parse: "Message [Name] [Content]"
    // Support: "Message Alice Hello there"
    // Support: "Text Bob that I am coming"
    // Support: "Send to Charlie saying Are you ready?"
    
    const patterns = [
        /^(?:message|text|send to)\s+(.+?)\s+(?:saying|that|:)\s+(.+)$/i, // Explicit separator
        /^(?:message|text|send to)\s+(.+?)\s+(.+)$/i // Implicit separator (riskier)
    ];

    let match = null;
    for (let pattern of patterns) {
        match = lowerText.match(pattern);
        if (match) break;
    }

    if (match) {
        const rawName = match[1].trim();
        const content = match[2].trim();
        
        // Find user in chats
        // Priority: Exact match -> Starts with -> Includes
        let targetChat = chats.find(c => {
             const partner = c.participants.find(p => p._id !== user._id);
             return partner?.name.toLowerCase() === rawName;
        });

        if (!targetChat) {
             targetChat = chats.find(c => {
                 const partner = c.participants.find(p => p._id !== user._id);
                 return partner?.name.toLowerCase().startsWith(rawName);
            });
        }
        
        // If still not found, we can't send easily without searching global users.
        // For MVP/Safety, we only support existing chats or we fail gracefully.
        
        if (targetChat) {
            const partnerName = targetChat.participants.find(p => p._id !== user._id)?.name;
            setFeedback(`Confirm: Send to ${partnerName}?`);
            setPendingCommand({ targetChat, content });
            
            // Check Auto-Send Preference
            const autoSend = localStorage.getItem('voice_auto_send') === 'true';
            if (autoSend) {
                handleSend(targetChat._id, content);
            }
        } else {
            setFeedback(`Could not find chat with "${rawName}"`);
            setTimeout(() => setIsListening(false), 2000);
        }
    } else {
        setFeedback("Couldn't understand the command. Try 'Message [User] [Text]'");
        setTimeout(() => setIsListening(false), 2000);
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
