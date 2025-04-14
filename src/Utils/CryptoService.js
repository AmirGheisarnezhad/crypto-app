import axios from "axios";
import { AuthContext } from "../context/AuthContext"; 
import { useContext } from "react";

export const API_URL = "http://localhost:5000/proxy/";

export const apiList = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

let exchangeRatesCache = null;  
let lastFetchTime = 0;        

export const fetchExchangeRates = async () => {
  const now = Date.now();

  // بررسی کش در localStorage
  const cachedRates = JSON.parse(localStorage.getItem("exchangeRates"));
  const lastTime = localStorage.getItem("exchangeRatesTime");

  if (cachedRates && lastTime && now - lastTime < 5 * 60 * 1000) {
    console.log("✅ Using cached exchange rates:", cachedRates);
    return cachedRates;
  }

  try {
    console.log("⚡ Fetching exchange rates from API...");
    const response = await apiList.get("rates");

    if (!response.data || !response.data.data) {
      console.error("❌ ERROR: API returned no data!");
      return null; 
    }

    const rates = response.data.data.reduce((acc, rate) => {
      acc[rate.symbol] = parseFloat(rate.rateUsd);
      return acc;
    }, {});

    if (!rates["USD"]) {
      console.error("❌ ERROR: API did not return USD exchange rate! Using fallback.");
      rates["USD"] = 1;
    }

    localStorage.setItem("exchangeRates", JSON.stringify(rates));
    localStorage.setItem("exchangeRatesTime", now);

    console.log("✅ Successfully fetched exchange rates:", rates);
    return rates;

  } catch (error) {
    console.error("❌ ERROR FETCHING RATES:", error.response?.data || error.message);
    return null; 
  }
};
// --------------------------------------------------------------------------------------------

// ✅ دریافت لیست ارزهای دیجیتال و تبدیل قیمت‌ها بر اساس واحد پولی انتخابی
export const getCryptoList = async (selectedCurrency = "USD") => {
  console.log("🔥 getCryptoList called with currency:", selectedCurrency);
  try {
    const exchangeRates = await fetchExchangeRates();

    if (!exchangeRates) {
      console.error("❌ ERROR: Exchange rates not available. Returning empty list.");
      return [];
    }

    const conversionRate = exchangeRates[selectedCurrency] || exchangeRates["USD"] || 1;
    const response = await apiList.get("assets");

    let coins = response.data.data;
    coins = coins.map((coin) => ({
      ...coin,
      priceConverted: (parseFloat(coin.priceUsd) / conversionRate).toFixed(2),
    }));

    console.log(`✅ Updated coin prices for ${selectedCurrency}:`, coins);
    return coins;
  } catch (error) {
    console.error("❌ ERROR FETCHING COINS:", error.response?.data || error.message);
    return [];
  }
};
// --------------------------------------------------------------------------------------------

// ✅ دریافت اطلاعات جزئیات یک صرافی خاص بر اساس `exchangeId`
export const getExchangeDetails = async (exchangeId) => {
  try {
    const response = await apiList.get(`exchanges/${exchangeId}`);
    return response.data.data || "N/A";
  } catch (error) {
    console.error(`❌ ERROR FETCHING EXCHANGE DETAILS (${exchangeId}):`, error.response?.data || error.message);
    return "N/A";
  }
};
// -------------------------------------------------------------------------------------------------------

// ✅ دریافت لیست بازارهای یک صرافی خاص بر اساس `exchangeId`
export const getExchangeMarkets = async (exchangeId, limit = 50) => {
  try {
    const response = await apiList.get(`markets?exchangeId=${exchangeId}&limit=${limit}`);
    return response.data.data || [];
  } catch (error) {
    console.error(`❌ ERROR FETCHING EXCHANGE MARKETS (${exchangeId}):`, error.response?.data || error.message);
    return [];
  }
};
// ------------------------------------------------------------------------------------------------------

// ✅ مدیریت تعداد درخواست‌ها به API با `Cache` و `Throttle`
const topPairCache = {};
const requestQueue = new Map(); 

export const getTopPairForExchange = async (exchangeId) => {
  if (topPairCache[exchangeId]) {
    console.log(`✅ Using cached top pair for ${exchangeId}`);
    return topPairCache[exchangeId];
  }

  if (requestQueue.has(exchangeId)) {
    return requestQueue.get(exchangeId);
  }

  const fetchPromise = new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const response = await apiList.get(`markets?exchangeId=${exchangeId}`);
        const markets = response.data.data;

        if (!markets || markets.length === 0) {
          resolve("N/A");
        } else {
          const topMarket = markets.reduce((prev, current) =>
            parseFloat(current.volumeUsd24Hr) > parseFloat(prev.volumeUsd24Hr) ? current : prev
          );
          const topPair = `${topMarket?.baseSymbol ?? "Unknown"}/${topMarket?.quoteSymbol ?? "Unknown"}`;
          topPairCache[exchangeId] = topPair;
          resolve(topPair);
        }
      } catch (error) {
        console.error(`❌ ERROR FETCHING TOP PAIR (${exchangeId}):`, error.response?.data || error.message);
        resolve("N/A");
      } finally {
        requestQueue.delete(exchangeId);
      }
    }, 200);
  });

  requestQueue.set(exchangeId, fetchPromise);
  return fetchPromise;
};


// =========================================================
// ✅ دریافت تاریخچه‌ی قیمت یک کوین برای چارت
export const getCoinHistory = async (coinId, interval = "d1") => {
  try {
    const response = await apiList.get(`assets/${coinId}/history?interval=${interval}`);
    if (!response.data?.data || response.data.data.length === 0) {
      console.warn(`⚠️ No history data for ${coinId} - ${interval}`);
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
        console.warn("⛔ Token expired, user is redirected to login page.");
        logout();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
}


// ✅ مدیریت درخواست‌های `Too Many Requests (429)`
apiList.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 429) {
    console.warn("⚠️ Too Many Requests. Retrying after delay...");
    await new Promise((resolve) => setTimeout(resolve, 1000)); 
    return apiList(error.config); 
  }
  return Promise.reject(error);
});
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
