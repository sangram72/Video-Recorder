import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons'; // Import icons from Expo vector-icons

export default function App() {
  const [audiopermission, setaudiopermission] = useState(null);
  const [camerapermission, setcamerapermission] = useState(null);
  const [cameras, setcameras] = useState(null);
  const [record, setrecord] = useState(null);
  const [type, settype] = useState(Camera.Constants.Type.back);
  const video = useRef(null);
  const [status, setstatus] = useState({});
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    (async () => {
      const camerastatus = await Camera.requestCameraPermissionsAsync();
      setcamerapermission((await camerastatus).status === 'granted');

      const audiostatus = Camera.requestMicrophonePermissionsAsync();
      setaudiopermission((await audiostatus).status === 'granted');
    })();
  }, []);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1000);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [recording]);

  const takeVideo = async () => {
    if (cameras) {
      setRecording(true);
      const data = await cameras.recordAsync({
        maxDuration: 10,
      });
      setRecording(false);
      setrecord(data.uri);
    }
  };

  const stopVideo = async () => {
    setRecording(false);
    setDuration(0);
    cameras.stopRecording();
  };

  const togglePlayPause = () => {
    if (video.current) {
      if (status.isPlaying) {
        video.current.pauseAsync();
      } else {
        video.current.playAsync();
      }
    }
  };

  const flipCamera = () => {
    settype(
      type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={(ref) => setcameras(ref)}
        style={styles.cameraContainer}
        type={type}
        ratio={'4:3'}
      />

      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: record,
        }}
        useNativeControls
        resizeMode='contain'
        isLooping
        onPlaybackStatusUpdate={(status) => setstatus(() => status)}
      />

      {recording && (
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>Recording: {Math.floor(duration / 1000)}s</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={flipCamera}>
          <MaterialIcons name="flip-camera-android" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureButton} onPress={takeVideo} disabled={recording}>
          <MaterialIcons name="fiber-manual-record" size={50} color={recording ? 'red' : 'white'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={stopVideo} disabled={!recording}>
          <MaterialIcons name="stop" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    aspectRatio: 1,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  controlButton: {
    marginHorizontal: 20,
  },
  captureButton: {
    backgroundColor: 'transparent',
    borderWidth: 5,
    borderColor: 'white',
    borderRadius: 50,
    padding: 20,
  },
  durationContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  durationText: {
    fontSize: 16,
    color: 'black',
  },
});
