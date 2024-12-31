import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, Pressable, Image } from 'react-native';

interface PictogramModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, imageUri: string, audioUri: string) => void;
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

  const handleSave = () => {
    if (!name || !imageFileUri || !audioFileUri) {
      return;
    }
    onSave(name, imageFileUri, audioFileUri);
    setName('');
  };

  const handleCancel = () => {
    setName('');
    onClose();
  };

  return (
    <Modal animationType="slide" visible={visible} transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Agregar Pictograma</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del pictograma"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.previewContainer}>
            {imageFileUri ? (
              <Image source={{ uri: imageFileUri }} style={styles.previewImage} />
            ) : (
              <Text style={styles.previewPlaceholder}>Sin imagen seleccionada</Text>
            )}
          </View>
          <Button title="Seleccionar imagen" onPress={() => onPickFile('image')} />
          <View style={styles.audioContainer}>
            <Text>{audioFileUri ? 'Audio seleccionado' : 'Sin audio seleccionado'}</Text>
            <Button
              title={recording ? 'Detener grabación' : 'Grabar audio'}
              onPress={recording ? onStopRecording : onStartRecording}
              color={recording ? 'red' : 'blue'}
            />
            <Button title="Seleccionar audio" onPress={() => onPickFile('audio')} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Guardar" onPress={handleSave} />
            <Button title="Cancelar" onPress={handleCancel} color="red" />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default PictogramModal;
