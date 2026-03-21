"""
Token Usage Calculator for Eloquence
Shows exactly how many tokens each API call uses
"""

# Your transcription length
TRANSCRIPTION_LENGTH = 13920  # characters
TRANSCRIPTION_TOKENS = TRANSCRIPTION_LENGTH / 4  # Rough estimate: 4 chars per token

# Emotion data
EMOTION_CHUNKS = 268
EMOTION_DATA_TOKENS = 50  # After summarization

# Linguistic data (compact format)
LINGUISTIC_DATA_TOKENS = 200

# Instructions
INSTRUCTION_TOKENS = 300

print("="*60)
print("TOKEN USAGE ANALYSIS FOR YOUR 17-MINUTE SPEECH")
print("="*60)

print("\n1. VOCABULARY REPORT:")
vocab_tokens = TRANSCRIPTION_TOKENS + LINGUISTIC_DATA_TOKENS + INSTRUCTION_TOKENS
print(f"   - Transcription: {TRANSCRIPTION_TOKENS:.0f} tokens")
print(f"   - Linguistic data: {LINGUISTIC_DATA_TOKENS} tokens")
print(f"   - Instructions: {INSTRUCTION_TOKENS} tokens")
print(f"   TOTAL: {vocab_tokens:.0f} tokens")

print("\n2. SCORE GENERATION:")
score_tokens = TRANSCRIPTION_TOKENS + EMOTION_DATA_TOKENS + LINGUISTIC_DATA_TOKENS + INSTRUCTION_TOKENS
print(f"   - Transcription: {TRANSCRIPTION_TOKENS:.0f} tokens")
print(f"   - Emotion summary: {EMOTION_DATA_TOKENS} tokens")
print(f"   - Linguistic data: {LINGUISTIC_DATA_TOKENS} tokens")
print(f"   - Instructions: {INSTRUCTION_TOKENS} tokens")
print(f"   TOTAL: {score_tokens:.0f} tokens")

print("\n3. SPEECH REPORT:")
speech_tokens = TRANSCRIPTION_TOKENS + EMOTION_DATA_TOKENS + LINGUISTIC_DATA_TOKENS + INSTRUCTION_TOKENS
print(f"   - Transcription: {TRANSCRIPTION_TOKENS:.0f} tokens")
print(f"   - Emotion summary: {EMOTION_DATA_TOKENS} tokens")
print(f"   - Linguistic data: {LINGUISTIC_DATA_TOKENS} tokens")
print(f"   - Instructions: {INSTRUCTION_TOKENS} tokens")
print(f"   TOTAL: {speech_tokens:.0f} tokens")

print("\n4. EXPRESSION REPORT:")
expression_tokens = 300 + 200  # Emotion data + instructions
print(f"   - Emotion analysis: 300 tokens")
print(f"   - Instructions: 200 tokens")
print(f"   TOTAL: {expression_tokens} tokens")

total_per_speech = vocab_tokens + score_tokens + speech_tokens + expression_tokens
print("\n" + "="*60)
print(f"TOTAL PER SPEECH: {total_per_speech:.0f} tokens")
print("="*60)

# Calculate how many speeches you can process
FREE_TIER_LIMIT = 250000
speeches_per_minute = FREE_TIER_LIMIT / total_per_speech

print(f"\nFree tier limit: {FREE_TIER_LIMIT:,} tokens/minute")
print(f"Speeches you can process per minute: {speeches_per_minute:.1f}")
print(f"Time between speeches to stay safe: {60/speeches_per_minute:.1f} seconds")

# Show what happens with multiple tests
print("\n" + "="*60)
print("WHAT HAPPENS WITH MULTIPLE TESTS:")
print("="*60)

for num_tests in range(1, 6):
    total_tokens = total_per_speech * num_tests
    percentage = (total_tokens / FREE_TIER_LIMIT) * 100
    status = "✅ OK" if total_tokens < FREE_TIER_LIMIT else "❌ QUOTA EXCEEDED"
    print(f"{num_tests} test(s): {total_tokens:,.0f} tokens ({percentage:.1f}%) {status}")

print("\n" + "="*60)
print("RECOMMENDATION:")
print("="*60)
print("Wait at least 60 seconds between test runs!")
print("Or use a shorter test video (2-5 minutes)")
