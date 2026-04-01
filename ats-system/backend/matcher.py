import re

try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    MODEL_INSTANCE = SentenceTransformer('all-MiniLM-L6-v2')
    IS_SEMANTIC = True
except Exception:
    MODEL_INSTANCE = None
    IS_SEMANTIC = False

# Türkçe için yaygın bağlaçlar
STOP_WORDS = {"ve", "veya", "ile", "için", "bir", "bu", "şu", "o", "gibi", "kadar", "olan", "olarak", "aranan", "deneyimli", "yıl", "ay", "sahip", "tercihen", "görev", "eleman", "uzman", "personel", "iyi", "derecede", "bilen"}

CHARACTER_TRAITS = {
    "liderlik": ["kaptan", "yönetti", "lider", "öncülük", "yönlendirdi", "müdür", "koordine", "şef", "yönetici", "başkan", "kurucu", "vizyon"],
    "takim_calismasi": ["takım", "ekip", "birlikte", "koordineli", "paylaşım", "uyum", "sosyal", "destekleyici", "ortak", "yardımlaşma"],
    "problem_cozme": ["çözüm", "çözdü", "çözme", "iyileştir", "kriz", "giderdi", "optimizasyon", "inovatif", "hata", "alternatif"],
    "iletisim": ["iletişim", "sunum", "müşteri", "ilişki", "ikna", "müzakere", "dışa dönük", "sözlü", "yazılı", "hitabet", "dialog"],
    "analitik": ["analiz", "veri", "rapor", "metrik", "strateji", "planlama", "araştırma", "hesaplama", "istatistik", "sistemli", "ölçüm"]
}

# OOP Class Yapısı: ATS Analyzer
class ATSAnalyzer:
    """ İş ilanını ve adayın CV'sini bir bütün nesne (Object) olarak ele alan değerlendirme sınıfı. """
    
    def __init__(self, job_description: str):
        self.job_description = job_description
        self.job_keywords = self._extract_job_keywords()

    # Encapsulation: Dışarıdan çağrılması gerekmeyen iç temizleme fonksiyonu (_)
    def _extract_job_keywords(self) -> list:
        raw_words = re.findall(r'\b\w{3,}\b', self.job_description.lower())
        return list(set([w for w in raw_words if w not in STOP_WORDS and not w.isdigit()]))

    def analyze_candidate(self, cv_text: str) -> dict:
        if not cv_text:
            return {"score": 0, "cv_skills": [], "job_skills": [], "character": {}}
            
        cv_words = re.findall(r'\b\w{3,}\b', cv_text.lower())
        cv_words_set = set(cv_words)
        
        # Sektörel Uyum Puanı
        keyword_score = 0
        matched_skills = []
        if self.job_keywords:
            matched = set(self.job_keywords).intersection(cv_words_set)
            matched_skills = list(matched)
            keyword_score = int((len(matched) / len(self.job_keywords)) * 100)
            
        # Karakteristik Puan
        character_scores = self.__analyze_character(cv_text)
        
        # Semantic + Uyum
        final_score = self.__calculate_final_score(cv_text, keyword_score, character_scores)
        
        return {
            "score": final_score,
            "keyword_score": keyword_score,
            "cv_skills": matched_skills, 
            "job_skills": self.job_keywords,
            "character": character_scores
        }

    def __analyze_character(self, cv_text: str) -> dict:
        text_lower = cv_text.lower()
        scores = {}
        for trait, keywords in CHARACTER_TRAITS.items():
            found = 0
            for kw in keywords:
                if re.search(r'\b' + kw + r'\w*\b', text_lower):
                    found += 1
            scores[trait] = min(100, found * 25)
        return scores

    def __calculate_final_score(self, cv_text, keyword_score, character_scores):
        avg_char = sum(character_scores.values()) / len(character_scores) if character_scores else 0
        
        if IS_SEMANTIC and MODEL_INSTANCE:
            from sklearn.metrics.pairwise import cosine_similarity
            cv_emb = MODEL_INSTANCE.encode([cv_text])
            job_emb = MODEL_INSTANCE.encode([self.job_description])
            semantic_score = int(cosine_similarity(cv_emb, job_emb)[0][0] * 100)
            semantic_score = max(0, min(100, semantic_score))
            
            if self.job_keywords:
                return int((semantic_score * 0.3) + (keyword_score * 0.4) + (avg_char * 0.3))
            return semantic_score
        else:
            return int((keyword_score * 0.6) + (avg_char * 0.4))

    def generate_ai_summary(self, match_data: dict) -> str:
        score = match_data.get("score", 0)
        character = match_data.get("character", {})
        
        strong_traits = [k.replace('_', ' ').title() for k, v in character.items() if v >= 40]
        
        summary = f"Genel Analiz: Aday iş ilanıyla sektörel bazda %{score} uyumlu. "
        
        if strong_traits:
            summary += f"Karakteristik İzler: CV okumasında adayın ağırlıklı olarak {', '.join(strong_traits)} yönlerinin gelişmiş olduğu saptanmıştır. "
        else:
            summary += "Karakteristik İzler: Adayın CV'si sadece mesleki kelimelerle doldurulmuş gibi duruyor. Takım çalışması, iletişim gibi soft-skill ipuçları zayıf. "
            
        if score >= 70:
            summary += "Sonuç: Mülakata davet edilmesi önerilir."
        elif score >= 45:
            summary += "Sonuç: Karakter ağırlığı dikkate alınarak diğer adaylarla kıyaslanmalıdır."
        else:
            summary += "Sonuç: Uyumluluk çok düşük."
            
        return summary
