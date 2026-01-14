import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/user.service';
import { IoMdArrowBack } from 'react-icons/io';
import { MdModeEditOutline, MdCheck, MdPhotoCamera } from 'react-icons/md';
import Input from '../common/Input';
import Cropper from 'react-easy-crop';

// --- Styled Components ---

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease;
`;

const DrawerContainer = styled.div`
  position: fixed;
  top: 0; 
  right: 0; /* Align to right for standard drawer feel */
  /* Logic for width: Mobile -> 100%, Desktop -> Panel Width */
  width: 100%;
  @media (min-width: 900px) {
    width: ${props => props.theme.panel_width || '400px'};
    max-width: ${props => props.theme.max_panel_width || '450px'};
    border-left: 1px solid ${props => props.theme.colors.border};
  }

  height: 100vh;
  background-color: ${props => props.theme.colors.panelBackground}; /* Match sidebar bg */
  z-index: 1001;
  transform: ${props => (props.$isOpen ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 10px rgba(0,0,0,0.2);
`;

const DrawerHeader = styled.div`
  padding: 1rem;
  background-color: ${props => props.theme.colors.headerBackground};
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const BackButton = styled.button`
  background: none; border: none;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.5rem; cursor: pointer; display: flex;
  &:hover { opacity: 0.8; }
`;

const HeaderTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background-color: ${props => props.theme.colors.background}; /* Use main background for contrast */
`;

// Hero Section
const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  background-color: ${props => props.theme.colors.panelBackground};
  margin-bottom: 0; 
`;

const ImageContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin-bottom: 1rem;
`;

const ProfileImage = styled.img`
  width: 100%; height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: ${props => props.theme.isDark ? 'none' : `1px solid ${props.theme.colors.border}`};
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s; cursor: pointer; color: white;
  ${ImageContainer}:hover & { opacity: 1; }
`;

const UserName = styled.h2`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 0.2rem;
  text-align: center;
`;

const UserStatus = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  margin: 1.5rem 0 0.5rem 0;
  padding: 0.5rem 0;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  
  &:hover {
      opacity: 0.8;
  }
`;

const StatValue = styled.span`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.textPrimary};
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
`;

// Info Section
const SectionContainer = styled.div`
  padding: 1.2rem 1.5rem;
  background-color: ${props => props.theme.colors.panelBackground};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  
  &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 1.5rem;
      right: 0;
      height: 1px;
      background-color: ${props => props.theme.colors.border};
      opacity: 0.5;
  }
  
  &:last-child::after {
      display: none;
  }
`;

const SectionTitle = styled.h4`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.2rem;
  font-weight: 500;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const InfoText = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.4;
  flex: 1;
`;

const EditAction = styled.button`
  background: none; border: none;
  color: ${props => props.theme.colors.icon};
  cursor: pointer; font-size: 1.3rem;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  
  &:hover { color: ${props => props.theme.colors.primary}; }
`;

const HiddenInput = styled.input` display: none; `;

// Crop UI (Simplified reuse)
const CropModal = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: #000; z-index: 2000;
  display: flex; flex-direction: column;
`;
const CropContainer = styled.div` position: relative; flex: 1; background: #333; `;
const CropControls = styled.div`
  height: 80px; display: flex; justify-content: space-between; align-items: center;
  padding: 0 20px; background: #111;
`;
const Button = styled.button`
  padding: 8px 16px; border-radius: 4px; border: none; font-weight: 600; cursor: pointer;
  background: ${props => props.$primary ? props.theme.colors.primary : '#444'};
  color: white;
`;
const Slider = styled.input` width: 50%; `;


// --- Helper Functions ---
const createImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
});
function getRadianAngle(degreeValue) { return (degreeValue * Math.PI) / 180; }
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
    canvas.width = safeArea; canvas.height = safeArea;
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate(getRadianAngle(rotation));
    ctx.translate(-safeArea / 2, -safeArea / 2);
    ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);
    const data = ctx.getImageData(0, 0, safeArea, safeArea);
    canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
    ctx.putImageData(data, 0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x, 0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y);
    return canvas.toDataURL('image/jpeg');
}


