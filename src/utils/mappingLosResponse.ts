import los from '~/config/los';
import { ILOSHistoryKreditResponse } from '~/types/LOSTypes';

const mappingHistoryKredit = (losHistory: ILOSHistoryKreditResponse) => {
  const result = [];

  if (losHistory.trackHistory && losHistory.trackHistory.length > 0) {
    const trackHistory = losHistory.trackHistory;
    const trackHistoryLength = trackHistory.length;

    for (let i = trackHistoryLength - 1; i >= 0; i--) {
      const statusMcs = los.listStatusNumber.includes(trackHistory[i].trCode)
        ? los.statusLos[trackHistory[i].trCode]
        : null;

      result.push({
        status_los: trackHistory[i].trCode,
        description: trackHistory[i].trDesc,
        date: trackHistory[i].trDate,
        channel: trackHistory[i].trBy,
        status_microsite: statusMcs,
      });
    }
  }

  return result;
};

export default { mappingHistoryKredit };
