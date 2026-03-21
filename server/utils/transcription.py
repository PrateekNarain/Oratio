#
# transcription.py  — lazy-loaded via model_manager
#
import torch
import warnings
from typing import Union, List
import numpy as np

warnings.filterwarnings("ignore", category=UserWarning, module='torchaudio')

# Models are loaded lazily through model_manager (no eager init here)
from model_manager import model_manager


def _get_model():
    """Return (processor, model, device) from the shared model manager."""
    return model_manager.get_whisper()

def chunk_audio(audio: np.ndarray, chunk_duration_s: int = 30, overlap_s: float = 0.5, sample_rate: int = 16000) -> List[np.ndarray]:
    """
    Split audio into overlapping chunks for better transcription.
    Whisper works best with ~30 second chunks.
    
    Args:
        audio: Audio data as numpy array
        chunk_duration_s: Duration of each chunk in seconds (default: 30)
        overlap_s: Overlap between chunks in seconds (default: 0.5)
        sample_rate: Sample rate of the audio (default: 16000)
    
    Returns:
        List of audio chunks
    """
    chunk_length = int(chunk_duration_s * sample_rate)
    overlap = int(overlap_s * sample_rate)
    step = chunk_length - overlap
    
    chunks = []
    for i in range(0, len(audio), step):
        chunk = audio[i:i + chunk_length]
        # Only add chunks that are at least 1 second long
        if len(chunk) >= sample_rate:
            chunks.append(chunk)
    
    print(f"Split audio into {len(chunks)} chunks of ~{chunk_duration_s}s each")
    return chunks

def transcribe_chunk(audio_chunk: np.ndarray, sample_rate: int = 16000) -> str:
    """
    Transcribe a single audio chunk using Whisper.
    """
    processor, model, device = _get_model()
    try:
        # Ensure audio chunk is the right type
        if not isinstance(audio_chunk, np.ndarray):
            audio_chunk = np.array(audio_chunk)
        
        if audio_chunk.dtype != np.float32:
            audio_chunk = audio_chunk.astype(np.float32)
        
        # Normalize audio to [-1, 1] range if needed
        if np.abs(audio_chunk).max() > 1.0:
            audio_chunk = audio_chunk / np.abs(audio_chunk).max()
        
        # Prepare input features
        input_features = processor(
            audio_chunk, 
            sampling_rate=sample_rate, 
            return_tensors="pt"
        ).input_features
        
        # Move to device
        input_features = input_features.to(device, dtype=model.dtype)
        
        # Generate transcription with supported parameters only
        with torch.no_grad():
            predicted_ids = model.generate(
                input_features,
                max_new_tokens=440,  # Reduced to avoid exceeding max_target_positions
                num_beams=5,  # Beam search for better quality
                temperature=0.0,  # Deterministic output
                do_sample=False,  # No sampling with temperature=0
                language="en",  # Force English
                task="transcribe"  # Transcription task
            )
        
        # Decode the transcription
        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        return transcription.strip()
        
    except Exception as e:
        print(f"Error transcribing chunk: {e}")
        # Try simpler generation as fallback
        try:
            with torch.no_grad():
                predicted_ids = model.generate(
                    input_features,
                    max_new_tokens=440
                )
            transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
            return transcription.strip()
        except Exception as fallback_error:
            print(f"Fallback also failed: {fallback_error}")
            return ""

def remove_duplicate_phrases(text: str, window_size: int = 5) -> str:
    """
    Remove duplicate phrases that might occur at chunk boundaries.
    
    Args:
        text: Combined transcription text
        window_size: Number of words to check for duplicates
    
    Returns:
        Cleaned text with duplicates removed
    """
    words = text.split()
    if len(words) <= window_size:
        return text
    
    cleaned_words = []
    skip_next = 0
    
    for i, word in enumerate(words):
        if skip_next > 0:
            skip_next -= 1
            continue
            
        cleaned_words.append(word)
        
        # Check for duplicate sequences at chunk boundaries
        if i + window_size < len(words) and len(cleaned_words) >= window_size:
            # Look for repeated sequences
            for check_size in range(min(window_size, 3), 0, -1):
                if len(cleaned_words) >= check_size:
                    recent = ' '.join(cleaned_words[-check_size:]).lower()
                    upcoming = ' '.join(words[i+1:i+1+check_size]).lower()
                    
                    if recent == upcoming:
                        skip_next = check_size
                        break
    
    return ' '.join(cleaned_words)

