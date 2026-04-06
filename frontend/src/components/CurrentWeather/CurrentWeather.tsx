import { CurrentWeatherResponse } from '../../types/weather';
import {
  formatPercent,
  formatPressure,
  formatTemperature,
  formatTime,
  formatVisibility,
  formatWindSpeed,
} from '../../utils/weatherHelpers';
import './CurrentWeather.css';

interface CurrentWeatherProps {
  data: CurrentWeatherResponse;
}

export function CurrentWeather({ data }: CurrentWeatherProps) {
  const { location, current } = data;
  const { units } = current;

  return (
    <section className="current-weather card" aria-label="Current weather conditions">
      {/* Header */}
      <div className="cw-header">
        <div className="cw-location">
          <h2 className="cw-city">{location.city}</h2>
          <span className="cw-country">{location.country}</span>
        </div>
        <time className="cw-observed" dateTime={current.observedAt}>
          {formatTime(current.observedAt)}
        </time>
      </div>

      {/* Main temperature */}
      <div className="cw-main">
        <img
          src={current.iconUrl}
          alt={current.description}
          className="cw-icon"
          width={80}
          height={80}
        />
        <div className="cw-temp-block">
          <span className="cw-temperature">
            {formatTemperature(current.temperature, units)}
          </span>
          <span className="cw-description">{current.description}</span>
          <span className="cw-feels-like">
            Feels like {formatTemperature(current.feelsLike, units)}
          </span>
          <span className="cw-range">
            H: {formatTemperature(current.tempMax, units)} &nbsp;
            L: {formatTemperature(current.tempMin, units)}
          </span>
        </div>
      </div>

      {/* Secondary stats grid */}
      <dl className="cw-stats">
        <StatItem label="Humidity" value={formatPercent(current.humidity)} />
        <StatItem
          label="Wind"
          value={`${formatWindSpeed(current.windSpeed, units)} ${current.windDirection}`}
        />
        {current.windGust != null && (
          <StatItem label="Gusts" value={formatWindSpeed(current.windGust, units)} />
        )}
        <StatItem label="Pressure" value={formatPressure(current.pressure)} />
        <StatItem label="Visibility" value={formatVisibility(current.visibility, units)} />
        <StatItem label="Cloud Cover" value={formatPercent(current.cloudCoverage)} />
        <StatItem label="Sunrise" value={formatTime(current.sunrise)} />
        <StatItem label="Sunset" value={formatTime(current.sunset)} />
      </dl>
    </section>
  );
}

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="cw-stat">
      <dt className="cw-stat-label">{label}</dt>
      <dd className="cw-stat-value">{value}</dd>
    </div>
  );
}
