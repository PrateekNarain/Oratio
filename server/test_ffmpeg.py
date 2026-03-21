import ffmpeg
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

video_file = "D:\\.Study\\projects\\Eloquence-main\\Eloquence-main\\ssvid.net--Phil-Lempert-s-2-minute-Speech-Demo_v720P.mp4"

try:
    logging.info(f"Testing ffmpeg with {video_file}")
    ffmpeg_path = "ffmpeg"  # Adjust to full path if needed, e.g., "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe"
    
    # Verify ffmpeg version
    ffmpeg_version = ffmpeg.get_ffmpeg_version(cmd=ffmpeg_path)
    logging.info(f"ffmpeg version: {ffmpeg_version}")
    
    # Probe the file
    probe = ffmpeg.probe(video_file, cmd=ffmpeg_path)
    logging.info(f"Video probe: {probe.get('format', {}).get('filename')}")
    
    # Test audio extraction
    out, err = (
        ffmpeg
        .input(video_file, cmd=ffmpeg_path)
        .output('pipe:', format='s16le', acodec='pcm_s16le', ac=1, ar='16k')
        .global_args('-loglevel', 'error')
        .run(capture_stdout=True, capture_stderr=True)
    )
    logging.info("ffmpeg test successful")
except ffmpeg.Error as e:
    logging.error(f"ffmpeg error: {e.stderr.decode('utf-8', errors='replace') if e.stderr else str(e)}")
except Exception as e:
    logging.error(f"Unexpected error: {str(e)}")