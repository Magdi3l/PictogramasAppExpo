import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av'; // Importamos Audio desde expo-av

const { width } = Dimensions.get('window');

// Mapa de sonidos
const soundMap = {
  sound1: require('../../assets/sounds/si.mp3'),
  sound2: require('../../assets/sounds/no.mp3'),
  sound3: require('../../assets/sounds/comer.mp3'),
  sound4: require('../../assets/sounds/papa.mp3'),
  sound5: require('../../assets/sounds/mama.mp3'),
  sound6: require('../../assets/sounds/saludo.mp3'),
  sound7: require('../../assets/sounds/feliz.mp3'),
  sound8: require('../../assets/sounds/triste.mp3'),
  sound9: require('../../assets/sounds/sed.mp3'),
  sound10: require('../../assets/sounds/bano.mp3'),
  sound11: require('../../assets/sounds/dolor.mp3'),
  sound12: require('../../assets/sounds/jugar.mp3'),
  sound13: require('../../assets/sounds/pintar.mp3'),
  sound14: require('../../assets/sounds/musica.mp3'),
  sound15: require('../../assets/sounds/abrazo.mp3'),
};

// Componente principal
const App = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null); // Estado para manejar el sonido

  // Función para reproducir el sonido
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
          <TouchableOpacity onPress={() => playSound('sound1')} style={styles.pictogram}>
            <Image source={require('../../assets/images/si.jpg')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Sí</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound2')} style={styles.pictogram}>
            <Image source={require('../../assets/images/no.jpg')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound3')} style={styles.pictogram}>
            <Image source={require('../../assets/images/comer.jpg')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Comer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound4')} style={styles.pictogram}>
            <Image source={require('../../assets/images/papa.jpg')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Papá</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound5')} style={styles.pictogram}>
            <Image source={require('../../assets/images/mama1.jpg')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Mamá</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound6')} style={styles.pictogram}>
            <Image source={require('../../assets/images/saludar.jpg')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Saludar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound7')} style={styles.pictogram}>
            <Image source={require('../../assets/images/feliz.png')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Feliz</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound8')} style={styles.pictogram}>
            <Image source={require('../../assets/images/triste.png')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Triste</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound9')} style={styles.pictogram}>
            <Image source={require('../../assets/images/sed.png')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Sed</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound10')} style={styles.pictogram}>
            <Image source={require('../../assets/images/bano.png')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Baño</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound11')} style={styles.pictogram}>
            <Image source={require('../../assets/images/dolor.png')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Dolor</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound12')} style={styles.pictogram}>
            <Image source={require('../../assets/images/jugar.png')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Jugar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound13')} style={styles.pictogram}>
            <Image source={require('../../assets/images/pintar.png')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Pintar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound14')} style={styles.pictogram}>
            <Image source={require('../../assets/images/musica.png')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Musica</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => playSound('sound15')} style={styles.pictogram}>
            <Image source={require('../../assets/images/abrazo.png')} style={styles.pictogramImage} />
            <Text style={styles.pictogramText}>Abrazo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  pictogram: {
    width: width / 3 - 20, // Ajuste de tamaño para que se ajuste a 3 columnas
    height: width / 3 - 20,
    margin: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pictogramImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'contain',
  },
  pictogramText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});

export default App;
