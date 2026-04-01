from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
import os
import tempfile
from parser import PDFParser, DocxParser, CVCandidate
from matcher import ATSAnalyzer
from database import get_db, AssessmentRecord

router = APIRouter()

@router.post("/analyze-cv")
async def analyze_cv(
    cv: UploadFile = File(...),
    jobDescription: str = Form(...),
    db: Session = Depends(get_db)  # Veritabanı Oturumu (Dependency Injection)
):
    if not cv.filename:
        raise HTTPException(status_code=400, detail="CV dosyası yüklenmedi.")
        
    ext = cv.filename.split('.')[-1].lower()
    if ext not in ['pdf', 'doc', 'docx']:
        raise HTTPException(status_code=400, detail="Desteklenmeyen dosya.")
        
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, cv.filename)
    
    with open(temp_path, "wb") as buffer:
        buffer.write(await cv.read())
        
    try:
        # OOP - Çok Biçimlilik (Polymorphism):
        # Programın if-else bloklarıyla uğraşması yerine Abstract (Soyut) Base Sınıf kullanıyoruz.
        if ext == 'pdf':
            parser = PDFParser(temp_path)
        else:
            parser = DocxParser(temp_path)
            
        # extract_text her iki sınıf için farklıdır ancak çağrılış şekli aynıdır.
        raw_text = parser.extract_text()
        
        # OOP - Kapsülleme (Encapsulation): Gizli özellikleri barındıran nesne üretimi
        candidate = CVCandidate(raw_text)
        
        # OOP - Sınıf Mantığı (Class Object): Analyzer objesi yaratılıyor
        analyzer = ATSAnalyzer(jobDescription)
        
        # Sadece getter fonksiyonları üzerinden kapalı dataya (raw text) ulaşılır
        match_data = analyzer.analyze_candidate(candidate.get_text())
        ai_summary = analyzer.generate_ai_summary(match_data)
        
        contact_str = candidate.get_formatted_contact()
        
        # Adı formatla
        candidate_name = cv.filename.split('.')[0].replace('_', ' ').title()
        score = match_data.get("score", 0)
        
        # --- VERİTABANI (DATABASE) KAYIT İŞLEMİ ---
        new_record = AssessmentRecord(
            candidate_name=candidate_name,
            contact_info=contact_str,
            job_target="Detay Gizli",
            final_score=score,
            ai_summary=ai_summary
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        
        char = match_data.get("character", {})
        
        return {
            "candidate_name": candidate_name,
            "contact": contact_str,
            "score": score,
            "skills_count": len(match_data.get("cv_skills", [])),
            "experience": "Karakter Analizi", 
            "ai_summary": ai_summary + f" (DB Kayıt: ID #{new_record.id})",
            "chartData": [
                match_data.get("keyword_score", 0),  
                char.get("iletisim", 15),
                char.get("liderlik", 15),
                char.get("takim_calismasi", 15),
                char.get("problem_cozme", 15)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sunucu hatası: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            try: os.remove(temp_path)
            except: pass
