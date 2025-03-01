import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Loader from "../Loader/Loader";
import { Chart } from "react-chartjs-2";
import { getCoinHistory, getCandlestickData } from "../../Utils/CryptoService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import {
  CandlestickController,
  OhlcController,
  CandlestickElement,
  OhlcElement,
} from "chartjs-chart-financial";

import "../Charts/Coinchart.css";

// ثبت ماژول‌های لازم برای نمودار
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  OhlcController,
  CandlestickElement,
  OhlcElement
);

export default function CoinChart({ coinId, interval, exchangeId, quoteId }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCandlestick, setIsCandlestick] = useState(false);

  useEffect(() => {
    console.log("🛠 useEffect triggered with interval:", interval);
    async function fetchData() {
      setLoading(true);
      setError(null);
      console.log("🟡 Fetching data for interval:", interval);

      let historyData = [];
      try {
        if (["1W", "1M"].includes(interval.toUpperCase())) {
          console.log(`🔄 Trying to fetch candlestick data for: ${interval}`);
          historyData = await getCandlestickData(
            exchangeId,
            coinId,
            quoteId,
            interval.toLowerCase()
          );

          if (Array.isArray(historyData) && historyData.length > 0) {
            console.log("✅ Candlestick data received:", historyData);
            setIsCandlestick(true);
          } else {
            console.warn(
              `⚠️ No candles data for ${interval}, switching to history API.`
            );
            historyData = await getCoinHistory(coinId, "d1");
            setIsCandlestick(false);
          }
        } else {
          historyData = await getCoinHistory(coinId, "d1");
          setIsCandlestick(false);
        }

        if (!Array.isArray(historyData) || historyData.length === 0) {
          throw new Error("Invalid or empty data received from API");
        }

        console.log("📊 Final processed historyData:", historyData);

        // بررسی داده‌ها قبل از تنظیم نمودار
        if (historyData.some((item) => !item.priceUsd || !item.time)) {
          console.warn("⚠️ Some items have missing values:", historyData);
        }

        const formattedData = isCandlestick
          ? {
              labels: historyData.map((item) =>
                new Date(item.period).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Candlestick Data",
                  data: historyData.map((item) => ({
                    x: new Date(item.period),
                    o: parseFloat(item.open),
                    h: parseFloat(item.high),
                    l: parseFloat(item.low),
                    c: parseFloat(item.close),
                  })),
                  borderColor: "rgb(75, 192, 192)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                },
              ],
            }
          : {
              labels: historyData.map((item) =>
                new Date(item.time).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Price (USD)",
                  data: historyData.map((item) => parseFloat(item.priceUsd)),
                  borderColor: "rgb(75, 192, 192)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  tension: 0.4,
                },
              ],
            };

        console.log("🔍 Processed chartData:", formattedData);

        setChartData(formattedData);
        console.log("✅ Updated chartData:", formattedData);

        // ✅ **بازنشانی `chartData` برای اطمینان از اجرای رندر مجدد**
        setTimeout(() => {
          console.log("🔄 Forcing re-render by setting chartData again");
          setChartData((prev) => ({ ...prev }));
        }, 500);

      } catch (error) {
        setError("⚠️ There is a problem retrieving data.");
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [coinId, interval, exchangeId, quoteId]);

  return (
    <div className="chart-container">
      <h3 className="chart-title">
        📊 {isCandlestick ? "Candlestick Chart" : "Price History"}
      </h3>
      {loading ? (
        <Loader />
      ) : error ? (
        <p className="chart-error">{error}</p>
      ) : chartData ? (
        <div className="chart-wrapper">
          {isCandlestick ? (
            <Chart
              type="candlestick"
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    type: "time",
                    time: { unit: "day" },
                    ticks: { autoSkip: true, maxTicksLimit: 15 },
                  },
                },
              }}
            />
          ) : (
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    ticks: {
                      autoSkip: true,
                      maxTicksLimit: 15,
                      font: { size: 12 },
                    },
                  },
                },
              }}
            />
          )}
        </div>
      ) : (
        <p className="chart-error">❌ No data available</p>
      )}
    </div>
  );
}
