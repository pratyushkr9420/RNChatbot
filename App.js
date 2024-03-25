import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import axios from "axios";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { API_KEY } from "@env";
import * as Speech from "expo-speech";
import { COLORS } from "./colors";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [promptResponse, setPromptResponse] = useState(null);
  const handleSendButtonClick = (text) => {
    setPrompt(text);
    const message = {
      _id: Math.random().toString(36).substring(2, 8),
      text: prompt,
      createdAt: new Date(),
      user: {
        _id: 1,
      },
    };
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [message])
    );
    const data = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    };

    axios
      .post("https://api.openai.com/v1/chat/completions", data, config)
      .then((response) => {
        setPromptResponse(response.data.choices[0].message.content);
        const newModelMessage = {
          _id: Math.random().toString(36).substring(2, 8),
          text: response.data.choices[0].message.content,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "OpenAi",
            avatar: "",
          },
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [newModelMessage])
        );
      })
      .catch((error) => {
        console.error("Error:", error.response.data.error);
      });

    setPrompt("");
  };

  const generateImage = (text) => {
    setPrompt(text);
    const message = {
      _id: Math.random().toString(36).substring(2, 8),
      text: prompt,
      createdAt: new Date(),
      user: {
        _id: 1,
      },
    };
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [message])
    );
    const data = {
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    };

    axios
      .post("https://api.openai.com/v1/images/generations", data, config)
      .then((response) => {
        response.data.data.forEach((item) => {
          const newModelMessage = {
            _id: Math.random().toString(36).substring(2, 8),
            createdAt: new Date(),
            image: item.url,
            user: {
              _id: 2,
              name: "OpenAi",
              avatar: "",
            },
          };
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [newModelMessage])
          );
        });
      })
      .catch((error) => {
        console.error("Error:", error.response.data.error);
      });

    setPrompt("");
  };

  const checkStringText = (currentInput) => {
    if (currentInput.toLowerCase().startsWith("generate image")) {
      return true;
    }
    return false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <GiftedChat
          messages={messages}
          text=""
          renderInputToolbar={() => {}}
          user={{ _id: 1 }}
          renderAvatar={() => (
            <MaterialCommunityIcons
              name="robot"
              size={24}
              color={COLORS.secondaryTheme}
            />
          )}
          renderBubble={(props) => (
            <Bubble
              onPress={() => {
                Speech.speak(promptResponse);
              }}
              {...props}
              wrapperStyle={{
                right: {
                  backgroundColor: COLORS.theme,
                },
              }}
            />
          )}
          minInputToolbarHeight={10}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : "height"}
      >
        <View style={styles.inputToolBarContainer}>
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <TextInput
              value={prompt}
              placeholder="Type your prompt here"
              onChangeText={(text) => setPrompt(text)}
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={
                checkStringText(prompt) ? generateImage : handleSendButtonClick
              }
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inputToolBarContainer: {
    borderColor: "black",
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    alignItems: "center",
    marginHorizontal: 10,
  },
  buttonContainer: {
    backgroundColor: COLORS.theme,
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
    height: "101%",
    width: 60,
  },
  sendButtonText: {
    padding: 10,
    fontWeight: "bold",
    color: "white",
  },
});
