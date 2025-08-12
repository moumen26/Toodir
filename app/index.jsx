import { View, StyleSheet, Image } from "react-native";

export default function Index() {
  return (
    <View
      className="bg-[#19213D] h-full"
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("../assets/index.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "#fff",
    fontSize: 32,
  },
  image: {
    width: 280,
    height: 220,
    marginBottom: 10,
  },
});
