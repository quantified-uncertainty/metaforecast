import { Forecast, platforms } from "../backend/platforms";

export interface PlatformConfig {
  name: string;
  label: string;
  color: string;
}

export type FrontendForecast = Forecast & {
  platformLabel: string;
  visualization?: any;
};

export const addLabelsToForecasts = (
  forecasts: Forecast[]
): FrontendForecast[] => {
  const platformNameToLabel = Object.fromEntries(
    platforms.map((platform) => [platform.name, platform.label])
  );

  return forecasts.map((result) => ({
    ...result,
    platformLabel: platformNameToLabel[result.platform] || result.platform,
  }));
};
