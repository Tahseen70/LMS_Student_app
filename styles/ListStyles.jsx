// styles.js
import { StyleSheet } from "react-native";
import Colors from "./Colors";

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 50,
    elevation: 4,
    shadowColor: Colors.quaternary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    backgroundColor: Colors.primary,
  },
  cardText: {
    flex: 1,
    marginHorizontal: 12,
    color: Colors.tertiary,
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
  },
});

export default styles;
