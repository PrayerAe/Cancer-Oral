import hashlib
import logging
import mimetypes
import os
import re
import time  # Dipindahkan dari dalam fungsi ke sini
import uuid
from datetime import datetime
from typing import List, Optional, Tuple

# Impor Pustaka Pihak Ketiga
try:
    from PIL import Image
except ImportError:
    print("Peringatan: Pustaka 'Pillow' tidak ditemukan. Fungsi gambar tidak akan bekerja.")
    print("Silakan instal dengan menjalankan: pip install Pillow")
    Image = None

# Konfigurasi Logger
logger = logging.getLogger(__name__)


def generate_secure_filename(original_filename: str, prefix: str = "") -> str:
    """Menghasilkan nama file yang aman menggunakan UUID."""
    # Dapatkan ekstensi file
    _, ext = os.path.splitext(original_filename)

    # Hasilkan nama file berbasis UUID
    unique_id = str(uuid.uuid4())

    # Gabungkan dengan awalan jika ada
    if prefix:
        filename = f"{prefix}_{unique_id}{ext}"
    else:
        filename = f"{unique_id}{ext}"

    return filename


def validate_image_file(file_path: str) -> Tuple[bool, str]:
    """Memvalidasi format dan properti file gambar."""
    if Image is None:
        return False, "Pustaka Pillow tidak terinstal."
        
    try:
        # Periksa apakah file ada
        if not os.path.exists(file_path):
            return False, "File tidak ada"

        # Periksa ukuran file (maksimal 16MB)
        file_size = os.path.getsize(file_path)
        if file_size > 16 * 1024 * 1024:
            return False, "Ukuran file melebihi batas 16MB"

        # Validasi tipe MIME
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type or not mime_type.startswith('image/'):
            return False, "Format gambar tidak valid"

        # Coba buka dengan PIL
        with Image.open(file_path) as img:
            # Periksa dimensi gambar
            width, height = img.size
            if width < 50 or height < 50:
                return False, "Gambar terlalu kecil (minimum 50x50 piksel)"

            if width > 4000 or height > 4000:
                return False, "Gambar terlalu besar (maksimum 4000x4000 piksel)"

            # Periksa apakah gambar rusak
            img.verify()

        return True, "File gambar valid"

    except Exception as e:
        return False, f"Validasi gambar gagal: {str(e)}"


def calculate_file_hash(file_path: str) -> str:
    """Menghitung hash SHA256 dari sebuah file."""
    try:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        logger.error(f"❌ Gagal menghitung hash file: {e}")
        return ""


def sanitize_patient_data(data: dict) -> dict:
    """Membersihkan data pasien untuk keamanan."""
    sanitized = {}

    # Daftar field yang diizinkan
    safe_fields = [
        'patient_name', 'patient_age', 'patient_gender',
        'doctor_name', 'hospital', 'medical_history', 'symptoms'
    ]

    for field in safe_fields:
        if field in data and data[field]:
            value = str(data[field]).strip()
            # Hapus karakter yang berpotensi berbahaya
            value = re.sub(r'[<>"\']', '', value)
            # Batasi panjang
            if field in ['medical_history', 'symptoms']:
                value = value[:500]
            else:
                value = value[:100]
            sanitized[field] = value

    return sanitized


def format_processing_time(seconds: float) -> str:
    """Memformat waktu pemrosesan agar mudah dibaca."""
    if seconds < 1:
        return f"{seconds*1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.2f}s"
    else:
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes}m {remaining_seconds:.1f}s"


