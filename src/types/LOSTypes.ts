export interface DataNasabah {
  namaNasabah: string;
  nik: string;
  tglLahir: string;
  tempatLahir: string;
  jenisKelamin: string;
  namaIbuKandung: string;
  npwp: string;
  statusPerkawinan: string;
  jumlahTanggungan: string;
  agama: string;
  pendidikan: string;
  noHp: string;
  noTelepon: string;
  email: string;
  rekeningTabungan: string;
  namaRekening: string;
  noRekening: string;
}

export interface DataCalonHaji {
  namaCalonHaji: string;
  nikCalonHaji: string;
  tglLahirCalonHaji: string;
  bankHaji: string;
  cabangBankHaji: string;
  alamatBankHaji: string;
}

export interface DataPasangan {
  namaPasangan: string;
  nikPasangan: string;
  tglLahirPasangan: string;
}

export interface DataAlamatNasabah {
  alamat: string;
  rt: string;
  rw: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  alamatDomisili: string;
  rtDomisili: string;
  rwDomisili: string;
  provinsiDomisili: string;
  kabupatenDomisili: string;
  kecamatanDomisili: string;
  kelurahanDomisili: string;
}

export interface DataKerabat {
  namaKerabat: string;
  hubunganKerabat: string;
  noHpKerabat: string;
  noTeleponKerabat: string;
}

export interface DataAlamatKerabat {
  alamatKerabat: string;
  rtKerabat: string;
  rwKerabat: string;
  provinsiKerabat: string;
  kabupatenKerabat: string;
  kecamatanKerabat: string;
  kelurahanKerabat: string;
}

export interface DataUsaha {
  lamaUsaha: string;
  statusPekerjaan: string;
  pekerjaan: string;
  namaTempatUsaha: string;
  bidangUsaha: string;
  jenisUsaha: string;
  noIjinUsaha: string;
  aspekPemasaran: string;
  jarakLokasiKeUnitMikro: string;
  jenisTempatUsaha: string;
  statusTempatUsaha: string;
  tipePendapatan: string;
  pendapatanPerBulan: string;
  noTeleponUsaha: string;
  faxUsaha: string;
  modalUsaha: string;
  jumlahPekerja: string;
  kondisiRumah: string;
  nikPendamping: string;
  namaPendamping: string;
  idPegawai: string;
  namaPemimpin: string;
  jenisPerusahaan: string;
  tanggalPensiun: string;
}

export interface DataAlamatUsaha {
  alamatUsaha: string;
  rtUsaha: string;
  rwUsaha: string;
  provinsiUsaha: string;
  kabupatenUsaha: string;
  kecamatanUsaha: string;
  kelurahanUsaha: string;
}

export interface DataKeuangan {
  omzet: string;
  biayaProduksi: string;
  biayaAdministrasi: string;
  biayaGaji: string;
  biayaUmum: string;
  biayaLainnya: string;
  pendapatanGaji: string;
  pendapatanLainnya: string;
  pengeluaranRutinRumahTangga: string;
  pengeluaranRutinLainnya: string;
}

export interface DataFasilitasKredit {
  uangPinjamanDiminta: string;
  uangPinjamanDisetujui: string;
  produk: string;
  jenisNasabah: string;
  sektorEkonomi: string;
  jenisPermohonan: string;
  tujuanPinjaman: string;
  jangkaWaktu: string;
  polaAngsuran: string;
  metodeAngsuran: string;
  rate: string;
  angsuran: string;
  outletPencairan: string;
  tglBayar: string;
}

export interface JaminanKendaraan {
  jenisKendaraan: string;
  kepemilikan: string;
  kondisi: string;
  noBpkb: string;
  noPolisi: string;
  tahunPerakitan: string;
  hargapasar: string;
  merek: string;
  keteranganKendaraan: string;
}

export interface JaminanSuratBerharga {
  jenisSertifikat: string;
  namaPemilik: string;
  noSertifikat: string;
  hargapasar: string;
}

export interface JaminanBarangGudang {
  jenisBarangGudang: string;
  namaBarang: string;
  jumlah: string;
  hargapasar: string;
}

export interface JaminanBarangElektronik {
  jenisBarangElektronik: string;
  namaBarang: string;
  jumlah: string;
  hargapasar: string;
}

export interface JaminanPersediaan {
  jenisPersediaan: string;
  namaBarang: string;
  jumlah: string;
  hargapasar: string;
}

export interface JaminanBarangKantong {
  jenisBarangKantong: string;
  jenisPerhiasan: string;
  jumlah: string;
  beratKotor: string;
  beratBersih: string;
}

export interface ILOSPengajuan {
  channelId: string;
  clientId: string;
  kodeChannel: string;
  kodeBookingChannel: string;
  nik: string;
  namaNasabah: string;
  tglLahir: string;
  noHp: string;
  email: string;
  kodeOutlet: string;
  up: string;
  kodeProduk: string;
  tenor: string;
  kepemilikanUsaha: string;
  kode_instansi: string;
  jumlahJaminan: string;
  jenisPengajuan: string;
  dataNasabah: DataNasabah;
  dataCalonHaji: DataCalonHaji;
  dataPasangan: DataPasangan;
  dataAlamatNasabah: DataAlamatNasabah;
  dataKerabat: DataKerabat;
  dataAlamatKerabat: DataAlamatKerabat;
  dataUsaha: DataUsaha;
  dataAlamatUsaha: DataAlamatUsaha;
  dataKeuangan: DataKeuangan;
  dataFasilitasKredit: DataFasilitasKredit;
  jaminanKendaraan: JaminanKendaraan[];
  jaminanSuratBerharga: JaminanSuratBerharga[];
  jaminanBarangGudang: JaminanBarangGudang[];
  jaminanBarangElektronik: JaminanBarangElektronik[];
  jaminanPersediaan: JaminanPersediaan[];
  jaminanBarangKantong: JaminanBarangKantong[];
}
