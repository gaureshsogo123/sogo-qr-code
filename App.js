import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import QRCode from "react-native-qrcode-svg";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

export default function App() {
  const [dtoken, setDtoken] = useState("");
  const [text, setText] = useState("");
  const [data, setData] = useState([
    { data: "bye", mode: "byte" },
    { data: "hello", mode: "byte" },
  ]);
  const defaultText = "please enter text";
  const [showQr, setShowQr] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const qrCodeRef = useRef();

  /* const htmlTpDataUrl = () => {
    const html = `<h3>Name : ${text}</h3> <br />
  <h3>Age : 25</h3> <br />
  <h3>Profession : Teacher</h3>`;
    const base64 = window.atob(window.unescape(encodeURIComponent(html)));
    return `data:text/html;base64,${base64}`;
  };*/
  const html = `<h3>Name : ${text}</h3> <br />
  <h3>Age : 25</h3> <br />
  <h3>Profession : Teacher</h3>`;
  const blob = new Blob([html], { type: "text/html" });

  const blobToDataURl = () => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const dataUrl = blobToDataURl();

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
  const saveQRCode = async () => {
    let fileUri;
    try {
      qrCodeRef.current.toDataURL((data) => {
        /* Sharing.shareAsync("data:image/png;base64," + data, {
          mimeType: "image/png",
          dialogTitle: "Share Qr",
        });*/
        fileUri = `${FileSystem.cacheDirectory}temp.png`;
        FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        Sharing.shareAsync(fileUri)
          .then((res) => console.log(res, "succ"))
          .catch((err) => console.log(err, "err"));
      });
    } catch (error) {
      console.error("Error generating QR code SVG:", error);
    }
  };
  return (
    <View style={styles.container}>
      {/*
        <><Text>Token: {dtoken}</Text>
  <Button title="Send Notification" onPress={sendNotification} /></>*/}
      <TextInput
        style={{
          width: "100%",
          height: "7%",
          borderRadius: 10,
          borderWidth: 1,
          paddingHorizontal: 10,
          marginBottom: 50,
        }}
        value={text}
        onChangeText={(val) => setText(val)}
        placeholder="Please Enter a name"
      />
      <QRCode
        value={/*!text ? defaultText : text*/ "http://thesogo.com/"}
        size={200}
        getRef={qrCodeRef}
      />
      <View style={{ width: "100%", marginTop: "2%" }}>
        <Button title="Share" onPress={saveQRCode} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
});
