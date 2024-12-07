import { Audio } from 'expo-av';

// Cargar los sonidos
export const playSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/comer.mp3') // Ajusta la ruta si es necesario
    );
    await sound.playAsync();
  } catch (error) {
    console.log('Error al reproducir el sonido:', error);
  }
};