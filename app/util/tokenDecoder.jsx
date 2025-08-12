import { decode } from "base-64";

// Function to manually decode JWT
const decodeJWT = (token) => {
  const base64Url = token.split(".")[1]; // Get the payload part
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decode(base64);
  return JSON.parse(jsonPayload);
};

export default decodeJWT;