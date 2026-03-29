import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function GoogleLogin({ onSuccess }) {

  const initialized = useRef(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialResponse = async (response) => {
    console.log("Google Token received");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        {
          token: response.credential,
        },
        { withCredentials: true }
      );

      console.log("Google login response:", res.data);

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback: reload page if no callback
        window.location.reload();
      }

    } catch (err) {
      console.error("Google login failed:", err);
      setError(err.response?.data?.message || "❌ Google login failed");
      setLoading(false);
    }
  };

  useEffect(() => {

    const initGoogle = () => {
      if (!window.google || initialized.current) return;

      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        {
          theme: "outline",
          size: "large",
          width: 250,
        }
      );
    };

    // ✅ wait for google script
    const interval = setInterval(() => {
      if (window.google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);

  }, [onSuccess]);

  return (
    <>
      <div id="googleSignInDiv"></div>
      {error && <p className="auth-error" style={{ marginTop: "10px" }}>{error}</p>}
    </>
  );
}