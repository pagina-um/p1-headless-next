import ApplePay from "./logos/Apple";
import DebitoDirectoLogo from "./logos/DebitoDirecto";
import GooglePay from "./logos/Google";
import MBWayLogo from "./logos/Mbway";
import Multibanco from "./logos/Multibanco";
import VisaMastercardLogo from "./logos/VisaMasterCard";

export const PaymentMethods = () => (
  <div className="grid grid-cols-3 gap-4 place-items-center">
    <VisaMastercardLogo />
    <MBWayLogo />
    <Multibanco />
    <DebitoDirectoLogo />
    <ApplePay />
    <GooglePay />
  </div>
);
