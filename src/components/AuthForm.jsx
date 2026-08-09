import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function AuthForm({ isSignUp = false, submitLabel = "Continue" }) {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const endpoint = isSignUp ? "/signup" : "/login";

      const payload = isSignUp
        ? formData
        : {
            email: formData.email,
            password: formData.password,
          };


      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });


      const data = await response.json();


      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }


      if (!isSignUp && data.token) {
        localStorage.setItem("token", data.token);
      }


      console.log(data);

      alert(
        isSignUp
          ? "Account created successfully"
          : "Login successful"
      );


    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit}>

      {isSignUp && (
        <>
          <div>
            <label className="mb-2 block text-[16px] font-semibold text-[#241065]">
              Full Name
            </label>

            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4"
            />
          </div>


          <div className="mt-4">
            <label className="mb-2 block text-[16px] font-semibold text-[#241065]">
              Phone Number
            </label>

            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4"
            />
          </div>
        </>
      )}


      <div className="mt-4">
        <label className="mb-2 block text-[16px] font-semibold text-[#241065]">
          Email Address
        </label>

        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          placeholder="Enter your email"
          className="h-14 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4"
        />
      </div>


      <div className="mt-4">
        <label className="mb-2 block text-[16px] font-semibold text-[#241065]">
          Password
        </label>

        <div className="flex h-12 items-center rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4">

          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full bg-transparent outline-none"
          />


          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <HiOutlineEyeOff size={24}/>
            ) : (
              <HiOutlineEye size={24}/>
            )}
          </button>

        </div>
      </div>


      {isSignUp && (
        <div className="mt-4">

          <label className="mb-2 block text-[16px] font-semibold text-[#241065]">
            Confirm Password
          </label>


          <input
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            type="password"
            placeholder="Confirm password"
            className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-[#F4F3FF] px-4"
          />

        </div>
      )}


      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}


      <button
        type="submit"
        disabled={loading}
        className="mt-6 h-12 w-full rounded-xl bg-[#6133DA] text-white"
      >
        {loading ? "Please wait..." : submitLabel}
      </button>

    </form>
  );
}