def speech_to_text_long(audio_input: Union[str, np.ndarray], pause_threshold_s: float = 1.0) -> str:
    """
    Transcribes long audio using chunking for complete transcription.
    
    Args:
        audio_input: Either a numpy array of audio data or a file path
        pause_threshold_s: Not used in this version but kept for compatibility
    
    Returns:
        Complete transcription of the audio
    """
    if audio_input is None:
        print("Error: Audio input is None.")
        return ""
    
    # Handle string input (file path)
    if isinstance(audio_input, str):
        if not audio_input:
            print("Error: Audio input is empty string.")
            return ""
        # Load audio from file
        try:
            import librosa
            audio_data, sr = librosa.load(audio_input, sr=16000)
        except ImportError:
            # If librosa not available, try with torchaudio
            try:
                import torchaudio
                audio_data, sr = torchaudio.load(audio_input)
                if sr != 16000:
                    resampler = torchaudio.transforms.Resample(sr, 16000)
                    audio_data = resampler(audio_data).numpy().squeeze()
                else:
                    audio_data = audio_data.numpy().squeeze()
            except Exception as e:
                print(f"Error loading audio file: {e}")
                return ""
        except Exception as e:
            print(f"Error loading audio file: {e}")
            return ""
    else:
        # Input is already a numpy array
        audio_data = audio_input
        if not isinstance(audio_data, np.ndarray):
            print(f"Error: Expected numpy array, got {type(audio_data)}")
            return ""
    
    # Ensure audio is float32
    if audio_data.dtype != np.float32:
        audio_data = audio_data.astype(np.float32)
    
    # Calculate duration
    duration_s = len(audio_data) / 16000
    print(f"Processing audio of duration: {duration_s:.1f} seconds")
    
    # For short audio (< 30 seconds), process in one go
    if duration_s <= 30:
        print("Audio is short enough to process in one chunk")
        transcription = transcribe_chunk(audio_data)
        if transcription:
            print(f"Transcription complete: {transcription[:100]}...")
            return transcription
        else:
            print("Failed to transcribe audio")
            return ""
    
    # For long audio, use chunking
    print(f"Long audio detected ({duration_s:.1f}s), using chunking approach...")
    
    # Split audio into chunks
    chunks = chunk_audio(audio_data, chunk_duration_s=30, overlap_s=0.5)
    
    # Transcribe each chunk
    transcriptions = []
    for i, chunk in enumerate(chunks):
        print(f"Transcribing chunk {i+1}/{len(chunks)}...")
        chunk_text = transcribe_chunk(chunk)
        
        if chunk_text:
            transcriptions.append(chunk_text)
            # Show progress
            print(f"  Chunk {i+1}: '{chunk_text[:50]}...'")
        else:
            print(f"  Chunk {i+1}: No transcription generated")
    
    if not transcriptions:
        print("No transcriptions generated from any chunks")
        return ""
    
    # Combine all transcriptions
    print(f"Combining {len(transcriptions)} transcriptions...")
    full_transcription = " ".join(transcriptions)
    
    # Remove potential duplicates at chunk boundaries
    full_transcription = remove_duplicate_phrases(full_transcription, window_size=3)
    
    # Final cleanup - remove extra spaces
    full_transcription = " ".join(full_transcription.split())
    
    print("="*50)
    print("COMPLETE TRANSCRIPTION:")
    print("="*50)
    print(full_transcription)
    print("="*50)
    print(f"Transcription finished successfully. Total length: {len(full_transcription)} characters")
    
    return full_transcription.strip()

# Alternative function using forced_decoder_ids for better control
# def speech_to_text_long_with_timestamps(audio_input: Union[str, np.ndarray]) -> str:
#     """
#     Alternative version that uses forced_decoder_ids for better control.
#     This can be more reliable for some audio types.
#     """
#     if audio_input is None:
#         return ""
    
#     # Process audio input
#     if isinstance(audio_input, str):
#         try:
#             import librosa
#             audio_data, _ = librosa.load(audio_input, sr=16000)
#         except:
#             return ""
#     else:
#         audio_data = audio_input
    
#     if not isinstance(audio_data, np.ndarray):
#         return ""
    
#     # Ensure correct dtype
#     if audio_data.dtype != np.float32:
#         audio_data = audio_data.astype(np.float32)
    
#     duration_s = len(audio_data) / 16000
#     print(f"Processing {duration_s:.1f}s audio with timestamp method...")
    
#     # Process in chunks
#     chunks = chunk_audio(audio_data, chunk_duration_s=30)
#     transcriptions = []
    
#     for i, chunk in enumerate(chunks):
#         try:
#             # Process chunk
#             input_features = processor(chunk, sampling_rate=16000, return_tensors="pt").input_features
#             input_features = input_features.to(device, dtype=model.dtype)
            
#             # Use forced decoder IDs for English
#             forced_decoder_ids = processor.get_decoder_prompt_ids(language="english", task="transcribe")
            
#             with torch.no_grad():
#                 predicted_ids = model.generate(
#                     input_features,
#                     forced_decoder_ids=forced_decoder_ids,
#                     max_new_tokens=448
#                 )
            
#             transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
#             if transcription:
#                 transcriptions.append(transcription.strip())
#                 print(f"Chunk {i+1}/{len(chunks)}: Success")
            
#         except Exception as e:
#             print(f"Chunk {i+1}/{len(chunks)}: Failed - {e}")
    
#     if transcriptions:
#         full_text = " ".join(transcriptions)
#         full_text = remove_duplicate_phrases(full_text)
#         return full_text.strip()
    
#     return ""