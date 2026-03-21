import os
from typing import Dict


# NOTE: Vocabulary evaluation via Gemini is now handled by the combined prompt
# in app.py (generate_combined_report).  This module only provides the local
# helper that extracts structured insights from linguistic analysis data.


def generate_vocabulary_insights_json(linguistic_analysis):
    """
    Generate structured JSON insights from linguistic analysis
    
    Args:
        linguistic_analysis: The linguistic analysis data
        
    Returns:
        Dictionary with structured insights
    """
    if not linguistic_analysis:
        return {}
    
    vocab = linguistic_analysis.get('vocabulary', {})
    fillers = linguistic_analysis.get('filler_words', {})
    hedges = linguistic_analysis.get('hedge_words', {})
    power = linguistic_analysis.get('power_words', {})
    
    # Calculate confidence ratio
    hedge_count = hedges.get('total_count', 0)
    power_count = power.get('total_count', 0)
    
    if hedge_count + power_count > 0:
        confidence_ratio = power_count / (hedge_count + power_count)
    else:
        confidence_ratio = 0.5
    
    return {
        'lexical_diversity': vocab.get('lexical_diversity', 0),
        'filler_percentage': fillers.get('percentage', 0),
        'confidence_ratio': round(confidence_ratio, 2),
        'total_words': vocab.get('total_words', 0),
        'unique_words': vocab.get('unique_words', 0),
        'top_fillers': [f[0] for f in fillers.get('top_3', [])],
        'power_word_count': power_count,
        'hedge_word_count': hedge_count
    }