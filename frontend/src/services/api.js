export const getPrediction = async () => {
  const res = await fetch("https://beehiveapi.vercel.app/api/...");
  return await res.json();
};