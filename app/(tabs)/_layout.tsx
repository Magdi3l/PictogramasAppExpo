import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import PictogramModal from '@/components/PictogramModal';
import { Audio } from 'expo-av';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

interface Pictogram {
  name: string;
  image: string;
  sound: string;
}

const imagesDirectory = FileSystem.documentDirectory + 'images/';
const soundsDirectory = FileSystem.documentDirectory + 'sounds/';

export default function TabLayout() {
  const router = useRouter();
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const colorScheme = useColorScheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioFileUri, setAudioFileUri] = useState('');
  const [imageFileUri, setImageFileUri] = useState('');
  const [updatePictos, setUpdatePictos] = useState(false);
  

  const openModal = () => setIsModalVisible(true);

  const closeModal = () => {
    // Limpiar los valores al cerrar el modal
    setImageFileUri('');
    setAudioFileUri('');
    setIsModalVisible(false);
  };

  const handlePickFile = async (type: 'image' | 'audio') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: type === 'image' ? 'image/*' : 'audio/*',
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        if (type === 'image') setImageFileUri(asset.uri);
        else setAudioFileUri(asset.uri);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      const {status} = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permisos de microfono no concedidos');
        return
      }
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
          setAudioFileUri(uri);
        }
        setRecording(null);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleSavePictogram = async (name: string, imageUri: string, audioUri: string) => {
    try {
      const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '');
      const newImageUri = `${imagesDirectory}${sanitizedName}.jpg`;
      const newAudioUri = `${soundsDirectory}${sanitizedName}.m4a`;

      await FileSystem.copyAsync({ from: imageUri, to: newImageUri });
      await FileSystem.copyAsync({ from: audioUri, to: newAudioUri });

      console.log('Archivos guardados correctamente.');

      setImageFileUri('');
      setAudioFileUri('');

      setIsModalVisible(false);
      router.push({
        pathname: '/(tabs)',
        params: {
          refreshPictograms: 'true',
        },
      });
      closeModal();
    } catch (error) {
      console.error('Error saving pictogram:', error);
    }
  };

  const handleUpdtPictograms = async () => {
    setUpdatePictos(!updatePictos)
    if (updatePictos)
    router.push({
      pathname: '/(tabs)',
      params: {
        updatePictos: 'true',
      }
    })
    else {
      router.push({
        pathname: '/(tabs)',
        params: {
          updatePictos: 'false',
          },
        })
    }
  }

  

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'black',
          headerShown: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'PICTOGRAMAS',
            tabBarIcon: () => <Ionicons name="mic-outline" size={24} color="black" />,
            headerRight: () => (
              <View style={{ flexDirection: 'row', marginRight: 10 }}>
                <Pressable style={{ marginRight: 30 }} onPress={openModal}>
                  <Ionicons name="add-circle" size={35} color="black" />
                </Pressable>
                <Pressable onPress={handleUpdtPictograms}>
                  <Ionicons name="create" size={35} color="black" />
                </Pressable>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="music"
          options={{
            title: 'Music Player',
            tabBarIcon: ({ color }) => <Ionicons name="musical-notes-sharp" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="paint"
          options={{
            title: 'Paint',
            tabBarIcon: ({ color }) => <Ionicons name="brush" size={24} color={color} />,
          }}
        />
      </Tabs>

      <PictogramModal
        visible={isModalVisible}
        onClose={closeModal}
        onSave={handleSavePictogram}
        onPickFile={handlePickFile}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        recording={recording !== null}
        audioFileUri={audioFileUri}
        imageFileUri={imageFileUri}
      />
    </>
  );
}
