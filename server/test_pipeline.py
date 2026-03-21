import requests
import os
import json
import pandas as pd
from typing import Dict, Any

# --- Configuration ---
FLASK_URL = "http://127.0.0.1:5000/upload"
VIDEO_PATH = r"D:\Eloquence-main\Eloquence-main\videoplayback.mp4"  # Using raw string for Windows path
USER_ID = "test_user_123"
CONTEXT = "Demo Speech"
TITLE = "Demo Speech"

def print_linguistic_summary(linguistic_summary: Dict[str, str]):
    """Print linguistic summary in a formatted way"""
    print("\n--- LINGUISTIC SUMMARY ---")
    for key, value in linguistic_summary.items():
        print(f"  [{key.upper()}]")
        print(f"    {value}")

def print_linguistic_details(linguistic_analysis: Dict[str, Any]):
    """Print detailed linguistic analysis"""
    print("\n--- DETAILED LINGUISTIC ANALYSIS ---")
    
    # Vocabulary
    vocab = linguistic_analysis.get('vocabulary', {})
    if vocab:
        print("\n  [VOCABULARY RICHNESS]")
        print(f"    Total words: {vocab.get('total_words', 0)}")
        print(f"    Unique words: {vocab.get('unique_words', 0)}")
        print(f"    Lexical diversity: {vocab.get('lexical_diversity', 0):.3f}")
        print(f"    Unique lemmas: {vocab.get('unique_lemmas', 0)}")
        
        most_common = vocab.get('most_common_words', [])[:5]
        if most_common:
            print(f"    Most common words: {', '.join([f'{w}({c})' for w, c in most_common])}")
    
    # Filler words
    fillers = linguistic_analysis.get('filler_words', {})
    if fillers:
        print("\n  [FILLER WORDS]")
        print(f"    Total count: {fillers.get('total_count', 0)}")
        print(f"    Percentage: {fillers.get('percentage', 0):.2f}%")
        top_fillers = fillers.get('top_3', [])
        if top_fillers:
            print(f"    Top fillers: {', '.join([f'{w}({c})' for w, c in top_fillers])}")
    
    # Hedge words
    hedges = linguistic_analysis.get('hedge_words', {})
    if hedges:
        print("\n  [HEDGE WORDS (Uncertainty)]")
        print(f"    Total count: {hedges.get('total_count', 0)}")
        print(f"    Percentage: {hedges.get('percentage', 0):.2f}%")
        top_hedges = hedges.get('top_3', [])
        if top_hedges:
            print(f"    Top hedges: {', '.join([f'{w}({c})' for w, c in top_hedges])}")
    
    # Power words
    power = linguistic_analysis.get('power_words', {})
    if power:
        print("\n  [POWER WORDS (Confidence)]")
        print(f"    Total count: {power.get('total_count', 0)}")
        print(f"    Percentage: {power.get('percentage', 0):.2f}%")
        by_category = power.get('by_category', {})
        if by_category:
            print(f"    By category: {', '.join([f'{k}({v})' for k, v in list(by_category.items())[:3]])}")
    
    # Confidence ratio
    hedge_count = hedges.get('total_count', 0)
    power_count = power.get('total_count', 0)
    if hedge_count + power_count > 0:
        confidence_ratio = power_count / (hedge_count + power_count)
        print(f"\n  [CONFIDENCE RATIO]")
        print(f"    {confidence_ratio:.2%} (Power words / Total confidence markers)")
        if confidence_ratio > 0.6:
            print(f"    ✓ Strong confident language")
        elif confidence_ratio > 0.4:
            print(f"    ~ Balanced confidence")
        else:
            print(f"    ⚠ Shows uncertainty")
    
    # Weak words
    weak = linguistic_analysis.get('weak_words', {})
    if weak and weak.get('total_count', 0) > 0:
        print("\n  [WEAK WORDS]")
        print(f"    Total count: {weak.get('total_count', 0)}")
        print(f"    Percentage: {weak.get('percentage', 0):.2f}%")
    
    # Transitions
    transitions = linguistic_analysis.get('transitions', {})
    if transitions:
        print("\n  [TRANSITION WORDS]")
        print(f"    Total count: {transitions.get('total_count', 0)}")
        by_category = transitions.get('by_category', {})
        if by_category:
            print(f"    By type: {', '.join([f'{k}({v})' for k, v in by_category.items()])}")
    
    # Part of speech
    pos = linguistic_analysis.get('pos_distribution', {})
    if pos:
        details = pos.get('details', {})
        if details:
            print("\n  [PART OF SPEECH DISTRIBUTION]")
            print(f"    Nouns: {details.get('nouns', 0)}")
            print(f"    Verbs: {details.get('verbs', 0)}")
            print(f"    Adjectives: {details.get('adjectives', 0)}")
            print(f"    Adverbs: {details.get('adverbs', 0)}")
            
            # Verb-to-noun ratio
            nouns = details.get('nouns', 0)
            verbs = details.get('verbs', 0)
            if nouns > 0:
                ratio = verbs / nouns
                print(f"    Verb/Noun ratio: {ratio:.2f}")
                if ratio > 0.7:
                    print(f"      ✓ Good action-oriented language")
                else:
                    print(f"      ⚠ Consider adding more action verbs")
    
    # Named entities
    entities = linguistic_analysis.get('named_entities', {})
    if entities and entities.get('total_entities', 0) > 0:
        print("\n  [NAMED ENTITIES]")
        print(f"    Total entities: {entities.get('total_entities', 0)}")
        entity_types = entities.get('entity_types', {})
        if entity_types:
            print(f"    Types: {', '.join([f'{k}({v})' for k, v in entity_types.items()])}")
        
        entities_by_type = entities.get('entities_by_type', {})
        for entity_type, items in list(entities_by_type.items())[:3]:
            print(f"    {entity_type}: {', '.join(items[:5])}")
    
    # Sentence structure
    structure = linguistic_analysis.get('sentence_structure', {})
    if structure:
        print("\n  [SENTENCE STRUCTURE]")
        print(f"    Total sentences: {structure.get('total_sentences', 0)}")
        
        stats = structure.get('sentence_length_stats', {})
        if stats:
            print(f"    Avg sentence length: {stats.get('avg', 0):.1f} words")
            print(f"    Min/Max: {stats.get('min', 0)} / {stats.get('max', 0)} words")
        
        passive = structure.get('passive_voice', {})
        if passive and passive.get('count', 0) > 0:
            print(f"    Passive voice: {passive.get('count', 0)} instances")
            examples = passive.get('examples', [])
            if examples:
                print(f"      Example: \"{examples[0][:60]}...\"")
        
        repetitive = structure.get('repetitive_starts', {})
        if repetitive:
            print(f"    Repetitive sentence starts: {', '.join([f'{k}({v})' for k, v in list(repetitive.items())[:3]])}")

