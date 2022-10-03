import validator from 'validator';

export interface IValidationCSV {
  nik_ktp?: string;
  nama?: string;
  no_hp?: string;
  up?: number | string;
  kode_produk?: string;
  nik_ktp_karyawan?: string | null;
}

const validationCsv = (data: IValidationCSV) => {
  const errors = [];

  if (!data.nik_ktp || !validator.isLength(data.nik_ktp, { min: 16, max: 16 }) || !validator.isNumeric(data.nik_ktp)) {
    errors.push('NIK EKTP harus 16 digit angka');
  }

  if (!data.nama || !validator.isLength(data.nama, { min: 2, max: 60 })) {
    errors.push('Nama minimal 2 karakter huruf');
  }

  if (!data.no_hp || !validator.isLength(data.no_hp, { min: 11, max: 15 }) || !validator.isNumeric(data.no_hp)) {
    errors.push('Nomor HP harus 11 - 15 digit angka');
  }

  if (!data.kode_produk || !validator.isLength(data.kode_produk, { min: 1, max: 5 })) {
    errors.push('Kode produk harus angka atau huruf');
  }

  return errors;
};

export default validationCsv;
