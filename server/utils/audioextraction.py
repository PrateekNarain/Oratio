import ffmpeg
import os
import numpy as np

def extract_audio_to_memory(video_file: str) -> np.ndarray | None:
    """
    Extracts audio from a video file directly into an in-memory NumPy array.

    This is the recommended function for the updated workflow as it avoids writing
    an intermediate WAV file to disk, which is faster. The output is specifically
    formatted for the updated transcription and vocal emotion functions.

    Args:
        video_file (str): Path to the input video file.

    Returns:
        np.ndarray: A NumPy array of the audio data, or None if it fails.
    """
    if not os.path.isfile(video_file):
        print(f"Error: File '{video_file}' does not exist.")
        return None

    try:
        print(f"Extracting audio from {video_file} into memory...")
        # This command pipes the raw audio data to stdout. It's set to:
        # - s16le: Signed 16-bit PCM audio format
        # - ac 1: Mono audio (single channel)
        # - ar 16k: 16000 Hz sample rate
        out, _ = (
            ffmpeg
            .input(video_file)
            .output('pipe:', format='s16le', acodec='pcm_s16le', ac=1, ar='16k')
            .run(capture_stdout=True, capture_stderr=True)
        )
        
        # Convert the raw byte data into a normalized float32 NumPy array
        audio_array = np.frombuffer(out, np.int16).astype(np.float32) / 32768.0
        print("Audio extraction to memory successful.")
        return audio_array
        
    except ffmpeg.Error as e:
        # It's helpful to print the stderr from ffmpeg to debug issues
        print(f"An ffmpeg error occurred: {e.stderr.decode()}")
        return None


'''
def extract_audio_to_file(video_file: str, output_wav: str) -> bool:
    """
    Extracts audio from a video file and saves it as a WAV file.
    This is the original, simpler method.

    Args:
        video_file (str): Path to the input video file (e.g., .mp4).
        output_wav (str): Path to save the extracted audio file.

    Returns:
        bool: True if extraction is successful, False otherwise.
    """
    if not os.path.isfile(video_file):
        print(f"Error: File '{video_file}' does not exist.")
        return False

    try:
        (
            ffmpeg
            .input(video_file)
            .output(output_wav, format='wav', acodec='pcm_s16le')
            .run(quiet=True, overwrite_output=True)
        )
        print(f"Audio successfully extracted to: {output_wav}")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

'''