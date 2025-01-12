import React, { useState, useRef } from 'react';
import { StyleSheet, View, Button, Text, Image, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import WheelPicker from 'react-native-wheel-color-picker';
import { captureScreen } from 'react-native-view-shot'; // Librería para capturar la pantalla

export default function PaintScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [color, setColor] = useState('#000000'); // Color predeterminado
  const [paintedImage, setPaintedImage] = useState<string | null>(null); // Imagen pintada
  const imageRef = useRef<View>(null); // Ref para capturar la pantalla

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.assets && response.assets[0].uri) {
        setImageUri(response.assets[0].uri); // Asignar la URI de la imagen seleccionada
      }
    });
  };

  // Función para capturar la imagen pintada
  const savePaintedImage = () => {
    if (imageRef.current) {
      captureScreen({
        format: 'jpg', // Formato de la imagen
        quality: 0.8, // Calidad de la imagen
      })
        .then((uri) => {
          setPaintedImage(uri); // Guarda la URI de la imagen pintada
          alert('Imagen guardada con éxito');
        })
        .catch((error) => {
          console.error('Error al capturar la imagen:', error);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paint App</Text>

      {/* Botón para seleccionar la imagen */}
      <Button title="Seleccionar Image" onPress={selectImage} />

      <View style={styles.content}>
        {/* Mostrar la imagen seleccionada a la izquierda */}
        {imageUri && (
          <View ref={imageRef} style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        )}

        {/* Selector de colores a la derecha */}
        <View style={styles.colorPickerContainer}>
          <WheelPicker
            style={styles.wheelPicker}
            color={color} // El color actual seleccionado
            onColorChange={setColor} // Actualizar el color seleccionado
          />
          {/* Mostrar el color actual seleccionado */}
          <Text>Color seleccionado: {color}</Text>
        </View>
      </View>

      {/* Botón para guardar la imagen pintada */}
      {imageUri && (
        <TouchableOpacity onPress={savePaintedImage} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar Imagen</Text>
        </TouchableOpacity>
      )}

      {/* Mostrar la imagen pintada guardada */}
      {paintedImage && (
        <Image source={{ uri: paintedImage }} style={styles.savedImage} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Asegura que los elementos estén alineados arriba
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    flexDirection: 'row', // Disposición horizontal de la imagen y el selector de colores
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 500, // Aumentar el tamaño de la imagen
    height: 500,
    marginRight: 20, // Espacio entre la imagen y el selector de colores
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorPickerContainer: {
    alignItems: 'center',
  },
  wheelPicker: {
    width: 200,
    height: 200,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
  },
  savedImage: {
    marginTop: 20,
    width: 500, // Tamaño de la imagen guardada
    height: 500,
  },
});
