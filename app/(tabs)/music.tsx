import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const soundMap = {
  banda: require('../../assets/sounds/Banda.mp3'),
  baladas: require('../../assets/sounds/baladas.mp3'),
  regueton: require('../../assets/sounds/regueton.mp3'),
};

const imageMap = {
  banda: require('../../assets/images/banda.png'),
  baladas: require('../../assets/images/baladas.png'),
  regueton: require('../../assets/images/regueton.png'),
};

export default function TabTwoScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); 
  
  const playSound = async (soundFile: keyof typeof soundMap) => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(soundMap[soundFile]);
    setSound(newSound);
    setIsPlaying(true);
    await newSound.playAsync();
  };

  const pauseSound = async () => {
    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeSound = async () => {
    if (sound && !isPlaying) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const restartSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      setIsPlaying(true);
      await sound.playAsync();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={styles.header.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
        <Ionicons name="musical-notes" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.title}>Tu Música</Text>
        </View>
        <View style={styles.pictogramsContainer}>
          {Object.keys(soundMap).map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => playSound(key as keyof typeof soundMap)}
              style={styles.pictogram}
            >
              <Image
                source={imageMap[key as keyof typeof imageMap]}
                style={styles.pictogramImage}
              />
              <Text style={styles.pictogramText}>{key.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {sound && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={pauseSound} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>Pausa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resumeSound} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={restartSound} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>Reiniciar</Text>
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
    marginRight: 10, // Espaciado entre el ícono y el texto
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
  controlsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  controlButton: {
    padding: 10,
    backgroundColor: '#4a90e2',
    borderRadius: 5,
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
