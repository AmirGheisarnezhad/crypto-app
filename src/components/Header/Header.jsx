import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { apiList } from "../../Utils/CryptoService";
import "../Header/Header.css";

export default function Header({ selectedCurrency = "USD", setSelectedCurrency }) {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currencies, setCurrencies] = useState([]);
  const [searchCurrency, setSearchCurrency] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const [searchAsset, setSearchAsset] = useState("");
  const [assets, setAssets] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  // ✅ دریافت لیست نرخ ارزها
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await apiList.get("rates");
        const data = response.data?.data || [];

        // فقط ارزهایی که واحد (symbol) دارند
        const filtered = data.filter((c) => c.symbol);
        setCurrencies(filtered);
      } catch (error) {
        console.error("❌ ERROR fetching currency rates:", error);
      }
    }
    fetchCurrencies();
  }, []);

  // ✅ فیلتر ارزها براساس سرچ کاربر
  useEffect(() => {
    if (!searchCurrency.trim()) {
      setFilteredCurrencies([]);
      setShowCurrencyDropdown(false);
      return;
    }

    const filtered = currencies.filter(
      (currency) =>
        currency.id.toLowerCase().includes(searchCurrency.toLowerCase()) ||
        currency.symbol.toLowerCase().includes(searchCurrency.toLowerCase())
    );

    setFilteredCurrencies(filtered);
    setShowCurrencyDropdown(filtered.length > 0);
  }, [searchCurrency, currencies]);

  const handleSelectCurrency = (currency) => {
    setSelectedCurrency(currency.symbol);
    setSearchCurrency("");
    setShowCurrencyDropdown(false);
  };

  // ✅ دریافت لیست کوین‌ها و صرافی‌ها برای سرچ پیشرفته
  useEffect(() => {
    async function fetchData() {
      try {
        const assetsResponse = await apiList.get("assets");
        const exchangesResponse = await apiList.get("exchanges");

        setAssets(assetsResponse.data?.data || []);
        setExchanges(exchangesResponse.data?.data || []);
      } catch (error) {
        console.error("❌ ERROR fetching assets & exchanges:", error);
      }
    }
    fetchData();
  }, []);

  // ✅ فیلتر نتایج سرچ برای نمایش پیشنهادها
  useEffect(() => {
    if (!searchAsset?.trim()) {
      setFilteredResults([]);
      return;
    }

    const filteredAssets = assets.filter(
      (item) =>
        (item.id && item.id.toLowerCase().includes(searchAsset.toLowerCase())) ||
        (item.symbol && item.symbol.toLowerCase().includes(searchAsset.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(searchAsset.toLowerCase()))
    );

    const filteredExchanges = exchanges.filter(
      (item) =>
        (item.exchangeId && item.exchangeId.toLowerCase().includes(searchAsset.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(searchAsset.toLowerCase()))
    );

    setFilteredResults([...filteredAssets, ...filteredExchanges]);
  }, [searchAsset, assets, exchanges]);

  const handleLogin = () => navigate("/login");

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="nav-link">Coins</Link>
        <Link to="/exchanges" className="nav-link">Exchanges</Link>

        {/* ✅ Currency Dropdown */}
        <div className="currency-dropdown">
          <input
            type="text"
            placeholder="Search currency..."
            value={searchCurrency}
            onChange={(e) => setSearchCurrency(e.target.value)}
            className="currency-search"
          />
          {showCurrencyDropdown && (
            <ul className="currency-list">
              {filteredCurrencies.map((currency, index) => (
                <li
                  key={index}
                  className="currency-item"
                  onClick={() => handleSelectCurrency(currency)}
                >
                  {currency.id} ({currency.symbol?.toUpperCase()})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ✅ Asset/Exchange Search */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Assets or Exchanges..."
            value={searchAsset}
            onChange={(e) => setSearchAsset(e.target.value)}
            className="search-input"
          />
          {filteredResults.length > 0 && (
            <ul className="search-dropdown">
              {filteredResults.map((item, index) => (
                <li key={index} className="search-item">
                  <Link
                    to={item.exchangeId ? `/exchange/${item.exchangeId}` : `/coin/${item.id}`}
                    onClick={() => {
                      setSearchAsset("");
                      setFilteredResults([]);
                    }}
                  >
                    {item.name} ({item.symbol ?? item.id})
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ✅ Login / Logout */}
        {isAuthenticated ? (
          <button className="logout-button" onClick={logout}>Logout</button>
        ) : (
          <button className="login-button" onClick={handleLogin}>Login / Register</button>
        )}
      </nav>
    </header>
  );
}
