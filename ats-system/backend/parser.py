import pdfplumber
import docx
import re
from abc import ABC, abstractmethod

# 1. ABSTRACTION (Soyutlama): Temel bir CV Okuyucu şablonu belirliyoruz.
# Her yeni format eklendiğinde (örn. TXTParser), bu şablona uymak ZORUNDADIR.
class BaseCVParser(ABC):
    def __init__(self, file_path):
        self.file_path = file_path
        self._raw_text = ""  # Protected özellik (sadece miras alanlar doğrudan erişir)

    @abstractmethod
    def extract_text(self) -> str:
        """ Alt sınıflar bu metodu kendi formatlarına göre ezmek (override) zorundadır. """
        pass

    def clean_text(self):
        """ Ortak fonksiyon: Tüm formatlar için metin temizliği aynıdır. """
        self._raw_text = re.sub(r'\s+', ' ', self._raw_text).strip()
        return self._raw_text

# 2. INHERITANCE (Kalıtım) & POLYMORPHISM (Çok Biçimlilik)
# PDF ve DOCX sınıfları BaseCVParser'dan türer ama extract_text'i kendilerine has (çok biçimli) kullanırlar.

class PDFParser(BaseCVParser):
    def extract_text(self) -> str:
        text = ""
        try:
            with pdfplumber.open(self.file_path) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as e:
            print(f"PDF parsing error: {e}")
        self._raw_text = text
        return self.clean_text()

class DocxParser(BaseCVParser):
    def extract_text(self) -> str:
        text = ""
        try:
            doc = docx.Document(self.file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"DOCX parsing error: {e}")
        self._raw_text = text
        return self.clean_text()

# 3. ENCAPSULATION (Kapsülleme)
# Verilerin dışarıdan rastgele değiştirilmesini engellemek için gizli (private) değişkenler (__ ile) kullanılır.
class CVCandidate:
    def __init__(self, text: str):
        self.__text = text
        self.__email = None
        self.__phone = None
        # Nesne yaratılır yaratılmaz kapalı fonksiyonla veriler çıkarılır
        self.__extract_contact_info()

    def __extract_contact_info(self):
        """ Dışarıdan doğrudan çağrılamaz, sadece sınıfın içi kullanır. """
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        emails = re.findall(email_pattern, self.__text)
        self.__email = emails[0] if emails else None
        
        phone_pattern = r'(?:\+?90|0)?\s*[5]\d{2}\s*\d{3}\s*\d{2}\s*\d{2}'
        phones = re.findall(phone_pattern, self.__text)
        self.__phone = phones[0] if phones else None

    # Getters: Gizli verilere kontrollü, sadece okuma erişimi sağlanır.
    def get_email(self):
        return self.__email

    def get_phone(self):
        return self.__phone
        
    def get_text(self):
        return self.__text

    def get_formatted_contact(self):
        # Eğer bir numara değiştirip ekrana basacaksak, dışarıya sadece güvenli ve şekillendirilmiş veriyi verir.
        info = []
        if self.__email: info.append(self.__email)
        if self.__phone: info.append(self.__phone)
        return " | ".join(info) if info else "İletişim Bilgisi Bulunamadı"