def get_file_info(file_path: str) -> dict:
    """Mendapatkan informasi lengkap tentang file."""
    try:
        stat = os.stat(file_path)

        info = {
            "filename": os.path.basename(file_path),
            "size_bytes": stat.st_size,
            "size_mb": round(stat.st_size / (1024 * 1024), 2),
            "modified_time": stat.st_mtime,
            "mime_type": mimetypes.guess_type(file_path)[0]
        }

        # Tambahkan info spesifik gambar jika ini adalah file gambar
        if info["mime_type"] and info["mime_type"].startswith('image/') and Image:
            try:
                with Image.open(file_path) as img:
                    info.update({
                        "width": img.width,
                        "height": img.height,
                        "format": img.format,
                        "mode": img.mode
                    })
            # --- PERBAIKAN DI SINI ---
            # Mengganti 'except:' dengan 'except Exception as e:'
            except Exception as e:
                logger.warning(f"Tidak dapat membaca metadata gambar dari {info['filename']}: {e}")
                pass

        return info

    except Exception as e:
        logger.error(f"❌ Gagal mendapatkan info file: {e}")
        return {}


def create_thumbnail(image_path: str, output_path: str, size: Tuple[int, int] = (150, 150)) -> bool:
    """Membuat thumbnail dari sebuah gambar."""
    if Image is None:
        logger.error("Tidak dapat membuat thumbnail karena Pustaka Pillow tidak terinstal.")
        return False
        
    try:
        with Image.open(image_path) as img:
            # Konversi ke RGB jika perlu (misalnya dari PNG dengan transparansi)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')

            # Buat thumbnail
            img.thumbnail(size, Image.Resampling.LANCZOS)

            # Simpan thumbnail
            img.save(output_path, 'JPEG', quality=85, optimize=True)

        return True

    except Exception as e:
        logger.error(f"❌ Gagal membuat thumbnail: {e}")
        return False


class FileManager:
    """Kelas utilitas untuk manajemen direktori dan file."""

    @staticmethod
    def ensure_directory(directory: str) -> bool:
        """Memastikan sebuah direktori ada, jika tidak maka akan dibuat."""
        try:
            os.makedirs(directory, exist_ok=True)
            return True
        except Exception as e:
            logger.error(f"❌ Gagal membuat direktori {directory}: {e}")
            return False

    @staticmethod
    def clean_old_files(directory: str, max_age_hours: int = 24) -> int:
        """Membersihkan file lama dari sebuah direktori."""
        try:
            current_time = time.time()
            cutoff_time = current_time - (max_age_hours * 3600)
            cleaned_count = 0

            for filename in os.listdir(directory):
                file_path = os.path.join(directory, filename)
                if os.path.isfile(file_path):
                    file_mtime = os.path.getmtime(file_path)
                    if file_mtime < cutoff_time:
                        os.remove(file_path)
                        cleaned_count += 1
            
            if cleaned_count > 0:
                logger.info(f"Membersihkan {cleaned_count} file lama dari direktori {directory}.")
            return cleaned_count

        except Exception as e:
            logger.error(f"❌ Gagal membersihkan file lama: {e}")
            return 0

    @staticmethod
    def get_directory_size(directory: str) -> int:
        """Mendapatkan total ukuran sebuah direktori dalam byte."""
        try:
            total_size = 0
            for dirpath, dirnames, filenames in os.walk(directory):
                for filename in filenames:
                    file_path = os.path.join(dirpath, filename)
                    if os.path.exists(file_path):
                        total_size += os.path.getsize(file_path)
            return total_size
        except Exception as e:
            logger.error(f"❌ Gagal menghitung ukuran direktori: {e}")
            return 0


def validate_api_request(request_data: dict) -> Tuple[bool, str]:
    """Memvalidasi data request API."""
    required_fields = ['file']

    for field in required_fields:
        if field not in request_data:
            return False, f"Field wajib tidak ditemukan: {field}"

    # Validasi tambahan bisa ditambahkan di sini
    return True, "Request valid"


def log_analysis_event(event_type: str, request_id: str, details: dict = None):
    """Mencatat (log) event analisis untuk pemantauan."""
    log_entry = {
        "timestamp": str(datetime.now()),
        "event_type": event_type,
        "request_id": request_id,
        "details": details or {}
    }

    logger.info(f"📊 Event Analisis: {event_type} [ID: {request_id[:8]}] - Rincian: {log_entry['details']}")