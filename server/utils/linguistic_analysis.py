"""
Linguistic Analysis Module for Speech Evaluation
Provides detailed analysis of transcription including filler words, speech patterns,
vocabulary richness, and linguistic features.

Requirements:
    pip install spacy
    python -m spacy download en_core_web_sm
"""

import re
from collections import Counter
from typing import Dict, List, Tuple, Any
import numpy as np

# Models are loaded lazily through model_manager (no eager init here)
from model_manager import model_manager


def _nlp(text):
    """Convenience wrapper: get spaCy nlp from model_manager and call it."""
    return model_manager.get_spacy_nlp()(text)

# ============================================================================
# WORD LISTS AND PATTERNS
# ============================================================================

FILLER_WORDS = [
    'um', 'uh', 'er', 'ah', 'hmm', 'mhm', 'uh-huh', 'mm-hmm',
    'like', 'you know', 'i mean', 'sort of', 'kind of', 'type of',
    'actually', 'basically', 'literally', 'seriously', 'honestly',
    'right', 'okay', 'so', 'well', 'anyway', 'anyhow',
    'just', 'really', 'very', 'pretty much', 'more or less',
    'i guess', 'i think', 'i suppose', 'i believe',
    'stuff', 'things', 'whatever', 'somehow', 'somewhat',
    'at the end of the day', 'to be honest', 'if you will',
    'as it were', 'so to speak', 'you see', 'you know what i mean'
]

HEDGE_WORDS = [
    # Uncertainty markers
    'maybe', 'perhaps', 'possibly', 'probably', 'presumably',
    'apparently', 'seemingly', 'allegedly', 'supposedly',
    # Modal verbs indicating uncertainty
    'might', 'may', 'could', 'would', 'should',
    # Qualifiers
    'somewhat', 'fairly', 'rather', 'quite', 'relatively',
    'comparatively', 'reasonably', 'moderately', 'partially',
    # Approximations
    'about', 'around', 'approximately', 'roughly', 'nearly',
    'almost', 'close to', 'more or less', 'or so',
    # Tentative phrases
    'i think', 'i believe', 'i feel', 'i guess', 'i suppose',
    'it seems', 'it appears', 'it looks like', 'tends to',
    # Softeners
    'a bit', 'a little', 'slightly', 'kind of', 'sort of',
    'in a way', 'to some extent', 'in some sense',
    # Disclaimers
    'arguably', 'debatable', 'questionable', 'uncertain',
    'unclear', 'ambiguous', 'vague'
]

POWER_WORDS = {
    'achievement': ['achieve', 'accomplish', 'attain', 'succeed', 'triumph', 
                    'victory', 'win', 'conquer', 'master', 'excel'],
    'proof': ['proven', 'evidence', 'demonstrate', 'verify', 'validate',
              'confirm', 'establish', 'substantiate', 'certify', 'guarantee'],
    'results': ['results', 'outcomes', 'impact', 'effect', 'consequence',
                'breakthrough', 'milestone', 'progress', 'advancement'],
    'transformation': ['transform', 'revolutionize', 'innovate', 'disrupt',
                       'breakthrough', 'game-changing', 'paradigm shift',
                       'reimagine', 'reinvent', 'evolve'],
    'importance': ['critical', 'crucial', 'vital', 'essential', 'imperative',
                   'paramount', 'fundamental', 'key', 'pivotal', 'significant',
                   'important', 'necessary', 'indispensable'],
    'quality': ['excellent', 'outstanding', 'exceptional', 'superior',
                'premium', 'elite', 'world-class', 'best-in-class',
                'top-tier', 'cutting-edge', 'state-of-the-art'],
    'action': ['drive', 'propel', 'accelerate', 'boost', 'amplify',
               'maximize', 'optimize', 'enhance', 'strengthen', 'empower',
               'enable', 'facilitate', 'catalyze', 'ignite', 'spark'],
    'trust': ['reliable', 'trustworthy', 'dependable', 'authentic',
              'genuine', 'credible', 'legitimate', 'reputable', 'proven',
              'tested', 'verified', 'certified'],
    'exclusivity': ['exclusive', 'unique', 'distinctive', 'rare',
                    'unprecedented', 'unparalleled', 'unmatched',
                    'incomparable', 'one-of-a-kind', 'extraordinary'],
    'simplicity': ['simple', 'easy', 'effortless', 'straightforward',
                   'seamless', 'smooth', 'streamlined', 'intuitive',
                   'user-friendly', 'hassle-free'],
    'value': ['valuable', 'beneficial', 'advantageous', 'profitable',
              'worthwhile', 'rewarding', 'lucrative', 'cost-effective'],
    'innovation': ['innovative', 'advanced', 'modern', 'contemporary',
                   'next-generation', 'futuristic', 'pioneering',
                   'groundbreaking', 'novel', 'fresh'],
    'confidence': ['confident', 'certain', 'definite', 'absolute',
                   'undeniable', 'indisputable', 'unquestionable',
                   'conclusive', 'decisive', 'determined']
}

