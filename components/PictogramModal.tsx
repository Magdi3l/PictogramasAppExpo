import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface PictogramModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, imageUri: string, audioUri: string, category: string) => void;
  onPickFile: (type: 'image' | 'audio') => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  recording: boolean;
  audioFileUri: string;
  imageFileUri: string;
}

const PictogramModal: React.FC<PictogramModalProps> = ({
  visible,
  onClose,
  onSave,
  onPickFile,
  onStartRecording,
  onStopRecording,
  recording,
  audioFileUri,
  imageFileUri,
}) => {
  const [name, setName] = useState('');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [category, setCategory] = useState<string>('Acciones');

  const validateFields = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del pictograma es requerido.');
      return false;
    }
    if (!imageFileUri) {
      Alert.alert('Error', 'Es necesario seleccionar una imagen.');
      return false;
    }
    if (!audioFileUri) {
      Alert.alert('Error', 'Es necesario grabar o seleccionar un audio.');
      return false;
    }
    return true;
  };


  const handleSave = () => {
    if (!validateFields()) return;
    onSave(name, imageFileUri, audioFileUri, category);
    setName('');
    setCategory('Acciones');
  };

  const handleCancel = () => {
    setName('');
    setCategory('Acciones'); 
    onClose();
  };

  const playAudio = async () => {
    if (!audioFileUri) {
      Alert.alert('Error', 'No hay audio seleccionado para reproducir.');
      return;
    }
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioFileUri });
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      Alert.alert('Error', 'No se pudo reproducir el audio.');
    }
  };

  const handlePressIn = () => {
    onStartRecording();
  };

  const handlePressOut = () => {
    onStopRecording();
  };

  return (
    <Modal animationType="slide" visible={visible} transparent>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Agregar Pictograma</Text>
        <Text style={styles.titleCategory}>Seleccione la categoria:</Text>
        <View style={styles.categoryContainer}>
            {['Acciones', 'Emociones', 'Respuestas Rápidas', 'Personalizados'].map((cat) => (
              <Pressable
                key={cat}
                style={[styles.categoryButton, category === cat && styles.selectedCategory]}
                onPress={() => setCategory(cat)}
              >
                <Text style={styles.categoryButtonText}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        <TextInput
          style={styles.input}
          placeholder="Nombre del pictograma"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.titleCategory}>Seleccione la imagen:</Text>
        <View style={styles.previewContainer}>
          {imageFileUri ? (
            <Image source={{ uri: imageFileUri }} style={styles.previewImage} />
          ) : (
            <FontAwesome name="image" size={130} color="#007BFF" />
          )}
          <Pressable onPress={() => onPickFile('image')} style={styles.iconButton}>
            <Ionicons name="add-circle-sharp" size={35} color="black" />
          </Pressable>
        </View>
        <View style={styles.audioContainer}>
          <Text>{audioFileUri ? `${name}` : 'Selecciona o graba un audio'}</Text>
            <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            
          >
            <Ionicons
              name={recording ? 'mic-off' : 'mic-outline'}
              size={recording ? 50: 30 }
              color={recording ? 'red' : 'blue'}
            />
          </Pressable>
          <Pressable onPress={() => onPickFile('audio')} >
            <MaterialIcons name="audiotrack" size={30} color="#007BFF" />
          </Pressable>
          <Pressable onPress={playAudio} >
            <MaterialIcons name="play-arrow" size={30} color="green" />
          </Pressable>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </Pressable>
          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  titleCategory: {
    fontSize: 17,
    fontWeight: 'black',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#007BFF',
  },
  selectedCategory: {
    backgroundColor: '#0056b3',
  },
  categoryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  previewContainer: {
    justifyContent: 'center',
    flexDirection:'row',
  },
  iconButton: {
    margin: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  previewPlaceholder: {
    fontSize: 16,
    color: '#888',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    width: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default PictogramModal;
