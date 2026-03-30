import { useLocation, useNavigate } from "react-router-dom";
import "./Success.css";

export default function Success() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-box">

        <h2>🎉 Payment Successful!</h2>

        <p>
          You have subscribed to <b>{state?.plan}</b> plan
        </p>

        <p>
          Billing: <b>{state?.billing}</b>
        </p>

        <p>
          Amount Paid: <b>${state?.price}</b>
        </p>

        <button onClick={() => navigate("/")}>
          Go to Home
        </button>

      </div>
    </div>
  );
}