WEAK_WORDS = [
    # Vague quantifiers
    'some', 'many', 'few', 'several', 'various', 'numerous',
    'a lot', 'lots of', 'plenty of', 'a bunch of',
    # Weak verbs
    'try', 'attempt', 'hope', 'wish', 'want', 'need',
    'seems', 'appears', 'looks like', 'feels like',
    # Overused adjectives
    'good', 'bad', 'nice', 'fine', 'okay', 'alright',
    'big', 'small', 'great', 'amazing', 'awesome',
    # Intensifiers that weaken
    'very', 'really', 'quite', 'pretty', 'rather',
    'extremely', 'incredibly', 'absolutely', 'totally',
    'completely', 'utterly', 'highly'
]

CONFIDENT_PHRASES = [
    'i am confident', 'i am certain', 'without a doubt',
    'it is clear that', 'the evidence shows', 'research demonstrates',
    'studies prove', 'data indicates', 'we know that',
    'the fact is', 'undoubtedly', 'unquestionably',
    'definitively', 'conclusively', 'empirically'
]

TRANSITION_WORDS = {
    'addition': ['furthermore', 'moreover', 'additionally', 'also', 'besides',
                 'in addition', 'as well as', 'not only', 'coupled with'],
    'contrast': ['however', 'nevertheless', 'nonetheless', 'conversely',
                 'on the other hand', 'in contrast', 'whereas', 'while',
                 'although', 'despite', 'yet', 'but'],
    'cause_effect': ['therefore', 'thus', 'consequently', 'as a result',
                     'hence', 'accordingly', 'for this reason', 'because',
                     'since', 'due to', 'leads to', 'results in'],
    'example': ['for example', 'for instance', 'specifically', 'namely',
                'such as', 'including', 'to illustrate', 'in particular'],
    'sequence': ['first', 'second', 'third', 'next', 'then', 'finally',
                 'subsequently', 'previously', 'simultaneously', 'meanwhile'],
    'emphasis': ['indeed', 'in fact', 'certainly', 'obviously', 'clearly',
                 'undoubtedly', 'without question', 'above all', 'most importantly'],
    'summary': ['in conclusion', 'to summarize', 'in summary', 'overall',
                'in brief', 'to sum up', 'ultimately', 'in essence']
}

JARGON_INDICATORS = [
    # Business jargon
    'synergy', 'leverage', 'paradigm', 'bandwidth', 'circle back',
    'touch base', 'low-hanging fruit', 'move the needle', 'deep dive',
    'drill down', 'take offline', 'ping', 'loop in', 'reach out',
    # Tech jargon
    'disruptive', 'scalable', 'agile', 'ecosystem', 'platform',
    'solution', 'architecture', 'framework', 'infrastructure',
    # Corporate speak
    'actionable', 'deliverable', 'stakeholder', 'value-add',
    'best practice', 'core competency', 'going forward', 'at scale'
]

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def count_pattern_occurrences(text: str, patterns: List[str]) -> Dict[str, int]:
    """
    Count occurrences of patterns in text (case-insensitive, word boundaries)
    
    Args:
        text: Input text to search
        patterns: List of patterns to find
        
    Returns:
        Dictionary mapping pattern to count
    """
    text_lower = text.lower()
    counts = {}
    
    for pattern in patterns:
        # Sort by length (longest first) to match multi-word phrases first
        pattern_lower = pattern.lower()
        # Use word boundaries for single words, flexible matching for phrases
        if ' ' in pattern_lower:
            count = len(re.findall(re.escape(pattern_lower), text_lower))
        else:
            count = len(re.findall(r'\b' + re.escape(pattern_lower) + r'\b', text_lower))
        
        if count > 0:
            counts[pattern] = count
    
    return counts


