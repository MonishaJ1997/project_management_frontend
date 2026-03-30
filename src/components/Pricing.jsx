import { useState } from "react";
import "./Pricing.css";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const plans = {
    monthly: {
      Starter: 12,
      Professional: 24,
      Enterprise: 40,
    },
    yearly: {
      Starter: 120,
      Professional: 240,
      Enterprise: 400,
    },
  };

  const handleChoosePlan = (planName, price) => {
    navigate("/payment", {
      state: {
        plan: planName,
        price: price,
        billing: isYearly ? "Yearly" : "Monthly",
      },
    });
  };

  return (
    <section className="pricing-section">

      <div className="pricing-header">
        <h2>Simple & Transparent Pricing</h2>
        <p>Flexible plans that grow with your business</p>
      </div>

      {/* TOGGLE */}
      <div className="toggle">
        <span
          className={!isYearly ? "active" : ""}
          onClick={() => setIsYearly(false)}
        >
          Monthly
        </span>
        <span
          className={isYearly ? "active" : ""}
          onClick={() => setIsYearly(true)}
        >
          Yearly
        </span>
      </div>

      <div className="pricing-grid">

        {/* STARTER */}
        <div className="pricing-card">
          <h3>Starter</h3>

          <h1>
            ${isYearly ? plans.yearly.Starter : plans.monthly.Starter}
            <span>/{isYearly ? "year" : "month"}</span>
          </h1>

          <ul>
            <li>✔ Basic task management</li>
            <li>✔ Limited projects</li>
            <li>✔ Email support</li>
            <li>✔ Team collaboration</li>
          </ul>

          <button
            className="btn-primary"
            onClick={() =>
              handleChoosePlan(
                "Starter",
                isYearly ? plans.yearly.Starter : plans.monthly.Starter
              )
            }
          >
            Choose Plan
          </button>
        </div>

        {/* PROFESSIONAL */}
        <div className="pricing-card popular">
          <span className="badge">Most Popular</span>

          <h3>Professional</h3>

          <h1>
            ${isYearly ? plans.yearly.Professional : plans.monthly.Professional}
            <span>/{isYearly ? "year" : "month"}</span>
          </h1>

          <ul>
            <li>✔ Advanced task management</li>
            <li>✔ Unlimited projects</li>
            <li>✔ Priority support</li>
            <li>✔ Team analytics</li>
          </ul>

          <button
            className="btn-primary"
            onClick={() =>
              handleChoosePlan(
                "Professional",
                isYearly
                  ? plans.yearly.Professional
                  : plans.monthly.Professional
              )
            }
          >
            Choose Plan
          </button>
        </div>

        {/* ENTERPRISE (UPDATED - now with Choose Plan) */}
        <div className="pricing-card">
          <h3>Enterprise</h3>

          <h1>
            ${isYearly ? plans.yearly.Enterprise : plans.monthly.Enterprise}
            <span>/{isYearly ? "year" : "month"}</span>
          </h1>

          <ul>
            <li>✔ Dedicated manager</li>
            <li>✔ Advanced integrations</li>
            <li>✔ Custom workflows</li>
            <li>✔ Enterprise security</li>
          </ul>

          <button
            className="btn-primary"
            onClick={() =>
              handleChoosePlan(
                "Enterprise",
                isYearly
                  ? plans.yearly.Enterprise
                  : plans.monthly.Enterprise
              )
            }
          >
            Choose Plan
          </button>
        </div>

      </div>
    </section>
  );
}