/**
 * Validation utilities for forms and inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'File harus berupa gambar (JPEG, PNG, GIF, dll.)'
    };
  }

  // Check file size (16MB limit)
  const maxSize = 16 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Ukuran file terlalu besar. Maksimal 16MB.'
    };
  }

  // Check minimum size (1KB)
  if (file.size < 1024) {
    return {
      isValid: false,
      error: 'File terlalu kecil. Minimal 1KB.'
    };
  }

  return { isValid: true };
}

export function validatePatientName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: true }; // Optional field
  }

  if (name.length > 100) {
    return {
      isValid: false,
      error: 'Nama terlalu panjang (maksimal 100 karakter)'
    };
  }

  // Check for potentially dangerous characters
  const dangerousChars = /[<>'"&]/;
  if (dangerousChars.test(name)) {
    return {
      isValid: false,
      error: 'Nama mengandung karakter yang tidak diizinkan'
    };
  }

  return { isValid: true };
}

export function validateAge(age: string): ValidationResult {
  if (!age || age.trim().length === 0) {
    return { isValid: true }; // Optional field
  }

  const ageNum = parseInt(age, 10);
  
  if (isNaN(ageNum)) {
    return {
      isValid: false,
      error: 'Usia harus berupa angka'
    };
  }

  if (ageNum < 1 || ageNum > 150) {
    return {
      isValid: false,
      error: 'Usia harus antara 1-150 tahun'
    };
  }

  return { isValid: true };
}

export function validateTextArea(text: string, maxLength: number = 500): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: true }; // Optional field
  }

  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `Teks terlalu panjang (maksimal ${maxLength} karakter)`
    };
  }

  return { isValid: true };
}

export function validateHospitalName(hospital: string): ValidationResult {
  if (!hospital || hospital.trim().length === 0) {
    return { isValid: true }; // Optional field
  }

  if (hospital.length > 200) {
    return {
      isValid: false,
      error: 'Nama rumah sakit terlalu panjang (maksimal 200 karakter)'
    };
  }

  return { isValid: true };
}

export function validateDoctorName(doctorName: string): ValidationResult {
  if (!doctorName || doctorName.trim().length === 0) {
    return { isValid: true }; // Optional field
  }

  if (doctorName.length > 100) {
    return {
      isValid: false,
      error: 'Nama dokter terlalu panjang (maksimal 100 karakter)'
    };
  }

  return { isValid: true };
}

export function validateMedicalHistory(history: string): ValidationResult {
  return validateTextArea(history, 1000);
}

export function validateSymptoms(symptoms: string): ValidationResult {
  return validateTextArea(symptoms, 1000);
}

export function validatePatientData(data: {
  patient_name?: string;
  patient_age?: string;
  patient_gender?: string;
  doctor_name?: string;
  hospital?: string;
  medical_history?: string;
  symptoms?: string;
}): ValidationResult {
  // Validate each field
  const validators = [
    () => validatePatientName(data.patient_name || ''),
    () => validateAge(data.patient_age || ''),
    () => validateDoctorName(data.doctor_name || ''),
    () => validateHospitalName(data.hospital || ''),
    () => validateMedicalHistory(data.medical_history || ''),
    () => validateSymptoms(data.symptoms || '')
  ];

  for (const validator of validators) {
    const result = validator();
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
}