def get_sentences(text: str) -> List[str]:
    """
    Split text into sentences using spaCy
    
    Args:
        text: Input text
        
    Returns:
        List of sentences
    """
    doc = _nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents]
    return sentences


def get_words(text: str) -> List[str]:
    """
    Extract words from text (alphabetic only) using spaCy
    
    Args:
        text: Input text
        
    Returns:
        List of words
    """
    doc = _nlp(text)
    words = [token.text for token in doc if token.is_alpha]
    return words


def get_lemmatized_words(text: str) -> List[str]:
    """
    Extract lemmatized words (base forms) from text
    
    Args:
        text: Input text
        
    Returns:
        List of lemmatized words
    """
    doc = _nlp(text)
    lemmas = [token.lemma_.lower() for token in doc if token.is_alpha and not token.is_stop]
    return lemmas


def calculate_lexical_diversity(words: List[str]) -> float:
    """
    Calculate lexical diversity (Type-Token Ratio)
    
    Args:
        words: List of words
        
    Returns:
        Lexical diversity score (0-1)
    """
    if not words:
        return 0.0
    
    unique_words = set(w.lower() for w in words)
    return len(unique_words) / len(words)


def detect_passive_voice(text: str) -> Dict[str, Any]:
    """
    Detect passive voice constructions using spaCy dependency parsing
    
    Args:
        text: Input text
        
    Returns:
        Dictionary with passive voice count and examples
    """
    doc = _nlp(text)
    passive_sentences = []
    
    for sent in doc.sents:
        for token in sent:
            # Check for passive voice: auxiliary verb + past participle
            if token.dep_ == "nsubjpass" or token.dep_ == "csubjpass":
                passive_sentences.append(sent.text.strip())
                break
            # Alternative check: look for "auxpass" dependency
            if token.dep_ == "auxpass":
                passive_sentences.append(sent.text.strip())
                break
    
    return {
        'count': len(passive_sentences),
        'examples': passive_sentences[:3]  # Return up to 3 examples
    }


def get_word_length_stats(words: List[str]) -> Dict[str, float]:
    """
    Calculate word length statistics
    
    Args:
        words: List of words
        
    Returns:
        Dictionary with length statistics
    """
    if not words:
        return {'avg': 0, 'min': 0, 'max': 0, 'median': 0}
    
    lengths = [len(w) for w in words]
    return {
        'avg': np.mean(lengths),
        'min': min(lengths),
        'max': max(lengths),
        'median': np.median(lengths)
    }


def get_sentence_length_stats(sentences: List[str]) -> Dict[str, float]:
    """
    Calculate sentence length statistics (in words)
    
    Args:
        sentences: List of sentences
        
    Returns:
        Dictionary with length statistics
    """
    if not sentences:
        return {'avg': 0, 'min': 0, 'max': 0, 'median': 0}
    
    lengths = [len(get_words(s)) for s in sentences]
    return {
        'avg': np.mean(lengths),
        'min': min(lengths),
        'max': max(lengths),
        'median': np.median(lengths)
    }


# ============================================================================
# MAIN ANALYSIS FUNCTIONS
# ============================================================================

def analyze_filler_words(text: str) -> Dict[str, Any]:
    """
    Analyze filler word usage
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with filler word analysis
    """
    filler_counts = count_pattern_occurrences(text, FILLER_WORDS)
    total_fillers = sum(filler_counts.values())
    total_words = len(get_words(text))
    
    # Calculate filler word percentage
    filler_percentage = (total_fillers / total_words * 100) if total_words > 0 else 0
    
    # Sort by frequency
    sorted_fillers = dict(sorted(filler_counts.items(), key=lambda x: x[1], reverse=True))
    
    return {
        'total_count': total_fillers,
        'percentage': round(filler_percentage, 2),
        'breakdown': sorted_fillers,
        'top_3': list(sorted_fillers.items())[:3] if sorted_fillers else []
    }


