import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carColor, setCarColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    // basic validation
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !carBrand ||
      !carModel ||
      !carColor ||
      !plateNumber
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // we assume backend will:
      //  - create user
      //  - create car
      //  - generate qrId + qrImage (data URL)
      //  - return all of that in response.data
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
        carBrand,
        carModel,
        carColor,
        plateNumber,
      });

      const userData = res.data.user; // expect { qrId, name, email, carBrand, plateNumber, qrImage, ... }

      // store user so dashboard / other pages can use it
     localStorage.setItem("parklinkUser", JSON.stringify(userData));

      setInfo("Account created successfully. Redirecting to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Signup failed. Check backend / API.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <h1 className="page-title">Create your ParkLink account</h1>
      <p className="page-description">
        Sign up, register your car, and we’ll generate a unique QR code for
        your vehicle automatically.
      </p>

      <form className="form-grid" onSubmit={handleSignup}>
        {/* USER INFO */}
        <div className="form-group">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
          />
        </div>

        {/* CAR INFO */}
        <div className="form-group">
          <label htmlFor="carBrand">Car brand</label>
          <input
            id="carBrand"
            className="input"
            value={carBrand}
            onChange={(e) => setCarBrand(e.target.value)}
            placeholder="e.g. Kia, BMW, Toyota"
          />
        </div>

        <div className="form-group">
          <label htmlFor="carModel">Car model</label>
          <input
            id="carModel"
            className="input"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            placeholder="e.g. Sportage 2022"
          />
        </div>

        <div className="form-group">
          <label htmlFor="carColor">Car color</label>
          <input
            id="carColor"
            className="input"
            value={carColor}
            onChange={(e) => setCarColor(e.target.value)}
            placeholder="e.g. Black, White, Blue"
          />
        </div>

        <div className="form-group">
          <label htmlFor="plateNumber">Plate number</label>
          <input
            id="plateNumber"
            className="input"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="e.g. ABC 1234"
          />
        </div>

        {/* QR INFO TEXT */}
        <div className="form-group">
          <p className="field-hint">
            ✅ A unique QR code will be generated automatically for this car
            after signup.
          </p>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {error && <p className="status-message error">❌ {error}</p>}
      {info && <p className="status-message success">✅ {info}</p>}
    </div>
  );
}
