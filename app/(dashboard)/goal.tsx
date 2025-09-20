// GoalScreen.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from '@react-native-community/datetimepicker';

interface GoalScreenProps {
  navigation?: any;
}

interface Goal {
  id: number;
  title: string;
  text: string;
  date: string;
}

const GoalScreen: React.FC<GoalScreenProps> = ({ navigation }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'add' | 'edit'>('add');

  // Function to format date as MM/DD/YYYY
  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Set current date when add modal opens
  const openAddModal = () => {
    const currentDate = new Date();
    setNewDate(formatDate(currentDate));
    setAddModalVisible(true);
  };

  const handleAddGoal = () => {
    if (newTitle.trim() && newText.trim() && newDate.trim()) {
      const newGoal = {
        id: Date.now(),
        title: newTitle.trim(),
        text: newText.trim(),
        date: newDate.trim(),
      };
      setGoals([...goals, newGoal]);
      setNewTitle("");
      setNewText("");
      setNewDate("");
      setAddModalVisible(false);
    } else {
      Alert.alert("Error", "Please enter title and description");
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditText(goal.text);
    setEditDate(goal.date);
    setEditModalVisible(true);
  };

  const handleUpdateGoal = () => {
    if (editingGoal && editTitle.trim() && editText.trim() && editDate.trim()) {
      const updatedGoals = goals.map((g) =>
        g.id === editingGoal.id
          ? { ...g, title: editTitle.trim(), text: editText.trim(), date: editDate.trim() }
          : g
      );
      setGoals(updatedGoals);
      setEditModalVisible(false);
      setEditingGoal(null);
      setEditTitle("");
      setEditText("");
      setEditDate("");
    } else {
      Alert.alert("Error", "Please enter title and description");
    }
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const confirmDeleteGoal = (goal: Goal) => {
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => handleDeleteGoal(goal.id),
          style: "destructive",
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    // Date change functionality removed as requested
  };

  const showDatepicker = (mode: 'add' | 'edit') => {
    // Date picker functionality removed as requested
    Alert.alert("Info", "Date changing is not allowed");
  };

  const renderGoal = ({ item }: { item: Goal }) => (
    <View style={tw`bg-white p-3 rounded-lg mb-3 shadow-sm border border-gray-100`}>
      <View style={tw`flex-row justify-between items-start mb-2`}>
        <Text
          style={tw`text-base font-bold text-purple-800 flex-1 mr-2`}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={tw`text-xs text-gray-500`}>{item.date}</Text>
      </View>
      <Text style={tw`text-gray-700 mb-3 text-sm`} numberOfLines={3}>
        {item.text}
      </Text>
      <View style={tw`flex-row justify-end`}>
        <TouchableOpacity
          style={tw`bg-yellow-500 py-1 px-2 rounded mr-2 flex-row items-center`}
          onPress={() => handleEditGoal(item)}
        >
          <Icon name="edit" size={12} color="white" style={tw`mr-1`} />
          <Text style={tw`text-white text-xs font-bold`}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`bg-red-500 py-1 px-2 rounded flex-row items-center`}
          onPress={() => confirmDeleteGoal(item)}
        >
          <Icon name="delete" size={12} color="white" style={tw`mr-1`} />
          <Text style={tw`text-white text-xs font-bold`}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-gray-50`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header with smaller font size and left alignment */}
      <View style={tw`bg-white px-4 py-3 border-b border-gray-200 shadow-sm`}>
        <Text style={tw`text-base font-semibold text-gray-900 text-left`}>
          Monthly Goals
        </Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Add Goal Button */}
        <View style={tw`items-center mb-5`}>
          <TouchableOpacity
            style={tw`bg-purple-600 py-2 px-4 rounded-lg flex-row items-center justify-center shadow-sm`}
            onPress={openAddModal}
          >
            <Icon name="add" size={16} color="white" style={tw`mr-1`} />
            <Text style={tw`text-white font-semibold text-sm`}>Add New Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={tw`bg-white p-6 rounded-lg shadow-sm items-center border border-gray-100`}>
            <Icon name="flag" size={40} color="#9CA3AF" style={tw`mb-3`} />
            <Text style={tw`text-lg text-gray-500 mb-2 text-center font-medium`}>
              No goals yet!
            </Text>
            <Text style={tw`text-gray-400 text-center text-xs`}>
              Tap the button above to add your first goal.
            </Text>
          </View>
        ) : (
          <View style={tw`mb-6`}>
            <Text style={tw`text-base font-semibold text-gray-800 mb-3`}>
              Your Goals ({goals.length})
            </Text>
            <FlatList
              data={goals}
              renderItem={renderGoal}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {goals.length > 0 && (
          <View style={tw`items-center mt-5`}>
            <TouchableOpacity
              style={tw`bg-red-500 py-2 px-4 rounded-lg items-center shadow-sm`}
              onPress={() => {
                Alert.alert(
                  "Clear All Goals",
                  "Are you sure you want to delete all goals?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear All",
                      onPress: () => {
                        setGoals([]);
                      },
                      style: "destructive",
                    },
                  ]
                );
              }}
            >
              <Text style={tw`text-white font-semibold text-sm`}>Clear All Goals</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Goal Modal */}
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
    style={tw`bg-gray-400 py-1.5 px-3 rounded-lg mr-3 `}
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

        {/* Edit Goal Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => {
            setEditModalVisible(false);
            setEditingGoal(null);
          }}
        >
          <View
            style={tw`flex-1 justify-center items-center bg-black bg-opacity-40 p-4`}
          >
            <View style={tw`bg-white p-5 rounded-xl w-full max-w-md shadow-lg`}>
              <Text
                style={tw`text-lg font-bold mb-4 text-center text-purple-800`}
              >
                Edit Goal
              </Text>

              <TextInput
                style={tw`border border-gray-300 p-3 rounded-lg mb-3 text-sm bg-gray-50`}
                placeholder="Goal Title"
                placeholderTextColor="#9CA3AF"
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <TextInput
                style={tw`border border-gray-300 p-3 rounded-lg mb-3 text-sm h-20 bg-gray-50`}
                placeholder="Goal Description"
                placeholderTextColor="#9CA3AF"
                value={editText}
                onChangeText={setEditText}
                multiline={true}
                textAlignVertical="top"
              />

              <View style={tw`flex-row items-center mb-4`}>
                <Text style={tw`text-gray-700 mr-2 text-sm`}>Date:</Text>
                <View
                  style={tw`border border-gray-300 p-2 rounded-lg flex-1 bg-gray-100 flex-row justify-between items-center`}
                >
                  <Text style={tw`text-gray-900`}>{editDate}</Text>
                  <Icon name="calendar-today" size={18} color="#9CA3AF" />
                </View>
              </View>

              <View style={tw`flex-row justify-between gap-3`}>
                <TouchableOpacity
                  style={tw`bg-gray-400 py-2 px-3 rounded-lg flex-1 items-center`}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={tw`text-white font-semibold text-xs`}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`bg-green-600 py-2 px-3 rounded-lg flex-1 items-center`}
                  onPress={handleUpdateGoal}
                >
                  <Text style={tw`text-white font-semibold text-xs`}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default GoalScreen;