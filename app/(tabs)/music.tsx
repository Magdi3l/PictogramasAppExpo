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
  Modal,
  View as RNView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definir el tipo para el estado de reproducción
type PlaybackStatus = AVPlaybackStatus & {
  isLoaded: boolean;
  isPlaying?: boolean;
  didJustFinish?: boolean;
};

const { width } = Dimensions.get('window');

interface Song {
  uri: string;
  fileName: string;
  genre: string;
}

interface MusicLibrary {
  [genre: string]: Song[];
}

interface ImageMap {
  [key: string]: ImageSourcePropType;
}

const imageMap: ImageMap = {
  banda: require('../../assets/images/banda.png'),
  baladas: require('../../assets/images/baladas.png'),
  regueton: require('../../assets/images/regueton.png'),
};
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
  genreText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  activeControlButton: {
    backgroundColor: '#2d5f9e',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  modalSecondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  modalCancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  modalButtonIcon: {
    marginRight: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSecondaryButtonText: {
    color: '#4a90e2',
  },
  modalCancelButtonText: {
    color: '#ff6b6b',
  },
});
export default function TabTwoScreen(): JSX.Element {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [musicLibrary, setMusicLibrary] = useState<MusicLibrary>({});
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  
  
  const showGenreOptions = (genre: string) => {
    setSelectedGenre(genre);
    setShowGenreModal(true);
  };

  const handleGenreOption = async (option: 'play' | 'add') => {
    setShowGenreModal(false);
    const genreSongs = musicLibrary[selectedGenre] || [];

    if (option === 'add') {
      await pickAudioFile(selectedGenre);
    } else if (genreSongs.length > 0) {
      const playlist = isShuffleMode ? shuffleArray([...genreSongs]) : genreSongs;
      setCurrentPlaylist(playlist);
      setCurrentIndex(0);
      await playSound(playlist[0]);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await configureAudio();
      await loadMusicLibrary();
    };
    
    initializeApp();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

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

  const loadMusicLibrary = async () => {
    try {
      const savedLibrary = await AsyncStorage.getItem('musicLibrary');
      if (savedLibrary) {
        setMusicLibrary(JSON.parse(savedLibrary));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la biblioteca de música');
    }
  };

  const saveMusicLibrary = async (newLibrary: MusicLibrary) => {
    try {
      await AsyncStorage.setItem('musicLibrary', JSON.stringify(newLibrary));
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la biblioteca de música');
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

  const pickAudioFile = async (genre: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const audioUri = result.assets[0].uri;
        const fileName = result.assets[0].name;
        
        const newSong: Song = {
          uri: audioUri,
          fileName: fileName || 'Canción sin nombre',
          genre,
        };

        const updatedLibrary = {
          ...musicLibrary,
          [genre]: [...(musicLibrary[genre] || []), newSong],
        };

        setMusicLibrary(updatedLibrary);
        await saveMusicLibrary(updatedLibrary);
        
        // Actualizar la playlist actual si estamos en el mismo género
        if (currentPlaylist.length > 0 && currentPlaylist[0].genre === genre) {
          const newPlaylist = updatedLibrary[genre];
          setCurrentPlaylist(isShuffleMode ? shuffleArray([...newPlaylist]) : newPlaylist);
        } else {
          setCurrentPlaylist(isShuffleMode ? shuffleArray([...updatedLibrary[genre]]) : updatedLibrary[genre]);
          setCurrentIndex(updatedLibrary[genre].length - 1);
        }

        await playSound(newSong);
        Alert.alert('Éxito', `Música agregada a ${genre}: ${fileName}`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo de música');
    }
  };

  const playSound = async (song: Song) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true },
        (status: PlaybackStatus) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            playNextSong();
          }
        }
      );
      
      newSound.setOnPlaybackStatusUpdate((status: PlaybackStatus) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying || false);
        }
      });
      
      setSound(newSound);
      setCurrentSong(song);
      setIsPlaying(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo reproducir el archivo de audio');
    }
  };

  const playNextSong = async () => {
    if (currentPlaylist.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    setCurrentIndex(nextIndex);
    await playSound(currentPlaylist[nextIndex]);
  };

  const playPreviousSong = async () => {
    if (currentPlaylist.length === 0) return;
    
    const previousIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    setCurrentIndex(previousIndex);
    await playSound(currentPlaylist[previousIndex]);
  };

  const toggleShuffle = () => {
    setIsShuffleMode(!isShuffleMode);
    if (currentPlaylist.length > 0) {
      const newPlaylist = isShuffleMode ? 
        [...musicLibrary[currentPlaylist[0].genre]] : 
        shuffleArray([...currentPlaylist]);
      setCurrentPlaylist(newPlaylist);
      setCurrentIndex(newPlaylist.findIndex(song => song.uri === currentSong?.uri));
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const selectGenre = async (genre: string) => {
    const genreSongs = musicLibrary[genre] || [];
    if (genreSongs.length === 0) {
      await pickAudioFile(genre);
    } else {
      const playlist = isShuffleMode ? shuffleArray([...genreSongs]) : genreSongs;
      setCurrentPlaylist(playlist);
      setCurrentIndex(0);
      await playSound(playlist[0]);
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
              onPress={() => showGenreOptions(key)}
              style={styles.pictogram}
            >
              <Image
                source={image}
                style={styles.pictogramImage}
              />
              <Text style={styles.pictogramText}>
                {key.toUpperCase()}
                {musicLibrary[key]?.length > 0 && ` (${musicLibrary[key].length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {currentSong && (
          <View style={styles.songInfoContainer}>
            <Text style={styles.songTitle}>{currentSong.fileName}</Text>
            <Text style={styles.genreText}>{currentSong.genre.toUpperCase()}</Text>
          </View>
        )}
        {sound && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              onPress={playPreviousSong} 
              style={styles.controlButton}
            >
              <Ionicons name="play-skip-back" size={24} color="#fff" />
            </TouchableOpacity>
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
              onPress={playNextSong} 
              style={styles.controlButton}
            >
              <Ionicons name="play-skip-forward" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={toggleShuffle} 
              style={[
                styles.controlButton,
                isShuffleMode && styles.activeControlButton
              ]}
            >
              <Ionicons name="shuffle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal de opciones de género */}
      <Modal
        visible={showGenreModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenreModal(false)}
      >
        <RNView style={styles.modalOverlay}>
          <RNView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedGenre.toUpperCase()}
            </Text>
            <Text style={styles.modalSubtitle}>
              {musicLibrary[selectedGenre]?.length || 0} canciones en esta lista
            </Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleGenreOption('add')}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" style={styles.modalButtonIcon} />
              <Text style={styles.modalButtonText}>Agregar nueva canción</Text>
            </TouchableOpacity>

            {musicLibrary[selectedGenre]?.length > 0 && (
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondaryButton]}
                onPress={() => handleGenreOption('play')}
              >
                <Ionicons name="play-circle-outline" size={24} color="#4a90e2" style={styles.modalButtonIcon} />
                <Text style={[styles.modalButtonText, styles.modalSecondaryButtonText]}>
                  Reproducir lista actual
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setShowGenreModal(false)}
            >
              <Text style={[styles.modalButtonText, styles.modalCancelButtonText]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </RNView>
        </RNView>
      </Modal>
    </SafeAreaView>
  );
}