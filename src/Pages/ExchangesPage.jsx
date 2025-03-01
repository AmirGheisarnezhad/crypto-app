import { useEffect, useState, useCallback  } from "react";
import { apiList, fetchExchangeRates, getTopPairForExchange } from "../Utils/CryptoService";
import { Link, useOutletContext } from "react-router-dom";
import { Pagination } from "antd";
import Loader from "../components/Loader/Loader";
import "../Styles/Exchanges.css";

export default function ExchangesPage() {
  const { selectedCurrency } = useOutletContext();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(localStorage.getItem("currentPage")) || 1;
  });
  const [exchangeRates, setExchangeRates] = useState({});
  const pageSize = 10;

  const getExchanges = useCallback(async () => {
    try {
      console.log("🔄 Fetching exchanges data for currency:", selectedCurrency);
      setLoading(true);

      // دریافت و ذخیره نرخ‌های ارز
      const rates = await fetchExchangeRates();
      setExchangeRates(rates ?? { USD: 1 });

      // دریافت لیست صرافی‌ها
      const response = await apiList.get("exchanges");
      if (response.data?.data) {
        const sortedExchanges = response.data.data.sort((a, b) => a.rank - b.rank);

        // دریافت Top Pair برای هر صرافی
        const exchangesWithTopPair = await Promise.all(
          sortedExchanges.map(async (exchange) => {
            const topPair = (await getTopPairForExchange(exchange.exchangeId)) || "N/A";
            return { ...exchange, topPair };
          })
        );

        setExchanges(exchangesWithTopPair);
      }
    } catch (e) {
      console.error("❌ ERROR fetching exchanges:", e);
    } finally {
      setLoading(false);
    }
  },[selectedCurrency]); // ✅ وابسته به selectedCurrency

  useEffect(() => {
    getExchanges();
  }, [getExchanges]); // ✅ حالا تابع همیشه پایدار می‌مونه

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const convertCurrency = (amount) => {
    if (!amount || !exchangeRates[selectedCurrency]) {
      return "N/A";
    }
    return (parseFloat(amount) / (exchangeRates[selectedCurrency] || 1)).toFixed(2);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedExchanges = exchanges.slice(startIndex, endIndex);

  return (
    <div className="main-container">
      <h1 className="title">🏛️ List of Exchanges</h1>
      {loading ? (
        <Loader />
      ) : (
        <>
          <table className="exchanges-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Trading Pairs</th>
                <th>Top Pair</th>
                <th>24h Volume ({selectedCurrency})</th>
                <th>Total Volume %</th>
                <th>WebSocket</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {displayedExchanges.map(
                ({
                  exchangeId,
                  name,
                  tradingPairs,
                  topPair,
                  volumeUsd,
                  percentTotalVolume,
                  socket,
                  rank,
                }) => (
                  <tr key={exchangeId ?? crypto.randomUUID()}>
                    <td>{rank ?? "N/A"}</td>
                    <td>{name?.trim() || "Unknown"}</td>
                    <td>{tradingPairs || "N/A"}</td>
                    <td>{topPair?.trim() || "N/A"}</td>
                    <td>{volumeUsd ? `${convertCurrency(volumeUsd)} ${selectedCurrency}` : "N/A"}</td>
                    <td>{percentTotalVolume ? `${parseFloat(percentTotalVolume).toFixed(2)}%` : "N/A"}</td>
                    <td>
                      {socket ? (
                        <span className="available">✅ Available</span>
                      ) : (
                        <span className="not-available">❌ Not Available</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/exchange/${exchangeId ?? "unknown"}`} className="view-link">
                        🔍 View
                      </Link>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          <Pagination
            className="pagination"
            current={currentPage}
            pageSize={pageSize}
            total={exchanges.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </>
      )}
    </div>
  );
}
