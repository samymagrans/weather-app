import { ForecastResponse } from '../../types/weather';
import { formatPercent, formatTemperature } from '../../utils/weatherHelpers';
import './ForecastList.css';

interface ForecastListProps {
  data: ForecastResponse;
}

export function ForecastList({ data }: ForecastListProps) {
  return (
    <section className="forecast card" aria-label="5-day forecast">
      <h3 className="forecast-title">5-Day Forecast</h3>
      <ol className="forecast-list">
        {data.daily.map((day) => (
          <li key={day.date} className="forecast-day">
            <span className="fd-day">{day.dayOfWeek.slice(0, 3)}</span>
            <img
              src={day.iconUrl}
              alt={day.description}
              className="fd-icon"
              width={40}
              height={40}
            />
            <span className="fd-desc">{day.description}</span>
            <div className="fd-pop" title="Precipitation probability">
              {day.precipitationProbability > 0 && (
                <span className="fd-pop-value">{formatPercent(day.precipitationProbability)}</span>
              )}
            </div>
            <div className="fd-temps">
              <span className="fd-high">
                {formatTemperature(day.tempHigh, day.units)}
              </span>
              <span className="fd-low">
                {formatTemperature(day.tempLow, day.units)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
