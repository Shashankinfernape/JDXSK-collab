import React, { useState } from 'react';
import styled from 'styled-components';
import { BsEmojiSmile } from 'react-icons/bs';

const PickerContainer = styled.div`
  height: 250px;
  background-color: ${props => props.theme.colors.panelBackground};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.headerBackground || props.theme.colors.panelBackground};
  padding: 0;
`;

const TabButton = styled.button`
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  border-bottom: 3px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.2);
    border-radius: 3px;
  }
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 5px;
`;

const EmojiButton = styled.button`
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  padding: 2px;
  transition: transform 0.1s;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    transform: scale(1.1);
  }
`;

const PlaceholderGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
`;

const PlaceholderItem = styled.div`
    height: 100px;
    background-color: ${props => props.theme.colors.hoverBackground};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: bold;
    color: ${props => props.theme.colors.textSecondary};
    cursor: pointer;
    border: 1px solid transparent;

    &:hover {
        border-color: ${props => props.theme.colors.primary};
        opacity: 0.8;
    }
`;



const EMOJIS = [
  // 😊 Everyday reactions (WhatsApp core)
  "😀","😄","😁","😂","🤣","😊","😉","🙂","🙃","😍",
  "🥰","😘","😋","😎","🤩","🥳","😏","😌",

  // 😐 Mood / attitude
  "😒","🙄","😑","😐","😬","🤔","🤨","🧐","🤐",
  "😔","🥺","😢","😭","😤","😠","😡","🤬",

  // 😳 Shock / stress / tired
  "😳","😱","😨","😰","🥵","🥶","😴","🥱","🤯",

  // 🤡 Fun / sarcasm / chaos
  "🤡","💀","👀","👻","😈","🤖","💩",

  // 👍 Gestures (most-used on WhatsApp)
  "👍","👎","👌","✌️","🤞","🤟","🤘","👏",
  "🙌","🤝","🙏","💪","👊","✋","👋","🤙",

  // ❤️ Love & emotion (WhatsApp favorites)
  "❤️","🧡","💛","💚","💙","💜","🖤","🤍",
  "💔","💕","💖","💗","💘","💝","😘","💋",

  // 🔥 Extras (status / chat energy)
  "🔥","✨","💯","🎉","🥹","😮‍💨","🫶","🫠"
];


const EmojiPicker = ({ onEmojiClick }) => {
  const [activeTab, setActiveTab] = useState('emoji'); // emoji, gif, sticker

  return (
    <PickerContainer>
        <Tabs>
            <TabButton $active={activeTab === 'emoji'} onClick={() => setActiveTab('emoji')} type="button">
                <BsEmojiSmile /> Emoji
            </TabButton>
             <TabButton $active={activeTab === 'gif'} onClick={() => setActiveTab('gif')} type="button">
                <span>GIF</span>
            </TabButton>
             <TabButton $active={activeTab === 'sticker'} onClick={() => setActiveTab('sticker')} type="button">
                <span>Sticker</span>
            </TabButton>
        </Tabs>
        <ContentArea>
            {activeTab === 'emoji' && (
                <EmojiGrid>
                    {EMOJIS.map(emoji => (
                        <EmojiButton key={emoji} onClick={() => onEmojiClick(emoji)} type="button">
                            {emoji}
                        </EmojiButton>
                    ))}
                </EmojiGrid>
            )}
            {activeTab === 'gif' && (
                <PlaceholderGrid>
                    {[...Array(8)].map((_, i) => (
                        <PlaceholderItem key={i}>GIF {i+1}</PlaceholderItem>
                    ))}
                </PlaceholderGrid>
            )}
            {activeTab === 'sticker' && (
                 <PlaceholderGrid>
                    {[...Array(8)].map((_, i) => (
                         <PlaceholderItem key={i}>Sticker {i+1}</PlaceholderItem>
                    ))}
                </PlaceholderGrid>
            )}
        </ContentArea>
    </PickerContainer>
  );
};

export default EmojiPicker;
