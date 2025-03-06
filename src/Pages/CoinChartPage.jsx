import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import CoinChart from "../components/Charts/CoinChart";
import "../components/Charts/CoinChart.css";

export default function CoinChartPage() {
  const { coin_id } = useParams();
  const [selectedInterval, setSelectedInterval] = useState("1M"); // Default interval
  const intervals = ["1D", "1W", "1M", "3M", "6M", "1Y", "All"];

  return (
    <div className="chart-page">
      <h1 className="chart-title">📊 Price Chart for {coin_id.toUpperCase()}</h1>

      {/* 📌 Main Chart */}
      <div className="chart-container">
        <CoinChart key={coin_id + selectedInterval} coinId={coin_id} interval={selectedInterval} />
      </div>

      {/* 📌 Interval Selection Buttons */}
      <div className="button-container">
        {intervals.map((time) => (
          <button
            key={time}
            className={`time-button ${selectedInterval === time ? "selected" : ""}`}
            onClick={() => setSelectedInterval(time)}
          >
            {time}
          </button>
        ))}
      </div>

      <Link to={`/coin/${coin_id}`}>
        <button className="back-button">🔙 Back to Details</button>
      </Link>
    </div>
  );
}