// --- Main Component ---
const ProfileDrawer = ({ isOpen, onClose, targetUser }) => {
  const { user: currentUser, updateUser } = useAuth();
  
  // Determine mode
  const isEditable = !targetUser || targetUser._id === currentUser._id;
  const displayUser = isEditable ? currentUser : targetUser;

  // Local State
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  // Sync state when user changes
  useEffect(() => {
    if (displayUser) {
        setName(displayUser.name || '');
        setAbout(displayUser.about || 'Hey there! I am using Chatflix.');
    }
  }, [displayUser]);

  // Crop State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const fileInputRef = useRef(null);

  // --- Handlers ---
  const handleSaveName = async () => {
    try {
      const { data: updatedUser } = await userService.updateUser({ name });
      updateUser(updatedUser); 
      setIsEditingName(false);
    } catch (error) { console.error("Failed to update name", error); }
  };
  
  const handleSaveAbout = async () => {
    try {
      const { data: updatedUser } = await userService.updateUser({ about });
      updateUser(updatedUser); 
      setIsEditingAbout(false);
    } catch (error) { console.error("Failed to update about", error); }
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
          setImageSrc(reader.result);
          setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      const { data: updatedUser } = await userService.updateUser({ profilePic: croppedImageBase64 });
      updateUser(updatedUser);
      setIsCropping(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      alert("Failed to update profile picture");
    }
  };

  if (!displayUser) return null;

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onClose} />
      <DrawerContainer $isOpen={isOpen}>
        <DrawerHeader>
          <BackButton onClick={onClose}><IoMdArrowBack /></BackButton>
          <HeaderTitle>{isEditable ? 'Your Profile' : 'Contact Info'}</HeaderTitle>
        </DrawerHeader>

        <ScrollableContent>
            {/* Hero Section */}
            <HeroSection>
                <ImageContainer onClick={() => isEditable && fileInputRef.current.click()}>
                    <ProfileImage 
                        src={displayUser.profilePic || `https://i.pravatar.cc/150?u=${displayUser._id}`} 
                        alt="Profile" 
                    />
                    {isEditable && (
                        <ImageOverlay>
                            <MdPhotoCamera size={30} />
                            <span>Change</span>
                        </ImageOverlay>
                    )}
                </ImageContainer>
                
                {isEditable && (
                    <HiddenInput 
                        type="file" accept="image/*" 
                        ref={fileInputRef} onChange={onFileChange} 
                    />
                )}

                <UserName>{displayUser.name}</UserName>
                <UserStatus>
                    {displayUser.email}
                    {/* Add online status logic here if available */}
                </UserStatus>

                <StatsRow>
                    <StatItem>
                        <StatValue>0</StatValue>
                        <StatLabel>Posts</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue>{displayUser.followers?.length || 0}</StatValue>
                        <StatLabel>Followers</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue>{displayUser.following?.length || 0}</StatValue>
                        <StatLabel>Following</StatLabel>
                    </StatItem>
                </StatsRow>
            </HeroSection>

            {/* About Section */}
            <SectionContainer>
                <SectionTitle>About</SectionTitle>
                <InfoRow>
                    {isEditingAbout ? (
                        <Input 
                            type="text" 
                            value={about} 
                            onChange={(e) => setAbout(e.target.value)} 
                            autoFocus
                        />
                    ) : (
                        <InfoText>{about}</InfoText>
                    )}
                    
                    {isEditable && (
                        <EditAction onClick={isEditingAbout ? handleSaveAbout : () => setIsEditingAbout(true)}>
                            {isEditingAbout ? <MdCheck /> : <MdModeEditOutline />}
                        </EditAction>
                    )}
                </InfoRow>
            </SectionContainer>

            {/* Name Section (Editable only) or Other Info */}
             <SectionContainer>
                <SectionTitle>Name</SectionTitle>
                <InfoRow>
                     {isEditingName ? (
                        <Input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            autoFocus
                        />
                    ) : (
                        <InfoText>{name}</InfoText>
                    )}
                    
                    {isEditable && (
                        <EditAction onClick={isEditingName ? handleSaveName : () => setIsEditingName(true)}>
                            {isEditingName ? <MdCheck /> : <MdModeEditOutline />}
                        </EditAction>
                    )}
                </InfoRow>
                {isEditable && <UserStatus style={{ marginTop: '0.5rem', display: 'block', textAlign: 'left', fontSize: '0.85rem' }}>This is not your username or pin. This name will be visible to your contacts.</UserStatus>}
            </SectionContainer>

        </ScrollableContent>
      </DrawerContainer>

      {/* Cropping Modal */}
      {isCropping && (
          <CropModal>
              <CropContainer>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
              </CropContainer>
              <CropControls>
                  <Button onClick={() => setIsCropping(false)}>Cancel</Button>
                  <Slider type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} />
                  <Button $primary onClick={showCroppedImage}>Save</Button>
              </CropControls>
          </CropModal>
      )}
    </>
  );
};

export default ProfileDrawer;