"""
Test script for the Detailed Analysis Pipeline

This script demonstrates the comprehensive analysis capabilities
with detailed progress tracking and metrics at each stage.
"""

import os
import sys
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the detailed pipeline
from utils.detailed_analysis_pipeline import (
    DetailedAnalysisPipeline,
    run_detailed_analysis
)


def test_basic_pipeline(file_path: str):
    """Test the basic pipeline with default settings"""
    print("\n" + "="*70)
    print("TEST 1: Basic Pipeline with Verbose Output")
    print("="*70)
    
    results = run_detailed_analysis(
        file_path=file_path,
        context="Practice presentation for a business meeting",
        title="Business Presentation Test",
        user_id="test_user_123",
        verbose=True
    )
    
    return results


def test_custom_model_pipeline(file_path: str):
    """Test pipeline with custom model configuration"""
    print("\n" + "="*70)
    print("TEST 2: Custom Model Pipeline")
    print("="*70)
    
    from utils.detailed_analysis_pipeline import analyze_with_custom_model
    
    results = analyze_with_custom_model(
        file_path=file_path,
        context="Technical presentation on AI",
        model_name="gemini-2.5-flash",
        title="Technical Talk",
        verbose=True
    )
    
    return results


def test_pipeline_object(file_path: str):
    """Test using the pipeline object directly"""
    print("\n" + "="*70)
    print("TEST 3: Direct Pipeline Object Usage")
    print("="*70)
    
    # Create pipeline instance
    pipeline = DetailedAnalysisPipeline(gemini_model_name="gemini-2.5-flash")
    
    # Run analysis
    results = pipeline.analyze_file(
        file_path=file_path,
        context="Motivational speech",
        title="Motivation Test",
        user_id="test_user_456",
        verbose=True
    )
    
    # Access stage timings
    print("\n📊 Detailed Stage Timings:")
    print("-" * 70)
    for stage, duration in results['stage_timings'].items():
        print(f"  {stage:.<40} {duration:>6.2f}s")
    print(f"  {'TOTAL':.<40} {results['total_processing_time']:>6.2f}s")
    
    return results


def display_detailed_results(results: Dict):
    """Display detailed analysis results in a formatted way"""
    print("\n" + "="*70)
    print("DETAILED RESULTS BREAKDOWN")
    print("="*70)
    
    # Basic Info
    print(f"\n📋 Session Information:")
    print(f"  Title: {results.get('title', 'N/A')}")
    print(f"  Context: {results.get('context', 'N/A')}")
    print(f"  Mode: {results.get('mode', 'N/A')}")
    print(f"  User ID: {results.get('userId', 'N/A')}")
    
    # Transcription
    transcription = results.get('transcription', '')
    word_count = len(transcription.split())
    print(f"\n📝 Transcription:")
    print(f"  Word count: {word_count}")
    print(f"  Preview: {transcription[:150]}...")
    
    # Scores
    scores = results.get('scores', {})
    print(f"\n🎯 Scores:")
    print(f"  Vocabulary:  {scores.get('vocabulary', 0):>3}/100")
    print(f"  Voice:       {scores.get('voice', 0):>3}/100")
    print(f"  Expressions: {scores.get('expressions', 0):>3}/100")
    print(f"  Average:     {sum(scores.values())/3:>6.1f}/100")
    
    # Linguistic Summary
    linguistic_summary = results.get('linguistic_summary', {})
    if linguistic_summary:
        print(f"\n📊 Linguistic Summary:")
        for key, value in linguistic_summary.items():
            print(f"  {key}: {value}")
    
    # Advanced Insights
    insights = results.get('advanced_insights', {})
    if insights:
        print(f"\n💡 Advanced Insights:")
        
        strengths = insights.get('strengths', [])
        if strengths:
            print(f"\n  ✅ Strengths ({len(strengths)}):")
            for i, strength in enumerate(strengths, 1):
                print(f"    {i}. {strength}")
        
        improvements = insights.get('areas_for_improvement', [])
        if improvements:
            print(f"\n  🔧 Areas for Improvement ({len(improvements)}):")
            for i, area in enumerate(improvements, 1):
                print(f"    {i}. {area}")
        
        recommendations = insights.get('recommendations', [])
        if recommendations:
            print(f"\n  📌 Recommendations ({len(recommendations)}):")
            for i, rec in enumerate(recommendations, 1):
                action = rec.get('action', 'N/A')
                reason = rec.get('reason', 'N/A')
                priority = rec.get('priority', 'medium')
                print(f"    {i}. [{priority.upper()}] {action}")
                print(f"       → {reason}")
        
        key_metrics = insights.get('key_metrics', {})
        if key_metrics:
            print(f"\n  📈 Key Metrics:")
            for metric, value in key_metrics.items():
                print(f"    {metric}: {value}")
    
    # Vocal Emotions
    vocal_emotions = results.get('vocal_emotions', [])
    if vocal_emotions:
        emotion_counts = {}
        for chunk in vocal_emotions:
            emotion = chunk['emotion']
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        print(f"\n🎵 Vocal Emotions ({len(vocal_emotions)} chunks):")
        for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / len(vocal_emotions)) * 100
            print(f"  {emotion:.<15} {count:>3} chunks ({percentage:>5.1f}%)")
    
    # Reports Preview
    print(f"\n📄 Reports Generated:")
    vocab_report = results.get('vocabulary_report', '')
    print(f"  Vocabulary Report: {len(vocab_report)} characters")
    print(f"    Preview: {vocab_report[:100]}...")
    
    speech_report = results.get('speech_report', '')
    print(f"\n  Speech Report: {len(speech_report)} characters")
    print(f"    Preview: {speech_report[:100]}...")
    
    expression_report = results.get('expression_report', '')
    print(f"\n  Expression Report: {len(expression_report)} characters")
    print(f"    Preview: {expression_report[:100]}...")
    
    # Processing Time
    print(f"\n⏱️  Processing Time:")
    print(f"  Total: {results.get('total_processing_time', 0):.2f}s")


def save_results_to_file(results: Dict, output_file: str = "detailed_analysis_results.json"):
    """Save results to a JSON file"""
    # Convert any non-serializable objects
    import pandas as pd
    
    serializable_results = results.copy()
    
    # Convert DataFrame to dict if present
    if 'facial_emotions' in serializable_results:
        facial = serializable_results['facial_emotions']
        if isinstance(facial, pd.DataFrame):
            serializable_results['facial_emotions'] = facial.to_dict()
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(serializable_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Results saved to: {output_file}")


def main():
    """Main test function"""
    # Check if file path is provided
    if len(sys.argv) < 2:
        print("Usage: python test_detailed_pipeline.py <path_to_audio_or_video_file>")
        print("\nExample:")
        print("  python test_detailed_pipeline.py Uploads/sample.mp4")
        print("  python test_detailed_pipeline.py Uploads/sample.wav")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found: {file_path}")
        sys.exit(1)
    
    print(f"\n🚀 Starting Detailed Analysis Pipeline Tests")
    print(f"📁 File: {file_path}")
    
    # Run test
    try:
        results = test_basic_pipeline(file_path)
        
        # Display detailed results
        display_detailed_results(results)
        
        # Save to file
        save_results_to_file(results)
        
        print("\n✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
