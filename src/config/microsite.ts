const jenisPromosi = {
  TUNAI: 'TUNAI',
  CASHBACK: 'CASHBACK',
  TRANSFER: 'TRANSFER',
};

const tipeTransaksi = {
  FIXED: 'FIXED',
  NON_FIXED: 'NON_FIXED',
};

const jenisVoucher = {
  TANPA_VOUCHER: 'TANPA_VOUCHER',
  SEKALI_PAKAI: 'SEKALI_PAKAI',
  MULTI_PAKAI: 'MULTI_PAKAI',
};

const jenisTransaksi = {
  BOOKING: 'BOOKING',
  NON_BOOKING: 'NON_BOOKING',
};

const tipeNasabah = {
  NASABAH_BARU: 'NASABAH_BARU',
  SEMUA_NASABAH: 'SEMUA_NASABAH',
};

const tipePromosi = {
  UANG_PINJAMAN: 'UANG_PINJAMAN',
  MINTA_TAMBAH: 'MINTA_TAMBAH',
  TRANSAKSI_NON_OSL: 'TRANSAKSI_NON_OSL',
};

const microsite = {
  params: {
    jenisPromosi,
    tipeTransaksi,
    jenisVoucher,
    tipeNasabah,
    tipePromosi,
    jenisTransaksi,
  },
};

export default microsite;
