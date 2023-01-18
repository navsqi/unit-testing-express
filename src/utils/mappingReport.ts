import {
  QueryResultClosingReport,
  QueryResultEventReport,
  QueryResultInstansiReports,
  QueryResultLeadsReport,
} from '~/types/reportTypes';

export const mapInstansiReport = (data: QueryResultInstansiReports[]) => {
  const newData = data.map((el) => {
    const o = {
      outlet_4: '',
      outlet_3: '',
      outlet_2: '',
    };

    if (el.nama_unit_kerja && el.unit) {
      o[`outlet_${el.unit}`] = el.nama_unit_kerja;
      delete el['nama_unit_kerja'];
      delete el['unit'];
    }

    if (el.nama_unit_kerja_parent_2 && el.unit_parent_2) {
      o[`outlet_${el.unit_parent_2}`] = el.nama_unit_kerja_parent_2;
      delete el['nama_unit_kerja_2'];
      delete el['unit_parent_2'];
    }

    if (el.nama_unit_kerja_parent_3 && el.unit_parent_3) {
      o[`outlet_${el.unit_parent_3}`] = el.nama_unit_kerja_parent_3;
      delete el['nama_unit_kerja_3'];
      delete el['unit_parent_3'];
    }

    return {
      ...el,
      ...o,
    };
  });

  return newData;
};

export const mapEventReport = (data: QueryResultEventReport[]) => {
  const newData = data.map((el) => {
    const o = {
      outlet_4: '',
      outlet_3: '',
      outlet_2: '',
    };

    if (el.nama_unit_kerja && el.unit) {
      o[`outlet_${el.unit}`] = el.nama_unit_kerja;
      delete el['nama_unit_kerja'];
      delete el['unit'];
    }

    if (el.nama_unit_kerja_parent_2 && el.unit_parent_2) {
      o[`outlet_${el.unit_parent_2}`] = el.nama_unit_kerja_parent_2;
      delete el['nama_unit_kerja_2'];
      delete el['unit_parent_2'];
    }

    if (el.nama_unit_kerja_parent_3 && el.unit_parent_3) {
      o[`outlet_${el.unit_parent_3}`] = el.nama_unit_kerja_parent_3;
      delete el['nama_unit_kerja_3'];
      delete el['unit_parent_3'];
    }

    return {
      ...el,
      ...o,
      foto_dokumentasi: el.foto_dokumentasi ? `${process.env.MINIO_LINK_PREFIX}/${el.foto_dokumentasi}` : null,
    };
  });

  return newData;
};

export const mapLeadsReport = (data: QueryResultLeadsReport[]) => {
  const newData = data.map((el) => {
    const o = {
      outlet_4: '',
      outlet_3: '',
      outlet_2: '',
    };

    if (el.nama_unit_kerja && el.unit) {
      o[`outlet_${el.unit}`] = el.nama_unit_kerja;
      delete el['nama_unit_kerja'];
      delete el['unit'];
    }

    if (el.nama_unit_kerja_parent_2 && el.unit_parent_2) {
      o[`outlet_${el.unit_parent_2}`] = el.nama_unit_kerja_parent_2;
      delete el['nama_unit_kerja_2'];
      delete el['unit_parent_2'];
    }

    if (el.nama_unit_kerja_parent_3 && el.unit_parent_3) {
      o[`outlet_${el.unit_parent_3}`] = el.nama_unit_kerja_parent_3;
      delete el['nama_unit_kerja_3'];
      delete el['unit_parent_3'];
    }

    el.nama_produk = el.nama_produk || '—';

    const nik = el.nik_ktp_nasabah ? `**********${el.nik_ktp_nasabah.substring(10)}` : '—';
    el.nik_ktp_nasabah = nik;

    return {
      ...el,
      ...o,
    };
  });

  return newData;
};

export const mapClosingReport = (data: QueryResultClosingReport[]) => {
  const newData = data.map((el) => {
    const o = {
      outlet_4: '',
      outlet_3: '',
      outlet_2: '',
      osl: el.osl || 0,
      saldo_tabemas: el.saldo_tabemas || 0,
    };

    const channel = el.channel ? el.channel : 'Outlet';
    el.channel = channel;

    const nik = el.nik_ktp_nasabah ? `**********${el.nik_ktp_nasabah.substring(10)}` : '—';
    el.nik_ktp_nasabah = nik;

    if (el.nama_unit_kerja && el.unit) {
      o[`outlet_${el.unit}`] = el.nama_unit_kerja;
      delete el['nama_unit_kerja'];
      delete el['unit'];
    }

    if (el.nama_unit_kerja_parent_2 && el.unit_parent_2) {
      o[`outlet_${el.unit_parent_2}`] = el.nama_unit_kerja_parent_2;
      delete el['nama_unit_kerja_2'];
      delete el['unit_parent_2'];
    }

    if (el.nama_unit_kerja_parent_3 && el.unit_parent_3) {
      o[`outlet_${el.unit_parent_3}`] = el.nama_unit_kerja_parent_3;
      delete el['nama_unit_kerja_3'];
      delete el['unit_parent_3'];
    }

    return {
      ...el,
      ...o,
    };
  });

  return newData;
};
