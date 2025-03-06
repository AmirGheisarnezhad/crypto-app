import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getCoinHistory } from "../../Utils/CryptoService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns"; // ✅ برای پردازش تاریخ‌ها
import { format } from "date-fns"; // ✅ برای فرمت کردن تاریخ
import "../Charts/CoinChart.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

export default function CoinChart({ coinId, interval }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        let apiInterval = "d1"; // مقدار پیش‌فرض

        if (interval === "1D") apiInterval = "m1"; 
        else if (["1W", "1M", "3M", "6M", "1Y", "All"].includes(interval)) apiInterval = "d1";

        const historyData = await getCoinHistory(coinId, apiInterval);

        if (!Array.isArray(historyData) || historyData.length === 0) {
          throw new Error("No valid data received");
        }

        let filteredData = [];
        if (interval === "1W") filteredData = historyData.slice(-7);
        else if (interval === "1M") filteredData = historyData.slice(-30);
        else if (interval === "3M") filteredData = historyData.slice(-90);
        else if (interval === "6M") filteredData = historyData.slice(-180);
        else if (interval === "1Y") filteredData = historyData.slice(-365);
        else if (interval === "All") filteredData = historyData;
        else filteredData = historyData;

        const formattedData = {
          labels: filteredData.map((item) => new Date(item.time)),
          datasets: [
            {
              label: "Price (USD)",
              data: filteredData.map((item) => parseFloat(item.priceUsd)),
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.4,
            },
          ],
        };

        setChartData(formattedData);
      } catch (error) {
        setError("⚠️ There is a problem retrieving data.");
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [coinId, interval]);

  // ✅ تنظیم فرمت تاریخ بر اساس تایم‌فریم انتخاب شده
  const getTimeUnit = () => {
    if (interval === "1D") return "hour"; // ساعت‌ها
    if (interval === "1W") return "day"; // روزها
    if (["1M", "3M", "6M"].includes(interval)) return "week"; // هفته‌ها
    if (["1Y", "All"].includes(interval)) return "month"; // ماه‌ها
    return "day"; // مقدار پیش‌فرض
  };
  const getTimeFormat = () => {
    if (interval === "1D") return "h a"; // `3PM, 4PM, 5PM`
    if (interval === "1W") return "MMM dd"; // `Feb 22, Feb 23`
    if (["1M", "3M", "6M"].includes(interval)) return "MMM dd yyyy"; // `Feb 05 2023`
    if (["1Y", "All"].includes(interval)) return "MMM yyyy"; // `Mar 2023, Apr 2023`
    return "MMM dd"; // مقدار پیش‌فرض
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">📊 Price History</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="chart-error">{error}</p>
      ) : chartData ? (
        <Line
          data={chartData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                type: "time",
                time: {
                  unit: getTimeUnit(),
                  tooltipFormat: "PP",
                  displayFormats: {
                    hour: "h a",
                    day: "MMM dd",
                    week: "MMM dd yyyy",
                    month: "MMM yyyy",
                  },
                  y: {
                    grid: {
                      display: false, /* ✅ حذف خطوط محور Y */
                    },
                    ticks: {
                      display: true, /* ✅ اعداد محور Y باقی بمانند */
                    },
                  },
                },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 15,
                  callback: function (value, index, values) {
                    return format(new Date(value), getTimeFormat());
                  },
                },
              },
            },
          }}
        />
      ) : (
        <p className="chart-error">❌ No data available</p>
      )}
    </div>
  );
}