def run_test():
    """
    Sends a video file to the Flask backend and prints a formatted summary of the analysis.
    """
    if not os.path.exists(VIDEO_PATH):
        print(f"Error: Test video not found at '{VIDEO_PATH}'")
        return
    
    with open(VIDEO_PATH, 'rb') as video_file:
        files = {'file': (os.path.basename(VIDEO_PATH), video_file, 'video/mp4')}
        data = {'userId': USER_ID, 'context': CONTEXT, 'title': TITLE}

        print(f"Uploading '{VIDEO_PATH}' to {FLASK_URL}...")
        
        try:
            # Added a 10-minute timeout for longer processing
            response = requests.post(FLASK_URL, files=files, data=data)

            print(f"Server responded with status code: {response.status_code}")

            if response.status_code == 200:
                print("\n✅ Success! Pipeline completed.")
                report = response.json()
                
                print("\n" + "="*80)
                print(f" ANALYSIS REPORT FOR: {report.get('title', 'N/A')}")
                print("="*80)

                scores = report.get('scores', {})
                print("\n--- SCORES ---")
                print(f"  - Vocabulary:  {scores.get('vocabulary', 'N/A')} / 100")
                print(f"  - Voice:       {scores.get('voice', 'N/A')} / 100")
                print(f"  - Expressions: {scores.get('expressions', 'N/A')} / 100")
                
                # Print linguistic summary (quick insights)
                linguistic_summary = report.get('linguistic_summary', {})
                if linguistic_summary:
                    print_linguistic_summary(linguistic_summary)
                
                # Print detailed linguistic analysis
                linguistic_analysis = report.get('linguistic_analysis', {})
                if linguistic_analysis:
                    print_linguistic_details(linguistic_analysis)
                
                print("\n--- LLM-GENERATED FEEDBACK ---")
                print("\n[Vocabulary Report]")
                vocab_report = report.get('vocabulary_report', 'N/A')
                if isinstance(vocab_report, dict):
                    print(json.dumps(vocab_report, indent=2))
                else:
                    print(vocab_report)
                
                print("\n[Vocal Tone Report]")
                print(report.get('speech_report', 'N/A'))
                
                print("\n[Expression Report]")
                print(report.get('expression_report', 'N/A'))

                print("\n--- FULL TRANSCRIPTION ---")
                print(report.get('transcription', 'N/A'))
                
                # Print vocal emotions timeline
                vocal_emotions = report.get('vocal_emotions', [])
                if vocal_emotions:
                    print("\n--- VOCAL EMOTIONS TIMELINE ---")
                    for emotion_chunk in vocal_emotions[:10]:  # Show first 10 chunks
                        print(f"  [{emotion_chunk.get('start_time', 0):.1f}s - {emotion_chunk.get('end_time', 0):.1f}s]: {emotion_chunk.get('emotion', 'N/A')}")
                    if len(vocal_emotions) > 10:
                        print(f"  ... and {len(vocal_emotions) - 10} more chunks")
                
                print("\n" + "="*80)
                print("\n💡 TIP: You can now chat with this report using the /chat endpoint!")
                print(f"   Report ID: {report.get('_id', 'N/A')}")
                print("="*80)

            else:
                print("\n❌ Error! The server returned an error.")
                try:
                    print(response.json())
                except json.JSONDecodeError:
                    print(response.text)

        except requests.exceptions.RequestException as e:
            print(f"\n❌ An error occurred: {e}")
            print("Please make sure your Flask app is running and accessible.")

