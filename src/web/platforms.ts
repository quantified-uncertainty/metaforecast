import { Forecast, PlatformConfig } from "../backend/platforms";

export type FrontendForecast = Forecast & {
  platformLabel: string;
  visualization?: any;
};

// ok on client side
export const addLabelsToForecasts = (
  forecasts: Forecast[],
  platformsConfig: PlatformConfig[]
): FrontendForecast[] => {
  const platformNameToLabel = Object.fromEntries(
    platformsConfig.map((platform) => [platform.name, platform.label])
  );

  return forecasts.map((result) => ({
    ...result,
    platformLabel: platformNameToLabel[result.platform] || result.platform,
  }));
};
