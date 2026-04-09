import ahoy from "ahoy.js";

ahoy.configure({
  urlPrefix: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});

export default ahoy;