def test_chat(report_id: str):
    """
    Test the chat endpoint with a report
    """
    CHAT_URL = "http://127.0.0.1:5000/chat"
    
    test_questions = [
        "What was my vocabulary score and why?",
        "How can I reduce my filler words?",
        "What are my top 3 areas for improvement?",
        "Can you give me specific examples of weak language I used?",
        "How confident did I sound overall?"
    ]
    
    print("\n" + "="*80)
    print(" TESTING CHAT FEATURE")
    print("="*80)
    
    chat_history = []
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n[Question {i}]: {question}")
        
        try:
            response = requests.post(
                CHAT_URL,
                json={
                    "reportId": report_id,
                    "message": question,
                    "history": chat_history
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get('response', 'N/A')
                print(f"\n[Answer {i}]:")
                print(answer)
                
                # Add to history
                chat_history.append({"role": "user", "content": question})
                chat_history.append({"role": "assistant", "content": answer})
            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
        
        print("\n" + "-"*80)
    
    print("\n✅ Chat test completed!")
    print("="*80)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "chat":
        # Test chat with a report ID
        if len(sys.argv) > 2:
            report_id = sys.argv[2]
            test_chat(report_id)
        else:
            print("Usage: python test_pipeline.py chat <report_id>")
    else:
        # Run normal pipeline test
        run_test()