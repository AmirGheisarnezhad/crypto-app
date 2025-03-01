import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../Header/Header.css";

export default function Header({ selectedCurrency, setSelectedCurrency }) {
  const [currencies, setCurrencies] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // مقدار اولیه را از localStorage بگیریم
  // const [selectedCurrency, setSelectedCurrency] = useState(() => {
  //   return localStorage.getItem("selectedCurrency") || "USD"; 
  // });

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch("https://api.coincap.io/v2/rates");
        const data = await response.json();
        setCurrencies(data.data);
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    }
    fetchCurrencies();
  }, []);

  // ذخیره‌ی انتخاب کاربر در localStorage
  useEffect(() => {
    console.log("Header: Selected currency changed to", selectedCurrency);
    // localStorage.setItem("selectedCurrency", selectedCurrency);
  }, [selectedCurrency]);

  // فیلتر کردن ارزها بر اساس ورودی جستجو
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredCurrencies([]);
      setShowDropdown(false);
    } else {
      const filtered = currencies.filter(
        (currency) =>
          currency.id.toLowerCase().includes(search.toLowerCase()) ||
          (currency.symbol &&
            currency.symbol.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredCurrencies(filtered);
      setShowDropdown(filtered.length > 0);
    }
  }, [search, currencies]);

  // انتخاب واحد پولی و ذخیره در localStorage
  const handleSelectCurrency = (currency) => {
    console.log("User selected currency:", currency.symbol);
    setSelectedCurrency(currency.symbol);
    setSearch("");
    setShowDropdown(false);
  };

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="nav-link">Coins</Link>
        <Link to="/exchanges" className="nav-link">Exchanges</Link>

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
              {filteredCurrencies.map((currency,index) => (
                <li
                  key={index} // ✅ جلوگیری از کلید تکراری
                  className="currency-item"
                  onClick={() => handleSelectCurrency(currency)}
                >
                  {currency.id.toUpperCase()} ({currency.symbol?.toUpperCase()})
                </li>
              ))}
            </ul>
          )}
        </div>

        <span className="selected-currency">
          Selected: {selectedCurrency}
        </span>
      </nav>
    </header>
  );
}
