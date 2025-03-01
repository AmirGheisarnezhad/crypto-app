import { useParams, Link, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getExchangeDetails,
  getExchangeMarkets,
  fetchExchangeRates,
} from "../Utils/CryptoService";
import "../Styles/ExchangeDetails.css";

export default function ExchangeDetailsPage() {
  const { id: exchangeId } = useParams();
  const { selectedCurrency } = useOutletContext();

  const [exchange, setExchange] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10); // تعداد آیتم‌های قابل نمایش

  useEffect(() => {
    async function fetchData() {
      try {
        const updatedRates = await fetchExchangeRates(selectedCurrency);
        setRates(updatedRates);

        const exchangeData = await getExchangeDetails(exchangeId);
        const marketData = await getExchangeMarkets(exchangeId, 50);

        if (exchangeData) setExchange(exchangeData);
        else setError("Exchange data not found.");

        if (marketData) setMarkets(marketData);
      } catch (e) {
        setError("Error fetching exchange data.",e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [exchangeId, selectedCurrency]);

  const convertPrice = (price) =>
    price ? (parseFloat(price) / (rates[selectedCurrency] || 1)).toFixed(2) : "-";

  if (loading) return <p className="loading-spinner">Loading...</p>;
  if (error) return <p className="error-message">⚠️ {error}</p>;

  return (
    <div className="exchange-details-container">
      {/* 📌 اطلاعات صرافی */}
      <div className="exchange-card">
        <h1 className="exchange-title">🏛 {exchange?.name || "Unknown Exchange"}</h1>
        
        <div className="exchange-info-grid">
          <div className="info-box"><strong>🔹 Name:</strong> {exchange.name}</div>
          <div className="info-box"><strong>🏆 Rank:</strong> {exchange.rank}</div>
          <div className="info-box"><strong>💰 Volume (24h):</strong> {selectedCurrency} {convertPrice(exchange.volumeUsd)}</div>
          <div className="info-box"><strong>🔄 Trading Pairs:</strong> {exchange.tradingPairs}</div>
          <div className="info-box"><strong>📊 Total Volume:</strong> {parseFloat(exchange.percentTotalVolume).toFixed(2)}%</div>
          <div className="info-box"><strong>⚡ WebSocket:</strong> {exchange.socket ? "✅ Available" : "❌ Not Available"}</div>
        </div>

        <a href={exchange.exchangeUrl} target="_blank" rel="noopener noreferrer" className="visit-website-btn">🔗 Visit Website</a>
      </div>

      {/* 📌 جدول لیست مارکت‌ها */}
      <h2 className="market-title">📈 Market Listings</h2>

      {markets.length > 0 ? (
        <div className="table-container">
          <table className="market-table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Rate ({selectedCurrency})</th>
                <th>Price ({selectedCurrency})</th>
                <th>Volume (24h) ({selectedCurrency})</th>
                <th>Volume %</th>
              </tr>
            </thead>
            <tbody>
              {markets.slice(0, visibleCount).map(({ baseSymbol, quoteSymbol, priceUsd, volumeUsd24Hr, percentExchangeVolume }) => (
                <tr key={`${baseSymbol}-${quoteSymbol}`}>
                  <td>{baseSymbol}/{quoteSymbol}</td>
                  <td>{convertPrice(priceUsd)}</td>
                  <td>{convertPrice(priceUsd)}</td>
                  <td>{convertPrice(volumeUsd24Hr)}</td>
                  <td>{percentExchangeVolume ? `${Number(percentExchangeVolume).toFixed(2)}%` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* دکمه "See More" برای نمایش بیشتر */}
          {visibleCount < markets.length && (
            <button className="see-more-btn" onClick={() => setVisibleCount(visibleCount + 10)}>See More</button>
          )}
        </div>
      ) : (
        <p className="no-market-data">⚠️ No market data available</p>
      )}

      {/* دکمه بازگشت */}
      <Link to="/exchanges">
        <button className="back-btn">🔙 Back to Exchanges</button>
      </Link>
    </div>
  );
}
