import { Dimensions, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import EditScreenInfo from '@/components/EditScreenInfo';
import { useState } from 'react';
import { Audio } from 'expo-av';
const { width } = Dimensions.get('window');
const soundMap = {
  sound5: require('../../assets/sounds/mama.mp3'),
  sound6: require('../../assets/sounds/saludo.mp3'),
  sound7: require('../../assets/sounds/feliz.mp3'),
};

export default function TabTwoScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null); 
    const playSound = async (soundFile: keyof typeof soundMap) => {
      const { sound } = await Audio.Sound.createAsync(
        soundMap[soundFile] // Usar el mapa para obtener el archivo correspondiente
      );
      setSound(sound); // Establecer el sonido en el estado
      await sound.playAsync(); // Reproducir el sonido
    };
  
  return (
     <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={styles.header.backgroundColor}
          />
          <ScrollView contentInsetAdjustmentBehavior="automatic">
            <View style={styles.header}>
              <Text style={styles.title}>Pictogramas</Text>
            </View>
            <View style={styles.pictogramsContainer}>
            <TouchableOpacity onPress={() => playSound('sound5')} style={styles.pictogram}>
                <Image source={require('../../assets/images/banda.png')} style={styles.pictogramImage} />
                <Text style={styles.pictogramText}>BANDA 24 DE MAYO</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => playSound('sound6')} style={styles.pictogram}>
                <Image source={require('../../assets/images/baladas.png')} style={styles.pictogramImage} />
                <Text style={styles.pictogramText}>BALADAS</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => playSound('sound7')} style={styles.pictogram}>
                <Image source={require('../../assets/images/regueton.png')} style={styles.pictogramImage} />
                <Text style={styles.pictogramText}>REGUETON</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a90e2',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#003c71',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  pictogramsContainer: {
    flexDirection: 'row', // Asegura que estén en fila
    justifyContent: 'space-between', // Espacio entre pictogramas
    flexWrap: 'wrap', // Permite que pasen a otra fila si no hay espacio
    paddingHorizontal: 10, // Margen horizontal
    paddingTop: 20, // Espaciado superior
    gap: 10, // Espaciado uniforme entre elementos
  },
  pictogram: {
    width: width / 3 - 20, // Ajustar tamaño para 3 columnas
    height: width / 3 - 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Fondo blanco para destacar
    shadowColor: '#000', // Sombra para un diseño más elegante
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // Sombra para Android
  },
  pictogramImage: {
    width: '80%',
    height: '70%',
    resizeMode: 'contain', // Escala la imagen sin recortarla
  },
  pictogramText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a4a4a', // Texto más oscuro para contraste
    textAlign: 'center',
  },
});
