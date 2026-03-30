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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let err = {};

    if (!/^\d{16}$/.test(form.cardNumber)) {
      err.cardNumber = "Enter 16 digit card number";
    }

    if (!/^[A-Za-z ]+$/.test(form.name)) {
      err.name = "Only letters allowed";
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) {
      err.expiry = "Format MM/YY";
    }

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