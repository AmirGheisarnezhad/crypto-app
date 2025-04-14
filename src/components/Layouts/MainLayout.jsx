import { Fragment, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header"; 
import Footer from "../Footer/Footer";
import "../../Styles/MainLayout.css"; 

export default function MainLayout() {
  // ✅ مدیریت انتخاب واحد پولی در سطح بالا
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem("selectedCurrency") || "USD"; 
  });

  useEffect(() => {
    console.log("Updating localStorage with:", selectedCurrency);
    localStorage.setItem("selectedCurrency", selectedCurrency); 
  }, [selectedCurrency]);

  console.log("Selected currency in MainLayout:", selectedCurrency);

  return (
    <Fragment>
      <Header selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />
      <div className="content">
        <Outlet context={{ selectedCurrency }} key={selectedCurrency} /> 
      </div>
      <Footer />
    </Fragment>
  );
}
