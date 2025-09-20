import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import tw from "tailwind-react-native-classnames";
import Icon from "react-native-vector-icons/MaterialIcons";
import { auth } from "@/firebase";
import { createGoal } from "@/services/goalService";

const GoalScreen = () => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState("");

  const formatDate = (date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const openAddModal = () => {
    const currentDate = new Date();
    setNewDate(formatDate(currentDate));
    setAddModalVisible(true);
  };

  const handleAddGoal = async () => {
    if (newTitle.trim() && newText.trim() && newDate.trim()) {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          Alert.alert("Error", "Please sign in to create goals");
          return;
        }

        const newGoalData = {
          title: newTitle.trim(),
          text: newText.trim(),
          date: newDate.trim(),
          userId
        };

        await createGoal(newGoalData);
        setNewTitle("");
        setNewText("");
        setNewDate("");
        setAddModalVisible(false);
        Alert.alert("Success", "Goal created successfully!");
      } catch (error) {
        Alert.alert("Error", "Failed to create goal");
        console.error(error);
      }
    } else {
      Alert.alert("Error", "Please enter title and description");
    }
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-gray-50`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={tw`bg-white px-4 py-3 border-b border-gray-200 shadow-sm`}>
        <Text style={tw`text-base font-semibold text-gray-900 text-left`}>
          Monthly Goals
        </Text>
      </View>

      <View style={tw`flex-1 p-4`}>
        <View style={tw`items-center mb-5`}>
          <TouchableOpacity
            style={tw`bg-purple-600 py-2 px-4 rounded-lg flex-row items-center justify-center shadow-sm`}
            onPress={openAddModal}
          >
            <Icon name="add" size={16} color="white" style={tw`mr-1`} />
            <Text style={tw`text-white font-semibold text-sm`}>Add New Goal</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={addModalVisible}
          onRequestClose={() => {
            setAddModalVisible(false);
            setNewTitle("");
            setNewText("");
            setNewDate("");
          }}
        >
          <View
            style={tw`flex-1 justify-center items-center bg-black bg-opacity-40 p-4`}
          >
            <View style={tw`bg-white p-5 rounded-xl w-full max-w-md shadow-lg`}>
              <Text
                style={tw`text-lg font-bold mb-4 text-center text-purple-800`}
              >
                Add New Goal
              </Text>

              <TextInput
                style={tw`border border-gray-300 p-3 rounded-lg mb-3 text-sm bg-gray-50`}
                placeholder="Goal Title"
                placeholderTextColor="#9CA3AF"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <TextInput
                style={tw`border border-gray-300 p-3 rounded-lg mb-3 text-sm h-20 bg-gray-50`}
                placeholder="Goal Description"
                placeholderTextColor="#9CA3AF"
                value={newText}
                onChangeText={setNewText}
                multiline={true}
                textAlignVertical="top"
              />

              <View style={tw`flex-row items-center mb-4`}>
                <Text style={tw`text-gray-700 mr-2 text-sm`}>Date:</Text>
                <View
                  style={tw`border border-gray-300 p-2 rounded-lg flex-1 bg-gray-100 flex-row justify-between items-center`}
                >
                  <Text style={tw`text-gray-900`}>{newDate}</Text>
                  <Icon name="calendar-today" size={18} color="#9CA3AF" />
                </View>
              </View>

              <View style={tw`flex-row justify-end gap-2`}>
                <TouchableOpacity
                  style={tw`bg-gray-400 py-1.5 px-3 rounded-lg mr-3`}
                  onPress={() => {
                    setAddModalVisible(false);
                    setNewTitle("");
                    setNewText("");
                    setNewDate("");
                  }}
                >
                  <Text style={tw`text-white font-semibold text-xs`}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`bg-purple-600 py-1.5 px-3 rounded-lg`}
                  onPress={handleAddGoal}
                >
                  <Text style={tw`text-white font-semibold text-xs`}>Add Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default GoalScreen;