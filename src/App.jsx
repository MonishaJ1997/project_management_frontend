import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import About from "./components/About";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Pricing from "./components/Pricing";
import Payment from "./components/Payment";
import Success from "./components/Success";
import Help from "./components/Help";
import FAQ from "./components/FAQ";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Terms from "./components/Terms";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About/>}/>
        <Route path="/features" element={<Features/>}/>
        <Route path="/pricing" element={<Pricing/>}/>
        <Route path="/payment" element={<Payment/>}/>
        <Route path="/success" element={<Success/>}/>
        <Route path="/help" element={<Help/>}/>
        <Route path="/FAQ" element={<FAQ/>}/>
        <Route path="/Privacy" element={<PrivacyPolicy/>}/>
        <Route path="Terms" element={<Terms/>}/>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;