import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, useWindowDimensions, Animated, Pressable } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

interface TouchEvent {
  x: number;
  y: number;
  type: 'start' | 'active' | 'end';
}

interface PathData {
  path: string;
  color: string;
  brushType: string;
  brushSize: number;
}

const PaintScreen = () => {
  const { width, height } = useWindowDimensions();
  const CANVAS_HEIGHT = height * 0.8;
  const CANVAS_WIDTH = width;
  const PANEL_WIDTH = 200;

  // Animaciones para los paneles
  const leftPanelAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const rightPanelAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(8);
  const [brushType, setBrushType] = useState('normal');
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentPath, setCurrentPath] = useState<PathData | null>(null);
  const [canvasRef, setCanvasRef] = useState<any>(null);

  const colors = [
    '#000000', // Negro
    '#FFFFFF', // Blanco
    '#FF0000', // Rojo
    '#00FF00', // Verde
    '#0000FF', // Azul
    '#FFFF00', // Amarillo
    '#FFA500', // Naranja
    '#800080', // Púrpura
    '#00FFFF', // Cian
    '#808080', // Gris
    '#A52A2A', // Marrón
    '#FFC0CB', // Rosa
  ];

  const brushTypes = [
    { id: 'normal', name: 'Normal' },
    { id: 'round', name: 'Redondo' },
    { id: 'square', name: 'Cuadrado' },
    { id: 'spray', name: 'Spray' },
  ];

  const toggleLeftPanel = () => {
    // If right panel is open, close it first
    if (isRightPanelVisible) {
      Animated.spring(rightPanelAnim, {
        toValue: -PANEL_WIDTH,
        useNativeDriver: false,
        friction: 8,
      }).start(() => {
        setIsRightPanelVisible(false);
        // Then open left panel
        const toValue = isLeftPanelVisible ? -PANEL_WIDTH : 0;
        Animated.spring(leftPanelAnim, {
          toValue,
          useNativeDriver: false,
          friction: 8,
        }).start();
        setIsLeftPanelVisible(!isLeftPanelVisible);
      });
    } else {
      // If right panel is closed, just toggle left panel
      const toValue = isLeftPanelVisible ? -PANEL_WIDTH : 0;
      Animated.spring(leftPanelAnim, {
        toValue,
        useNativeDriver: false,
        friction: 8,
      }).start();
      setIsLeftPanelVisible(!isLeftPanelVisible);
    }
  };

  const toggleRightPanel = () => {
    // If left panel is open, close it first
    if (isLeftPanelVisible) {
      Animated.spring(leftPanelAnim, {
        toValue: -PANEL_WIDTH,
        useNativeDriver: false,
        friction: 8,
      }).start(() => {
        setIsLeftPanelVisible(false);
        // Then open right panel
        const toValue = isRightPanelVisible ? -PANEL_WIDTH : 0;
        Animated.spring(rightPanelAnim, {
          toValue,
          useNativeDriver: false,
          friction: 8,
        }).start();
        setIsRightPanelVisible(!isRightPanelVisible);
      });
    } else {
      // If left panel is closed, just toggle right panel
      const toValue = isRightPanelVisible ? -PANEL_WIDTH : 0;
      Animated.spring(rightPanelAnim, {
        toValue,
        useNativeDriver: false,
        friction: 8,
      }).start();
      setIsRightPanelVisible(!isRightPanelVisible);
    }
  };

