import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface Song {
  name: string;
  uri: string;
}

const MAX_GENRES = 5;

const MusicPlayer = () => {
  const [genres, setGenres] = useState<{ [key: string]: Song[] }>({});
  const [newGenre, setNewGenre] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [isGenreModalVisible, setGenreModalVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);

  useEffect(() => {
    loadGenres();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadGenres = async () => {
    try {
      const storedGenres = await AsyncStorage.getItem("genres");
      if (storedGenres) setGenres(JSON.parse(storedGenres));
    } catch (error) {
      console.error("Error loading genres:", error);
    }
  };

  const saveGenres = async (updatedGenres: { [key: string]: Song[] }) => {
    try {
      await AsyncStorage.setItem("genres", JSON.stringify(updatedGenres));
      setGenres(updatedGenres);
    } catch (error) {
      console.error("Error saving genres:", error);
    }
  };

  const addGenre = () => {
    if (!newGenre.trim()) {
      Alert.alert("Error", "El nombre del género no puede estar vacío");
      return;
    }
    if (genres[newGenre]) {
      Alert.alert("Error", "El género ya existe");
      return;
    }
    if (Object.keys(genres).length >= MAX_GENRES) {
      Alert.alert("Error", `No puedes crear más de ${MAX_GENRES} géneros`);
      return;
    }
    const updatedGenres = { ...genres, [newGenre]: [] };
    saveGenres(updatedGenres);
    setNewGenre("");
    setGenreModalVisible(false);
  };

  const deleteGenre = (genreName: string) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar el género "${genreName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const updatedGenres = { ...genres };
            delete updatedGenres[genreName];
            saveGenres(updatedGenres);
            if (selectedGenre === genreName) {
              setSelectedGenre("");
              setCurrentSong(null);
              if (sound) {
                sound.unloadAsync();
              }
            }
          },
        },
      ]
    );
  };

  const deleteSong = (genreName: string, songIndex: number) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar esta canción?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const updatedSongs = [...genres[genreName]];
            updatedSongs.splice(songIndex, 1);
            const updatedGenres = { ...genres, [genreName]: updatedSongs };
            saveGenres(updatedGenres);
            if (currentSongIndex === songIndex) {
              setCurrentSong(null);
              if (sound) {
                sound.unloadAsync();
              }
            }
          },
        },
      ]
    );
  };
  
  const addSongToGenre = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "audio/*" });
      if (result.assets && result.assets.length > 0 && selectedGenre) {
        const newSong: Song = {
          name: result.assets[0].name,
          uri: result.assets[0].uri
        };
        const updatedGenres = {
          ...genres,
          [selectedGenre]: [...(genres[selectedGenre] || []), newSong],
        };
        saveGenres(updatedGenres);
      }
    } catch (error) {
      console.error("Error al seleccionar el archivo:", error);
    }
  };

  const playSound = async (song: Song, index: number) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);
      setCurrentSong(song);
      setCurrentSongIndex(index);

      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && !status.isPlaying && status.positionMillis === status.durationMillis) {
          await playNextSong();
        }
      });
    } catch (error) {
      console.error("Error reproduciendo el audio:", error);
    }
  };

  const togglePlayPause = async () => {
    if (sound) {
      try {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Error toggling play/pause:", error);
      }
    }
  };

  const playNextSong = async () => {
    if (selectedGenre) {
      const songs = genres[selectedGenre];
      let nextIndex = (currentSongIndex + 1) % songs.length;
      await playSound(songs[nextIndex], nextIndex);
    }
  };

  const playPreviousSong = async () => {
    if (selectedGenre) {
      const songs = genres[selectedGenre];
      let prevIndex = currentSongIndex - 1;
      if (prevIndex < 0) prevIndex = songs.length - 1;
      await playSound(songs[prevIndex], prevIndex);
    }
  };

  const playRandomSong = async () => {
    if (selectedGenre) {
      const songs = genres[selectedGenre];
      const randomIndex = Math.floor(Math.random() * songs.length);
      await playSound(songs[randomIndex], randomIndex);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1E1E1E' }}>
      {/* Header */}
      <View style={{ 
        padding: 20, 
        backgroundColor: '#2D2D2D',
        borderBottomWidth: 1,
        borderBottomColor: '#3D3D3D'
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: "bold",
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          Mi Reproductor de Música
        </Text>
        
        {Object.keys(genres).length < MAX_GENRES && (
          <TouchableOpacity
            style={{
              marginTop: 10,
              padding: 12,
              backgroundColor: "#007AFF",
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => setGenreModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: "white", fontSize: 16 }}>Nuevo Género</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal para crear género */}
      {isGenreModalVisible && (
        <View style={{ 
          padding: 20,
          backgroundColor: '#2D2D2D',
          margin: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#3D3D3D'
        }}>
          <TextInput
            placeholder="Nombre del género"
            placeholderTextColor="#999"
            value={newGenre}
            onChangeText={setNewGenre}
            style={{
              borderWidth: 1,
              borderColor: "#3D3D3D",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
              color: 'white',
              backgroundColor: '#1E1E1E'
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: "#666",
                borderRadius: 8,
                marginRight: 8
              }}
              onPress={() => setGenreModalVisible(false)}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: "#007AFF",
                borderRadius: 8
              }}
              onPress={addGenre}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lista de géneros */}
      <FlatList
        style={{ flex: 1 }}
        data={Object.keys(genres)}
        keyExtractor={(item) => item}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <View style={{ 
            marginBottom: 10,
            backgroundColor: '#2D2D2D',
            borderRadius: 10,
            overflow: 'hidden'
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              backgroundColor: selectedGenre === item ? '#007AFF' : '#2D2D2D',
            }}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setSelectedGenre(item === selectedGenre ? '' : item)}
              >
                <Text style={{ fontSize: 18, color: 'white' }}>{item}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteGenre(item)}
                style={{ padding: 8 }}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            {selectedGenre === item && (
              <View style={{ padding: 10 }}>
                {genres[item].length > 0 ? (
                  <FlatList
                    data={genres[item]}
                    keyExtractor={(song) => song.uri}
                    renderItem={({ item: song, index }) => (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 8,
                        backgroundColor: currentSong?.uri === song.uri ? '#3D3D3D' : 'transparent',
                        borderRadius: 6,
                        marginVertical: 2
                      }}>
                        <TouchableOpacity
                          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                          onPress={() => playSound(song, index)}
                        >
                          <Ionicons 
                            name={currentSong?.uri === song.uri && isPlaying ? "pause-circle" : "play-circle"} 
                            size={24} 
                            color={currentSong?.uri === song.uri ? "#007AFF" : "#999"}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={{ 
                            color: currentSong?.uri === song.uri ? '#FFFFFF' : '#CCCCCC',
                            flex: 1
                          }}>
                            {song.name}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteSong(item, index)}
                          style={{ padding: 8 }}
                        >
                          <Ionicons name="close-circle-outline" size={24} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={{ color: '#999', textAlign: 'center', padding: 10 }}>
                    No hay canciones en este género
                  </Text>
                )}

                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    padding: 12,
                    backgroundColor: "#4A4A4A",
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={() => addSongToGenre()}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: "white" }}>Agregar Canción</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* Controles de reproducción */}
      {currentSong && (
        <View style={{
          padding: 20,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#3D3D3D'
        }}>
          <Text style={{ 
            color: 'white', 
            textAlign: 'center',
            marginBottom: 10,
            fontSize: 16
          }}>
            {currentSong.name}
          </Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}>
            <TouchableOpacity onPress={playPreviousSong}>
              <Ionicons name="play-skip-back" size={32} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={togglePlayPause}>
              <Ionicons
                name={isPlaying ? "pause-circle" : "play-circle"}
                size={48}
                color="#007AFF"
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={playNextSong}>
              <Ionicons name="play-skip-forward" size={32} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={playRandomSong}>
              <Ionicons name="shuffle" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default MusicPlayer;