def analyze_hedge_words(text: str) -> Dict[str, Any]:
    """
    Analyze hedge word usage (uncertainty markers)
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with hedge word analysis
    """
    hedge_counts = count_pattern_occurrences(text, HEDGE_WORDS)
    total_hedges = sum(hedge_counts.values())
    total_words = len(get_words(text))
    
    hedge_percentage = (total_hedges / total_words * 100) if total_words > 0 else 0
    
    sorted_hedges = dict(sorted(hedge_counts.items(), key=lambda x: x[1], reverse=True))
    
    return {
        'total_count': total_hedges,
        'percentage': round(hedge_percentage, 2),
        'breakdown': sorted_hedges,
        'top_3': list(sorted_hedges.items())[:3] if sorted_hedges else []
    }


def analyze_power_words(text: str) -> Dict[str, Any]:
    """
    Analyze power word usage (impactful, confident words)
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with power word analysis
    """
    all_power_words = []
    for category_words in POWER_WORDS.values():
        all_power_words.extend(category_words)
    
    power_counts = count_pattern_occurrences(text, all_power_words)
    total_power = sum(power_counts.values())
    total_words = len(get_words(text))
    
    power_percentage = (total_power / total_words * 100) if total_words > 0 else 0
    
    # Categorize power words
    category_counts = {}
    for category, words in POWER_WORDS.items():
        category_count = sum(power_counts.get(word, 0) for word in words)
        if category_count > 0:
            category_counts[category] = category_count
    
    sorted_power = dict(sorted(power_counts.items(), key=lambda x: x[1], reverse=True))
    
    return {
        'total_count': total_power,
        'percentage': round(power_percentage, 2),
        'breakdown': sorted_power,
        'by_category': category_counts,
        'top_5': list(sorted_power.items())[:5] if sorted_power else []
    }


def analyze_weak_words(text: str) -> Dict[str, Any]:
    """
    Analyze weak word usage
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with weak word analysis
    """
    weak_counts = count_pattern_occurrences(text, WEAK_WORDS)
    total_weak = sum(weak_counts.values())
    total_words = len(get_words(text))
    
    weak_percentage = (total_weak / total_words * 100) if total_words > 0 else 0
    
    sorted_weak = dict(sorted(weak_counts.items(), key=lambda x: x[1], reverse=True))
    
    return {
        'total_count': total_weak,
        'percentage': round(weak_percentage, 2),
        'breakdown': sorted_weak,
        'top_5': list(sorted_weak.items())[:5] if sorted_weak else []
    }


def analyze_transitions(text: str) -> Dict[str, Any]:
    """
    Analyze transition word usage
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with transition word analysis
    """
    category_counts = {}
    all_transitions = {}
    
    for category, words in TRANSITION_WORDS.items():
        counts = count_pattern_occurrences(text, words)
        category_total = sum(counts.values())
        if category_total > 0:
            category_counts[category] = category_total
            all_transitions.update(counts)
    
    total_transitions = sum(all_transitions.values())
    
    return {
        'total_count': total_transitions,
        'by_category': category_counts,
        'breakdown': all_transitions
    }


def analyze_confident_phrases(text: str) -> Dict[str, Any]:
    """
    Analyze confident phrase usage
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with confident phrase analysis
    """
    confident_counts = count_pattern_occurrences(text, CONFIDENT_PHRASES)
    total_confident = sum(confident_counts.values())
    
    return {
        'total_count': total_confident,
        'breakdown': confident_counts
    }


def analyze_jargon(text: str) -> Dict[str, Any]:
    """
    Analyze jargon usage
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with jargon analysis
    """
    jargon_counts = count_pattern_occurrences(text, JARGON_INDICATORS)
    total_jargon = sum(jargon_counts.values())
    
    return {
        'total_count': total_jargon,
        'breakdown': jargon_counts
    }