/*   const toggleLeftPanel = () => {
    const toValue = isLeftPanelVisible ? -PANEL_WIDTH : 0;
    Animated.spring(leftPanelAnim, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();
    setIsLeftPanelVisible(!isLeftPanelVisible);
  };

  const toggleRightPanel = () => {
    const toValue = isRightPanelVisible ? -PANEL_WIDTH : 0;
    Animated.spring(rightPanelAnim, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();
    setIsRightPanelVisible(!isRightPanelVisible);
  }; */

  const createBrushStroke = (x: number, y: number, type: 'start' | 'active') => {
    switch (brushType) {
      case 'round':
        return type === 'start' ? `M${x},${y} m-${brushSize},0 a${brushSize},${brushSize} 0 1,0 ${brushSize * 2},0 a${brushSize},${brushSize} 0 1,0 -${brushSize * 2},0` : `L${x},${y}`;
      case 'square':
        const half = brushSize / 2;
        return type === 'start' ? `M${x - half},${y - half} h${brushSize} v${brushSize} h-${brushSize} Z` : `L${x},${y}`;
      case 'spray':
        let sprayPath = '';
        for (let i = 0; i < 10; i++) {
          const randX = x + (Math.random() - 0.5) * brushSize * 2;
          const randY = y + (Math.random() - 0.5) * brushSize * 2;
          sprayPath += `M${randX},${randY} L${randX + 1},${randY + 1} `;
        }
        return sprayPath;
      default:
        return type === 'start' ? `M${x},${y}` : `L${x},${y}`;
    }
  };

  const onTouch = ({ x, y, type }: TouchEvent) => {
    const touchX = Number(x);
    const touchY = Number(y);

    if (isNaN(touchX) || isNaN(touchY)) return;

    switch (type) {
      case 'start': {
        const path = createBrushStroke(touchX, touchY, 'start');
        setCurrentPath({
          path,
          color,
          brushType,
          brushSize,
        });
        break;
      }
      case 'active': {
        if (!currentPath) return;
        const newStroke = createBrushStroke(touchX, touchY, 'active');
        setCurrentPath({
          ...currentPath,
          path: `${currentPath.path} ${newStroke}`,
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

  return (
    <View style={styles.container}>
      {/* Botón para panel izquierdo */}
      <TouchableOpacity 
        style={styles.leftPanelButton}
        onPress={toggleLeftPanel}
      >
        <Text style={styles.panelButtonText}>🖌️</Text>
      </TouchableOpacity>

      {/* Panel izquierdo (Pinceles) */}
      <Animated.View style={[
        styles.leftPanel,
        {
          transform: [{ translateX: leftPanelAnim }],
        }
      ]}>
        <Text style={styles.panelTitle}>Pinceles</Text>
        
        <View style={styles.brushTypesContainer}>
          {brushTypes.map((brush) => (
            <TouchableOpacity
              key={brush.id}
              style={[
                styles.brushTypeButton,
                brushType === brush.id && styles.selectedBrushType
              ]}
              onPress={() => setBrushType(brush.id)}
            >
              <Text style={[
                styles.brushTypeText,
                brushType === brush.id && styles.selectedBrushText
              ]}>{brush.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.brushSizeContainer}>
          <Text style={styles.sectionTitle}>Tamaño: {brushSize}</Text>
          <View style={styles.brushSizeButtons}>
            <TouchableOpacity
              style={styles.sizeButton}
              onPress={() => setBrushSize(Math.max(2, brushSize - 2))}
            >
              <Text style={styles.sizeButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sizeButton}
              onPress={() => setBrushSize(Math.min(30, brushSize + 2))}
            >
              <Text style={styles.sizeButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Botón para panel derecho */}
      <TouchableOpacity 
        style={styles.rightPanelButton}
        onPress={toggleRightPanel}
      >
        <Text style={styles.panelButtonText}>🎨</Text>
      </TouchableOpacity>

      {/* Panel derecho (Colores) */}
      <Animated.View style={[
        styles.rightPanel,
        {
          transform: [{ translateX: rightPanelAnim }],
        }
      ]}>
        <Text style={styles.panelTitle}>Colores</Text>
        <View style={styles.colorGrid}>
          {colors.map((colorValue) => (
            <TouchableOpacity
              key={colorValue}
              style={[
                styles.colorButton,
                { backgroundColor: colorValue },
                color === colorValue && styles.selectedColor
              ]}
              onPress={() => setColor(colorValue)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            setPaths([]);
            setCurrentPath(null);
          }}
        >
          <Text style={styles.clearButtonText}>Limpiar</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
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
            <Path
              key={index}
              d={path.path}
              stroke={path.color}
              strokeWidth={path.brushSize}
              fill={path.brushType === 'square' ? path.color : 'none'}
            />
          ))}
          {currentPath && (
            <Path
              d={currentPath.path}
              stroke={currentPath.color}
              strokeWidth={currentPath.brushSize}
              fill={currentPath.brushType === 'square' ? currentPath.color : 'none'}
            />
          )}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  canvas: {
    flex: 1,
    backgroundColor: 'white',
  },
  leftPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 200,
    backgroundColor: 'white',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
  },
  rightPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 200,
    backgroundColor: 'white',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
  },
  leftPanelButton: {
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25,
    zIndex: 3,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  rightPanelButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25,
    zIndex: 3,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  panelButtonText: {
    fontSize: 24,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  brushTypesContainer: {
    marginBottom: 20,
  },
  brushTypeButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedBrushType: {
    backgroundColor: '#007AFF',
  },
  brushTypeText: {
    fontSize: 16,
    color: '#333',
  },
  selectedBrushText: {
    color: 'white',
  },
  brushSizeContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  brushSizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  sizeButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonText: {
    fontSize: 20,
    color: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  selectedColor: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaintScreen;

