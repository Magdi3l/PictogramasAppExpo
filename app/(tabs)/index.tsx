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
};

const imagesDirectory = FileSystem.documentDirectory + 'images/';
const soundsDirectory = FileSystem.documentDirectory + 'sounds/';

interface Pictogram {
  name: string;
  image: string;
  sound: string;
}

// Componente principal
const App = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null); 
  const [userPictograms, setUserPictograms] = useState<Pictogram[]>([]); 
  const [allPictograms, setAllPictograms] = useState<Pictogram[]>([]);
  const searchParams = useSearchParams();
  const refreshPictograms = searchParams.get('refreshPictograms') === 'true';
  const updatePictos = searchParams.get('updatePictos') === 'true';
  const [iconDelete, setIconDelete] = useState(false);
  

  const playSound = async (soundUri: string) => {
    try {
      console.log('Reproduciendo sonido desde URI:', soundUri);
  
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
      { name: 'Sí', image: require('../../assets/images/si.jpg'), sound: 'sound1' },
      { name: 'No', image: require('../../assets/images/no.jpg'), sound: 'sound2' },
      { name: 'Comer', image: require('../../assets/images/comer.jpg'), sound: 'sound3' },
      { name: 'Papá', image: require('../../assets/images/papa.jpg'), sound: 'sound4' },
      { name: 'Mamá', image: require('../../assets/images/mama1.jpg'), sound: 'sound5' },
      { name: 'Saludar', image: require('../../assets/images/saludar.jpg'), sound: 'sound6' },
      { name: 'Feliz', image: require('../../assets/images/feliz.png'), sound: 'sound7' },
      { name: 'Triste', image: require('../../assets/images/triste.png'), sound: 'sound8' },
      { name: 'Sed', image: require('../../assets/images/sed.png'), sound: 'sound9' },
      { name: 'Baño', image: require('../../assets/images/bano.png'), sound: 'sound10' },
      { name: 'Dolor', image: require('../../assets/images/dolor.png'), sound: 'sound11' },
      { name: 'Jugar', image: require('../../assets/images/jugar.png'), sound: 'sound12' },
      { name: 'Pintar', image: require('../../assets/images/pintar.png'), sound: 'sound13' },
      { name: 'Música', image: require('../../assets/images/musica.png'), sound: 'sound14' },
      { name: 'Abrazo', image: require('../../assets/images/abrazo.png'), sound: 'sound15' },
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
      console.log("update", updatePictos)
      setIconDelete(true); 
    } else {
      setIconDelete(false);
      console.log("update", updatePictos)
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
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={styles.pictogramsContainer}>
        {allPictograms.map((pictogram, index) => (
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
    fontSize: 14,
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
