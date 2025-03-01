import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useOutletContext } from "react-router-dom";
import { apiList, fetchExchangeRates } from "../Utils/CryptoService";
import { Button } from "antd";
import "../Styles/CoinsDetailsPage.css";

export default function CoinsPage() {
  const { coin_id } = useParams();
  const { selectedCurrency } = useOutletContext(); 
  const [coin, setCoin] = useState({});
  const [allCoins, setAllCoins] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [exchangeRates, setExchangeRates] = useState({ USD: 1 });
  const navigate = useNavigate();

  useEffect(() => {
    async function getExchangeRates() {
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
    }
    getExchangeRates();
  }, []);

  async function getCoin() {
    try {
      const response = await apiList.get(`/assets/${coin_id}`);
      setCoin(response.data.data);
    } catch (e) {
      console.log("ERROR : ", e);
    }
  }

  async function getAllCoins() {
    try {
      const response = await apiList.get("assets");
      if (response.data && response.data.data) {
        setAllCoins(response.data.data);
      }
    } catch (e) {
      console.log("ERROR fetching coins: ", e);
    }
  }

  useEffect(() => {
    getCoin();
    getAllCoins();
  }, [coin_id]);

  const convertPrice = (price) => {
    return (parseFloat(price) / (exchangeRates[selectedCurrency] || 1)).toFixed(2);
  };

  return (
    <div className="container">
      {/* 📌 اطلاعات کوین با ساختار جدید */}
      <div className="crypto-info">
        <h1>{coin.symbol}</h1>
        <h2>{coin.name}</h2>
        
        <div className="crypto-details">
          <div className="crypto-detail-item">
            <strong>Price</strong> {selectedCurrency} {convertPrice(coin?.priceUsd ?? 0)}
          </div>
          <div className="crypto-detail-item">
            <strong>Rank</strong> {coin.rank ?? "N/A"}
          </div>
          <div className="crypto-detail-item">
            <strong>Supply</strong> {parseFloat(coin.supply).toLocaleString()}
          </div>
          <div className="crypto-detail-item">
            <strong>Market Cap</strong> {selectedCurrency} {convertPrice(coin.marketCapUsd)}
          </div>
          <div className="crypto-detail-item">
            <strong>VWAP (24Hr)</strong> {selectedCurrency} {convertPrice(coin.vwap24Hr)}
          </div>
          <div className="crypto-detail-item">
            <strong>24h Volume</strong> {selectedCurrency} {convertPrice(coin.volumeUsd24Hr)}
          </div>
          <div className="crypto-detail-item">
            <strong>24h Change</strong> 
            <span className={coin.changePercent24Hr < 0 ? "negative" : "positive"}>
              {parseFloat(coin.changePercent24Hr).toFixed(2)}%
            </span>
          </div>
        </div>

        <button className="chart-button" onClick={() => navigate(`/coin/${coin_id}/chart`)}>
          📈 View the chart
        </button>
      </div>

      {/* 📌 لیست تمام ارزها در قالب جدول */}
      <div className="crypto-list">
        <h2>🔥 List of all currencies </h2>
        <table className="crypto-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Symbol</th>
              <th>Name</th>
              <th>Price ({selectedCurrency})</th>
              <th>Supply</th>
              <th>Market Cap</th>
              <th>VWAP (24Hr)</th>
              <th>24h Volume</th>
              <th>24h Change</th>
            </tr>
          </thead>
          <tbody>
            {allCoins.slice(0, visibleCount).map(({ id, rank, symbol, name, priceUsd, supply, marketCapUsd, vwap24Hr, volumeUsd24Hr, changePercent24Hr }) => (
              <tr key={id}>
                <td>{rank ?? "N/A"}</td>
                <td>{symbol}</td>
                <td>{name}</td>
                <td>{convertPrice(priceUsd)}</td>
                <td>{parseFloat(supply).toLocaleString()}</td>
                <td>{convertPrice(marketCapUsd)}</td>
                <td>{convertPrice(vwap24Hr)}</td>
                <td>{convertPrice(volumeUsd24Hr)}</td>
                <td className={changePercent24Hr < 0 ? "negative" : "positive"}>
                  {parseFloat(changePercent24Hr).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visibleCount < allCoins.length && (
          <Button type="primary" onClick={() => setVisibleCount(visibleCount + 10)} className="see-more-button">
            See More
          </Button>
        )}
      </div>

      <div className="back-container">
        <button className="back-button" onClick={() => navigate("/")}>🔙 Back to Home</button>
      </div>
    </div>
  );
}
