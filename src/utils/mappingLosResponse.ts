import los from '~/config/los';
import { ILOSHistoryKreditResponse } from '~/types/LOSTypes';

const mappingHistoryKredit = (losHistory: ILOSHistoryKreditResponse) => {
  const result = [];

  if (losHistory.trackHistory && losHistory.trackHistory.length > 0) {
    for (const h of losHistory.trackHistory) {
      result.push({
        status_los: h.trCode,
        description: h.trDesc,
        status_microsite: los.statusLos[h.trCode],
      });
    }
  }

  return result;
};

export default { mappingHistoryKredit };
