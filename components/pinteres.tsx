import React from "react";
import { View, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const AmongUsCharacter = () => {
  return (
    <View style={styles.container}>
      <View style={styles.tripulante}>
        <View style={styles.cuerpo}>
          <View style={styles.visor}>
            <View style={styles.visorOverlay} />
            <View style={styles.visorLight} />
          </View>
        </View>
        <View style={styles.pies}>
          <View style={styles.pie} />
          <View style={[styles.pie, styles.pieRight]} />
        </View>
        <View style={styles.bolso} />
        <View style={styles.sombra} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tripulante: {
    width: 200,
    height: 340,
    position: "relative",
  },
  cuerpo: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#e96b23", ////
    height: 270,
    width: 198,
    borderTopRightRadius: 130,
    borderTopLeftRadius: 130,
    borderBottomRightRadius: 10,
    borderWidth: 15,
    borderColor: "black",
  },
  visor: {
    position: "absolute",
    top: 40,
    right: -10,
    width: 150,
    height: 100,
    backgroundColor: "#49626e",
    borderRadius: 45,
    borderWidth: 15,
    borderColor: "black",
  },
  visorOverlay: {
    position: "relative",
    top: 0,
    right: -20,
    width: 100,
    height: 50,
    backgroundColor: "#9cc5d5",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 2,
    borderBottomRightRadius: 5, 
    borderBottomLeftRadius: 25,
  },
  visorLight: {
    position: "absolute",
    top: 7,
    right: 11,
    width: 50,
    height: 20,
    backgroundColor: "white",
    borderRadius: '100%',
  },
  pies: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: 80,
    position: "relative",
  },
  pie: {
    width: 90,
    height: 70,
    backgroundColor: "#e96b23",
    borderWidth: 15,
    borderColor: "black",
    top:-15,
    borderTopWidth: 0,
    borderTopLeftRadius:0,
    borderTopRightRadius:0,
    borderRadius: 30,
  },
  pieRight: {
    width: 88,
    height: 55,
    marginTop: 0,
    marginRight: 2,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 50,
  },
  bolso: {
    position: "absolute",
    top: 79,
    left: -50,
    width: 80,
    height: 165,
    backgroundColor: "#feae14",
    borderWidth: 15,
    borderColor: "black",
    borderRightWidth: 0,
    borderRadius: 40,
    zIndex: -1,
  },
  sombra: {
    position: "absolute",
    zIndex:-1,
    bottom: 0,
    left: -30,
    width: 240,
    height: 70,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: '100%',
  },
});

export default AmongUsCharacter;
