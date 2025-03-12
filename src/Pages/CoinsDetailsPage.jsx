import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { apiList, fetchExchangeRates } from "../Utils/CryptoService";
import { Button } from "antd";
import "../Styles/CoinsDetailsPage.css";

export default function CoinsPage() {
  const { coin_id } = useParams();
  const { selectedCurrency } = useOutletContext();
  const [coin, setCoin] = useState({});
  const [allCoins, setAllCoins] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [exchangeRates, setExchangeRates] = useState({});
  const [error, setError] = useState(false); // مدیریت خطای دریافت نرخ ارز
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!coin_id) return;

      console.log(`🔍 Fetching coin details for: ${coin_id}`);
      try {
        const response = await apiList.get(`/assets/${coin_id}`);
        if (isMounted) setCoin(response.data.data || {});
      } catch (e) {
        console.error("❌ ERROR fetching coin details:", e);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    }; // جلوگیری از Memory Leak
  }, [coin_id]);

  useEffect(() => {
    async function getExchangeRates() {
      console.log("🔄 Fetching exchange rates...");
      const rates = await fetchExchangeRates();

      if (!rates || Object.keys(rates).length === 0) {
        console.error("❌ ERROR: Failed to fetch exchange rates!");
        setError(true);
        setExchangeRates({ USD: 1 }); // مقدار پیش‌فرض فقط USD
        return;
      }

      setExchangeRates(rates);
      setError(false);
    }

    getExchangeRates();
  }, []);

  async function getAllCoins() {
    const cachedCoins = JSON.parse(localStorage.getItem("allCoins"));
    if (cachedCoins) {
      console.log("✅ Using cached coins list");
      setAllCoins(cachedCoins);
      return;
    }

    try {
      console.log("⚡ Fetching coins from API...");
      const response = await apiList.get("assets");
      if (response.data && response.data.data) {
        setAllCoins(response.data.data);
        localStorage.setItem("allCoins", JSON.stringify(response.data.data));
      }
    } catch (e) {
      console.log("ERROR fetching coins: ", e);
    }
  }

  useEffect(() => {
    getAllCoins();
  }, []);

  const conversionRate = useMemo(() => {
    if (error) {
      return 1; // مقدار پیش‌فرض در صورت بروز خطا
    }

    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      console.warn("⚠️ Exchange rates are empty! Waiting for data...");
      return 1;
    }

    if (!exchangeRates[selectedCurrency]) {
      console.error(`❌ ERROR: No exchange rate found for ${selectedCurrency}! Using USD.`);
      return exchangeRates["USD"] || 1; // مقدار USD را جایگزین می‌کنیم
    }

    console.log("🔄 Calculating conversion rate for:", selectedCurrency, exchangeRates);
    return exchangeRates[selectedCurrency];
  }, [exchangeRates, selectedCurrency]);

  console.log("🔍 Checking exchange rate for:", selectedCurrency, exchangeRates[selectedCurrency]);

  const convertPrice = (price) => {
    return (parseFloat(price) / conversionRate).toFixed(2);
  };

  const handleCoinClick = (coinId) => {
    navigate(`/coin/${coinId}`);
  };

  return (
    <div className="container">
      {error && <p style={{ color: "red" }}>❌ نرخ تبدیل ارز دریافت نشد! لطفاً بعداً امتحان کنید.</p>}

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
            <strong>Supply</strong> {parseFloat(coin.supply || 0).toLocaleString()}
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
              <tr key={id} onClick={() => handleCoinClick(id)}>
                <td>{rank ?? "N/A"}</td>
                <td>{symbol}</td>
                <td>{name}</td>
                <td>{convertPrice(priceUsd)}</td>
                <td>{parseFloat(supply || 0).toLocaleString()}</td>
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
      </div>
    </div>
  );
}
