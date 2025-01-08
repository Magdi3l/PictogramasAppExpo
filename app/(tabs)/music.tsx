import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
  Alert,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ImageMap {
  [key: string]: ImageSourcePropType;
}

const imageMap: ImageMap = {
  banda: require('../../assets/images/banda.png'),
  baladas: require('../../assets/images/baladas.png'),
  regueton: require('../../assets/images/regueton.png'),
};

export default function TabTwoScreen(): JSX.Element {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<string>('');

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        Alert.alert('Error', 'No se pudo configurar el audio');
      }
    };
    
    configureAudio();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const pickAudioFile = async (genre: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const audioUri = result.assets[0].uri;
        const fileName = result.assets[0].name;
        
        await playSound(audioUri);
        setCurrentSong(fileName || 'Canción seleccionada');
        Alert.alert('Éxito', `Música de ${genre} cargada: ${fileName}`);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo seleccionar el archivo de música. Por favor, intente nuevamente.'
      );
    }
  };

  const playSound = async (uri: string) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if ('isLoaded' in status && !status.isLoaded) return;
          if ('didJustFinish' in status && status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      );
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if ('isLoaded' in status && status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });
      
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo reproducir el archivo de audio');
    }
  };

  const pauseSound = async () => {
    try {
      if (sound && isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo pausar la reproducción');
    }
  };

  const resumeSound = async () => {
    try {
      if (sound && !isPlaying) {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo reanudar la reproducción');
    }
  };

  const restartSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo reiniciar la reproducción');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={styles.header.backgroundColor}
      />
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
      >
        <View style={styles.header}>
          <Ionicons name="musical-notes" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.title}>Tu Música</Text>
        </View>
        <View style={styles.pictogramsContainer}>
          {Object.entries(imageMap).map(([key, image]) => (
            <TouchableOpacity
              key={key}
              onPress={() => pickAudioFile(key)}
              style={styles.pictogram}
            >
              <Image
                source={image}
                style={styles.pictogramImage}
              />
              <Text style={styles.pictogramText}>{key.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {currentSong && (
          <View style={styles.songInfoContainer}>
            <Text style={styles.songTitle}>{currentSong}</Text>
          </View>
        )}
        {sound && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              onPress={isPlaying ? pauseSound : resumeSound} 
              style={styles.controlButton}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={restartSound} 
              style={styles.controlButton}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#003c71',
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  pictogramsContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingTop: 20,
    gap: 10,
  },
  pictogram: {
    width: width / 3 - 20,
    height: width / 3 - 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  pictogramImage: {
    width: '80%',
    height: '70%',
    resizeMode: 'contain',
  },
  pictogramText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a4a4a',
    textAlign: 'center',
  },
  songInfoContainer: {
    backgroundColor: 'transparent',
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  songTitle: {
    fontSize: 16,
    color: '#4a4a4a',
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
    paddingBottom: 20,
  },
  controlButton: {
    padding: 15,
    backgroundColor: '#4a90e2',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});