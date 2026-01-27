import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Animated, { FadeOut } from 'react-native-reanimated';

interface VideoSplashProps {
  onFinish: () => void;
}

export default function VideoSplash({ onFinish }: VideoSplashProps) {
  const videoRef = useRef<Video>(null);
  const [isFinished, setIsFinished] = useState(false);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      setIsFinished(true);
      // Give a brief moment before transitioning
      setTimeout(onFinish, 300);
    }
  };

  if (isFinished) {
    return null;
  }

  return (
    <Animated.View
      style={styles.container}
      exiting={FadeOut.duration(300)}
    >
      <Video
        ref={videoRef}
        source={require('../../assets/splash-video.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
