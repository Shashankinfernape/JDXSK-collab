import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/user.service';
import { IoMdArrowBack, IoMdClose } from 'react-icons/io';
import { MdEdit, MdCheck, MdPhotoCamera } from 'react-icons/md';
import Input from '../common/Input';
import Cropper from 'react-easy-crop';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease;
`;

const DrawerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${props => props.theme.panel_width};
  max-width: ${props => props.theme.max_panel_width};
  min-width: 300px;
  height: 100vh;
  background-color: ${props => props.theme.colors.black};
  z-index: 1001;
  transform: ${props => (props.isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.3s ease-out;
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  padding: 1rem;
  padding-top: 3.5rem;
  background-color: ${props => props.theme.colors.black_lightest};
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.white};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
`;

const HeaderTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.white};
`;

const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 1.5rem;
  overflow-y: auto;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 4px solid ${props => props.theme.colors.black_lighter};
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
  color: white;
  
  ${ImageContainer}:hover & {
    opacity: 1;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const InfoBlock = styled.div`
  width: 100%;
  padding: 1rem;
  background-color: ${props => props.theme.colors.black_lighter};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoLabel = styled.label`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  text-transform: uppercase;
`;

const InfoText = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.grey_light};
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
`;

// Crop Modal Styles
const CropModal = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #000;
  z-index: 2000;
  display: flex;
  flex-direction: column;
`;

const CropContainer = styled.div`
  position: relative;
  flex: 1;
  background: #333;
`;

const CropControls = styled.div`
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: #111;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: ${props => props.primary ? props.theme.colors.primary : '#444'};
  color: white;
`;

const Slider = styled.input`
  width: 50%;
`;


// Helper to create the cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

// Returns a base64 string
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
  );

  return canvas.toDataURL('image/jpeg');
}


const ProfileDrawer = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [name, setName] = useState(user.name);
  const [about, setAbout] = useState(user.about || 'Just watching Netflix... and chatting.');
  
  // Crop State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleSaveName = async () => {
    try {
      const { data: updatedUser } = await userService.updateUser({ name });
      updateUser(updatedUser); 
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update name", error);
    }
  };
  
  const handleSaveAbout = async () => {
    try {
      const { data: updatedUser } = await userService.updateUser({ about });
      updateUser(updatedUser); 
      setIsEditingAbout(false);
    } catch (error) {
      console.error("Failed to update about", error);
    }
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setIsCropping(true);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      );
      
      // Upload to server
      const { data: updatedUser } = await userService.updateUser({ profilePic: croppedImageBase64 });
      updateUser(updatedUser);
      setIsCropping(false);
      setImageSrc(null);
      
    } catch (e) {
      console.error(e);
      alert("Failed to update profile picture");
    }
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <DrawerContainer isOpen={isOpen}>
        <DrawerHeader>
          <BackButton onClick={onClose}>
            <IoMdArrowBack />
          </BackButton>
          <HeaderTitle>Profile</HeaderTitle>
        </DrawerHeader>

        <ProfileContent>
          <ImageContainer onClick={() => fileInputRef.current.click()}>
              <ProfileImage src={user.profilePic || `https://i.pravatar.cc/150?u=${user._id}`} alt="Profile" />
              <ImageOverlay>
                  <MdPhotoCamera size={30} />
                  <span>Change</span>
              </ImageOverlay>
          </ImageContainer>
          <HiddenInput 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={onFileChange} 
          />

          <InfoBlock>
            <InfoLabel>Your Name</InfoLabel>
            {isEditingName ? (
              <InfoRow>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <EditButton onClick={handleSaveName}><MdCheck /></EditButton>
              </InfoRow>
            ) : (
              <InfoRow>
                <InfoText>{user.name}</InfoText>
                <EditButton onClick={() => setIsEditingName(true)}><MdEdit /></EditButton>
              </InfoRow>
            )}
          </InfoBlock>

          <InfoBlock>
            <InfoLabel>About</InfoLabel>
             {isEditingAbout ? (
              <InfoRow>
                <Input type="text" value={about} onChange={(e) => setAbout(e.target.value)} />
                <EditButton onClick={handleSaveAbout}><MdCheck /></EditButton>
              </InfoRow>
            ) : (
              <InfoRow>
                <InfoText>{user.about || 'Just watching Netflix... and chatting.'}</InfoText>
                <EditButton onClick={() => setIsEditingAbout(true)}><MdEdit /></EditButton>
              </InfoRow>
            )}
          </InfoBlock>
        </ProfileContent>
      </DrawerContainer>
      
      {/* Cropping Modal */}
      {isCropping && (
          <CropModal>
              <CropContainer>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // 1:1 Aspect Ratio (Square)
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
              </CropContainer>
              <CropControls>
                  <Button onClick={() => setIsCropping(false)}>Cancel</Button>
                  <Slider
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(e.target.value)}
                  />
                  <Button primary onClick={showCroppedImage}>Save</Button>
              </CropControls>
          </CropModal>
      )}
    </>
  );
};

export default ProfileDrawer;