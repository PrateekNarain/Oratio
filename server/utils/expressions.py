import cv2
from deepface import DeepFace
import pandas as pd
import warnings
import os

# Suppress TensorFlow warnings for a cleaner output
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'


def analyze_video_emotions(video_file_path: str, sample_rate: int = 1):
    """
    Analyzes emotions by sampling frames and summing emotion scores using DeepFace.
    Returns both a DataFrame of aggregated scores and a timeline of dominant emotions.

    Args:
        video_file_path (str): Path to the video file to be analyzed.
        sample_rate (int): The number of frames to process per second.
                           Defaults to 1.

    Returns:
        tuple (pd.DataFrame, list):
            - DataFrame with 'Human Emotions' and 'Emotion Value from the Video'.
            - List of timeline chunks.
    """
    try:
        cap = cv2.VideoCapture(video_file_path)
        if not cap.isOpened():
            print(f"Error: Could not open video file {video_file_path}")
            return pd.DataFrame(), []

        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            fps = 30.0

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_sec = total_frames / fps if fps > 0 else 0
        seconds_between_samples = 1.0 / sample_rate if sample_rate > 0 else 1

        frame_interval = max(1, int(fps / sample_rate))
        estimated_frames_to_analyze = max(1, total_frames // frame_interval)

        print(
            f"Starting emotion analysis for {video_file_path}\n"
            f"  Duration: {duration_sec:.0f}s | FPS: {fps:.1f} | "
            f"Sampling {sample_rate} frame(s)/sec "
            f"(~{estimated_frames_to_analyze} frames to analyse)"
        )

        emotion_scores = {
            'angry': 0.0, 'disgust': 0.0, 'fear': 0.0, 'happy': 0.0,
            'sad': 0.0, 'surprise': 0.0, 'neutral': 0.0
        }

        timeline = []
        frame_count = 0
        analyzed_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % frame_interval == 0:
                try:
                    result = DeepFace.analyze(
                        img_path=frame,
                        actions=['emotion'],
                        enforce_detection=False,
                        detector_backend='opencv',
                        silent=True
                    )

                    if result and result[0]:
                        frame_emotions = result[0]['emotion']
                        for emotion, score in frame_emotions.items():
                            if emotion in emotion_scores:
                                emotion_scores[emotion] += (score / 100.0)

                        dominant = result[0]['dominant_emotion']
                        current_time = frame_count / fps
                        timeline.append({
                            "start_time": current_time,
                            "end_time": current_time + seconds_between_samples,
                            "emotion": dominant,
                            "chunk": analyzed_count
                        })
                except Exception:
                    pass

                analyzed_count += 1
                # Progress logging every 10 analysed frames
                if analyzed_count % 10 == 0:
                    pct = min(100, int(analyzed_count / estimated_frames_to_analyze * 100))
                    print(f"  Emotion analysis progress: {analyzed_count}/{estimated_frames_to_analyze} frames ({pct}%)")

            frame_count += 1

        cap.release()
        print(f"Emotion analysis finished successfully. Analysed {analyzed_count} frames.")

        score_comparisons = pd.DataFrame({
            'Human Emotions': [k.capitalize() for k in emotion_scores.keys()],
            'Emotion Value from the Video': list(emotion_scores.values())
        })

        return score_comparisons, timeline

    except Exception as e:
        print(f"An unexpected error occurred during emotion analysis: {e}")
        return pd.DataFrame(), []