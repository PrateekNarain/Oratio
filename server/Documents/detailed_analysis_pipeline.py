"""
Detailed Analysis Pipeline for Eloquence Speech Analysis System

This module orchestrates comprehensive speech analysis through multiple stages:
1. Audio/Video Processing
2. Transcription & Emotion Detection
3. Linguistic Analysis
4. Report Generation
5. Scoring & Insights

Each stage produces detailed metrics and actionable feedback.
"""

import os
import time
import json
from typing import Dict, Any, List, Optional, Tuple
import google.generativeai as genai

# Import utility modules
from utils.audioextraction import extract_audio_to_memory
from utils.expressions import analyze_video_emotions
from utils.transcription import speech_to_text_long
from utils.vocals import predict_emotion
from utils.vocabulary import evaluate_vocabulary
from utils.linguistic_analysis import (
    analyze_transcript_complete,
    generate_linguistic_summary
)

# Configure Gemini API
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))


class DetailedAnalysisPipeline:
    """
    Comprehensive speech analysis pipeline with detailed metrics at each stage
    """
    
    def __init__(self, gemini_model_name: str = "gemini-2.5-flash"):
        """
        Initialize the pipeline
        
        Args:
            gemini_model_name: Name of the Gemini model to use
        """
        self.gemini_model = genai.GenerativeModel(gemini_model_name)
        self.analysis_results = {}
        self.stage_timings = {}
        
    def analyze_file(
        self,
        file_path: str,
        context: str = "",
        title: str = "Untitled Session",
        user_id: str = None,
        verbose: bool = True
    ) -> Dict[str, Any]:
        """
        Run complete analysis pipeline on a video or audio file
        
        Args:
            file_path: Path to the media file
            context: Context/purpose of the speech
            title: Title for the session
            user_id: User identifier
            verbose: Print progress messages
            
        Returns:
            Complete analysis results dictionary
        """
        if verbose:
            print(f"\n{'='*60}")
            print(f"DETAILED ANALYSIS PIPELINE")
            print(f"{'='*60}")
            print(f"File: {file_path}")
            print(f"Title: {title}")
            print(f"Context: {context}")
            print(f"{'='*60}\n")
        
        # Stage 1: Media Processing
        audio_data, facial_emotions, mode = self._stage_1_media_processing(
            file_path, verbose
        )
        
        # Stage 2: Transcription
        transcription = self._stage_2_transcription(audio_data, verbose)
        
        # Stage 3: Vocal Emotion Analysis
        vocal_emotions = self._stage_3_vocal_emotions(audio_data, verbose)
        
        # Stage 4: Linguistic Analysis
        linguistic_analysis, linguistic_summary = self._stage_4_linguistic_analysis(
            transcription, vocal_emotions, verbose
        )
        
        # Stage 5: Vocabulary Evaluation
        vocabulary_report = self._stage_5_vocabulary_evaluation(
            transcription, context, linguistic_analysis, verbose
        )
        
        # Stage 6: Speech Report
        speech_report = self._stage_6_speech_report(
            transcription, context, vocal_emotions, linguistic_analysis, verbose
        )
        
        # Stage 7: Expression Report
        expression_report = self._stage_7_expression_report(
            facial_emotions, mode, verbose
        )
        
        # Stage 8: Scoring
        scores = self._stage_8_scoring(
            transcription, vocal_emotions, facial_emotions, linguistic_analysis, verbose
        )
        
        # Stage 9: Advanced Insights
        advanced_insights = self._stage_9_advanced_insights(
            transcription, linguistic_analysis, vocal_emotions, verbose
        )
        
        # Compile final results
        final_results = {
            "userId": user_id,
            "title": title,
            "context": context,
            "mode": mode,
            "transcription": transcription,
            "scores": scores,
            "vocabulary_report": vocabulary_report,
            "speech_report": speech_report,
            "expression_report": expression_report,
            "linguistic_analysis": linguistic_analysis,
            "linguistic_summary": linguistic_summary,
            "vocal_emotions": vocal_emotions,
            "facial_emotions": facial_emotions.to_dict() if not facial_emotions.empty else {},
            "advanced_insights": advanced_insights,
            "stage_timings": self.stage_timings,
            "total_processing_time": sum(self.stage_timings.values())
        }
        
        if verbose:
            self._print_pipeline_summary(final_results)
        
        return final_results
    
    def _stage_1_media_processing(
        self, file_path: str, verbose: bool
    ) -> Tuple[Any, Any, str]:
        """Stage 1: Extract audio and analyze facial expressions"""
        start_time = time.time()
        
        if verbose:
            print("📁 STAGE 1: Media Processing")
            print("-" * 60)
        
        # Determine mode
        file_ext = file_path.rsplit('.', 1)[1].lower()
        mode = "video" if file_ext == 'mp4' else 'audio'
        
        if mode == "video":
            if verbose:
                print("  → Extracting audio from video...")
            audio_data = extract_audio_to_memory(file_path)
            
            if verbose:
                print("  → Analyzing facial expressions...")
            facial_emotions = analyze_video_emotions(file_path)
            
            if verbose:
                print(f"  ✓ Facial emotions detected: {len(facial_emotions)} emotion types")
        else:
            audio_data = file_path
            facial_emotions = None
            if verbose:
                print("  → Audio-only mode (no facial analysis)")
        
        elapsed = time.time() - start_time
        self.stage_timings['media_processing'] = elapsed
        
        if verbose:
            print(f"  ⏱️  Stage 1 completed in {elapsed:.2f}s\n")
        
        return audio_data, facial_emotions, mode
    
    def _stage_2_transcription(self, audio_data: Any, verbose: bool) -> str:
        """Stage 2: Speech-to-text transcription"""
        start_time = time.time()
        
        if verbose:
            print("🎤 STAGE 2: Transcription")
            print("-" * 60)
            print("  → Converting speech to text...")
        
        transcription = speech_to_text_long(audio_data)
        word_count = len(transcription.split())
        
        elapsed = time.time() - start_time
        self.stage_timings['transcription'] = elapsed
        
        if verbose:
            print(f"  ✓ Transcription complete: {word_count} words")
            print(f"  ⏱️  Stage 2 completed in {elapsed:.2f}s\n")
        
        return transcription
    
    def _stage_3_vocal_emotions(self, audio_data: Any, verbose: bool) -> List[Dict]:
        """Stage 3: Vocal emotion detection"""
        start_time = time.time()
        
        if verbose:
            print("🎵 STAGE 3: Vocal Emotion Analysis")
            print("-" * 60)
            print("  → Analyzing vocal emotions...")
        
        vocal_emotions = predict_emotion(audio_data)
        
        # Calculate emotion distribution
        emotion_counts = {}
        for chunk in vocal_emotions:
            emotion = chunk['emotion']
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        elapsed = time.time() - start_time
        self.stage_timings['vocal_emotions'] = elapsed
        
        if verbose:
            print(f"  ✓ Analyzed {len(vocal_emotions)} audio chunks")
            print(f"  → Emotion distribution: {emotion_counts}")
            print(f"  ⏱️  Stage 3 completed in {elapsed:.2f}s\n")
        
        return vocal_emotions
    
    def _stage_4_linguistic_analysis(
        self, transcription: str, vocal_emotions: List[Dict], verbose: bool
    ) -> Tuple[Dict, Dict]:
        """Stage 4: Comprehensive linguistic analysis"""
        start_time = time.time()
        
        if verbose:
            print("📊 STAGE 4: Linguistic Analysis")
            print("-" * 60)
            print("  → Running spaCy NLP analysis...")
        
        linguistic_analysis = analyze_transcript_complete(transcription, vocal_emotions)
        linguistic_summary = generate_linguistic_summary(linguistic_analysis)
        
        elapsed = time.time() - start_time
        self.stage_timings['linguistic_analysis'] = elapsed
        
        if verbose:
            vocab = linguistic_analysis.get('vocabulary', {})
            fillers = linguistic_analysis.get('filler_words', {})
            print(f"  ✓ Vocabulary: {vocab.get('unique_words', 0)} unique words")
            print(f"  ✓ Lexical diversity: {vocab.get('lexical_diversity', 0):.3f}")
            print(f"  ✓ Filler words: {fillers.get('total_count', 0)} ({fillers.get('percentage', 0):.1f}%)")
            print(f"  ⏱️  Stage 4 completed in {elapsed:.2f}s\n")
        
        return linguistic_analysis, linguistic_summary
    
    def _stage_5_vocabulary_evaluation(
        self, transcription: str, context: str, linguistic_analysis: Dict, verbose: bool
    ) -> str:
        """Stage 5: Detailed vocabulary evaluation"""
        start_time = time.time()
        
        if verbose:
            print("📝 STAGE 5: Vocabulary Evaluation")
            print("-" * 60)
            print("  → Generating vocabulary report with AI...")
        
        vocabulary_report = evaluate_vocabulary(transcription, context, linguistic_analysis)
        
        elapsed = time.time() - start_time
        self.stage_timings['vocabulary_evaluation'] = elapsed
        
        if verbose:
            print(f"  ✓ Vocabulary report generated ({len(vocabulary_report)} chars)")
            print(f"  ⏱️  Stage 5 completed in {elapsed:.2f}s\n")
        
        return vocabulary_report
    
    def _stage_6_speech_report(
        self,
        transcription: str,
        context: str,
        vocal_emotions: List[Dict],
        linguistic_analysis: Dict,
        verbose: bool
    ) -> str:
        """Stage 6: Speech delivery report"""
        start_time = time.time()
        
        if verbose:
            print("🗣️  STAGE 6: Speech Delivery Report")
            print("-" * 60)
            print("  → Analyzing speech delivery and emotional tone...")
        
        speech_report = self._generate_speech_report(
            transcription, context, vocal_emotions, linguistic_analysis
        )
        
        elapsed = time.time() - start_time
        self.stage_timings['speech_report'] = elapsed
        
        if verbose:
            print(f"  ✓ Speech report generated ({len(speech_report)} chars)")
            print(f"  ⏱️  Stage 6 completed in {elapsed:.2f}s\n")
        
        return speech_report
    
    def _stage_7_expression_report(
        self, facial_emotions: Any, mode: str, verbose: bool
    ) -> str:
        """Stage 7: Facial expression report"""
        start_time = time.time()
        
        if verbose:
            print("😊 STAGE 7: Facial Expression Report")
            print("-" * 60)
        
        if mode == "video" and facial_emotions is not None and not facial_emotions.empty:
            if verbose:
                print("  → Analyzing facial expressions...")
            
            expression_report = self._generate_expression_report(facial_emotions)
        else:
            expression_report = "No facial expression analysis available (audio-only mode)."
            if verbose:
                print("  → Skipped (audio-only mode)")
        
        elapsed = time.time() - start_time
        self.stage_timings['expression_report'] = elapsed
        
        if verbose:
            print(f"  ⏱️  Stage 7 completed in {elapsed:.2f}s\n")
        
        return expression_report
    
    def _stage_8_scoring(
        self,
        transcription: str,
        vocal_emotions: List[Dict],
        facial_emotions: Any,
        linguistic_analysis: Dict,
        verbose: bool
    ) -> Dict[str, int]:
        """Stage 8: Generate comprehensive scores"""
        start_time = time.time()
        
        if verbose:
            print("🎯 STAGE 8: Scoring")
            print("-" * 60)
            print("  → Calculating vocabulary, voice, and expression scores...")
        
        scores = self._generate_scores(
            transcription, vocal_emotions, facial_emotions, linguistic_analysis
        )
        
        elapsed = time.time() - start_time
        self.stage_timings['scoring'] = elapsed
        
        if verbose:
            print(f"  ✓ Vocabulary: {scores['vocabulary']}/100")
            print(f"  ✓ Voice: {scores['voice']}/100")
            print(f"  ✓ Expressions: {scores['expressions']}/100")
            print(f"  ⏱️  Stage 8 completed in {elapsed:.2f}s\n")
        
        return scores
    
    def _stage_9_advanced_insights(
        self,
        transcription: str,
        linguistic_analysis: Dict,
        vocal_emotions: List[Dict],
        verbose: bool
    ) -> Dict[str, Any]:
        """Stage 9: Generate advanced insights and recommendations"""
        start_time = time.time()
        
        if verbose:
            print("💡 STAGE 9: Advanced Insights")
            print("-" * 60)
            print("  → Generating personalized recommendations...")
        
        insights = self._generate_advanced_insights(
            transcription, linguistic_analysis, vocal_emotions
        )
        
        elapsed = time.time() - start_time
        self.stage_timings['advanced_insights'] = elapsed
        
        if verbose:
            print(f"  ✓ Generated {len(insights.get('recommendations', []))} recommendations")
            print(f"  ✓ Identified {len(insights.get('strengths', []))} strengths")
            print(f"  ✓ Found {len(insights.get('areas_for_improvement', []))} areas for improvement")
            print(f"  ⏱️  Stage 9 completed in {elapsed:.2f}s\n")
        
        return insights
    
    # ========================================================================
    # Helper Methods for Report Generation
    # ========================================================================
    
    def _generate_speech_report(
        self,
        transcription: str,
        context: str,
        vocal_emotions: List[Dict],
        linguistic_analysis: Dict
    ) -> str:
        """Generate detailed speech delivery report"""
        hedges = linguistic_analysis.get('hedge_words', {})
        power = linguistic_analysis.get('power_words', {})
        confident = linguistic_analysis.get('confident_phrases', {})
        
        linguistic_context = f"""
Additional Linguistic Insights:
- Hedge words (uncertainty): {hedges.get('total_count', 0)}
- Power words (confidence): {power.get('total_count', 0)}
- Confident phrases: {confident.get('total_count', 0)}
        """
        
        system_message = f"""
You are an expert speech coach. Analyze the emotional delivery and vocal tone.
Context: "{context}"
Vocal Emotions: {vocal_emotions}
{linguistic_context}
        """
        
        user_message = """
Provide a detailed 2-3 paragraph report on emotional delivery. Focus on:
- Emotional tone appropriateness for the context
- Clarity and expressiveness
- Confidence and certainty in language
- Specific examples and actionable feedback
Do not include numeric scores.
        """
        
        response = self.gemini_model.generate_content([system_message, user_message])
        return response.text
    
    def _generate_expression_report(self, facial_emotions: Any) -> str:
        """Generate facial expression report"""
        emotion_str = facial_emotions.to_string(index=False)
        
        system_message = f"""
You are an expert in facial expression analysis.
Emotion Data: {emotion_str}
        """
        
        user_message = """
Provide a concise paragraph on facial expression appropriateness:
- Emotional appropriateness and consistency
- Expressiveness and engagement
- Alignment with speech tone
Do not include numeric scores.
        """
        
        response = self.gemini_model.generate_content([system_message, user_message])
        return response.text
    
    def _generate_scores(
        self,
        transcription: str,
        vocal_emotions: List[Dict],
        facial_emotions: Any,
        linguistic_analysis: Dict
    ) -> Dict[str, int]:
        """Generate vocabulary, voice, and expression scores"""
        # Prepare compact linguistic summary
        vocab = linguistic_analysis.get('vocabulary', {})
        fillers = linguistic_analysis.get('filler_words', {})
        hedges = linguistic_analysis.get('hedge_words', {})
        power = linguistic_analysis.get('power_words', {})
        
        linguistic_summary = f"""
Linguistic Metrics:
- Lexical Diversity: {vocab.get('lexical_diversity', 0):.2f}
- Words: {vocab.get('total_words', 0)}/{vocab.get('unique_words', 0)}
- Fillers: {fillers.get('percentage', 0):.1f}%
- Hedges: {hedges.get('total_count', 0)}, Power: {power.get('total_count', 0)}
        """
        
        emotion_str = facial_emotions.to_string(index=False) if facial_emotions is not None and not facial_emotions.empty else "No facial data"
        
        system_message = """
You are an expert speech analyst. Generate scores (0-100) for:

- Vocabulary: Richness, relevance, and variety
  90-100: Highly varied, sophisticated, no repetition
  70-89: Good variety, minor repetition
  50-69: Basic vocabulary, some overuse
  30-49: Limited variety, frequent repetition
  0-29: Poor, repetitive vocabulary

- Voice: Expressiveness and emotional impact
  90-100: Excellent expressiveness, perfect emotional match
  70-89: Good match, minor mismatches
  50-69: Average expressiveness
  30-49: Limited emotional range
  0-29: Monotone or mismatched

- Expressions: Facial expression appropriateness
  90-100: Dynamic, fully aligned with speech
  70-89: Mostly appropriate
  50-69: Average dynamism
  30-49: Limited expressiveness
  0-29: Inappropriate or flat

Provide only JSON: {"vocabulary": X, "voice": Y, "expressions": Z}
        """
        
        user_message = f"""
Transcription: {transcription}
Audio Emotions: {vocal_emotions}
Facial Emotions: {emotion_str}
{linguistic_summary}

Provide only the JSON output.
        """
        
        response = self.gemini_model.generate_content(
            [system_message, user_message],
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.0
            )
        )
        
        import re
        cleaned_text = re.sub(r'```(?:json)?\s*|\s*```', '', response.text).strip()
        scores = json.loads(cleaned_text)
        
        # Validate scores
        for key in ['vocabulary', 'voice', 'expressions']:
            if not isinstance(scores.get(key), int) or not 0 <= scores[key] <= 100:
                scores[key] = 0
        
        return scores
    
    def _generate_advanced_insights(
        self,
        transcription: str,
        linguistic_analysis: Dict,
        vocal_emotions: List[Dict]
    ) -> Dict[str, Any]:
        """Generate advanced insights with specific recommendations"""
        # Extract key metrics
        vocab = linguistic_analysis.get('vocabulary', {})
        fillers = linguistic_analysis.get('filler_words', {})
        hedges = linguistic_analysis.get('hedge_words', {})
        power = linguistic_analysis.get('power_words', {})
        weak = linguistic_analysis.get('weak_words', {})
        transitions = linguistic_analysis.get('transitions', {})
        
        # Build compact context
        context = f"""
Vocabulary: {vocab.get('unique_words', 0)} unique, diversity {vocab.get('lexical_diversity', 0):.2f}
Fillers: {fillers.get('total_count', 0)} ({fillers.get('percentage', 0):.1f}%)
Top fillers: {', '.join([f[0] for f in fillers.get('top_3', [])[:3]])}
Confidence: {power.get('total_count', 0)} power words, {hedges.get('total_count', 0)} hedges
Weak words: {weak.get('total_count', 0)}
Transitions: {transitions.get('total_count', 0)}
        """
        
        prompt = f"""
Based on this speech analysis, provide structured insights:

{context}

Generate a JSON response with:
{{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_for_improvement": ["area 1", "area 2", "area 3"],
  "recommendations": [
    {{"action": "specific action", "reason": "why it helps", "priority": "high/medium/low"}},
    ...
  ],
  "key_metrics": {{
    "confidence_level": "high/medium/low",
    "vocabulary_richness": "excellent/good/average/poor",
    "clarity": "excellent/good/average/poor"
  }}
}}

Be specific and actionable. Limit to 3-5 items per category.
        """
        
        response = self.gemini_model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )
        
        import re
        cleaned_text = re.sub(r'```(?:json)?\s*|\s*```', '', response.text).strip()
        insights = json.loads(cleaned_text)
        
        return insights
    
    def _print_pipeline_summary(self, results: Dict[str, Any]):
        """Print a summary of the pipeline results"""
        print(f"\n{'='*60}")
        print("PIPELINE COMPLETE - SUMMARY")
        print(f"{'='*60}")
        print(f"Total Processing Time: {results['total_processing_time']:.2f}s")
        print(f"\nScores:")
        print(f"  Vocabulary:  {results['scores']['vocabulary']}/100")
        print(f"  Voice:       {results['scores']['voice']}/100")
        print(f"  Expressions: {results['scores']['expressions']}/100")
        print(f"\nKey Insights:")
        insights = results.get('advanced_insights', {})
        strengths = insights.get('strengths', [])
        if strengths:
            print(f"  Strengths: {len(strengths)}")
            for s in strengths[:2]:
                print(f"    • {s}")
        improvements = insights.get('areas_for_improvement', [])
        if improvements:
            print(f"  Areas for Improvement: {len(improvements)}")
            for i in improvements[:2]:
                print(f"    • {i}")
        print(f"{'='*60}\n")


# ============================================================================
# Standalone Functions for Integration
# ============================================================================

def run_detailed_analysis(
    file_path: str,
    context: str = "",
    title: str = "Untitled Session",
    user_id: str = None,
    verbose: bool = True
) -> Dict[str, Any]:
    """
    Convenience function to run the detailed analysis pipeline
    
    Args:
        file_path: Path to video or audio file
        context: Speech context/purpose
        title: Session title
        user_id: User identifier
        verbose: Print progress messages
        
    Returns:
        Complete analysis results
    """
    pipeline = DetailedAnalysisPipeline()
    return pipeline.analyze_file(file_path, context, title, user_id, verbose)


def analyze_with_custom_model(
    file_path: str,
    context: str = "",
    model_name: str = "gemini-2.5-flash",
    **kwargs
) -> Dict[str, Any]:
    """
    Run analysis with a custom Gemini model
    
    Args:
        file_path: Path to media file
        context: Speech context
        model_name: Gemini model name
        **kwargs: Additional arguments for analyze_file
        
    Returns:
        Analysis results
    """
    pipeline = DetailedAnalysisPipeline(gemini_model_name=model_name)
    return pipeline.analyze_file(file_path, context, **kwargs)