def detect_repetitive_sentence_starts(text: str) -> Dict[str, int]:
    """
    Detect if sentences start with the same words repeatedly using spaCy
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary of repetitive starts and their counts
    """
    doc = _nlp(text)
    sentences = list(doc.sents)
    
    if len(sentences) < 3:
        return {}
    
    # Get first 1-2 words of each sentence
    sentence_starts = []
    for sent in sentences:
        tokens = [token for token in sent if token.is_alpha]
        if tokens:
            # Check both single word and two-word starts
            sentence_starts.append(tokens[0].text.lower())
            if len(tokens) > 1:
                sentence_starts.append(f"{tokens[0].text.lower()} {tokens[1].text.lower()}")
    
    # Count occurrences
    start_counts = Counter(sentence_starts)
    
    # Filter to only repetitive (appears 3+ times)
    repetitive = {start: count for start, count in start_counts.items() if count >= 3}
    
    return repetitive


def analyze_pos_distribution(text: str) -> Dict[str, Any]:
    """
    Analyze part-of-speech distribution using spaCy
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with POS metrics
    """
    doc = _nlp(text)
    
    pos_counts = Counter([token.pos_ for token in doc if token.is_alpha])
    total_pos = sum(pos_counts.values())
    
    # Calculate percentages
    pos_percentages = {pos: round((count / total_pos * 100), 2) 
                       for pos, count in pos_counts.items()} if total_pos > 0 else {}
    
    # Detailed POS breakdown
    pos_details = {
        'nouns': pos_counts.get('NOUN', 0) + pos_counts.get('PROPN', 0),
        'verbs': pos_counts.get('VERB', 0),
        'adjectives': pos_counts.get('ADJ', 0),
        'adverbs': pos_counts.get('ADV', 0),
        'pronouns': pos_counts.get('PRON', 0)
    }
    
    return {
        'distribution': dict(pos_counts),
        'percentages': pos_percentages,
        'details': pos_details
    }


def extract_named_entities(text: str) -> Dict[str, Any]:
    """
    Extract named entities using spaCy NER
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with entity information
    """
    doc = _nlp(text)
    
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    entity_counts = Counter([ent.label_ for ent in doc.ents])
    
    # Group entities by type
    entities_by_type = {}
    for ent in doc.ents:
        if ent.label_ not in entities_by_type:
            entities_by_type[ent.label_] = []
        entities_by_type[ent.label_].append(ent.text)
    
    return {
        'total_entities': len(entities),
        'entity_types': dict(entity_counts),
        'entities_by_type': entities_by_type,
        'all_entities': entities[:20]  # Limit to first 20
    }


def analyze_vocabulary_richness(text: str) -> Dict[str, Any]:
    """
    Analyze vocabulary richness and diversity using spaCy
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with vocabulary metrics
    """
    doc = _nlp(text)
    
    # Get all words (tokens that are alphabetic)
    words = [token.text for token in doc if token.is_alpha]
    words_lower = [w.lower() for w in words]
    
    # Get lemmatized words (excluding stop words)
    lemmas = [token.lemma_.lower() for token in doc if token.is_alpha and not token.is_stop]
    
    if not words:
        return {
            'total_words': 0,
            'unique_words': 0,
            'unique_lemmas': 0,
            'lexical_diversity': 0,
            'lexical_diversity_lemma': 0,
            'word_length_stats': {},
            'most_common_words': [],
            'most_common_lemmas': []
        }
    
    unique_words = set(words_lower)
    unique_lemmas = set(lemmas)
    
    # Count words (excluding stop words)
    content_words = [token.text.lower() for token in doc if token.is_alpha and not token.is_stop]
    word_counts = Counter(content_words)
    most_common_words = word_counts.most_common(10)
    
    # Count lemmas
    lemma_counts = Counter(lemmas)
    most_common_lemmas = lemma_counts.most_common(10)
    
    return {
        'total_words': len(words),
        'unique_words': len(unique_words),
        'unique_lemmas': len(unique_lemmas),
        'lexical_diversity': round(calculate_lexical_diversity(words), 3),
        'lexical_diversity_lemma': round(len(unique_lemmas) / len(lemmas), 3) if lemmas else 0,
        'word_length_stats': {k: round(v, 2) for k, v in get_word_length_stats(words).items()},
        'most_common_words': most_common_words,
        'most_common_lemmas': most_common_lemmas
    }


