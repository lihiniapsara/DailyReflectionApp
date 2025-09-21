import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator
} from "react-native";
import tw from "tailwind-react-native-classnames";
import Icon from "react-native-vector-icons/MaterialIcons";
import { auth, db } from "@/firebase";
import { createGoal, getAllGoals, updateGoal } from "@/services/goalService";

const GoalScreen = () => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState("");
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingGoalId, setUpdatingGoalId] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "active", "completed"

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

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          setLoading(false);
          return;
        }

        const allGoals = await getAllGoals();
        const userGoals = allGoals.filter(goal => goal.userId === userId);
        
        setGoals(userGoals);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching goals: ", error);
        setLoading(false);
        Alert.alert("Error", "Failed to load goals");
      }
    };

    fetchGoals();
  }, []);

  useEffect(() => {
    // Filter goals based on selected filter
    let filtered = goals;
    
    if (filter === "active") {
      filtered = goals.filter(goal => !goal.completed);
    } else if (filter === "completed") {
      filtered = goals.filter(goal => goal.completed);
    }
    
    setFilteredGoals(filtered);
  }, [goals, filter]);

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
          userId,
          completed: false,
          createdAt: new Date().toISOString(),
        };

        await createGoal(newGoalData);
        setNewTitle("");
        setNewText("");
        setNewDate("");
        setAddModalVisible(false);
        
        // Refresh the goals list
        const allGoals = await getAllGoals();
        const userGoals = allGoals.filter(goal => goal.userId === userId);
        setGoals(userGoals);
        
        Alert.alert("Success", "Goal created successfully!");
      } catch (error) {
        Alert.alert("Error", "Failed to create goal");
        console.error(error);
      }
    } else {
      Alert.alert("Error", "Please enter title and description");
    }
  };

  const handleToggleComplete = async (goalId, currentStatus) => {
    try {
      setUpdatingGoalId(goalId);
      await updateGoal(goalId, { completed: !currentStatus });
      
      // Update local state
      const updatedGoals = goals.map(goal => 
        goal.id === goalId ? { ...goal, completed: !currentStatus } : goal
      );
      
      setGoals(updatedGoals);
      setUpdatingGoalId(null);
    } catch (error) {
      console.error("Error updating goal: ", error);
      Alert.alert("Error", "Failed to update goal");
      setUpdatingGoalId(null);
    }
  };

  const renderGoalItem = ({ item }) => (
    <View style={tw`bg-white p-4 rounded-lg mb-3 shadow-sm border border-gray-100`}>
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <Text 
          style={[
            tw`text-lg font-bold flex-1 mr-2`,
            item.completed ? tw`text-gray-400 line-through` : tw`text-purple-800`
          ]} 
          numberOfLines={1}
        >
          {item.title}
        </Text>
        {updatingGoalId === item.id ? (
          <ActivityIndicator size="small" color="#8B5CF6" />
        ) : (
          <TouchableOpacity onPress={() => handleToggleComplete(item.id, item.completed)}>
            <Icon 
              name={item.completed ? "check-circle" : "radio-button-unchecked"} 
              size={24} 
              color={item.completed ? "#10B981" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={item.completed ? tw`text-gray-400 line-through mb-3` : tw`text-gray-700 mb-3`}>
        {item.text}
      </Text>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-center`}>
          <Icon name="calendar-today" size={14} color="#6b7280" style={tw`mr-1`} />
          <Text style={item.completed ? tw`text-gray-400 text-xs` : tw`text-gray-500 text-xs`}>
            {item.date}
          </Text>
        </View>
        <View style={[
          tw`px-2 py-1 rounded-full`,
          item.completed ? tw`bg-green-100` : tw`bg-purple-100`
        ]}>
          <Text style={item.completed ? tw`text-green-800 text-xs font-medium` : tw`text-purple-800 text-xs font-medium`}>
            {item.completed ? "Completed" : "Active"}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={tw`flex-1 justify-center items-center mt-10`}>
      <Icon name="emoji-objectives" size={60} color="#d1d5db" />
      <Text style={tw`text-gray-400 text-lg font-medium mt-4`}>
        {filter === "completed" ? "No completed goals" : 
         filter === "active" ? "No active goals" : "No goals yet"}
      </Text>
      <Text style={tw`text-gray-400 text-center mt-2 px-10`}>
        {filter === "all" ? "Start by adding your first goal to track your progress" :
         "Try changing your filters to see more goals"}
      </Text>
    </View>
  );

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
            className="bg-purple-600 py-3 px-6 rounded-lg flex-row items-center justify-center shadow-sm"
            onPress={openAddModal}
          >
            <Icon name="add" size={18} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white font-semibold`}>Add New Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Filter buttons */}
        <View style={tw`flex-row justify-center mb-4`}>
          <TouchableOpacity
            style={[
              tw`px-4 py-2 rounded-l-lg border border-purple-600`,
              filter === "all" ? tw`bg-purple-600` : tw`bg-white`
            ]}
            onPress={() => setFilter("all")}
          >
            <Text style={filter === "all" ? tw`text-white` : tw`text-purple-600`}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`px-4 py-2 border-t border-b border-purple-600`,
              filter === "active" ? tw`bg-purple-600` : tw`bg-white`
            ]}
            onPress={() => setFilter("active")}
          >
            <Text style={filter === "active" ? tw`text-white` : tw`text-purple-600`}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`px-4 py-2 rounded-r-lg border border-purple-600`,
              filter === "completed" ? tw`bg-purple-600` : tw`bg-white`
            ]}
            onPress={() => setFilter("completed")}
          >
            <Text style={filter === "completed" ? tw`text-white` : tw`text-purple-600`}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={tw`text-gray-500 mt-2`}>Loading goals...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredGoals}
            renderItem={renderGoalItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}

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
                style={tw`text-lg font-bold mb-4 text-center text-black-800`}
              >
                Add New Goal
              </Text>

              <TextInput
                style={tw`border border-gray-300 p-3 rounded-lg mb-3 text-sm bg-white`}
                placeholder="Goal Title"
                placeholderTextColor="#9CA3AF"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <TextInput
                style={tw`border border-gray-300 p-3 rounded-lg mb-3 text-sm h-20 bg-white`}
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
                  style={tw`bg-gray-400 py-2 px-4 rounded-full mr-3`}
                  onPress={() => {
                    setAddModalVisible(false);
                    setNewTitle("");
                    setNewText("");
                    setNewDate("");
                  }}
                >
                  <Text style={tw`text-white font-semibold`}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`bg-purple-600 py-2 px-4 rounded-full`}
                  onPress={handleAddGoal}
                >
                  <Text style={tw`text-white font-semibold`}>Save</Text>
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