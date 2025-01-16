import AmongUsCharacter from '@/components/pinteres';
import Landscape from '@/components/pinteres';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, PanResponder } from 'react-native';

export default function PaintScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null); // URI de la imagen seleccionada
  const [color, setColor] = useState('#000000'); // Color del pincel
  const [brushSize, setBrushSize] = useState(5); // Tamaño del pincel
  const [isDrawing, setIsDrawing] = useState(false); // Controla si el usuario está dibujando
  const canvasRef = useRef(null); // Referencia al lienzo
  const lastPosition = useRef({ x: 0, y: 0 }); // Guarda la última posición del toque

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const touch = e.nativeEvent.touches[0];
        lastPosition.current = { x: touch.pageX, y: touch.pageY };
        setIsDrawing(true);
      },
      onPanResponderMove: (e) => {
        if (!isDrawing) return;

        const touch = e.nativeEvent.touches[0];
        const offsetX = touch.pageX;
        const offsetY = touch.pageY;

        const currentPosition = { x: offsetX, y: offsetY };
        const canvas = canvasRef.current;

        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.beginPath();
          ctx.moveTo(lastPosition.current.x, lastPosition.current.y);
          ctx.lineTo(currentPosition.x, currentPosition.y);
          ctx.stroke();
        }

        lastPosition.current = currentPosition;
      },
      onPanResponderRelease: () => {
        setIsDrawing(false);
      },
    })
  ).current;

  // Lista de imágenes para elegir
  const images = [
    require('../../assets/pictures/flores.jpeg'),
    require('../../assets/pictures/flores.jpeg'),
    require('../../assets/pictures/flores.jpeg'),
  ];

  // Función para seleccionar una imagen
  const selectLocalImage = (image) => {
    setImageUri(image); // Actualiza el URI de la imagen seleccionada
  };

  // Función para limpiar el dibujo
  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el lienzo
      if (imageUri) {
        drawImageOnCanvas(imageUri); // Redibujar la imagen
      }
    }
  };

  // Manejo del lienzo al cargar
  const handleCanvas = (canvas) => {
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = 400;
      canvas.height = 400;
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = color;
    }
  };

  // Cargar la imagen seleccionada sobre el lienzo
  const drawImageOnCanvas = (imageUri) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (imageUri) {
      const img = Image.resolveAssetSource(imageUri);
      const { width, height } = img;

      img.onLoad = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  };

  // Actualizar la imagen en el lienzo cada vez que cambia
  useEffect(() => {
    if (imageUri) {
      drawImageOnCanvas(imageUri); // Redibujar la imagen cada vez que cambia
    }
  }, [imageUri]);

  return (
    <View style={styles.container}>
      {/* Lista de imágenes para seleccionar */}
      <View style={styles.imageList}>
        {images.map((image, index) => (
          <TouchableOpacity key={index} onPress={() => selectLocalImage(image)}>
            <Image source={image} style={styles.thumbnail} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        <AmongUsCharacter />
      </View>

      {/* Contenedor de colores */}
      <View style={styles.colorPalette}>
        {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'].map((colorValue) => (
          <TouchableOpacity
            key={colorValue}
            style={[styles.colorButton, { backgroundColor: colorValue }]}
            onPress={() => setColor(colorValue)}
          />
        ))}
      </View>

      {/* Contenedor de tamaño de pincel */}
      <View style={styles.brushSizeContainer}>
        <Text style={styles.brushSizeText}>Tamaño del Pincel: {brushSize}</Text>
        <TouchableOpacity onPress={() => setBrushSize(brushSize + 1)} style={styles.sizeButton}>
          <Text style={styles.sizeButtonText}>Aumentar tamaño</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setBrushSize(brushSize - 1)} style={styles.sizeButton}>
          <Text style={styles.sizeButtonText}>Reducir tamaño</Text>
        </TouchableOpacity>
      </View>

      {/* Contenedor de botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={clearDrawing} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Limpiar Dibujo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 10,
  },
  content: {
    position:'relative',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    top: 50,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  image: {
    width: 400,
    height: 400,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  canvasWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 400,
    height: 400,
    zIndex: 1,
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 400,
    height: 400,
    zIndex: 2,
  },
  imageList: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 'auto'
  },
  thumbnail: {
    width: 75,
    height: '35%',
    marginRight: 10,
    borderRadius: 5,
  },
  colorPalette: {
    position: 'relative',
    top: 20,
    left: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 10,
  },
  brushSizeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  brushSizeText: {
    fontSize: 16,
  },
  sizeButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  sizeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
