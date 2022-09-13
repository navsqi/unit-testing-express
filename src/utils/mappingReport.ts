import { QueryResultInstansiReports } from '~/types/reportTypes';

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

export const mapEventReport = (data: QueryResultInstansiReports[]) => {
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

export const mapLeadsReport = (data: QueryResultInstansiReports[]) => {
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

export const mapClosingReport = (data: QueryResultInstansiReports[]) => {
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
