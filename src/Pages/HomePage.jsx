import { Fragment } from "react";
import { useOutletContext } from "react-router-dom";
import CoinsList from "../components/CryptoList/CoinsList";



export default function HomePage() {
  const { selectedCurrency } = useOutletContext(); // ✅ دریافت مقدار `selectedCurrency
  console.log("Selected currency in HomePage:", selectedCurrency); // ✅ تست مقدار
  return (
    <Fragment>
      <CoinsList selectedCurrency={selectedCurrency} />;
    </Fragment>
  );
}
