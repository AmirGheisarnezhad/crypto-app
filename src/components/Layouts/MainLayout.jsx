import { Fragment, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "../../Styles/MainLayout.css"; // استایل جداگانه برای layout

export default function MainLayout() {
  // ✅ مدیریت انتخاب واحد پولی در سطح بالا
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem("selectedCurrency") || "USD"; // مقدار پیش‌فرض USD
  });

  useEffect(() => {
    console.log("Updating localStorage with:", selectedCurrency);
    localStorage.setItem("selectedCurrency", selectedCurrency); // ذخیره در localStorage
  }, [selectedCurrency]);

  console.log("Selected currency in MainLayout:", selectedCurrency);

  return (
    <Fragment>
      <Header selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />
      <div className="content">
      <Outlet context={{ selectedCurrency }} key={selectedCurrency}  /> {/* ✅ پاس دادن `selectedCurrency` به صفحات داخلی */}
      </div>
      <Footer />
    </Fragment>
  );
}
