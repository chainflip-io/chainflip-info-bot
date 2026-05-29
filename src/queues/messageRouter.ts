import { type JobConfig, type JobProcessor } from './initialize.js';
import { type SwapBannerData } from '../banners/buildBanner.js';
import Config, { type Platform, type FilterData } from '../config.js';
import logger from '../utils/logger.js';

const name = 'messageRouter';
type Name = typeof name;

type Data = {
  platform: Platform;
  message: string;
  filterData: FilterData;
  opts?: { disablePreview?: boolean };
  banner?: SwapBannerData;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  const { message, filterData, platform, opts, banner } = job.data;

  const channels = await Config.getChannels(platform);

  const jobs = channels
    ?.filter((channel) => Config.canSend(channel, filterData))
    .map(({ key }) => ({ name: 'sendMessage' as const, data: { key, message, opts, banner } }));

  if (jobs?.length) await dispatchJobs(jobs);

  logger.info(`Dispatched ${jobs?.length ?? 0} jobs for message type ${filterData.name}`);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
