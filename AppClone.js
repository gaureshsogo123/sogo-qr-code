import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export default function App() {
  const [dtoken, setDtoken] = useState("");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const sendNotification = async () => {
    await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=AAAA3X-wkTU:APA91bEv0hpZUnfz0hFQaHe-PGTEsFSRZRy7vE0rpk1JDxYdPHRrUAgg4w6QDYRClcvSZ7c3Hdn2LxZGKRCTjShI6C89CAQA1QDyVE_BltxprgK1we2s0asSkBkXr2eCl4ebztbUx06O`,
      },
      body: JSON.stringify({
        to: "fTdIoudOSCishT3c-2ImXQ:APA91bEOd-m_tMSc6P8j8eSsTO9CBRw1toVXmKoEiIiLDUBp0KCtQrnuOFZqv3rwODawL4PRDhJfUmZnzgdbc2hXNAEw0QJEeoSBAPRdT_fpvL6D0CJHEe92eaC3C1Qx6ce8aQ3E0dia",
        priority: "normal",
        data: {
          experienceId: "fcmnotification-app",
          scopeKey: "fcmnotification-app",
          title: "You've got mail",
          message: "Hello world!",
        },
      }),
    });
  };

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getDevicePushTokenAsync()).data;
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((toke) => {
      setDtoken(toke);
    });
  }, []);
  return (
    <View style={styles.container}>
      <Text>Token: {dtoken}</Text>
      <Button title="Send Notification" onPress={sendNotification} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
