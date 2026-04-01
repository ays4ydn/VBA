import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Text
from sqlalchemy.orm import declarative_base, sessionmaker

# Veritabanı nerede çalışıyor? -> Proje klasöründe yerel (Local) bir dosya olarak (ats_database.db)
DB_PATH = os.path.join(os.path.dirname(__file__), "ats_database.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# SQLAlchemy Engine (Veritabanı Motoru)
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Oturum Yöneticisi
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Temel Sınıf (Base Class)
Base = declarative_base()

# Veri Modeli (Tablo)
class AssessmentRecord(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String, index=True)
    contact_info = Column(String)
    job_target = Column(String)
    final_score = Column(Integer)
    ai_summary = Column(Text)

def init_db():
    """ Veritabanı tablolarını oluşturur """
    Base.metadata.create_all(bind=engine)

def get_db():
    """ Her işlem için geçici bir DB oturumu açar """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
