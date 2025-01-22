import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View, Image, Alert, TouchableOpacity, Text, Dimensions,} from 'react-native';
import { Audio } from 'expo-av'; 
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks';

import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window')

const soundMap: { [key: string]: any } = {
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
  sound16: require('../../assets/sounds/yo-quiero-participar.mp3'),
  sound17: require('../../assets/sounds/dulce.mp3'),
  sound18: require('../../assets/sounds/cumpleaos.mp3'),
  sound19: require('../../assets/sounds/felicidades.mp3'),
  sound20: require('../../assets/sounds/cinturon.mp3'),
  sound21: require('../../assets/sounds/nomegusta.mp3'),
};

const imagesDirectory = FileSystem.documentDirectory + 'images/';
const soundsDirectory = FileSystem.documentDirectory + 'sounds/';

interface Pictogram {
  name: string;
  image: string;
  sound: string;
  category: string;
}

// Componente principal
const App = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null); 
  const [userPictograms, setUserPictograms] = useState<Pictogram[]>([]); 
  const [allPictograms, setAllPictograms] = useState<Pictogram[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const searchParams = useSearchParams();
  const refreshPictograms = searchParams.get('refreshPictograms') === 'true';
  const updatePictos = searchParams.get('updatePictos') === 'true';
  const [iconDelete, setIconDelete] = useState(false);
  

  const categories = ["Todos", "Acciones", "Emociones", "Respuestas Rapidas", "Personalizados"];

  const playSound = async (soundUri: string) => {
    try {
      if (soundMap[soundUri]) {
        const { sound } = await Audio.Sound.createAsync(soundMap[soundUri]);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } else {
        
        const soundFileUri = soundUri;
  
        const { sound } = await Audio.Sound.createAsync({ uri: soundFileUri });
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      }
    } catch (error) {
      console.error('Error reproduciendo sonido:', error);
    }
  };

  const loadDefaultPictograms = () => {
    const defaultPictograms = [
      { name: 'Sí', image: require('../../assets/images/si.jpg'), sound: 'sound1', category:'Respuestas Rapidas' },
      { name: 'No', image: require('../../assets/images/no.jpg'), sound: 'sound2',category:'Respuestas Rapidas' },
      { name: 'Comer', image: require('../../assets/images/comer.jpg'), sound: 'sound3', category:'Acciones'},
      { name: 'Papá', image: require('../../assets/images/papa.jpg'), sound: 'sound4', category:'Respuestas Rapidas'},
      { name: 'Mamá', image: require('../../assets/images/mama.jpg'), sound: 'sound5', category:'Respuestas Rapidas' },
      { name: 'Saludar', image: require('../../assets/images/saludar.jpg'), sound: 'sound6', category:'Acciones' },
      { name: 'Feliz', image: require('../../assets/images/feliz.png'), sound: 'sound7', category:'Emociones' },
      { name: 'Triste', image: require('../../assets/images/triste.png'), sound: 'sound8',category:'Emociones' },
      { name: 'Sed', image: require('../../assets/images/sed.png'), sound: 'sound9', category:'Acciones' },
      { name: 'Baño', image: require('../../assets/images/bano.png'), sound: 'sound10', category:'Acciones' },
      { name: 'Dolor', image: require('../../assets/images/dolor.png'), sound: 'sound11', category:'Emociones' },
      { name: 'Jugar', image: require('../../assets/images/jugar.png'), sound: 'sound12', category:'Accion' },
      { name: 'Pintar', image: require('../../assets/images/pintar.png'), sound: 'sound13', category:'Accion'},
      { name: 'Musica', image: require('../../assets/images/musica.png'), sound: 'sound14', category:'Respuestas Rapidas'},
      { name: 'Abrazo', image: require('../../assets/images/abrazo.png'), sound: 'sound15', category:'Respuestas Rapidas'},
      { name: 'Participar', image: require('../../assets/images/yo-quiero-participar.png'), sound: 'sound16', category:'Accion'},
      { name: 'Dulce', image: require('../../assets/images/dulce.png'), sound: 'sound17', category:'Accion'},
      { name: 'Feliz Cumpleaños', image: require('../../assets/images/cumpleaos.png'), sound: 'sound18', category:'Respuestas Rapidas'},
      { name: 'Felicitaciones', image: require('../../assets/images/felicidades.png'), sound: 'sound19', category:'Respuestas Rapidas'},
      { name: 'Mi cinturon', image: require('../../assets/images/cinturon.png'), sound: 'sound20', category:'Respuestas Rapidas'},
      { name: 'No me gusta', image: require('../../assets/images/nomegusta.png'), sound: 'sound21', category:'Respuestas Rapidas'},
    ];
    setAllPictograms(defaultPictograms);
  };
  const loadUserPictograms = async () => {
    try {
      const imageFiles = await FileSystem.readDirectoryAsync(imagesDirectory);
      const soundFiles = await FileSystem.readDirectoryAsync(soundsDirectory);

      const loadedPictograms = imageFiles
        .map((image) => {
          const name = image.split('.')[0];
          const soundFile = soundFiles.find((sound) => sound.startsWith(name));
          if (soundFile) {
            return {
              name,
              image: `${imagesDirectory}${image}`,
              sound: `${soundsDirectory}${soundFile}`,
              category: 'Personalizados',
            };
          }
          return null;
        })
        .filter((item): item is Pictogram => item !== null);

      setUserPictograms(loadedPictograms);
      router.push({
        pathname: '/(tabs)',
        params: {
          refreshPictograms: 'false',
        },
      });
    } catch (error) {
      console.error('Error loading user pictograms:', error);
    }

  };
  useEffect(() => {
    loadDefaultPictograms();
    loadUserPictograms();
  }, []);

  useEffect(() => {
    if (refreshPictograms === true) {
      loadUserPictograms(); 
    }
  }, [refreshPictograms]);

  useEffect(() => {
    if (updatePictos === true) {
      setIconDelete(true); 
    } else {
      setIconDelete(false);
    }
  }, [updatePictos]);
  
  useEffect(() => {
    setAllPictograms((prevPictograms) => {
      const newPictograms = userPictograms.filter((userPicto) => 
        !prevPictograms.some((existingPicto) => existingPicto.name === userPicto.name)
      );
      return [...prevPictograms, ...newPictograms];
    });
  }, [userPictograms]);
  

  const filteredPictograms = selectedCategory === 'Todos' 
    ? allPictograms 
    : allPictograms.filter(pictogram => pictogram.category === selectedCategory);

  const renderImage = (pictogram: Pictogram) => {
    if (typeof pictogram.image === 'number') {
      return <Image source={pictogram.image} style={styles.pictogramImage} />
    } else {
      return <Image source={{ uri: pictogram.image }} style={styles.pictogramImage} />
    }
  }

  const handleDeletePictogram = async (pictogram: Pictogram) => {
    const defaultPictogramsNames = [
      'Sí', 'No', 'Comer', 'Papá', 'Mamá', 'Saludar', 'Feliz', 'Triste', 'Sed', 'Baño', 'Dolor', 'Jugar', 'Pintar', 'Música', 'Abrazo',
    ];

    if (defaultPictogramsNames.includes(pictogram.name)) {
      playSound('sound2'); 
      Alert.alert('Este pictograma no se puede eliminar.');
    } else {
      try {

        await FileSystem.deleteAsync(pictogram.image, { idempotent: true });
        await FileSystem.deleteAsync(pictogram.sound, { idempotent: true });

        const updatedPictograms = userPictograms.filter(item => item.name !== pictogram.name);
        setUserPictograms(updatedPictograms); 
        loadDefaultPictograms();
        loadUserPictograms();
  
        Alert.alert(`Pictograma ${pictogram.name} eliminado.`);
        
      } catch (error) {
        console.error('Error al eliminar el pictograma:', error);
        Alert.alert('Error al eliminar el pictograma.');
      }
    }
  };  

  return (
    <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#4a90e2" />

    <ScrollView horizontal contentContainerStyle={styles.categoryContainer} showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonSelected
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.categoryButtonTextSelected
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={styles.pictogramsContainer}>
        {filteredPictograms.map((pictogram, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => playSound(pictogram.sound)}
            style={styles.pictogram}
          >
            {renderImage(pictogram)}
            <Text style={styles.pictogramText}>{pictogram.name}</Text>

            {iconDelete && (
              <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleDeletePictogram(pictogram)}
            >
              <Ionicons name="trash-outline" size={30} color="#ff0000" />
            </TouchableOpacity>
            )}
          </TouchableOpacity>

        ))}
      </View>
    </ScrollView>
  </SafeAreaView>
  );
};

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
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom:35,
  },
  categoryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10, 
    borderRadius: 20,
    marginHorizontal: 5,
    marginVertical:5,
    height: 125,
  },
  categoryButtonSelected: {
    backgroundColor: '#4a90e2',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#000',
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  pictogramsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  pictogram: {
    width: width / 3 - 20,
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  deleteIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
});

export default App;
