import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { apiList } from "../../Utils/CryptoService"; // Import API service
import "../Header/Header.css";

export default function Header({ selectedCurrency = "USD", setSelectedCurrency }) {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currencies, setCurrencies] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [searchAsset, setSearchAsset] = useState(""); // Input value for searching assets & exchanges
  const [assets, setAssets] = useState([]); // Stores assets (cryptos)
  const [exchanges, setExchanges] = useState([]); // Stores exchanges
  const [filteredResults, setFilteredResults] = useState([]); // Filtered results for dropdown

  const handleLogin = () => {
    navigate("/login");
  };

  // ✅ Fetch currency rates (Existing functionality)
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch("https://api.coincap.io/v2/rates");
        if (!response.ok) throw new Error("Failed to fetch currency rates.");
        
        const data = await response.json();
        setCurrencies(data.data || []);
      } catch (error) {
        console.error("❌ ERROR fetching currencies:", error);
      }
    }
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredCurrencies([]);
      setShowDropdown(false);
      return;
    }

    const filtered = currencies.filter(
      (currency) =>
        currency.id.toLowerCase().includes(search.toLowerCase()) ||
        (currency.symbol && currency.symbol.toLowerCase().includes(search.toLowerCase()))
    );

    setFilteredCurrencies(filtered);
    setShowDropdown(filtered.length > 0);
  }, [search, currencies]);

  const handleSelectCurrency = (currency) => {
    setSelectedCurrency(currency.symbol);
    setSearch("");
    setShowDropdown(false);
  };

  // ✅ Fetch assets & exchanges for search input
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

  // ✅ Filter assets & exchanges based on search input
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

  // ✅ Handle selection & navigation
  const handleSelectItem = (item) => {
    try {
      const isExchange = exchanges.some((exchange) => exchange.id === item.id);

      console.log("🔎 Navigating to:", isExchange ? `/exchange/${item.id}` : `/coin/${item.id}`);

      navigate(isExchange ? `/exchange/${item.id}` : `/coin/${item.id}`, { replace: true });

      setSearchAsset(""); // پاک کردن مقدار جستجو
      setFilteredResults([]); // بستن لیست جستجو
    } catch (error) {
      console.error("❌ ERROR handling search selection:", error);
    }
  };

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="nav-link">Coins</Link>
        <Link to="/exchanges" className="nav-link">Exchanges</Link>

        {/* ✅ Currency Selection (Existing) */}
        <div className="currency-dropdown">
          <input
            type="text"
            placeholder="Search currency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="currency-search"
          />
          {showDropdown && (
            <ul className="currency-list">
              {filteredCurrencies.map((currency, index) => (
                <li
                  key={index}
                  className="currency-item"
                  onClick={() => handleSelectCurrency(currency)}
                >
                  {currency.id.toUpperCase()} ({currency.symbol?.toUpperCase()})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ✅ New Search Input for Assets & Exchanges */}
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
                    to={exchanges.some((exchange) => exchange.id === item.id) ? `/exchange/${item.id}` : `/coin/${item.id}`}
                    onClick={() => {
                      setSearchAsset(""); // پاک کردن مقدار جستجو
                      setFilteredResults([]); // بستن لیست جستجو
                    }}
                  >
                    {item.name} ({item.symbol ?? item.id})
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ✅ Login / Logout Button */}
        {isAuthenticated ? (
          <button className="logout-button" onClick={logout}>Logout</button>
        ) : (
          <button className="login-button" onClick={handleLogin}>Login / Register</button>
        )}
      </nav>
    </header>
  );
}
