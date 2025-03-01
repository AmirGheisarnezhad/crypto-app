import { Fragment, useState, useEffect } from "react";
import { apiList } from "../../Utils/CryptoService";
import { Link } from "react-router-dom";
import { Pagination } from "antd";
import Loader from "../Loader/Loader";
import "../../Styles/CoinsList.css";

export default function CoinsList({ selectedCurrency }) {
  const [coins, setCoins] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(localStorage.getItem("cryptoCurrentPage")) || 1;
  });
  const pageSize = 10;

  const getApi = async () => {
    try {
      console.log(`Requesting API with base currency: ${selectedCurrency}`);
      const response = await apiList.get(`assets?base=${selectedCurrency}`);
      if (response.data && response.data.data) {
        setCoins(response.data);
      } else {
        console.error("Invalid API response structure:", response);
      }
    } catch (e) {
      console.error("API Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getApi();
  }, [selectedCurrency]);

  useEffect(() => {
    localStorage.setItem("cryptoCurrentPage", currentPage);
  }, [currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedCoins = coins.data.slice(startIndex, endIndex);

  return (
    <Fragment>
      <div className="coins-list-container">
        <h2 className="table-title">📊 Cryptocurrency Market</h2>
        {loading ? (
          <Loader />
        ) : (
          <div className="table-wrapper">
            <table className="coins-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Price ({selectedCurrency})</th>
                  <th>Supply</th>
                  <th>Market Cap</th>
                  <th>24h Volume</th>
                  <th>24h Change</th>
                </tr>
              </thead>
              <tbody>
  {displayedCoins.map(({ id, symbol, name, priceUsd, supply, marketCapUsd, volumeUsd24Hr, changePercent24Hr }) => (
    <tr key={id} className="clickable-row" onClick={() => window.location.href = `/coin/${id}`}>
      <td>{symbol}</td>
      <td>{name}</td>
      <td>{parseFloat(priceUsd).toLocaleString()}</td>
      <td>{parseFloat(supply).toLocaleString()}</td>
      <td>{parseFloat(marketCapUsd).toLocaleString()}</td>
      <td>{parseFloat(volumeUsd24Hr).toLocaleString()}</td>
      <td className={changePercent24Hr < 0 ? "negative" : "positive"}>
        {parseFloat(changePercent24Hr).toFixed(2)}%
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        )}

        <Pagination
          current={currentPage}
          pageSize={10}
          total={coins.data.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          className="pagination"
        />
      </div>
    </Fragment>
  );
}