def analyze_sentence_structure(text: str) -> Dict[str, Any]:
    """
    Analyze sentence structure and complexity using spaCy
    
    Args:
        text: Transcription text
        
    Returns:
        Dictionary with sentence metrics
    """
    doc = _nlp(text)
    sentences = list(doc.sents)
    
    if not sentences:
        return {
            'total_sentences': 0,
            'sentence_length_stats': {},
            'questions': 0,
            'exclamations': 0,
            'passive_voice': {},
            'avg_dependency_depth': 0
        }
    
    # Count questions and exclamations
    questions = text.count('?')
    exclamations = text.count('!')
    
    # Detect passive voice with examples
    passive_info = detect_passive_voice(text)
    
    # Calculate average dependency tree depth (complexity measure)
    depths = []
    for sent in sentences:
        for token in sent:
            depth = 0
            current = token
            while current.head != current:
                depth += 1
                current = current.head
            depths.append(depth)
    
    avg_depth = np.mean(depths) if depths else 0
    
    # Get sentence length stats
    sentence_texts = [sent.text for sent in sentences]
    
    return {
        'total_sentences': len(sentences),
        'sentence_length_stats': {k: round(v, 2) for k, v in get_sentence_length_stats(sentence_texts).items()},
        'questions': questions,
        'exclamations': exclamations,
        'passive_voice': passive_info,
        'avg_dependency_depth': round(avg_depth, 2),
        'repetitive_starts': detect_repetitive_sentence_starts(text)
    }


def get_speech_segments_with_timestamps(transcription: str, vocal_emotions: List[Dict]) -> List[Dict]:
    """
    Align transcription with emotion timestamps for detailed feedback
    
    Args:
        transcription: Full transcription text
        vocal_emotions: List of emotion chunks with timestamps
        
    Returns:
        List of segments with text and emotion
    """
    if not vocal_emotions or not transcription:
        return []
    
    words = transcription.split()
    total_duration = vocal_emotions[-1]['end_time'] if vocal_emotions else 0
    
    if total_duration == 0:
        return []
    
    words_per_second = len(words) / total_duration
    
    segments = []
    for emotion_chunk in vocal_emotions:
        start_word_idx = int(emotion_chunk['start_time'] * words_per_second)
        end_word_idx = int(emotion_chunk['end_time'] * words_per_second)
        
        # Ensure indices are within bounds
        start_word_idx = max(0, min(start_word_idx, len(words)))
        end_word_idx = max(0, min(end_word_idx, len(words)))
        
        segment_text = ' '.join(words[start_word_idx:end_word_idx])
        
        segments.append({
            "start_time": emotion_chunk['start_time'],
            "end_time": emotion_chunk['end_time'],
            "text": segment_text,
            "emotion": emotion_chunk['emotion'],
            "chunk": emotion_chunk.get('chunk', 0)
        })
    
    return segments


def analyze_transcript_complete(transcription: str, vocal_emotions: List[Dict] = None) -> Dict[str, Any]:
    """
    Perform complete linguistic analysis on transcription using spaCy
    
    Args:
        transcription: Full transcription text
        vocal_emotions: Optional list of emotion chunks with timestamps
        
    Returns:
        Comprehensive dictionary with all linguistic metrics
    """
    if not transcription or not transcription.strip():
        return {
            'error': 'Empty transcription provided',
            'vocabulary': {},
            'sentence_structure': {},
            'filler_words': {},
            'hedge_words': {},
            'power_words': {},
            'weak_words': {},
            'transitions': {},
            'confident_phrases': {},
            'jargon': {},
            'pos_distribution': {},
            'named_entities': {},
            'segments': []
        }
    
    print("Running complete linguistic analysis...")
    
    analysis = {
        'vocabulary': analyze_vocabulary_richness(transcription),
        'sentence_structure': analyze_sentence_structure(transcription),
        'filler_words': analyze_filler_words(transcription),
        'hedge_words': analyze_hedge_words(transcription),
        'power_words': analyze_power_words(transcription),
        'weak_words': analyze_weak_words(transcription),
        'transitions': analyze_transitions(transcription),
        'confident_phrases': analyze_confident_phrases(transcription),
        'jargon': analyze_jargon(transcription),
        'pos_distribution': analyze_pos_distribution(transcription),
        'named_entities': extract_named_entities(transcription)
    }
    
    # Add segments if vocal emotions provided
    if vocal_emotions:
        analysis['segments'] = get_speech_segments_with_timestamps(transcription, vocal_emotions)
    
    print("Linguistic analysis complete.")
    return analysis


