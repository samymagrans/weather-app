import { WeatherInsights as WeatherInsightsType } from '../../types/weather';
import { getComfortIndexColor } from '../../utils/weatherHelpers';
import './WeatherInsights.css';

interface WeatherInsightsProps {
  insights: WeatherInsightsType;
}

export function WeatherInsights({ insights }: WeatherInsightsProps) {
  const { comfortIndex, windCondition, humidityComfort, activityRecommendation, visibilityDescription } = insights;
  const comfortColorClass = getComfortIndexColor(comfortIndex.type);

  return (
    <section className="insights card" aria-label="Weather insights">
      <h3 className="insights-title">Weather Insights</h3>

      <div className="insights-grid">
        {/* Comfort index — heat index, wind chill, or feels-like */}
        <div className={`insight-card comfort-card ${comfortColorClass}`}>
          <span className="insight-label">
            {comfortIndex.type === 'heat_index'
              ? 'Heat Index'
              : comfortIndex.type === 'wind_chill'
              ? 'Wind Chill'
              : 'Feels Like'}
          </span>
          <span className="insight-value">{comfortIndex.value}°F</span>
          <span className="insight-badge">{comfortIndex.label}</span>
          <p className="insight-desc">{comfortIndex.description}</p>
        </div>

        {/* Wind condition */}
        <div className="insight-card">
          <span className="insight-label">Wind Condition</span>
          <span className="insight-value insight-value--text">{windCondition}</span>
          <p className="insight-desc">Based on the Beaufort wind scale</p>
        </div>

        {/* Humidity comfort */}
        <div className="insight-card">
          <span className="insight-label">Humidity Comfort</span>
          <span className="insight-value insight-value--text">{humidityComfort}</span>
          <p className="insight-desc">Current moisture level comfort</p>
        </div>

        {/* Visibility */}
        <div className="insight-card">
          <span className="insight-label">Visibility</span>
          <span className="insight-value insight-value--text">{visibilityDescription}</span>
          <p className="insight-desc">Atmospheric clarity</p>
        </div>
      </div>

      {/* Activity recommendation — spans full width */}
      <div className="insight-recommendation" role="note" aria-label="Activity recommendation">
        <span className="rec-icon" aria-hidden="true">&#x2192;</span>
        <p>{activityRecommendation}</p>
      </div>
    </section>
  );
}
