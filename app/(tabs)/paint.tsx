import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

// Definir el tipo para los eventos de toque
interface TouchEvent {
  x: number;
  y: number;
  type: 'start' | 'active' | 'end';
}

// Definir el tipo para un camino
interface PathData {
  path: string;
  color: string;
}

const PaintScreen = () => {
  const { width, height } = useWindowDimensions(); 
  const CANVAS_HEIGHT = height * 0.6; 
  const CANVAS_WIDTH = width - 40;

  const [color, setColor] = useState('#000000'); 
  const [brushSize] = useState(8);  // Tamaño de pincel fijo en 8
  const [paths, setPaths] = useState<PathData[]>([]); 
  const [currentPath, setCurrentPath] = useState<PathData | null>(null); 
  const [canvasRef, setCanvasRef] = useState<any>(null); 

  const onTouch = ({ x, y, type }: TouchEvent) => {
    const touchX = Number(x);
    const touchY = Number(y);

    if (isNaN(touchX) || isNaN(touchY)) return;

    switch (type) {
      case 'start': {
        const path = `M${touchX},${touchY}`;
        setCurrentPath({
          path,
          color,
        });
        break;
      }
      case 'active': {
        if (!currentPath) return;
        setCurrentPath({
          path: `${currentPath.path} L${touchX},${touchY}`,
          color,
        });
        break;
      }
      case 'end': {
        if (!currentPath) return;
        setPaths(prevPaths => [...prevPaths, currentPath]); 
        setCurrentPath(null);
        break;
      }
    }
  };

  const takeScreenshot = () => {
    if (canvasRef) {
      captureRef(canvasRef, {
        format: 'jpg',
        quality: 0.8,
      })
        .then(uri => {
          Alert.alert('Captura de pantalla', `La captura de pantalla se ha guardado en: ${uri}`);
        })
        .catch(error => {
          Alert.alert('Error', 'Hubo un problema al tomar la captura de pantalla.');
        });
    }
  };

  return (
    <View style={styles.container}>
      <Svg
        style={styles.canvas}
        height={CANVAS_HEIGHT}
        width={CANVAS_WIDTH}
        onTouchStart={(e) => onTouch({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY, type: 'start' })}
        onTouchMove={(e) => onTouch({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY, type: 'active' })}
        onTouchEnd={(e) => onTouch({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY, type: 'end' })}
        ref={(ref) => setCanvasRef(ref)}
      >
        {paths.map((path, index) => (
          <Path key={index} d={path.path} stroke={path.color} strokeWidth={brushSize} fill="none" />
        ))}
        {currentPath && (
          <Path d={currentPath.path} stroke={currentPath.color} strokeWidth={brushSize} fill="none" />
        )}
      </Svg>

      <View style={styles.colorPalette}>
        {/* 14 colores (10 básicos + 4 adicionales) */}
        {[
          '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
          '#FF00FF', '#00FFFF', '#FFFFFF', '#808080', '#A52A2A',
          '#D2691E', '#8B0000', '#20B2AA', '#ADFF2F', 
        ].map((colorValue) => (
          <TouchableOpacity
            key={colorValue}
            style={[styles.colorButton, { backgroundColor: colorValue }]}
            onPress={() => setColor(colorValue)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          setPaths([]); // Limpia el lienzo
          setCurrentPath(null);
        }}
      >
        <Text style={styles.actionButtonText}>Limpiar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#34D399' }]}
        onPress={takeScreenshot}
      >
        <Text style={styles.actionButtonText}>Tomar Captura</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  canvas: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'nowrap', // Esto asegura que todos los botones estén en la misma línea
    justifyContent: 'space-evenly',
    marginTop: 20,
    flex: 1,
    alignItems: 'center', // Centra los botones
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  brushSizeContainer: {
    marginTop: 20,
  },
  brushSizeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaintScreen;