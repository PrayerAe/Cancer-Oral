import React, { useState } from 'react';
import { UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import type { PatientData } from '../types';

interface PatientFormProps {
  onAnalyze: (data: PatientData) => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
}

export default function PatientForm({ onAnalyze, disabled, isAnalyzing }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientData>({
    patient_name: '',
    patient_age: '',
    patient_gender: '',
    doctor_name: '',
    hospital: '',
    medical_history: '',
    symptoms: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Patient Name */}
      <div>
        <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Pasien
        </label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            id="patient_name"
            name="patient_name"
            value={formData.patient_name}
            onChange={handleChange}
            className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan nama pasien"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Age and Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="patient_age" className="block text-sm font-medium text-gray-700 mb-1">
            Usia
          </label>
          <input
            type="number"
            id="patient_age"
            name="patient_age"
            value={formData.patient_age}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Umur"
            min="1"
            max="120"
            disabled={disabled}
          />
        </div>

        <div>
          <label htmlFor="patient_gender" className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Kelamin
          </label>
          <select
            id="patient_gender"
            name="patient_gender"
            value={formData.patient_gender}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          >
            <option value="">Pilih jenis kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
      </div>

      {/* Doctor and Hospital */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="doctor_name" className="block text-sm font-medium text-gray-700 mb-1">
            Dokter Perujuk
          </label>
          <div className="relative">
            <AcademicCapIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="doctor_name"
              name="doctor_name"
              value={formData.doctor_name}
              onChange={handleChange}
              className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nama dokter"
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
            Rumah Sakit/Klinik
          </label>
          <input
            type="text"
            id="hospital"
            name="hospital"
            value={formData.hospital}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nama institusi"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Medical History */}
      <div>
        <label htmlFor="medical_history" className="block text-sm font-medium text-gray-700 mb-1">
          Riwayat Medis
        </label>
        <textarea
          id="medical_history"
          name="medical_history"
          value={formData.medical_history}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Riwayat penyakit terdahulu, operasi, obat-obatan, dll."
          disabled={disabled}
        />
      </div>

      {/* Symptoms */}
      <div>
        <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
          Gejala & Keluhan
        </label>
        <textarea
          id="symptoms"
          name="symptoms"
          value={formData.symptoms}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Deskripsikan gejala atau keluhan yang dialami pasien..."
          disabled={disabled}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={disabled || isAnalyzing}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          disabled || isAnalyzing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Menganalisis...
          </div>
        ) : (
          '🔬 Mulai Analisis AI'
        )}
      </button>
    </form>
  );
}
