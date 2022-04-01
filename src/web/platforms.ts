import { Forecast } from "../backend/platforms";

export interface PlatformConfig {
  name: string;
  label: string;
  color: string;
}

export type FrontendForecast = Forecast & {
  platformLabel: string;
  visualization?: any;
};
