import React from 'react';
import styled from 'styled-components';
import { TiTick } from 'react-icons/ti';

// 1. Parent Message Bubble (Container)
// Tailwind equivalent: flex flex-col items-stretch bg-[#007AFF] text-white rounded-xl p-2 min-w-[200px]
const BubbleContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* Crucial: Default is stretch, but we make it explicit to ensure width filling */
  align-items: stretch; 
  
  background-color: #007AFF; /* Standard Blue */
  color: white;
  border-radius: 0.75rem; /* rounded-xl */
  padding: 0.5rem; /* p-2 */
  min-width: 200px; /* min-w-[200px] */
  max-width: 80%; /* Reasonable max width constraint */
  
  /* Ensure it sits to the right if it's "me", or left if others. 
     This component assumes usage logic handles external positioning, 
     but we add self-end for demonstration if used in a flex column list. */
  align-self: flex-end; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  position: relative;
`;

// 2. The "Reply" Internal Card (The Fix)
// Tailwind: w-full bg-black/20 border-l-4 border-gray-300 rounded-md overflow-hidden p-2 mb-2
const ReplyCard = styled.div`
  width: 100%; /* Force full width */
  background-color: rgba(0, 0, 0, 0.2); /* bg-black/20 */
  border-radius: 0.375rem; /* rounded-md */
  position: relative;
  overflow: hidden;
  padding: 0.5rem 0.5rem 0.5rem 1rem; /* p-2 with extra left padding for stripe */
  margin-bottom: 0.5rem; /* Space between reply and main text */
  
  display: flex;
  flex-direction: column;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: #D1D5DB; /* Accent color */
  }
`;

const ReplySender = styled.span`
  font-weight: 700;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2px;
`;

const ReplyText = styled.span`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// 3. Main Content & Hierarchy
const MainMessageText = styled.div`
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 4px; /* Space for timestamp */
`;

// 4. Timestamp & Read Receipt
// Tailwind: flex justify-end text-[10px] text-white/60
const MetaContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  margin-top: auto; /* Push to bottom if needed */
`;

const TimestampText = styled.span`
  font-size: 10px; /* text-[10px] */
  color: rgba(255, 255, 255, 0.6); /* text-white/60 */
`;

const WhatsAppReplyBubble = ({ 
  replySender = "John Doe", 
  replyText = "This is the quoted message text that might be long", 
  messageText = "Here is my reply!", 
  time = "12:30 PM" 
}) => {
  return (
    <BubbleContainer>
      {/* Reply Card: Always full width, dark overlay */}
      <ReplyCard>
        <ReplySender>{replySender}</ReplySender>
        <ReplyText>{replyText}</ReplyText>
      </ReplyCard>

      {/* Main Message */}
      <MainMessageText>
        {messageText}
      </MainMessageText>

      {/* Footer: Timestamp */}
      <MetaContainer>
        <TimestampText>{time}</TimestampText>
        <TiTick size={14} color="rgba(255,255,255,0.8)" />
      </MetaContainer>
    </BubbleContainer>
  );
};

export default WhatsAppReplyBubble;
