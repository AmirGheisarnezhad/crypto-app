import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import CoinChart from "../components/Charts/CoinChart";
import { getCryptoList } from "../Utils/CryptoService"; // ✅ اضافه کردن دریافت لیست ارزها
import "../components/Charts/CoinChart.css"; // ✅ اضافه کردن فایل استایل

export default function CoinChartPage() {
  const { coin_id } = useParams();
  const [interval, setInterval] = useState("d1"); // مقدار پیش‌فرض روزانه
  const [exchangeId, setExchangeId] = useState("binance"); // مقدار پیش‌فرض (موقت)
  const [quoteId, setQuoteId] = useState("usd"); // مقدار پیش‌فرض (موقت)

  useEffect(() => {
    async function fetchCoinData() {
      try {
        const coins = await getCryptoList(); // ✅ دریافت لیست کوین‌ها
        const selectedCoin = coins.find((coin) => coin.id === coin_id);
        if (selectedCoin) {
          setQuoteId("usd"); // همیشه USD به عنوان ارز مبادله‌ای در نظر گرفته می‌شود
        }
      } catch (error) {
        console.error("Error fetching coin data:", error);
      }
    }

    fetchCoinData();
  }, [coin_id]);

  return (
    <div className="chart-page">
      <h1 className="chart-title">
        📊 Price Chart for {coin_id.toUpperCase()}
      </h1>

      {/* نمایش چارت */}
      <div className="chart-container">
        <CoinChart
          key={coin_id + interval}
          coinId={coin_id}
          interval={interval}
          exchangeId={exchangeId}
          quoteId={quoteId}
        />
      </div>

      {/* دکمه‌های تغییر بازه زمانی */}
      <div className="button-container">
        <button
          className="time-button"
          onClick={() => {
            setInterval("d1");
            console.log("🔄 Interval changed to:", "d1");
          }}
        >
          1 Day
        </button>
        <button
          className="time-button"
          onClick={() => {
            setInterval("w1");
            console.log("🔄 Interval changed to:", "w1");
          }}
        >
          1 Week
        </button>
        <button
          className="time-button"
          onClick={() => {
            setInterval("m1");
            console.log("🔄 Interval changed to:", "m1");
          }}
        >
          1 Month
        </button>
        <button
          className="time-button"
          onClick={() => {
            setInterval("3M");
            console.log("🔄 Interval changed to:", "3M");
          }}
        >
          3 Months
        </button>
        <button
          className="time-button"
          onClick={() => {
            setInterval("6M");
            console.log("🔄 Interval changed to:", "6M");
          }}
        >
          6 Months
        </button>
        <button
          className="time-button"
          onClick={() => {
            setInterval("1Y");
            console.log("🔄 Interval changed to:", "1Y");
          }}
        >
          1 Year
        </button>
        <button
          className="time-button"
          onClick={() => {
            setInterval("all");
            console.log("🔄 Interval changed to:", "all");
          }}
        >
          All
        </button>
      </div>

      {/* دکمه بازگشت */}
      <Link to={`/coin/${coin_id}`}>
        <button className="back-button">🔙 Back to Details</button>
      </Link>
    </div>
  );
}
