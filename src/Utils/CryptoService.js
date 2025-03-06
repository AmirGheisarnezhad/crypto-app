import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // 🔹 اضافه شد
import { useContext } from "react";

export const API_URL = "http://localhost:5000/proxy/";

export const apiList = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

// ✅ دریافت نرخ ارزها و ذخیره آن‌ها
let exchangeRatesCache = null; // کش نرخ ارزها

export const fetchExchangeRates = async () => {
  if (exchangeRatesCache) {
    console.log("✅ Using cached exchange rates");
    return exchangeRatesCache;
  }

  try {
    const response = await apiList.get("rates"); // 🔹 `/` حذف شد
    exchangeRatesCache = response.data.data.reduce(
      (acc, rate) => {
        acc[rate.symbol] = parseFloat(rate.rateUsd);
        return acc;
      },
      { USD: 1 }
    );

    console.log("📊 Updated exchange rates:", exchangeRatesCache);
    return exchangeRatesCache;
  } catch (error) {
    console.error(
      "❌ ERROR FETCHING RATES:",
      error.response?.data || error.message
    );
    return { USD: 1 };
  }
};

// ✅ دریافت لیست ارزهای دیجیتال و تبدیل قیمت‌ها بر اساس واحد پولی انتخابی
export const getCryptoList = async (selectedCurrency = "USD") => {
  try {
    const exchangeRates = await fetchExchangeRates();
    const conversionRate = exchangeRates[selectedCurrency] || 1;

    const response = await apiList.get("assets"); // 🔹 `/` حذف شد
    let coins = response.data.data;

    coins = coins.map((coin) => ({
      ...coin,
      priceConverted: (parseFloat(coin.priceUsd) / conversionRate).toFixed(2),
    }));

    console.log(`✅ Updated coin prices for ${selectedCurrency}:`, coins);
    return coins;
  } catch (error) {
    console.error(
      "❌ ERROR FETCHING COINS:",
      error.response?.data || error.message
    );
    return [];
  }
};

// ✅ دریافت اطلاعات جزئیات یک صرافی خاص بر اساس `exchangeId`
export const getExchangeDetails = async (exchangeId) => {
  try {
    const response = await apiList.get(`exchanges/${exchangeId}`); // 🔹 مسیر تصحیح شد
    return response.data.data || "N/A";
  } catch (error) {
    console.error(
      `❌ ERROR FETCHING EXCHANGE DETAILS (${exchangeId}):`,
      error.response?.data || error.message
    );
    return "N/A";
  }
};

// ✅ دریافت لیست بازارهای یک صرافی خاص بر اساس `exchangeId`
export const getExchangeMarkets = async (exchangeId, limit = 50) => {
  try {
    const response = await apiList.get(
      `markets?exchangeId=${exchangeId}&limit=${limit}`
    ); // 🔹 مسیر تصحیح شد
    return response.data.data || [];
  } catch (error) {
    console.error(
      `❌ ERROR FETCHING EXCHANGE MARKETS (${exchangeId}):`,
      error.response?.data || error.message
    );
    return [];
  }
};

// ✅ مدیریت تعداد درخواست‌ها به API با `Cache` و `Throttle`
const topPairCache = {}; // ذخیره مقادیر دریافت‌شده
const requestQueue = new Map(); // مدیریت درخواست‌های همزمان

export const getTopPairForExchange = async (exchangeId) => {
  if (topPairCache[exchangeId]) {
    console.log(`✅ Using cached top pair for ${exchangeId}`);
    return topPairCache[exchangeId];
  }

  if (requestQueue.has(exchangeId)) {
    return requestQueue.get(exchangeId); // در حال پردازش یک درخواست دیگر، منتظر می‌مانیم
  }

  const fetchPromise = new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const response = await apiList.get(`markets?exchangeId=${exchangeId}`); // 🔹 مسیر تصحیح شد
        const markets = response.data.data;

        if (!markets || markets.length === 0) {
          resolve("N/A");
        } else {
          const topMarket = markets.reduce((prev, current) =>
            parseFloat(current.volumeUsd24Hr) > parseFloat(prev.volumeUsd24Hr)
              ? current
              : prev
          );
          const topPair = `${topMarket?.baseSymbol ?? "Unknown"}/${
            topMarket?.quoteSymbol ?? "Unknown"
          }`;
          topPairCache[exchangeId] = topPair; // ذخیره مقدار در `Cache`
          resolve(topPair);
        }
      } catch (error) {
        console.error(
          `❌ ERROR FETCHING TOP PAIR (${exchangeId}):`,
          error.response?.data || error.message
        );
        resolve("N/A");
      } finally {
        requestQueue.delete(exchangeId); // ✅ حالا همیشه حذف می‌شه
      }
    }, 200); // تأخیر 200 میلی‌ثانیه بین درخواست‌ها
  });

  requestQueue.set(exchangeId, fetchPromise);
  return fetchPromise;
};

// ✅ دریافت نرخ ارزها (این تابع دیگر نیازی به درخواست اضافه ندارد)
export const getRates = async () => {
  return await fetchExchangeRates();
};

// =========================================================
// ✅ دریافت تاریخچه‌ی قیمت یک کوین برای چارت
export const getCoinHistory = async (coinId, interval = "d1") => {
  let apiInterval = "d1"; // مقدار پیش‌فرض

  if (interval === "1D") apiInterval = "m1"; 
  else if (["1W", "1M", "3M", "6M", "1Y", "All"].includes(interval)) apiInterval = "d1";

  try {
    const response = await apiList.get(`assets/${coinId}/history?interval=${apiInterval}`);

    if (!response.data?.data || response.data.data.length === 0) {
      console.warn(`⚠️ No history data for ${coinId} - ${apiInterval}`);
      return [];
    }

    return response.data.data;
  } catch (error) {
    console.error(`❌ ERROR FETCHING HISTORY FOR ${coinId}:`, error.response?.data || error.message);
    return [];
  }
};

// ---------------------------------------------------------------------------------------

// ✅ اضافه کردن `Interceptor` برای بررسی خطای 401 (توکن منقضی شده)
export function setupAxiosInterceptors(logout) {
  apiList.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("⛔ توکن منقضی شده، کاربر به صفحه لاگین هدایت می‌شود.");
        logout(); // خروج خودکار کاربر
        window.location.href = "/login"; // هدایت به صفحه لاگین
      }
      return Promise.reject(error);
    }
  );
}

// ---------------------------------------------------------------------

export const refreshToken = async (oldRefreshToken) => {
  try {
    const formData = new URLSearchParams();
    formData.append("grant_type", "refresh_token");
    formData.append("refresh_token", oldRefreshToken);

    const response = await apiList.post(
      "oauth/token",
      formData,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data;
  } catch (error) {
    console.error("❌ ERROR Refreshing Token:", error);
    return null;
  }
};

// ------------------------------------------------------
