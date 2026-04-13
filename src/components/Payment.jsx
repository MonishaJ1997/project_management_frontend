import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const plan = state?.plan;
  const price = state?.price;
  const billing = state?.billing;

  const [form, setForm] = useState({
    cardNumber: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});
const handleChange = (e) => {
  let { name, value } = e.target;

  // ================= CARD NUMBER =================
  if (name === "cardNumber") {
    value = value.replace(/\D/g, ""); // remove non-digits
    value = value.substring(0, 16); // max 16 digits

    // add space every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  // ================= EXPIRY =================
  if (name === "expiry") {
    value = value.replace(/\D/g, ""); // only numbers

    if (value.length >= 3) {
      value = value.substring(0, 4);
      value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    }
  }

  // ================= CVV =================
  if (name === "cvv") {
    value = value.replace(/\D/g, "");
    value = value.substring(0, 3);
  }

  // ================= NAME =================
  if (name === "name") {
    value = value.replace(/[^A-Za-z ]/g, "");
  }

  setForm({ ...form, [name]: value });
};


const validate = () => {
  let err = {};

  // CARD NUMBER (remove spaces before checking)
  if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ""))) {
    err.cardNumber = "Enter 16 digit card number";
  }

  // NAME
  if (!/^[A-Za-z ]+$/.test(form.name)) {
    err.name = "Only letters allowed";
  }

  // EXPIRY FORMAT CHECK
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) {
    err.expiry = "Format MM/YY";
  } else {
    // ✅ FUTURE DATE VALIDATION
    const [month, year] = form.expiry.split("/");

    const expiryDate = new Date(`20${year}`, month); // next month
    const today = new Date();

    // set today to first day of current month for fair compare
    const current = new Date(today.getFullYear(), today.getMonth() + 1);

    if (expiryDate < current) {
      err.expiry = "Card expired";
    }
  }

  // CVV
  if (!/^\d{3}$/.test(form.cvv)) {
    err.cvv = "3 digit CVV";
  }

  setErrors(err);
  return Object.keys(err).length === 0;
};
  const handlePay = () => {
    if (validate()) {
      navigate("/success", { state: { plan, price, billing } });
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-box">

        <h2>Payment</h2>

        <div className="plan-info">
          <h3>{plan} Plan</h3>
          <p>{billing}</p>
        </div>

        {/* CARD NUMBER */}
        <div className="input-group">
          <label>Card Number</label>
          <input
            type="text"
            name="cardNumber"
            value={form.cardNumber}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
          />
          <span className="error">{errors.cardNumber}</span>
        </div>

        {/* NAME */}
        <div className="input-group">
          <label>Card Holder Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
          <span className="error">{errors.name}</span>
        </div>

        {/* EXPIRY & CVV */}
        <div className="row">
          <div className="input-group">
            <label>Expiry</label>
            <input
              type="text"
              name="expiry"
              value={form.expiry}
              onChange={handleChange}
              placeholder="MM/YY"
            />
            <span className="error">{errors.expiry}</span>
          </div>

          <div className="input-group">
            <label>CVV</label>
            <input
              type="password"
              name="cvv"
              value={form.cvv}
              onChange={handleChange}
              placeholder="123"
            />
            <span className="error">{errors.cvv}</span>
          </div>
        </div>

        {/* PRICE */}
        <div className="price-summary">
          <span>Total</span>
          <span>${price}</span>
        </div>

        {/* PAY BUTTON */}
        <button className="pay-btn" onClick={handlePay}>
          Pay Now
        </button>

      </div>
    </div>
  );
}