def generate_linguistic_summary(analysis: Dict[str, Any]) -> Dict[str, str]:
    """
    Generate human-readable summary from linguistic analysis
    
    Args:
        analysis: Output from analyze_transcript_complete
        
    Returns:
        Dictionary with summary insights
    """
    summary = {}
    
    # Vocabulary summary
    vocab = analysis.get('vocabulary', {})
    if vocab:
        lexical_div = vocab.get('lexical_diversity_lemma', vocab.get('lexical_diversity', 0))
        if lexical_div > 0.7:
            summary['vocabulary'] = "Excellent vocabulary diversity with varied word choice."
        elif lexical_div > 0.5:
            summary['vocabulary'] = "Good vocabulary diversity, but could use more variety."
        else:
            summary['vocabulary'] = "Limited vocabulary diversity. Try using more varied words."
    
    # Filler words summary
    fillers = analysis.get('filler_words', {})
    if fillers:
        filler_pct = fillers.get('percentage', 0)
        if filler_pct < 2:
            summary['fillers'] = "Minimal filler word usage - excellent!"
        elif filler_pct < 5:
            summary['fillers'] = "Moderate filler word usage. Try to reduce further."
        else:
            top_fillers = fillers.get('top_3', [])
            top_filler_str = ", ".join([f"'{f[0]}'" for f in top_fillers[:2]]) if top_fillers else "filler words"
            summary['fillers'] = f"High filler word usage ({filler_pct:.1f}%). Reduce {top_filler_str}."
    
    # Confidence summary
    hedges = analysis.get('hedge_words', {})
    power = analysis.get('power_words', {})
    if hedges and power:
        hedge_count = hedges.get('total_count', 0)
        power_count = power.get('total_count', 0)
        
        if power_count > hedge_count * 2:
            summary['confidence'] = "Strong, confident language throughout."
        elif power_count > hedge_count:
            summary['confidence'] = "Generally confident, but some uncertainty markers present."
        else:
            summary['confidence'] = "Language shows uncertainty. Use more assertive words."
    
    # Sentence structure summary
    structure = analysis.get('sentence_structure', {})
    if structure:
        avg_length = structure.get('sentence_length_stats', {}).get('avg', 0)
        passive = structure.get('passive_voice', {}).get('count', 0)
        
        if 15 <= avg_length <= 25:
            summary['structure'] = "Well-balanced sentence length for clarity."
        elif avg_length < 15:
            summary['structure'] = "Sentences are quite short. Consider varying length."
        else:
            summary['structure'] = "Sentences are long. Break them up for better clarity."
        
        if passive > 3:
            summary['passive_voice'] = f"Found {passive} passive voice constructions. Use active voice for impact."
    
    # POS distribution summary
    pos = analysis.get('pos_distribution', {})
    if pos:
        details = pos.get('details', {})
        verbs = details.get('verbs', 0)
        adjectives = details.get('adjectives', 0)
        
        if verbs > adjectives * 2:
            summary['pos'] = "Good use of action verbs. Speech is dynamic."
        elif adjectives > verbs:
            summary['pos'] = "Heavy on adjectives. Add more action verbs."
    
    # Named entities summary
    entities = analysis.get('named_entities', {})
    if entities:
        total = entities.get('total_entities', 0)
        if total > 5:
            summary['entities'] = f"Good use of specific references ({total} entities mentioned)."
    
    return summary


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    # Test the module
    sample_text = """
    Um, so today I want to talk about, you know, the importance of public speaking.
    I think it's really, really important. Maybe we should, like, practice more.
    Public speaking can transform your career. It's a critical skill that everyone needs.
    However, many people feel nervous. Therefore, we must practice regularly.
    """
    
    result = analyze_transcript_complete(sample_text)
    print("Linguistic Analysis Results:")
    print(f"Total words: {result['vocabulary']['total_words']}")
    print(f"Filler words: {result['filler_words']['total_count']} ({result['filler_words']['percentage']}%)")
    print(f"Power words: {result['power_words']['total_count']}")
    print(f"Hedge words: {result['hedge_words']['total_count']}")
    
    summary = generate_linguistic_summary(result)
    print("\nSummary:")
    for key, value in summary.items():
        print(f"  {key}: {value}")
