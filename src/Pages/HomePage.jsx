import { Fragment } from "react";
import { useOutletContext } from "react-router-dom";
import CoinsList from "../components/CryptoList/CoinsList";



export default function HomePage() {
  const { selectedCurrency } = useOutletContext(); 
  console.log("Selected currency in HomePage:", selectedCurrency);  
  return (
    <Fragment>
      <CoinsList selectedCurrency={selectedCurrency} />
    </Fragment>
  );
}
